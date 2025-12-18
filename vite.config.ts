import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const host = "localhost";
const port = 3000;

export default defineConfig({
  plugins: [react()],
  server: {
    host,
    port,
  },
  preview: {
    port,
  },
});
