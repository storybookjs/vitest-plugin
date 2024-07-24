import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from '../vite.config'
import { storybookTest } from '@storybook/experimental-vitest-plugin'

export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [
      storybookTest({
        renderer: 'react',
      }),
    ],
    test: {
      name: 'storybook',
      include: ['../src/**/*.{story,stories}.?(c|m)[jt]s?(x)'],
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
        headless: true,
      },
      setupFiles: ['./setupTests.ts'],
      environment: 'happy-dom',
    },
  })
)
