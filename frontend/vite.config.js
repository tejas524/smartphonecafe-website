import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
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