export type SupportedRenderers = 'react' | 'vue3' | 'svelte'

export type UserOptions = {
  /**
   *  The directory where the Storybook configuration is located, relative to the vitest configuration file.
   *  If not provided, the plugin will use '.storybook' in the current working directory.
   *  @default '.storybook'
   */
  configDir?: string
  /**
   *  Optional script to run Storybook.
   *  If provided, Vitest will start Storybook using this script when ran in watch mode.
   *  @default undefined
   */
  storybookScript?: string
  /**
   *  Whether to skip running Storybook when running tests in watch mode.
   *  Only relevant when `storybookScript` is provided.
   *  @default false
   */
  skipRunningStorybook?: boolean
  /**
   *  The renderer used by Storybook. If not provided, it will be inferred from the main config file located in the `configDir`.
   *  @default undefined
   */
  renderer?: SupportedRenderers
  /**
   *  Whether to generate DOM snapshots for every story file.
   *  @default false
   */
  snapshot?: boolean
  /**
   *  The URL where Storybook is hosted.
   *  This is used to provide a link to the story in the test output on failures.
   *  @default 'http://localhost:6006'
   */
  storybookUrl?: string
}

export type InternalOptions = Required<UserOptions> & {
  storybookPort: number
  debug: boolean
}
