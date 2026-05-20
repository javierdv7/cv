import { serve } from "bun";
import index from "./index.html";

const server = serve({
  port: Number(process.env.PORT) || 3000,
  routes: {
    "/wallpaper.png": () =>
      new Response(Bun.file("./public/wallpaper.png"), {
        headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
      }),
    "/indies.la.png": () =>
      new Response(Bun.file("./public/indies.la.png"), {
        headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
      }),
    "/logos-page.png": () =>
      new Response(Bun.file("./public/logos-page.png"), {
        headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
      }),
    "/skyward-sword.png": () =>
      new Response(Bun.file("./public/skyward-sword.png"), {
        headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
      }),
    "/iconcv.png": () =>
      new Response(Bun.file("./public/iconcv.png"), {
        headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
      }),
    "/cv.pdf": () =>
      new Response(Bun.file("./public/cv.pdf"), {
        headers: {
          "Content-Type": "application/pdf",
          "Cache-Control": "public, max-age=3600",
          "Content-Disposition": 'inline; filename="cv.pdf"',
        },
      }),
    "/experiments/*": async req => {
      const u = new URL(req.url);
      const safe = u.pathname.replace(/\.\./g, "");
      const file = Bun.file(`./public${safe}`);
      if (!(await file.exists())) return new Response("Not Found", { status: 404 });
      return new Response(file, {
        headers: { "Cache-Control": "public, max-age=3600" },
      });
    },
    "/*": index,
  },
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
