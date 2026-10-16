/**
 * Writes to the gallery bucket as the signed-in admin. The manifest is the
 * single source of truth for what the public gallery shows; every change
 * re-reads it fresh from S3 and runs one at a time, so parallel uploads
 * can't overwrite each other's entries.
 */
import { downloadData, remove, uploadData } from "aws-amplify/storage";
import { keys, MANIFEST, sortItems, type Item } from "../gallery";
import type { Processed } from "./process";

const MEDIA_CACHE = "public, max-age=86400";

export async function readManifest(): Promise<Item[]> {
  try {
    const { body } = await downloadData({ path: MANIFEST }).result;
    return JSON.parse(await body.text()) as Item[];
  } catch (e) {
    if (e instanceof Error && (e.name === "NoSuchKey" || e.name === "NotFound")) return [];
    throw e;
  }
}

let queue: Promise<unknown> = Promise.resolve();

/** Serialized read-modify-write of the manifest. */
function editManifest(fn: (items: Item[]) => Item[]): Promise<Item[]> {
  const run = queue.then(async () => {
    const next = sortItems(fn(await readManifest()));
    await uploadData({
      path: MANIFEST,
      data: JSON.stringify(next),
      options: { contentType: "application/json", cacheControl: "no-cache" },
    }).result;
    return next;
  });
  queue = run.catch(() => {});
  return run;
}

const newId = () =>
  `${Date.now().toString(36)}-${crypto.getRandomValues(new Uint32Array(1))[0]!.toString(36)}`;

export async function publish(
  name: string,
  p: Processed,
  onProgress: (fraction: number) => void,
): Promise<Item[]> {
  const id = newId();
  const k = keys(id);
  const parts = [
    { path: k.sm, blob: p.files.sm },
    { path: k.lg, blob: p.files.lg },
    ...(p.files.video ? [{ path: k.video, blob: p.files.video }] : []),
  ];
  const total = parts.reduce((n, x) => n + x.blob.size, 0);
  const sent = new Map<string, number>();
  await Promise.all(
    parts.map(({ path, blob }) =>
      uploadData({
        path,
        data: blob,
        options: {
          contentType: blob.type,
          cacheControl: MEDIA_CACHE,
          onProgress: ({ transferredBytes }) => {
            sent.set(path, transferredBytes);
            onProgress([...sent.values()].reduce((a, b) => a + b, 0) / total);
          },
        },
      }).result,
    ),
  );

  const item: Item = {
    id,
    kind: p.files.video ? "video" : "photo",
    w: p.w,
    h: p.h,
    color: p.color,
    title: name.replace(/\.[^.]+$/, ""),
    taken: p.taken,
    added: new Date().toISOString(),
  };
  return editManifest(items => [...items, item]);
}

export async function unpublish(id: string): Promise<Item[]> {
  // Hide it first, then delete the files.
  const next = await editManifest(items => items.filter(i => i.id !== id));
  const k = keys(id);
  await Promise.all(
    [k.sm, k.lg, k.video].map(path => remove({ path }).catch(() => {})),
  );
  return next;
}
