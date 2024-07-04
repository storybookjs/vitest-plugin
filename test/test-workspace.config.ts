import { storybookTest } from '@storybook/experimental-vitest-plugin'
import Inspect from 'vite-plugin-inspect'
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    extends: './vite.config.ts',
  },
  {
    plugins: [
      Inspect({ build: true, outputDir: '.vite-inspect' }),
      storybookTest(),
    ],
    test: {
      browser: {
        enabled: true,
        headless: true,
        name: 'chrome',
        provider: 'webdriverio',
      },
      includeSource: ['./src/**/*.stories.[jt]sx?'],
    },
  },
])