import { Options } from './types'

export const PACKAGES_MAP = {
  react: {
    storybookPackage: '@storybook/react',
    testingLibraryPackage: '@testing-library/react',
  },
  vue3: {
    storybookPackage: '@storybook/vue3',
    testingLibraryPackage: '@testing-library/vue',
  },
} satisfies Record<
  Options['renderer'],
  { storybookPackage: string; testingLibraryPackage: string }
>
