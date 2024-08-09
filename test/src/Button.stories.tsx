import React, { useState, useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'
import {test as base } from 'vitest';

import { Button } from './Button'

const test = base;
const meta = {
  title: 'Example/Button',
  component: Button,
  excludeStories: /.*Data$/,
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

test('asdf', () => {
  expect(1).toBe(1);
})

export const Primary: Story = {
  args: {
    primary: true,
    label: 'Button',
  },
  play: async () => {
    // throw Primary;
    await expect(1).toBe(1);
    // const canvas = within(canvasElement)
    // const button = canvas.getByRole('button')
    // await expect(button).toBeInTheDocument()
  },
  tags: ['hello'],
};

export const Secondary: Story = {
  args: {
    ...Primary.args,
    primary: false,
  },
  parameters: {
    tests: {
      disableSnapshots: true,
    },
  },
} satisfies Story;

export const Skipped: Story = {
  ...Primary,
  tags: ['!test'],
};

const ResponsiveComponent = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768)
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  const updateMedia = () => {
    setIsDesktop(window.innerWidth > 768)
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: -
  useEffect(() => {
    window.addEventListener('resize', updateMedia)
    return () => window.removeEventListener('resize', updateMedia)
  }, [])

  return (
    <>
      <p>The current viewport is:</p>
      <strong>{isDesktop ? 'Desktop' : 'Mobile'}</strong>
      <p>The current dimensions are:</p>
      <strong>
        {dimensions.width} x {dimensions.height}
      </strong>
    </>
  )
};

export const ResponsiveDesktop: StoryObj = {
  tags: ['browser-only'],
  render: () => <ResponsiveComponent />,
  parameters: {
    viewport: {
      defaultViewport: 'ultrawide',
    },
  },
  play: async () => {
    await expect(1).toBe(1)
  },
};

export const ResponsiveMobile: StoryObj = {
  ...ResponsiveDesktop,
  parameters: {
    viewport: {
      defaultViewport: 'iphone12',
    },
  },
  play: async () => {
    await expect(1).toBe(1)
  },
};

