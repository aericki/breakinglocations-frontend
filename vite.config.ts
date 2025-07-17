import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), svgr(),tailwindcss()],
  "base": "/",
  server: {
    proxy: {

      '/api': {
        target: 'http://192.168.5.45:4000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor_react';
            }
            if (id.includes('firebase')) {
              return 'vendor_firebase';
            }
            if (id.includes('leaflet')) {
              return 'vendor_leaflet';
            }
            return 'vendor'; // all other node_modules
          }
        }
      }
    }
  }
})
