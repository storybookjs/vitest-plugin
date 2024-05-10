import type { Plugin } from 'vite'
import { transform } from './transformer'

type Options = Record<string, unknown>
export const storybookTest = (_options: Options = {}): Plugin => {
  return {
    name: 'vite-plugin-storybook-test',
    enforce: 'pre',
    transform(code, id) {
      if (process.env.VITEST !== 'true') return code
      if (id.match(/\.[cm]?[jt]sx?$/)) return transform(code, id)
    },
  }
}

export default storybookTest
