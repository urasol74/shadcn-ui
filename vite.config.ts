import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { viteSourceLocator } from "@metagptx/vite-plugin-source-locator";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    viteSourceLocator({
      prefix: "mgx",
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Настройка сервера для внешних соединений
  server: {
    host: true, // Позволяет принимать соединения с любого IP
    port: 5173,
  },
  // Оптимизация для production сборки
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['@/lib/database', '@/lib/supabase-api'],
        }
      }
    },
    // Включаем минификацию
    minify: 'esbuild',
    // Оптимизация размера чанков
    chunkSizeWarningLimit: 1000
  },
  // Оптимизация зависимостей
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query']
  }
}));