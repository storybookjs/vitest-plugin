import { Reporter } from 'vitest/reporters'
import { Options } from './types'

export default class CustomReporter implements Reporter {
  options: Options
  constructor(options: Options) {
    this.options = options
  }

  onInit() {
    // TODO: Start Storybook if needed
  }
}
