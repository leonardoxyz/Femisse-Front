import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Proxy apenas em desenvolvimento
    ...(mode === 'development' && {
      proxy: {
        '/api': 'http://localhost:4000',
      },
    }),
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configurações de build para produção
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, 
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Code splitting otimizado
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React core
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // UI components (Radix UI)
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            // Forms
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'vendor-forms';
            }
            // Charts
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            // Outros vendors
            return 'vendor-misc';
          }
        },
        // Configuração específica para assets de mídia
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const extType = info[info.length - 1];
          if (/mp4|webm|ogg|avi|mov/i.test(extType)) {
            return `assets/videos/[name]-[hash][extname]`;
          }
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Aumenta o limite para arquivos grandes (vídeos)
    assetsInlineLimit: 0, // Força todos os assets a serem arquivos separados
    chunkSizeWarningLimit: 1000, // Avisa se chunks > 1MB
  },
  // Configuração para assets de mídia
  assetsInclude: ['**/*.mp4', '**/*.webm', '**/*.ogg', '**/*.avi', '**/*.mov'],
}));
