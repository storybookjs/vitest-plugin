import type { SupportedRenderers } from './types'

type RendererSpecificTemplates = {
  storybookPackage: string
}

export const PACKAGES_MAP = {
  nextjs: {
    storybookPackage: '@storybook/nextjs',
  },
  react: {
    storybookPackage: '@storybook/react',
  },
  vue3: {
    storybookPackage: '@storybook/vue3',
  },
  svelte: {
    storybookPackage: '@storybook/svelte',
  },
} satisfies Record<SupportedRenderers, RendererSpecificTemplates>

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const log = (...args: any) => {
  if (process.env.DEBUG || process.env.DEBUG === 'storybook') {
    console.log('🟡 ', ...args)
  }
}
