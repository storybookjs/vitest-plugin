import { spawn } from 'node:child_process'
import { log } from './utils'
import http from 'node:http'
import https from 'node:https'

import type { GlobalSetupContext } from 'vitest/node'

let storybookProcess: ReturnType<typeof spawn> | null = null

const checkStorybookRunning = (storybookUrl: string) => {
  return new Promise<boolean>((resolve) => {
    const url = new URL(`${storybookUrl}/iframe.html`)
    const protocol = url.protocol === 'https:' ? https : http

    const options = {
      method: 'HEAD',
      host: url.hostname,
      path: url.pathname,
    }

    const req = protocol.request(options, (res) => {
      resolve(res.statusCode === 200)
    })

    req.on('error', () => resolve(false))
    req.end()
  })
}

const startStorybookIfNeeded = async () => {
  const storybookScript = process.env.__STORYBOOK_SCRIPT__ || ''
  const storybookUrl = process.env.__STORYBOOK_URL__ || ''

  const isRunning = await checkStorybookRunning(storybookUrl)

  if (isRunning) {
    log('Storybook is already running')
    return
  }

  log(`Starting Storybook with command: ${storybookScript}`)

  try {
    storybookProcess = spawn(storybookScript, [], {
      stdio: 'ignore',
      cwd: process.cwd(),
      shell: true,
    })

    storybookProcess.on('error', (error) => {
      log('Failed to start Storybook:', error)
      console.log({ error })
      throw error
    })
  } catch (error: unknown) {
    log('Failed to start Storybook:', error)
    throw error
  }
}

export const setup = async ({ config }: GlobalSetupContext) => {
  if (config.watch) {
    await startStorybookIfNeeded()
  }
}

export const teardown = async () => {
  if (storybookProcess) {
    log('Stopping Storybook process')
    storybookProcess.kill()
  }
}
