import { Options } from './types'

export const PACKAGES_MAP = {
  react: {
    storybookPackage: '@storybook/react',
    testingLibraryPackage: '@testing-library/react',
    render: (composedStory) => `render(<${composedStory} />)`,
  },
  vue3: {
    storybookPackage: '@storybook/vue3',
    testingLibraryPackage: '@testing-library/vue',
    render: (composedStory) => `render(${composedStory})`,
  },
  svelte: {
    storybookPackage: '@storybook/svelte',
    testingLibraryPackage: '@testing-library/svelte',
    render: (composedStory) =>
      `render(${composedStory}.Component, ${composedStory}.props)`,
  },
} satisfies Record<
  Options['renderer'],
  {
    storybookPackage: string
    testingLibraryPackage: string
    render: (composedStory: string) => string
  }
>
