import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { splitVendorChunkPlugin } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    mode === 'analyze' && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      disable: mode === 'development',
      includeAssets: [
        'favicon.png', 
        'icons/*.png',
        'images/ways/webp/way_s1_w1.webp',
        'images/ways/webp/way_s1_w2.webp',
        'images/ways/webp/way_s1_w3.webp',
        'images/ways/webp/way_s1_w4.webp',
        'images/ways/webp/way_s1_w5.webp',
        'images/ways/webp/way_s1_w6.webp'
      ],
      manifest: {
        name: 'WAY+',
        short_name: 'WAY+',
        description: 'Terapia Gamificada para niños con TEA',
        theme_color: '#6366f1',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        globIgnores: [
          '**/pdf-*.js',
          '**/PatientAnalyticsView-*.js',
          '**/EvolutionCharts-*.js',
          '**/framer-*.js',
          '**/supabase-*.js',
        ],
      }
    })
  ],

  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: mode !== 'production',
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation-vendor': ['framer-motion'],
          'state-vendor': ['zustand', '@tanstack/react-query'],
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name || '';
          if (/\.css$/.test(info)) return 'assets/css/[name]-[hash][extname]';
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(info))
            return 'assets/img/[name]-[hash][extname]';
          return 'assets/[name]-[hash][extname]';
        },
      }
    },
    chunkSizeWarningLimit: 500,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'zustand', 
      'framer-motion', 
      '@tanstack/react-query',
      '@supabase/supabase-js'
    ],
    force: true,
  },
}))
