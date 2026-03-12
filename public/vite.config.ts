import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import fs from 'fs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const isDev = mode === 'development';

  // Use mkcert certs for Vite HTTPS dev server if available
  const certPath = env.SSL_CERT_PATH;
  const keyPath = env.SSL_KEY_PATH;
  const httpsConfig =
    certPath && keyPath && fs.existsSync(certPath) && fs.existsSync(keyPath)
      ? { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) }
      : undefined;

  const backendUrl = isDev
    ? httpsConfig
      ? 'https://localhost:3000'
      : 'http://localhost:3000'
    : env.VITE_BACKEND_URL;

  return {
    plugins: [react()],
    worker: {
      format: 'es',
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          addon: path.resolve(__dirname, 'addon.html'),
        },
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-mantine': [
              '@mantine/core',
              '@mantine/hooks',
              '@mantine/form',
              '@mantine/charts',
              '@mantine/carousel',
              '@mantine/dropzone',
            ],
            'vendor-mobx': ['mobx', 'mobx-react-lite'],
            'vendor-icons': ['@tabler/icons-react'],
            'vendor-supabase': ['@supabase/supabase-js'],
          },
        },
      },
    },
    server: {
      https: httpsConfig,
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
