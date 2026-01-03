import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // 🔥 REQUIRED for GitHub Pages
  base: "/mern-auth-products/",

  // 👇 dev-only proxy (safe to keep)
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
