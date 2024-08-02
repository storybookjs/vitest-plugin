# Storybook Vitest Plugin

The Storybook Vitest plugin transforms story files into test files using the portable stories API, providing a seamless integration with Vitest.

## Requirements

This is a Vitest plugin, so you have to have Vitest set up in your project. It relies on testing-library, so you must also have it set up in your project.

## Renderer support

Currently this solution supports the following renderers:
- React
- Vue3
- Svelte

## Getting started

### 1. Install the plugin:
```sh
yarn add @storybook/experimental-vitest-plugin
```

### 2. Create a setup file for Storybook

This plugin is built on top of the [Portable stories](https://storybook.js.org/docs/api/portable-stories) Storybook concept. In order for the stories to be correctly composed by the plugin, you have to create a setup file that configures portable stories. [You can follow the docs](https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations) for that. You should create it at `.storybook/setupTests.ts`.

### 3. Create a Vitest config file in your Storybook directory

Define all of the setup to be applied only for the story tests in a `.storybook/vitest.config.ts` file:

```ts
// .storybook/vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from '../vite.config'
import { storybookTest } from '@storybook/experimental-vitest-plugin'

export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [
      storybookTest({
        renderer: 'react',
      }),
    ],
    test: {
      name: 'storybook',
      // add the paths to your stories
      include: ['../src/**/*.{story,stories}.?(c|m)[jt]s?(x)'],
      // enable browser mode
      browser: {
        enabled: true,
        name: 'chromium',
        // make sure to install playwright
        provider: 'playwright',
        headless: true,
      },
      setupFiles: ['./setupTests.ts'],
      environment: 'happy-dom',
    },
  })
)
```

### 4. Add the newly created vitest config to your vitest workspace file

If you already have a `vitest.workspace.ts` file, just add the `.storybook` path to its list, otherwise create the file like so:

```ts
// vitest.workspace.ts
import { defineWorkspace } from 'vitest/config'
import { storybookTest } from '@storybook/experimental-vitest-plugin'

export default defineWorkspace([
  // This is the path to your existing vitest config files
  './vitest.config.ts', 
  // 👇 Add the path to the storybook config directory
  './.storybook'
])
```

### 5. Run your tests

That's it, your tests should now include story files. If you are using the Vitest extension for your IDE, it should automatically detect the new tests as well.

## API options

The plugin should work out of the box, but there are extra functionalities if you pass options to it. Below is the detailed description of the options available for configuration.

### `configDir`

- **Type:** `string`
- **Description:** The directory where the Storybook configuration is located, relative to CWD. If not provided, the plugin will use `.storybook` in the current working directory.
- **Default:** `.storybook`

### `storybookScript`

- **Type:** `string` (optional)
- **Description:** Optional script to run Storybook. If provided, Vitest will start Storybook using this script when run in watch mode.
- **Default:** `undefined`

### `skipRunningStorybook`

- **Type:** `boolean`
- **Description:** Whether to skip running Storybook when running tests in watch mode. This option is only relevant when `storybookScript` is provided.
- **Default:** `false`

### `renderer`

- **Type:** `react | vue | svelte | nextjs`
- **Description:** The renderer used by Storybook.
- **Default:** `undefined`

> [!IMPORTANT]
> If you are using Next.js, you have to use this plugin in tandem with [vite-plugin-storybook-nextjs](https://github.com/storybookjs/vite-plugin-storybook-nextjs).

### `snapshot`

- **Type:** `boolean`
- **Description:** Whether to generate DOM snapshots for every story file.
- **Default:** `false`

### `storybookUrl`

- **Type:** `string`
- **Description:** The URL where Storybook is hosted. This is used for internal checks and to provide a link to the story in the test output on failures.
- **Default:** `http://localhost:6006`

### `tags`

- **Type:** `object`
- **Description:** Tags to include, exclude, or skip. These tags are defined as annotations in your story or meta.
  - `include`: `string[]` - Tags to include.
  - `exclude`: `string[]` - Tags to exclude.
  - `skip`: `string[]` - Tags to skip.

## Usage

```ts
storybookTest({
  // API options here
  renderer: 'react',
  // Make sure to pass the --ci flag so Storybook won't pop up the browser
  storybookScript: 'npm run storybook -- --ci',
});
```
