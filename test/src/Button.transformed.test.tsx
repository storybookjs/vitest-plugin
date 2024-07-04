/**
 * This is a slight representation of what the transformed stories file looks like
 * for easier debugging.
 */

import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from '@storybook/test'

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    await expect(button).toBeInTheDocument()
  },
  tags: ['hello'],
}


import { composeStories as __composeStories } from "@storybook/react";
import { setViewport } from "@storybook/experimental-vitest-plugin/dist/viewports";
import { describe as __describe, test as __test } from "vitest";
import { render as __render } from "@testing-library/react/pure";

const includeTags = [];
const excludeTags = [];
const skipTags = ["skip"];

const shouldSkip = (storyTags: string[] = []) => {
  return skipTags.some((tag) => storyTags.includes(tag));
};
const shouldRun = (storyTags: string[] = []) => {
  const isIncluded = includeTags.length === 0 || includeTags.some((tag) => storyTags.includes(tag));
  const isNotExcluded = excludeTags.every((tag) => !storyTags.includes(tag));
  return isIncluded && isNotExcluded;
};

__describe("Button (pre-transformed)", async () => {
  const stories = await import(
    /* @vite-ignore */
    import.meta.url
  );
  type This = { default: typeof meta, Primary: typeof Primary }
  const { Primary: PrimaryStory } = __composeStories<This>(stories);

  !!PrimaryStory && __test.runIf(shouldRun(PrimaryStory.tags))("Primary", async ({ task, skip }) => {
    shouldSkip(PrimaryStory.tags) && skip();
    // @ts-ignore
    task.meta.storyId = PrimaryStory.id;
    // @ts-ignore
    task.meta.hasPlayFunction = !!PrimaryStory.play;

    await setViewport(PrimaryStory.parameters.viewport);

    await PrimaryStory.load();
    __render(<PrimaryStory />);
    await PrimaryStory.play?.();

  }, { ...PrimaryStory.parameters.test?.options });
});
