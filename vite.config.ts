import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  // Build optimization
  build: {
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,
    
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'clsx'],
        },
      },
    },
    
    // Enable source maps for production debugging
    sourcemap: false,
    
    // Minification
    minify: 'esbuild',
  },
  
  // Development server configuration
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    
    // Proxy API requests to backend
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
