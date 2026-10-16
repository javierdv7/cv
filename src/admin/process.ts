/**
 * Turns an original photo/video into the files the gallery serves, entirely
 * in the browser. Re-encoding drops every metadata block, so nothing like
 * GPS ever leaves this machine.
 *
 *   photo → <id>-sm (900px) + <id>-lg (2400px), webp (jpeg where the browser
 *           can't encode webp, e.g. Safari)
 *   video → <id>-v (silent H.264 mp4, ≤1920px, rotation baked in) + poster sm/lg
 */
import exifr from "exifr";
import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  CanvasSink,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
} from "mediabunny";

export type Processed = {
  w: number;
  h: number;
  color: string;
  taken: string | null;
  files: { sm: Blob; lg: Blob; video?: Blob };
};

const SIZES = { sm: 900, lg: 2400 } as const;
const VIDEO_MAX = 1920;

export const isVideoFile = (f: File) =>
  f.type.startsWith("video/") || /\.(mov|mp4|m4v|webm)$/i.test(f.name);

async function encode(src: CanvasImageSource & { width: number; height: number }, edge: number, quality: number) {
  const s = Math.min(1, edge / Math.max(src.width, src.height));
  const c = new OffscreenCanvas(Math.round(src.width * s), Math.round(src.height * s));
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, c.width, c.height);
  const webp = await c.convertToBlob({ type: "image/webp", quality });
  // Safari silently falls back to png for unsupported types.
  return webp.type === "image/webp" ? webp : c.convertToBlob({ type: "image/jpeg", quality });
}

/** Darkened average color: the placeholder behind each tile. */
function placeholder(src: CanvasImageSource) {
  const c = new OffscreenCanvas(1, 1);
  const ctx = c.getContext("2d")!;
  ctx.drawImage(src, 0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return `#${[r, g, b].map(n => Math.round(n * 0.35).toString(16).padStart(2, "0")).join("")}`;
}

async function stills(src: ImageBitmap) {
  return {
    sm: await encode(src, SIZES.sm, 0.8),
    lg: await encode(src, SIZES.lg, 0.88),
    color: placeholder(src),
  };
}

export async function processPhoto(file: File): Promise<Processed> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("este navegador no puede leer el formato — exporta como jpg");
  }
  const { sm, lg, color } = await stills(bmp);
  const { width: w, height: h } = bmp;
  bmp.close();
  const exif = await exifr.parse(file, { pick: ["DateTimeOriginal", "CreateDate"] }).catch(() => null);
  const taken: unknown = exif?.DateTimeOriginal ?? exif?.CreateDate;
  return {
    w,
    h,
    color,
    taken: taken instanceof Date && !isNaN(+taken) ? taken.toISOString() : null,
    files: { sm, lg },
  };
}

const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);

export async function processVideo(file: File, onProgress: (p: number) => void): Promise<Processed> {
  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
  const track = await input.getPrimaryVideoTrack();
  if (!track) throw new Error("no se encontró pista de video");

  const s = Math.min(1, VIDEO_MAX / Math.max(track.displayWidth, track.displayHeight));
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: "in-memory" }),
    target: new BufferTarget(),
  });
  const conversion = await Conversion.init({
    input,
    output,
    tracks: "primary",
    tags: {}, // write no metadata (no GPS, no device info)
    video: {
      width: even(track.displayWidth * s),
      height: even(track.displayHeight * s),
      fit: "contain",
      codec: "avc",
      quality: QUALITY_HIGH,
      forceTranscode: true,
      allowTransformationMetadata: false,
    },
    audio: { discard: true }, // the gallery is silent
    showWarnings: false,
  });
  const lostVideo = conversion.discardedTracks.find(d => d.track.isVideoTrack());
  if (!conversion.isValid || lostVideo) {
    throw new Error(`no se puede convertir este video en este navegador (${lostVideo?.reason ?? "inválido"})`);
  }
  conversion.onProgress = onProgress;
  await conversion.execute();

  const video = new Blob([output.target.buffer!], { type: "video/mp4" });

  // Poster from the encoded file: already upright and resized.
  const out = new Input({ formats: ALL_FORMATS, source: new BlobSource(video) });
  const outTrack = (await out.getPrimaryVideoTrack())!;
  const duration = await out.computeDuration();
  const frame = await new CanvasSink(outTrack).getCanvas(duration > 2 ? 1 : 0);
  if (!frame) throw new Error("no se pudo extraer el póster");
  const bmp = await createImageBitmap(frame.canvas);
  const { sm, lg, color } = await stills(bmp);
  bmp.close();

  const tags = await input.getMetadataTags().catch(() => null);
  const taken = tags?.date && !isNaN(+tags.date) ? tags.date.toISOString() : null;

  return {
    w: outTrack.displayWidth,
    h: outTrack.displayHeight,
    color,
    taken,
    files: { sm, lg, video },
  };
}
