import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: [
          'beulah-speedful-provincially.ngrok-free.dev',
          'localhost',
          '127.0.0.1'
        ]
      },
      plugins: [react()],
      define: {},
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        chunkSizeWarningLimit: 650,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              leaflet: ['leaflet', 'react-leaflet']
            }
          }
        }
      },
      test: {
        environment: 'jsdom',
        setupFiles: './tests/setup.ts',
        globals: true
      }
    };
});
