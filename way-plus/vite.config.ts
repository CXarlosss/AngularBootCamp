import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
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
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            if (id.includes('zustand')) {
              return 'state';
            }
            if (id.includes('framer-motion')) {
              return 'framer';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('jspdf')) {
              return 'pdf';
            }
            return 'vendor';
          }
        }
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
    include: ['react', 'react-dom', 'zustand', 'framer-motion', '@supabase/supabase-js'],
    force: true,
  },
}))
