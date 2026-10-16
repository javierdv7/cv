import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth";
import { Authenticator } from "@aws-amplify/ui-react";
// Emitted as a separate file and linked here, so the ~300 KB of Amplify UI
// styles never end up in the public site's stylesheet.
import amplifyCss from "@aws-amplify/ui-react/styles.css" with { type: "file" };
import outputs from "../../amplify_outputs.json";
import { GALLERY_URL, isVideo, sm, type Item } from "../gallery";
import { isVideoFile, processPhoto, processVideo } from "./process";
import { publish, readManifest, unpublish } from "./store";

const configured = "auth" in outputs && "storage" in outputs;
if (configured) Amplify.configure(outputs);

if (!document.querySelector("link[data-amplify-ui]")) {
  const link = Object.assign(document.createElement("link"), { rel: "stylesheet", href: amplifyCss });
  link.dataset.amplifyUi = "";
  document.head.prepend(link);
}

const PUBLIC_URL = "https://vargastorres.cv/photos";

export default function Admin() {
  useEffect(() => {
    document.title = "admin — photos";
  }, []);

  if (!configured) {
    return (
      <div className="adm adm-center">
        <pre className="adm-note">{`backend not configured.\n\namplify_outputs.json is a stub — run\n  npx ampx generate outputs --app-id <id> --branch main`}</pre>
      </div>
    );
  }

  return (
    <div className="adm">
      <Authenticator hideSignUp>
        {({ signOut, user }) => (
          <Panel email={user?.signInDetails?.loginId ?? ""} onSignOut={() => signOut?.()} />
        )}
      </Authenticator>
    </div>
  );
}

type Job = {
  key: string;
  name: string;
  stage: "en cola" | "procesando" | "subiendo" | "listo" | "error";
  progress: number;
  error?: string;
};

function Panel({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [items, setItems] = useState<Item[] | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [drag, setDrag] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const pickRef = useRef<HTMLInputElement | null>(null);
  const work = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    fetchAuthSession().then(s => {
      const groups = (s.tokens?.accessToken.payload["cognito:groups"] ?? []) as string[];
      setAllowed(groups.includes("admins"));
    });
  }, []);

  useEffect(() => {
    if (allowed) readManifest().then(setItems, e => setLoadError(String(e?.message ?? e)));
  }, [allowed]);

  const patch = (key: string, p: Partial<Job>) =>
    setJobs(js => js.map(j => (j.key === key ? { ...j, ...p } : j)));

  // One file at a time: video encoding is heavy and runs on this machine.
  const enqueue = useCallback((files: File[]) => {
    const media = files.filter(f => f.type.startsWith("image/") || isVideoFile(f));
    const added = media.map(f => ({
      file: f,
      job: { key: `${f.name}-${f.size}-${Math.random()}`, name: f.name, stage: "en cola", progress: 0 } as Job,
    }));
    setJobs(js => [...added.map(a => a.job), ...js]);
    for (const { file, job } of added) {
      work.current = work.current.then(async () => {
        try {
          patch(job.key, { stage: "procesando" });
          const processed = isVideoFile(file)
            ? await processVideo(file, p => patch(job.key, { progress: p }))
            : await processPhoto(file);
          patch(job.key, { stage: "subiendo", progress: 0 });
          const next = await publish(file.name, processed, p => patch(job.key, { progress: p }));
          setItems(next);
          patch(job.key, { stage: "listo", progress: 1 });
        } catch (e) {
          patch(job.key, { stage: "error", error: e instanceof Error ? e.message : String(e) });
        }
      });
    }
  }, []);

  const del = async (id: string) => {
    try {
      setItems(await unpublish(id));
    } catch (e) {
      alert(`no se pudo eliminar: ${e instanceof Error ? e.message : e}`);
    }
  };

  return (
    <div className="adm-page">
      <header className="ph-bar">
        <a className="ph-bar-item" href={PUBLIC_URL} target="_blank" rel="noreferrer">◀ photos</a>
        <span className="ph-bar-path">admin · ~/photos</span>
        <span className="adm-bar-right">
          <span className="adm-dim">{email}</span>
          <button className="ph-bar-item adm-link" onClick={onSignOut}>salir</button>
        </span>
      </header>

      {allowed === false && (
        <div className="adm-center">
          <pre className="adm-note">{`acceso denegado.\n\n${email} no está en el grupo "admins".`}</pre>
        </div>
      )}

      {allowed && (
        <main className="adm-main">
          <div
            className={`adm-drop ${drag ? "adm-drop-on" : ""}`}
            role="button"
            tabIndex={0}
            onClick={() => pickRef.current?.click()}
            onKeyDown={e => (e.key === "Enter" || e.key === " ") && pickRef.current?.click()}
            onDragOver={e => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => {
              e.preventDefault();
              setDrag(false);
              enqueue(Array.from(e.dataTransfer.files));
            }}
          >
            <span>arrastra fotos o videos aquí</span>
            <span className="adm-dim">o haz clic para elegir · se quitan gps y metadatos antes de subir</span>
            <input
              ref={pickRef}
              type="file"
              accept="image/*,video/*"
              multiple
              hidden
              onChange={e => {
                enqueue(Array.from(e.target.files ?? []));
                e.target.value = "";
              }}
            />
          </div>

          {jobs.length > 0 && (
            <ul className="adm-jobs">
              {jobs.map(j => (
                <li key={j.key} className={`adm-job adm-job-${j.stage === "error" ? "err" : j.stage === "listo" ? "ok" : "run"}`}>
                  <span className="adm-job-name">{j.name}</span>
                  <span className="adm-job-stage">
                    {j.stage}
                    {(j.stage === "procesando" || j.stage === "subiendo") && j.progress > 0 && ` ${Math.round(j.progress * 100)}%`}
                  </span>
                  {j.error && <span className="adm-job-err">{j.error}</span>}
                  <span className="adm-job-bar" style={{ width: `${(j.stage === "listo" ? 1 : j.progress) * 100}%` }} />
                </li>
              ))}
            </ul>
          )}

          {loadError && <pre className="adm-note">no se pudo leer la galería: {loadError}</pre>}

          {items && (
            <>
              <div className="adm-count adm-dim">
                {items.length} {items.length === 1 ? "elemento" : "elementos"} publicados
              </div>
              <div className="ph-grid adm-grid">
                {items.map(p => (
                  <AdminTile key={p.id} p={p} onDelete={() => del(p.id)} />
                ))}
              </div>
            </>
          )}
        </main>
      )}
    </div>
  );
}

function AdminTile({ p, onDelete }: { p: Item; onDelete: () => void }) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const r = p.w / p.h;

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <div className={`ph-tile adm-tile ${busy ? "adm-busy" : ""}`} style={{ "--r": r, background: p.color } as CSSProperties}>
      <i style={{ paddingBottom: `${100 / r}%` }} />
      {GALLERY_URL && <img className="ph-in" src={sm(p)} alt={p.title} loading="lazy" draggable={false} />}
      {isVideo(p) && <span className="ph-badge" aria-hidden="true">▶</span>}
      <button
        className={`adm-del ${armed ? "adm-del-armed" : ""}`}
        disabled={busy}
        onClick={async () => {
          if (!armed) return setArmed(true);
          setBusy(true);
          await onDelete();
          setBusy(false);
        }}
        aria-label={armed ? `confirmar eliminar ${p.title}` : `eliminar ${p.title}`}
      >
        {busy ? "…" : armed ? "¿eliminar?" : "x"}
      </button>
    </div>
  );
}
