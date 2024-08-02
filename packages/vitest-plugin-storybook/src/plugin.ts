import { join } from 'node:path'
import type { Plugin } from 'vite'
import { transform } from './transformer'
import type { InternalOptions, UserOptions } from './types'
import { log } from './utils'
import { createRequire } from 'node:module'

const DEFAULT_CONFIG_DIR = '.storybook'

const require = createRequire(import.meta.url)

const defaultOptions: UserOptions = {
  storybookScript: undefined,
  renderer: undefined,
  configDir: undefined,
  storybookUrl: 'http://localhost:6006',
  snapshot: false,
  skipRunningStorybook: false,
  tags: {
    skip: [],
    exclude: [],
    include: ['test'],
  },
}

// biome-ignore lint/suspicious/noExplicitAny: The type should ideally be Plugin from vite, but that causes issues in user land
export const storybookTest = (options?: UserOptions): any => {
  const finalOptions = {
    ...defaultOptions,
    ...options,
    tags: {
      ...defaultOptions.tags,
      ...options?.tags,
    },
  } as InternalOptions

  if (process.env.DEBUG) {
    finalOptions.debug = true
  }

  const storybookUrl = finalOptions.storybookUrl || defaultOptions.storybookUrl

  // To be accessed by the global setup file
  process.env.__STORYBOOK_URL__ = storybookUrl
  process.env.__STORYBOOK_SCRIPT__ = finalOptions.storybookScript

  return {
    name: 'vite-plugin-storybook-test',
    enforce: 'pre' as const,
    async configureServer() {
      // this might be useful in the future
      if (!finalOptions.configDir) {
        finalOptions.configDir = join(
          process.cwd(),
          options?.configDir ?? DEFAULT_CONFIG_DIR
        )
      }
    },
    // biome-ignore lint: fix types later
    async configResolved(config: any) {
      // If we end up needing to know if we are running in browser mode later
      // const isRunningInBrowserMode = config.plugins.find((plugin: Plugin) =>
      //   plugin.name?.startsWith('vitest:browser')
      // )

      config.test ??= {}

      config.test.env ??= {}
      config.test.env = {
        ...config.test.env,
        // To be accessed by the setup file
        __STORYBOOK_URL__: storybookUrl,
      }

      config.resolve ??= {}
      config.resolve.conditions ??= []
      config.resolve.conditions.push('storybook', 'stories', 'test')

      config.test.setupFiles ??= []
      if (typeof config.test.setupFiles === 'string') {
        config.test.setupFiles = [config.test.setupFiles]
      }
      config.test.setupFiles.push(require.resolve('./setup-file.js'))

      // when a Storybook script is provided, we spawn Storybook for the user when in watch mode
      if (finalOptions.storybookScript) {
        config.test.globalSetup = config.test.globalSetup ?? []
        if (typeof config.test.globalSetup === 'string') {
          config.test.globalSetup = [config.test.globalSetup]
        }
        config.test.globalSetup.push(require.resolve('./global-setup.js'))
      }

      config.test.server ??= {}
      config.test.server.deps ??= {}
      config.test.server.deps.inline ??= []
      if (Array.isArray(config.test.server.deps.inline)) {
        config.test.server.deps.inline.push(
          '@storybook/experimental-vitest-plugin'
        )
      }

      log('Final plugin options:', finalOptions)

      return config
    },
    async transform(code, id) {
      if (process.env.VITEST !== 'true') {
        return code
      }

      if (id.match(/(story|stories)\.[cm]?[jt]sx?$/)) {
        return transform({
          code,
          id,
          options: finalOptions,
        })
      }
    },
  } satisfies Plugin
}

export default storybookTest
