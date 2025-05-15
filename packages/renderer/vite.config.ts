import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-dropdown-menu',
      'lucide-react'
    ],
    force: true
  },
  build: {
    sourcemap: true,
  },
  server: {
    hmr: true,
    watch: {
      usePolling: true,
    }
  }
})
