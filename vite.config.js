import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// vitejs.dev
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/flux/"
});
