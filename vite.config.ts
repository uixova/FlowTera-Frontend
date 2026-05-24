import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env        = loadEnv(mode, process.cwd(), '');
  const gatewayUrl = env.VITE_GATEWAY_URL || 'http://localhost:3002';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    esbuild: {
      // Strip all console.* and debugger statements in production builds
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': { target: gatewayUrl, changeOrigin: true },
        '/ml':  { target: gatewayUrl, changeOrigin: true },
      },
    },
  };
});
