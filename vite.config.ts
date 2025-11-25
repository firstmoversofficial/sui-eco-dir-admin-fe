import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    publicDir: "./public",
    base: "/",
    server: {
        port: 5174,
    },
    preview: {
        port: 4174,
        host: "0.0.0.0",
        strictPort: false,
        allowedHosts: [
            "sui-eco-dir-admin-fe-production.up.railway.app",
            ".up.railway.app",
            "localhost",
        ],
    },
});
