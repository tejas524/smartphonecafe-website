import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { siteOutput } from "./scripts/site-output.mjs";

export default defineConfig(({ mode }) => {
  const preview = mode === "preview";
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const site = new URL(env.VITE_SITE_URL || (preview ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || "smartphonecafe-website-pied.vercel.app"}` : "https://smartphonecafe.in"));
  if (site.protocol !== "https:" || site.username || site.password || site.pathname !== "/" || site.search || site.hash) throw new Error("VITE_SITE_URL must be an HTTPS origin without credentials or a path");
  const siteUrl = site.origin;
  return ({
  define: {
    "import.meta.env.VITE_STATIC_PREVIEW": JSON.stringify(mode === "preview"),
    "import.meta.env.VITE_SITE_URL": JSON.stringify(siteUrl),
  },
  plugins: [react(), tailwindcss(), siteOutput({ preview, siteUrl })],
  // Preview serves exported uploads instead of forwarding them to localhost.
  preview: { proxy: {} },
  // Dev-only: proxy API + uploaded images to the Express backend (port 4000)
  // so the frontend dev server can read live MySQL-backed content and images.
  // In production the same origin serves both, so no proxy is needed there.
  server: {
    proxy: {
      "/api": { target: "http://localhost:4000", changeOrigin: true },
      "/uploads": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    // Disable the inline module-preload polyfill so the built index.html
    // contains NO inline <script>. This lets the server send a strict
    // Content-Security-Policy with `script-src 'self'` (no 'unsafe-inline').
    // Modern browsers support <link rel="modulepreload"> natively; older ones
    // simply skip preloading and still load the module scripts normally.
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks: {
          router: ["react-router-dom"],
        },
      },
    },
  },
});
});
