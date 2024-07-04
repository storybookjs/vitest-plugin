import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: ['**/portable-story.*'],
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
        // remove this to see Vitest's UI mode
        headless: true,
      },
    },
  })
)
