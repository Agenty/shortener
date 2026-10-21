import path from 'path';
import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tailwindcss(),
    tanstackStart({
      prerender: { enabled: true },
    }),
    viteReact(),
  ],
  environments: {
    client: {
      build: {
        rolldownOptions: {
          output: {
            // Merge tiny per-module chunks (each icon / ui component) into a few
            // shared chunks so pages don't fire hundreds of modulepreload requests.
            codeSplitting: {
              groups: [
                {
                  name: 'react',
                  test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
                  priority: 30,
                },
                {
                  name: 'router',
                  test: /node_modules[\\/]@tanstack[\\/]/,
                  priority: 25,
                },
                {
                  name: 'icons',
                  test: /node_modules[\\/]lucide-react[\\/]/,
                  priority: 20,
                },
                {
                  // Scalar lazy-imports each svg icon as its own module; bundle them with
                  // the Vue runtime they depend on (only loaded on the API docs page).
                  name: 'scalar-vendor',
                  test: /node_modules[\\/](@scalar[\\/].*\.svg|@vue[\\/])/,
                  priority: 15,
                },
                {
                  name: 'ui',
                  test: /src[\\/]components[\\/]ui[\\/]|node_modules[\\/](@base-ui|class-variance-authority|clsx|tailwind-merge)[\\/]/,
                  priority: 10,
                },
              ],
            },
          },
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
