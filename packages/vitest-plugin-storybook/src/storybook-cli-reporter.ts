import net from 'net'
import { exec, ChildProcess } from 'child_process'
import { Reporter } from 'vitest/reporters'
import { Options } from './types'
import { Vitest } from 'vitest'

let storybookProcess: ChildProcess | null = null

const startStorybookIfNeeded = (options: Options) => {
  const port = 6006

  const server = net.createServer()

  server.once('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      // Storybook is running
    }
  })

  server.once('listening', () => {
    server.close()
    storybookProcess = exec(
      `${options.storybookScript} --ci`,
      (error, stdout, stderr) => {
        if (error) {
          if (error.message.includes('not found')) {
            console.warn(
              `\nCould not spawn Storybook with command: "${options.storybookScript}".\nIf you have a custom Storybook script, please specify via the plugin "storybookScript" option.`
            )
          } else {
            console.warn(
              `\nAn error occurred starting Storybook. Please fix it and rerun the test command : ${error.message}`
            )
            console.warn(stderr || stdout)
          }
          return
        }
      }
    )
  })

  server.listen(port)
}

const stopStorybook = () => {
  if (storybookProcess) {
    storybookProcess.kill('SIGINT')
    storybookProcess = null
  }
}

export class StorybookCliReporter implements Reporter {
  options: Options
  ctx!: Vitest

  constructor(options: Options) {
    this.options = options
  }

  async onInit(ctx: Vitest) {
    this.ctx = ctx
    process.on('exit', stopStorybook)
    process.on('SIGINT', () => {
      stopStorybook()
      process.exit()
    })
    process.on('SIGTERM', () => {
      stopStorybook()
      process.exit()
    })

    if (ctx.config.watch) {
      startStorybookIfNeeded(this.options)
    }
  }
}
