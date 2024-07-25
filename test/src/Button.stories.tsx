import React, { useState, useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'

import { Button } from './Button'

const meta = {
  title: 'Example/Button',
  component: Button,
  excludeStories: /.*Data$/,
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    primary: true,
    label: 'Button',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    await expect(button).toBeInTheDocument()
  },
  tags: ['hello'],
}

export const Secondary: Story = {
  render: (args) => {
    return <Button {...args} />
  },
  args: {
    ...Primary.args,
    primary: false,
  },
  parameters: {
    tests: {
      disableSnapshots: true,
    },
  },
} satisfies Story

export const Skipped: Story = {
  ...Primary,
  tags: ['!test'],
}

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
}

const ResponsiveDesktop: StoryObj = {
  tags: ['browser-only'],
  render: () => <ResponsiveComponent />,
  parameters: {
    viewport: {
      defaultViewport: 'ultrawide',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const div = canvas.getByText('Desktop')
    await expect(div).toBeInTheDocument()
    const dimensions = canvas.getByText('2560 x 1280')
    await expect(dimensions).toBeInTheDocument()
  },
}

const ResponsiveMobile: StoryObj = {
  ...ResponsiveDesktop,
  parameters: {
    viewport: {
      defaultViewport: 'iphone12',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const div = canvas.getByText('Mobile')
    await expect(div).toBeInTheDocument()
    const dimensions = canvas.getByText('390 x 844')
    await expect(dimensions).toBeInTheDocument()
  },
}

export { ResponsiveDesktop, ResponsiveMobile }

export const myExcludedData = 123
