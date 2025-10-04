import hologyBuild from '@hology/vite-plugin'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    worker: {
      format: 'es'
    },
    esbuild: {
      target: "es2020",
      drop: ['console', 'debugger'],
  },
    plugins: [
      hologyBuild(),
      react({
        babel: {
          plugins: [
            ["@babel/plugin-proposal-decorators", { version: "2023-11" }],
            ["module:@preact/signals-react-transform"],
          ],
        },
      }),
    ],
    define: {
      __POKI__: JSON.stringify(env.VITE_POKI === 'true'),
      __DEV__: JSON.stringify(mode === 'development'),
    }
  }
})