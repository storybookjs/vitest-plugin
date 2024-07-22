import { beforeAll } from 'vitest'
import { setProjectAnnotations } from '@storybook/react'
import { render as testingLibraryRender } from '@testing-library/react'

import * as projectAnnotations from './.storybook/preview'

const annotations = setProjectAnnotations([
  projectAnnotations,
  { testingLibraryRender },
])

// biome-ignore lint/style/noNonNullAssertion: being undefined is a bug in Storybook types
beforeAll(annotations.beforeAll!)
