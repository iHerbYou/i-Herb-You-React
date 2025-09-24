import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-only proxy: Frontend calls to /api/* → backend at 8080
// In production, this proxy does not apply. Use VITE_API_BASE_URL instead.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
