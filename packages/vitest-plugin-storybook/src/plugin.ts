import type { Plugin } from 'vite'
import { join } from 'path'
import { transform } from './transformer'
import { Options } from './types'
import { PACKAGES_MAP } from './utils'

const defaultOptions: Options = {
  configDir: '.storybook',
  renderer: 'react',
  snapshot: false,
}

export const storybookTest = (options?: Partial<Options>): Plugin => {
  const virtualModuleId = '/virtual:storybook-setup.js'
  const resolvedVirtualModuleId = '\0' + virtualModuleId
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
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const metadata = PACKAGES_MAP[finalOptions.renderer]
        return `
          console.log("from virtual module")
          import { afterEach, vi } from 'vitest'
          import { setProjectAnnotations } from '${metadata.storybookPackage}'
          import { cleanup } from '${metadata.testingLibraryPackage}'

          import globalStorybookConfig from '${storybookDirPath}/preview'

          afterEach(() => {
            cleanup()
          })
          setProjectAnnotations(globalStorybookConfig)
        `
      }
    },
    config(config: any) {
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
      config.test.setupFiles.push(virtualModuleId)

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
