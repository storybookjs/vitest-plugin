import { storybookTest } from '@storybook/experimental-vitest-plugin'
import Inspect from 'vite-plugin-inspect'
import { defineConfig, mergeConfig, defaultExclude } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [
      Inspect({ build: true, outputDir: '.vite-inspect' }),
      storybookTest({
        renderer: 'react',
        tags: {
          skip: ['skip'],
        },
      }),
    ],
    test: {
      include: ['**/*.test.*'],
      exclude: [...defaultExclude, '**/portable-story.*'],
      browser: {
        name: 'chromium',
        provider: 'playwright',
        headless: true,
      },
      environment: 'happy-dom',
      includeSource: ['./src/**/*.stories.[jt]sx?'],
    },
  })
)
