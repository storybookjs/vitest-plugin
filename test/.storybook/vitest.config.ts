import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from '../vite.config'
import { storybookTest } from '@storybook/experimental-vitest-plugin'
import Inspect from 'vite-plugin-inspect'

export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [
      storybookTest({
        renderer: 'react',
        storybookScript: 'pnpm run storybook --ci',
      }),
      Inspect({ build: true, outputDir: '.vite-inspect' }),
    ],
    test: {
      name: 'storybook',
      include: ['../src/**/*.{story,stories}.?(c|m)[jt]s?(x)'],
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
        headless: true,
        screenshotFailures: false,
      },
      setupFiles: ['./setupTests.ts'],
      environment: 'happy-dom',
    },
  })
)
