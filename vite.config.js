import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error',
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    },
    watch: {
      ignored: [
        '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg',
        '**/*.mp4', '**/*.webm', '**/node_modules/**', '**/backend/**', '**/.venv/**'
      ]
    }
  },
  build: {
    target: 'esnext', // Use modern JS syntax for smaller bundles
    
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) {
              return 'vendor-3d-engine'; // Dedicated chunk for 3D engine
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer'; // Dedicated chunk for animations
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react-core';
            }
            return 'vendor-utils';
          }
        }
      }
    },
    chunkSizeWarningLimit: 800,
    cssCodeSplit: true, // Inject CSS separately for each chunk to speed up rendering
  },
  plugins: [
    react({
      babel: {
        plugins: [
          // Optional: Add react compiler/memoization plugins here if needed
        ]
      }
    }),
    viteCompression({
      algorithm: 'brotliCompress', // Brotli compression is usually smaller/faster than gzip
      ext: '.br',
    }),
    viteCompression({
      algorithm: 'gzip', // Fallback gzip for older browsers
      ext: '.gz',
    })
  ]
});