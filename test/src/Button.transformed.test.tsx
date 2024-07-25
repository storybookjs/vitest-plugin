/**
 * This is a slight representation of what the transformed stories file looks like
 * for easier debugging.
 */
import type { Meta, StoryObj } from '@storybook/react'

import { Button } from './Button'

const meta = {
  title: 'Example/Button',
  component: Button,
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

__test(
  'Primary',
  testStory('Primary', import.meta.url, composeStories, {
    include: ['test'],
    exclude: [],
    skip: ['skip'],
  })
)
export const Primary: Story = {
  args: {
    primary: true,
    label: 'Button',
  },
}

import { test as __test } from 'vitest'
import { composeStories } from '@storybook/react'
import { testStory } from '@storybook/experimental-vitest-plugin/dist/test-utils'
