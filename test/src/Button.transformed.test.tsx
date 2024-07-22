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

export const Primary: Story = {
  args: {
    primary: true,
    label: 'Button',
  },
}
makeTest(
  composeStory(Primary, meta),
  { include: ['test'], exclude: [], skip: ['skip'] },
  'Primary'
)

import { composeStory } from '@storybook/react'
import { makeTest } from '@storybook/experimental-vitest-plugin/dist/make-test'
