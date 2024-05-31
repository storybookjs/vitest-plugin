import { Reporter } from 'vitest/reporters'

export default class CustomReporter implements Reporter {
  onInit(ctx: any) {
    ctx.provide('__storybook', { test: 123 })
  }
}
