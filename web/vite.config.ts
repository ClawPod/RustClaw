import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Build-only config. The web dashboard is served by the Rust gateway
// via rust-embed. Run `npm run build` then `cargo build` to update.
export default defineConfig({
  base: "/_app/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy the essential gateway routes to the backend
      "/pair": "http://localhost:42617",
      "/health": "http://localhost:42617",
      "/api": "http://localhost:42617",
      // Proxy WebSockets for chat and nodes
      "/ws": {
        target: "ws://localhost:42617",
        ws: true,
      },
    },
  },
  build: {
    outDir: "dist",
  },
});
