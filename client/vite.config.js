import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Vite = the tool that runs the React app (npm run dev) and bundles it (npm run build).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 }
});
