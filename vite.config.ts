import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react')) return 'react';
            if (id.includes('react-router')) return 'router';
            if (id.includes('@radix-ui')) return 'radix';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) return 'forms';
            if (id.includes('date-fns')) return 'date';
            if (id.includes('embla-carousel')) return 'carousel';
            return 'vendor';
          }
        },
      },
    },
  },
  preview: {
    port: 4173,
    host: true
  },
  server: {
    port: 3000,
    host: true
  }
});
