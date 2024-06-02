import { Reporter } from 'vitest/reporters'
import { TaskResultPack, Vitest } from 'vitest'

const stateToStatusMap = {
  run: 'pending',
  pass: 'success',
  fail: 'error',
} as any

export class StorybookStatusReporter implements Reporter {
  ctx!: Vitest
  onInit(ctx: Vitest): void {
    this.ctx = ctx
  }

  async onTaskUpdate(packs: TaskResultPack[]) {
    for (const pack of packs) {
      const task = this.ctx.state.idMap.get(pack[0])
      if (task && task.type === 'test') {
        const status = stateToStatusMap[task.result?.state as string]
        const meta = (task.meta || pack[2]) as { storyId: string }
        console.log(meta.storyId, status)
        // TODO:
        // sendStatusToStorybook(meta.storyId, status)
      }
    }
  }
}
