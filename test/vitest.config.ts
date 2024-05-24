import { storybookTest } from 'vitest-plugin-storybook'
import Inspect from 'vite-plugin-inspect'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    Inspect({ build: true, outputDir: '.vite-inspect' }),
    storybookTest({
      mode: 'stories',
    }),
  ],
  test: {
    browser: {
      name: 'chrome',
    },
    environment: 'jsdom',
    includeSource: ['./src/**/*.stories.[jt]sx?'],
  },
})
