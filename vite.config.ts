import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Используем относительные пути для деплоя
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@entities': path.resolve(__dirname, './src/entities'),
      '@features': path.resolve(__dirname, './src/features'),
      '@widgets': path.resolve(__dirname, './src/widgets'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@pages': path.resolve(__dirname, './src/pages'),
    },
  },
  
  // Production оптимизации
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Отключаем sourcemaps для production
    minify: 'terser', // Используем terser для лучшей минификации
    target: 'esnext',
    
    // Оптимизация chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // React и ReactDOM в отдельный chunk
          'react-vendor': ['react', 'react-dom'],
          // Zustand в отдельный chunk
          'state-vendor': ['zustand'],
        },
        // Оптимальные имена для кэширования
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    
    // Настройки minification
    terserOptions: {
      compress: {
        drop_console: true, // Удаляем console.log в production
        drop_debugger: true, // Удаляем debugger
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Удаляем specific console методы
      },
      format: {
        comments: false, // Удаляем комментарии
      },
    },
    
    // Ограничение размера chunk warning
    chunkSizeWarningLimit: 1000,
    
    // Оптимизация CSS
    cssCodeSplit: true,
    cssMinify: true,
  },
  
  // Optimization для dev сервера
  server: {
    port: 5173,
    host: true,
    open: true, // Автоматически открывать браузер
  },
  
  // Preview сервер конфигурация
  preview: {
    port: 4173,
    host: true,
    open: true,
  },
})

