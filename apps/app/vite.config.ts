import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("lucide-react")) {
            return "icons"; // Merge all icons components into dist/icons.js
          }
          if (id.includes("/components/ui/")) {
            return "ui"; // Merge all Shadcn UI components dist/ui.js
          }
        },
      },
    },
  },
});