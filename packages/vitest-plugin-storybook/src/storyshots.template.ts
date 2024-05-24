// @ts-nocheck
import type { Meta, StoryFn } from '@storybook/react'
import { composeStories } from '@storybook/react'
import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'

export type StoryFile = {
  default: Meta
  [name: string]: StoryFn | Meta
}

function getOptions() {
  return {
    shouldSnapshot: '{{shouldSnapshot}}',
  }
}

const getPath = () => {
  if (typeof window === 'undefined') {
    return require('path')
  }

  return {
    dirname: function (thePath: string) {
      // Remove trailing slashes for consistency
      thePath = thePath.replace(/\/+$/, '')

      // Find the last '/' and slice up to it
      let lastSlashIndex = thePath.lastIndexOf('/')
      if (lastSlashIndex === -1) return '.'

      // Handle the case where the thePath is something like "/file"
      if (lastSlashIndex === 0) return '/'

      // Slice from the start to the last '/'
      return thePath.slice(0, lastSlashIndex)
    },
    basename: function (thePath: string, ext?: string) {
      // Find the last '/' and slice from it to get the base name
      let lastSlashIndex = thePath.lastIndexOf('/')
      let base =
        lastSlashIndex === -1 ? thePath : thePath.slice(lastSlashIndex + 1)

      // If an extension is provided and the base ends with it, remove it
      if (ext && base.endsWith(ext)) {
        base = base.slice(0, base.length - ext.length)
      }

      return base
    },
  }
}

const compose = (
  entry: StoryFile
): ReturnType<typeof composeStories<StoryFile>> => {
  try {
    return composeStories(entry)
  } catch (e) {
    throw new Error(
      `There was an issue composing stories for the module: ${JSON.stringify(
        entry
      )}, ${e}`
    )
  }
}

const getAllStoryFiles = () => {
  // Place the glob you want to match your story files
  const storyFiles = Object.entries(
    import.meta.glob<StoryFile>('./**/*.(stories|story).@(js|jsx|mjs|ts|tsx)', {
      eager: true,
    })
  )

  const path = getPath()

  return storyFiles.map(([filePath, storyFile]) => {
    const storyDir = path.dirname(filePath)
    const componentName = path
      .basename(filePath)
      .replace(/\.(stories|story)\.[^/.]+$/, '')
    return { filePath, storyFile, componentName, storyDir }
  })
}

;((window as any) || {}).global = globalThis
// Recreate similar options to storyshots. Place your configuration below
const options = {
  suite: 'Storybook Tests',
  storyKindRegex: /^.*?DontTest$/,
  storyNameRegex: /UNSET/,
  snapshotsDirName: '__snapshots__',
  snapshotExtension: '.storyshot',
}

describe(options.suite, () => {
  getAllStoryFiles().forEach(({ storyFile, componentName }) => {
    const meta = storyFile.default
    const title = meta.title || componentName

    if (
      options.storyKindRegex.test(title) ||
      meta.parameters?.storyshots?.disable
    ) {
      // Skip component tests if they are disabled
      return
    }

    describe(title, () => {
      const stories = Object.entries(compose(storyFile))
        .map(([name, story]) => ({ name, story }))
        .filter(({ name, story }) => {
          // Implements a filtering mechanism to avoid running stories that are disabled via parameters or that match a specific regex mirroring the default behavior of Storyshots.
          return (
            !options.storyNameRegex?.test(name) &&
            !story.parameters.storyshots?.disable
          )
        })

      if (stories.length <= 0) {
        throw new Error(
          `No stories found for this module: ${title}. Make sure there is at least one valid story for this module, without a disable parameter, or add parameters.storyshots.disable in the default export of this file.`
        )
      }

      stories.forEach(({ name, story }) => {
        // Instead of not running the test, you can create logic to skip it, flagging it accordingly in the test results.
        const testFn = story.parameters.storyshots?.skip ? test.skip : test

        testFn(name, async () => {
          await story.load()
          const mounted = render(story())
          await story.play?.()

          if (
            getOptions().shouldSnapshot === 'true' &&
            !story.parameters.storyshots?.disableSnapshots
          ) {
            await new Promise((resolve) => setTimeout(resolve, 1))
            expect(mounted.container).toMatchSnapshot()
          }
        })
      })
    })
  })
})
