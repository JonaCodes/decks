import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const isDev = mode === 'development';
  const backendUrl = isDev ? 'http://localhost:3000' : env.VITE_BACKEND_URL;

  return {
    plugins: [react()],
    worker: {
      format: 'es',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React runtime
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // UI framework
            'vendor-mantine': [
              '@mantine/core',
              '@mantine/hooks',
              '@mantine/form',
              '@mantine/charts',
              '@mantine/carousel',
              '@mantine/dropzone',
            ],
            // State management
            'vendor-mobx': ['mobx', 'mobx-react-lite'],
            // Icons (can be large)
            'vendor-icons': ['@tabler/icons-react'],
            // Supabase client
            'vendor-supabase': ['@supabase/supabase-js'],
          },
        },
      },
    },
    server: {
      proxy: {
        '^/auth/(?!callback).*': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        '/public/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
      fs: {
        strict: false,
      },
    },
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, '../shared'),
        'public/src': path.resolve(__dirname, 'src'),
      },
      extensions: ['.ts', '.tsx', '.js', '.json'],
    },
  };
});
