import { storybookTest } from '@storybook/experimental-vitest-plugin'
import Inspect from 'vite-plugin-inspect'
import { defineConfig, mergeConfig } from 'vitest/config'
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
      include: ['**/*.test.*', '**/*.test.*'],
      browser: {
        name: 'chrome',
        provider: 'webdriverio',
        headless: true,
      },
      environment: 'happy-dom',
      includeSource: ['./src/**/*.stories.[jt]sx?'],
    },
  })
)
