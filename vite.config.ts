import { fileURLToPath, URL } from 'node:url'
import path from 'path';

import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

import { quasar } from '@quasar/vite-plugin'

console.log("XXX", __dirname);

// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE ?? "",

  build: { // new

    emptyOutDir: true, // We clear the output dir every build
    outDir: process.env.OUT_DIR ?? path.resolve(__dirname, "./backend/static"), // we change the output dir to match django settings
    assetsDir: path.resolve(__dirname,"."), // we put all assets inbase: "/static", the frontend folder in the static folder

    rollupOptions: {
      external: [
        fileURLToPath(new URL("./src/assets/base.scss", import.meta.url))
      ],
      input: ["./index.html"], // the entry point here is no longer the index.html but the main.ts,
      output: {
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
    manifest: "manifest.json",
    sourcemap: true,
    modulePreload: true
  },
  plugins: [
    vue({

      template: {
        transformAssetUrls: {
          base: null,
          includeAbsolute: false,
        },
      }
    }),

    // @quasar/plugin-vite options list:
    // https://github.com/quasarframework/quasar/blob/dev/vite-plugin/index.d.ts
    quasar({
      sassVariables: fileURLToPath(
        new URL('./src/quasar-variables.sass', import.meta.url)
      ),
    }),

    vueJsx(),
    vueDevTools(),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, './src/assets') + '/[!.]*',
          dest: '.',
        },
      ],
    }),
  ],
  css: {
    devSourcemap: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})


