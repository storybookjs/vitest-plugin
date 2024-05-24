import type { Plugin } from 'vite'
import { transform } from './transformer'
import { Options } from './types'

const defaultOptions: Options = {
  mode: 'stories',
  storybookPackage: '@storybook/react',
  testingLibraryPackage: '@testing-library/react',
  snapshot: false,
}

export const storybookTest = (options: Options): Plugin => {
  return {
    name: 'vite-plugin-storybook-test',
    enforce: 'pre',
    async transform(code, id) {
      if (process.env.VITEST !== 'true') return code
      if (id.match(/\.[cm]?[jt]sx?$/))
        return transform({
          code,
          id,
          options: { ...defaultOptions, ...options },
        })
    },
  }
}

export default storybookTest
