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
        '**/*.{story,stories}.?(c|m)[jt]s?(x)',
        // '**/*.transformed.*',
      ],
      browser: {
        enabled: true,
        name: 'chromium',
        // information about wdio vs playwright:
        // wdio doesn't support parallelization
        // wdio's userEvent API is sometimes 2x slower
        // wdio is slow in general because every action is an http request rather than websocket connection
        provider: 'playwright',
        headless: true,
        screenshotFailures: false,
      },
      setupFiles: ['./setupTests.ts'],
      environment: 'happy-dom',
    },
  },
])
