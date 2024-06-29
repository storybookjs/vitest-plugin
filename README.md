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

### 2. Register in your Vitest config file

You can choose one of the two possible ways:
1. In a Vitest config file:
```ts
// vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config'
import { storybookTest } from '@storybook/experimental-vitest-plugin'

import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [
      storybookTest(),
    ],
    test: {
      // whatever overrides you like here
    },
  })
)
```

2. In a Vitest workspace file:
```ts
// vitest.workspace.ts
import { defineWorkspace } from 'vitest/config'
import { storybookTest } from '@storybook/experimental-vitest-plugin'

export default defineWorkspace([
  {
    extends: './vite.config.ts',
    plugins: [
      storybookTest(),
    ],
    test: {
      setupFiles: './src/setupTests.node.ts',
      environment: 'happy-dom',
    },
  },
])
```

### 3. Run your tests

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

- **Type:** `SupportedRenderers` (optional)
- **Description:** The renderer used by Storybook. If not provided, it will be inferred from the main config file located in the `configDir`.
- **Default:** `undefined`

### `snapshot`

- **Type:** `boolean`
- **Description:** Whether to generate DOM snapshots for every story file.
- **Default:** `false`

### `storybookUrl`

- **Type:** `string`
- **Description:** The URL where Storybook is hosted. This is used to provide a link to the story in the test output on failures.
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
  configDir: '../../.storybook',
  storybookScript: 'npm run storybook',
});
```
