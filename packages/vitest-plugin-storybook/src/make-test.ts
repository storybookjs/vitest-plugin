import type { composeStory } from '@storybook/react'
import { test, type Task, type TaskMeta } from 'vitest'
import { setViewport } from './viewports'
import type { UserOptions } from './types'

type TagsFilter = Required<UserOptions['tags']>
type ExtendedTask = Task & {
  meta: TaskMeta & { storyId: string; hasPlayFunction: boolean }
}

const shouldSkip = (storyTags: string[], tagsFilter: TagsFilter) => {
  return tagsFilter?.skip.some((tag) => storyTags.includes(tag))
}

const shouldRun = (storyTags: string[], tagsFilter: TagsFilter) => {
  const isIncluded =
    tagsFilter?.include.length === 0 ||
    tagsFilter?.include.some((tag) => storyTags.includes(tag))
  const isNotExcluded = tagsFilter?.exclude.every(
    (tag) => !storyTags.includes(tag)
  )
  return isIncluded && isNotExcluded
}

export const makeTest = async (
  composedStory: ReturnType<typeof composeStory>,
  tagsFilter: TagsFilter,
  storyName: string
) => {
  !!composedStory &&
    test.runIf(shouldRun(composedStory.tags, tagsFilter))(
      storyName,
      async ({ task, skip }) => {
        shouldSkip(composedStory.tags, tagsFilter) && skip()
        const _task = task as ExtendedTask
        _task.meta.storyId = composedStory.id
        _task.meta.hasPlayFunction = !!composedStory.play
        await setViewport(composedStory.parameters.viewport)
        await composedStory.play()
      },
      { ...composedStory.parameters.test?.options }
    )
}
