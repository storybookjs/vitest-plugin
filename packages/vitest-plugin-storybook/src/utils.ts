import type { SupportedRenderers } from './types'

type RendererSpecificTemplates = {
  storybookPackage: string
  testingLibraryPackage: string
  render: (composedStory: string) => string
}

export const PACKAGES_MAP = {
  react: {
    storybookPackage: '@storybook/react',
    testingLibraryPackage: '@testing-library/react',
    render: (composedStory) => `__render(<${composedStory} />)`,
  },
  vue3: {
    storybookPackage: '@storybook/vue3',
    testingLibraryPackage: '@testing-library/vue',
    render: (composedStory) => `__render(${composedStory})`,
  },
  svelte: {
    storybookPackage: '@storybook/svelte',
    testingLibraryPackage: '@testing-library/svelte',
    render: (composedStory) =>
      `__render(${composedStory}.Component, ${composedStory}.props)`,
  },
} satisfies Record<SupportedRenderers, RendererSpecificTemplates>

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const log = (...args: any) => {
  if (process.env.DEBUG || process.env.DEBUG === 'storybook') {
    console.log('🟡 ', ...args)
  }
}
