import { storybookTest } from '@storybook/experimental-vitest-plugin'
import Inspect from 'vite-plugin-inspect'
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  './vitest.config.ts',
  {
    extends: './vite.config.ts',
    plugins: [
      Inspect({ build: true, outputDir: '.vite-inspect' }),
      storybookTest({
        renderer: 'react',
      }),
    ],
    test: {
      name: 'storybook',
      include: [
        // '**/*.transformed.test.*',
        '**/*.{story,stories}.?(c|m)[jt]s?(x)',
      ],
      // browser: {
      //   enabled: true,
      //   name: 'chrome',
      //   provider: 'webdriverio',
      //   headless: true,
      // },
      setupFiles: ['./setupTests.ts'],
      environment: 'happy-dom',

      // isolate experiments
      // isolate: false,
      // poolOptions: {
      //   threads: {
      //     isolate: false,
      //   },
      //   forks: {
      //     isolate: false
      //   }
      // }
    },
  },
])
