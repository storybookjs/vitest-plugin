import { beforeAll, beforeEach } from 'vitest'
import { setProjectAnnotations } from '@storybook/react'
import {
  render as testingLibraryRender,
  cleanup,
} from '@testing-library/react/pure'

import * as projectAnnotations from './.storybook/preview'

beforeEach(cleanup)

const annotations = setProjectAnnotations([
  projectAnnotations,
  { testingLibraryRender },
])

// biome-ignore lint/style/noNonNullAssertion: being undefined is a bug in Storybook types
beforeAll(annotations.beforeAll!)
