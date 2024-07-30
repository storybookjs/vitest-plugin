import { afterAll } from 'vitest'
import type { Task, TaskMeta } from 'vitest'

type ExtendedMeta = TaskMeta & { storyId: string; hasPlayFunction: boolean }

// The purpose of this set up file is to modify the error message of failed tests
// and inject a link to the story in Storybook
const modifyErrorMessage = (currentTask: Task) => {
  const meta = currentTask.meta as ExtendedMeta
  if (
    currentTask.type === 'test' &&
    currentTask.result?.state === 'fail' &&
    meta.storyId &&
    currentTask.result.errors?.[0]
  ) {
    const currentError = currentTask.result.errors[0]
    // TODO: seems like import.meta.env is not getting populated
    const storybookUrl =
      import.meta.env.__STORYBOOK_URL__ || process.env.__STORYBOOK_URL__
    let storyUrl = `${storybookUrl}/?path=/story/${meta.storyId}`
    if (meta.hasPlayFunction) {
      storyUrl = `${storyUrl}&addonPanel=storybook/interactions/panel`
    }
    currentError.message = `\n\x1B[34mClick to debug the error directly in Storybook: ${storyUrl}\x1B[39m\n\n${currentError.message}`
  }
}

afterAll((suite) => {
  suite.tasks.forEach(modifyErrorMessage)
})
