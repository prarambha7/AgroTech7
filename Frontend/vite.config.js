import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { url } from "./src/Data/url";

// https://vitejs.dev/config/

// const url = `http://192.168.1.78:8000`;
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: url,
        secure: false,
      },
      "/callcenter": {
        target: url,
        secure: false,
      },
      "/salesofficer": {
        target: url,
        secure: false,
      },
      "/salesmanager": {
        target: url,
        secure: false,
      },
    },
  },
  plugins: [react()],
});
