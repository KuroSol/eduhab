import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Ensure you import 'path' to resolve paths

export default defineConfig({
  root: '.',
  publicDir: 'public',
  resolve: {
    alias: {
      // Adjust the alias as per your project structure
      'pdfjs-dist': path.resolve(__dirname, 'node_modules/pdfjs-dist'),
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './public/index.html' // Explicitly set input to index.html
    },
  },
  plugins: [react()],
});
