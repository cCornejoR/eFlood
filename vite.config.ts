import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(() => ({
  plugins: [react()],

  // Path aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/assets': path.resolve(__dirname, './src/assets'),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**', '**/src-python/**'],
    },
  },

  // Build configuration
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' as const : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
    // Configuración para archivos grandes
    chunkSizeWarningLimit: 2000, // 2MB chunks
    rollupOptions: {
      output: {
        // Separar chunks grandes
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', '@heroicons/react', 'lucide-react'],
          charts: ['plotly.js', 'react-plotly.js', 'recharts'],
          vtk: ['@kitware/vtk.js'],
          animations: ['framer-motion', 'gsap', 'motion'],
          table: ['@tanstack/react-table'],
        },
      },
    },
    // Configuración de assets
    assetsInlineLimit: 0, // No inline assets para archivos grandes
  },

  // Optimización para archivos grandes
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tauri-apps/api',
      '@tauri-apps/plugin-dialog',
      '@tauri-apps/plugin-opener',
    ],
    exclude: ['@kitware/vtk.js'], // VTK es muy grande, excluir de pre-bundling
  },
}));
