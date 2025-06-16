import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8087,
    proxy: {
      '/api': {
        target: 'https://shop-v-backend-production.up.railway.app',
        changeOrigin: true,
        secure: true,
        // rewrite: (path) => path,
        // cookieDomainRewrite: 'localhost',
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
