import net from 'node:net'
import execa from 'execa'
import { log } from './utils'

import type { GlobalSetupContext } from 'vitest/node'

let storybookProcess: execa.ExecaChildProcess | null = null

const startStorybookIfNeeded = async () => {
  const storybookScript = process.env.__STORYBOOK_SCRIPT__
  const storybookUrl = process.env.__STORYBOOK_URL__ || ''

  const url = new URL(storybookUrl)
  const port = Number.parseInt(url.port, 10)

  if (typeof port !== 'number' || Number.isNaN(port)) {
    console.warn(
      `[Storybook] Found an invalid port number "${port}" in storybook url "${storybookUrl}", the plugin will skip running Storybook.\nAre you sure the storybookUrl option is correct?`
    )
    return
  }

  await new Promise((resolve, reject) => {
    const server = net.createServer()

    server.once('error', (err: NodeJS.ErrnoException) => {
      log('Error when listening to port', port, err)
      if (err.code === 'EADDRINUSE') {
        log('Storybook was already running before the tests started')
        resolve(null)
      } else {
        reject(err)
      }
    })

    server.once('listening', async () => {
      server.close()

      const script = `${storybookScript} --ci`
      log(`Watch mode detected, starting Storybook with command: ${script}`)

      try {
        storybookProcess = execa.command(script, {
          stdio: 'pipe',
          cwd: process.cwd(),
        })

        resolve(null)
      } catch (error: unknown) {
        log('Failed to start Storybook:', error)
        if ((error as { code: string }).code !== 'EADDRINUSE') {
          throw error
        }
        resolve(null)
      }
    })

    server.listen(port)
  })
}

export const setup = async ({ config }: GlobalSetupContext) => {
  if (config.watch) {
    startStorybookIfNeeded()
  }
}

export const teardown = async () => {
  if (storybookProcess) {
    log('Stopping Storybook process')
    storybookProcess.kill()
  }
}
