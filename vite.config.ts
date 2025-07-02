import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
    
  ],
  server: {
    port: 3002,
    host: true,
    strictPort: true,
    cors: true,
    hmr: {
      host: 'admin.meetowner.in',
      port: 3002,
      protocol: "ws",
      clientPort: 3002,
    },
  },
  define: {
    "process.env.REACT_APP_API_URL": JSON.stringify("https://api.meetowner.in"),
  },
});