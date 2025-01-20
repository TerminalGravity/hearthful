import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '..'),
      '@/lib': path.resolve(__dirname, '../lib'),
      '@/components': path.resolve(__dirname, '../components'),
    },
  },
}); 