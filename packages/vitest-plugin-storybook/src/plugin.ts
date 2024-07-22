import { join } from 'node:path'
import type { Plugin } from 'vite'
import { StorybookReporter } from './storybook-reporter'
import { transform } from './transformer'
import type { InternalOptions, UserOptions } from './types'
import { log } from './utils'

const DEFAULT_CONFIG_DIR = '.storybook'

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
  const virtualSetupFileId = '/virtual:storybook-setup.js'
  const resolvedVirtualSetupFileId = `\0${virtualSetupFileId}`

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

  // storybookUrl is used in CI to point to a deployed Storybook URL
  const storybookUrl = finalOptions.storybookUrl || defaultOptions.storybookUrl

  return {
    name: 'vite-plugin-storybook-test',
    enforce: 'pre' as const,
    resolveId(id) {
      if (id.startsWith(virtualSetupFileId)) {
        return resolvedVirtualSetupFileId
      }
    },
    load(id) {
      if (id === resolvedVirtualSetupFileId) {
        // The purpose of this virtual set up file is to modify the error message of failed tests
        // and inject a link to the story in Storybook
        const setupFileContent = `
          import { afterAll } from 'vitest'

          const modifyErrorMessage = (task) => {
            task.tasks?.forEach((currentTask) => {
              if (currentTask.type === 'test' && currentTask.result?.state === 'fail' && currentTask.meta.storyId) {
                const currentError = currentTask.result.errors[0]
                let storyUrl = '${storybookUrl}/?path=/story/' + currentTask.meta.storyId
                if (currentTask.meta.hasPlayFunction) {
                  storyUrl = storyUrl + '&addonPanel=storybook/interactions/panel'
                }
                currentError.message = 
                  '\\n\x1B[34m' + 
                  'Click to debug the error directly in Storybook: ' + storyUrl + '\x1B[39m' + 
                  '\\n\\n' + currentError.message
              }
            })
          }

          afterAll(suite => {
            suite.tasks.forEach(modifyErrorMessage)
          })
        `
        // log('Virtual setup file content:\n', setupFileContent)
        return setupFileContent
      }
    },
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
      // TODO: find a better way to detect if we're running in browser mode
      const isRunningInBrowserMode = config.plugins.find((plugin: Plugin) =>
        plugin.name?.startsWith('vitest:browser')
      )

      if (isRunningInBrowserMode) {
        config.define = config.define ?? {}
        config.define['process.env'] = {}
      }

      // current workaround for Vitest v1 projects where users have server.open = true in their App's vite config file
      config.server.open = false
      config.test = config.test ?? {}

      config.test.setupFiles = config.test.setupFiles ?? []
      if (typeof config.test.setupFiles === 'string') {
        config.test.setupFiles = [config.test.setupFiles]
      }
      config.test.setupFiles.push(virtualSetupFileId)

      if (finalOptions.storybookScript && !finalOptions.skipRunningStorybook) {
        config.test.reporters = config.test.reporters ?? ['default']

        // Start Storybook CLI in background if not already running
        // And send story status to Storybook's sidebar
        config.test.reporters.push(new StorybookReporter(finalOptions))
      }

      log('Final plugin options:', finalOptions)
      // log("Final Vitest config:", config);

      return config
    },
    async transform(code, id) {
      if (process.env.VITEST !== 'true') return code
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
