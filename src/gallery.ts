import outputs from "../amplify_outputs.json";

/** One entry of gallery/manifest.json. */
export type Item = {
  id: string;
  kind: "photo" | "video";
  w: number;
  h: number;
  /** Darkened dominant color, shown while the media loads. */
  color: string;
  /** Alt text only — never shown. */
  title: string;
  /** Capture date (ISO) when known; the gallery is sorted newest first. */
  taken: string | null;
  added: string;
};

export const GALLERY_URL: string | undefined = (outputs as { custom?: { galleryUrl?: string } })
  .custom?.galleryUrl;

export const MANIFEST = "gallery/manifest.json";
export const keys = (id: string) => ({
  sm: `gallery/${id}-sm`,
  lg: `gallery/${id}-lg`,
  video: `gallery/${id}-v`,
});

const cdn = (key: string) => `${GALLERY_URL}/${key}`;
export const sm = (p: Item) => cdn(keys(p.id).sm);
export const lg = (p: Item) => cdn(keys(p.id).lg);
export const mp4 = (p: Item) => cdn(keys(p.id).video);
export const isVideo = (p: Item) => p.kind === "video";

export const sortItems = (items: Item[]) =>
  items.slice().sort((a, b) => (b.taken ?? b.added).localeCompare(a.taken ?? a.added));

/** Public read through the CDN. A missing manifest is just an empty gallery. */
export async function fetchManifest(): Promise<Item[]> {
  if (!GALLERY_URL) return [];
  try {
    const r = await fetch(cdn(MANIFEST), { cache: "no-cache" });
    return r.ok ? ((await r.json()) as Item[]) : [];
  } catch {
    return [];
  }
}
