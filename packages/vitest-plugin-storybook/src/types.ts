export type Options = {
  mode?: 'storyshots' | 'stories'
  storybookPackage?: '@storybook/react' | '@storybook/vue3'
  testingLibraryPackage?: '@testing-library/react' | '@testing-library/vue'
  snapshot?: boolean
  persistStoryshotsContent?: boolean
}
