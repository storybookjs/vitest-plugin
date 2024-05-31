import type { Plugin } from 'vite'
import { join } from 'path'
import { transform } from './transformer'
import { Options } from './types'
// import CustomReporter from './reporter'
import { PACKAGES_MAP } from './utils'

const defaultOptions: Options = {
  configDir: '.storybook',
  renderer: 'react',
  snapshot: false,
}

export const storybookTest = (options?: Partial<Options>): Plugin => {
  const virtualSetupFileId = '/virtual:storybook-setup.js'
  const resolvedVirtualSetupFileId = '\0' + virtualSetupFileId
  let storybookDirPath: string

  const finalOptions = { ...defaultOptions, ...options }

  return {
    name: 'vite-plugin-storybook-test',
    enforce: 'pre',
    configResolved(config) {
      if (!options?.configDir) {
        // if you don't specify configDir, I'll try to find .storybook relative to the root
        storybookDirPath = join(process.cwd(), finalOptions.configDir!)
      } else {
        // if you do specify configDir, I'll try to find relative to the config file
        storybookDirPath = join(config.configFile!, finalOptions.configDir!)
      }
    },
    resolveId(id) {
      if (id === virtualSetupFileId) {
        return resolvedVirtualSetupFileId
      }
    },
    load(id) {
      if (id === resolvedVirtualSetupFileId) {
        const metadata = PACKAGES_MAP[finalOptions.renderer]
        return `
          import { afterEach, afterAll, vi } from 'vitest'
          import { setProjectAnnotations } from '${metadata.storybookPackage}'
          import { cleanup } from '${metadata.testingLibraryPackage}'

          import globalStorybookConfig from '${storybookDirPath}/preview'

          afterEach(() => {
            cleanup()
          })

          const modifyErrorMessage = (task) => {
            task.tasks.forEach((currentTask) => {
              if (currentTask.type === 'test' && currentTask.result.state === 'fail') {
                const currentError = currentTask.result.errors[0]
                const storyUrl = 'http://localhost:6006/?path=/story/' + currentTask.meta.storyId
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
          setProjectAnnotations(globalStorybookConfig)
        `
      }
    },
    async config(config: any) {
      config.test = config.test ?? {}
      // add a prefix to the tests when in a workspace scenario
      if (config.workspaceConfigPath) {
        config.test.name = 'storybook'
      }
      // enable isolate false by default for better performance
      config.test.isolate = config.test.isolate ?? false
      // enable globals so there's more compatibility with third party libraries e.g. vi-canvas-mock
      config.test.globals = config.test.globals ?? true
      config.test.include = config.test.include || []
      config.test.include.push('**/*.{story,stories}.?(c|m)[jt]s?(x)')

      config.test.setupFiles = config.test.setupFiles || []
      config.test.setupFiles.push(virtualSetupFileId)

      config.test.reporters = config.test.reporters || []

      // config.test.reporters.push(new CustomReporter(finalOptions))

      return config
    },
    async transform(code, id) {
      if (process.env.VITEST !== 'true') return code
      if (id.match(/\.[cm]?[jt]sx?$/))
        return transform({
          code,
          id,
          options: finalOptions,
        })
    },
  }
}

export default storybookTest
