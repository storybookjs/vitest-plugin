import net from 'node:net'
// @ts-expect-error missing type
import waitOn from 'wait-on'
import execa from 'execa'
import { log } from './utils'

// other code
import type { GlobalSetupContext } from 'vitest/node'

const options = {
  storybookPort: 6006,
  storybookScript: 'yarn storybook',
}

console.log('GLOBAL SETUP', { waitOn, execa })

const startStorybookIfNeeded = async () => {
  console.log('STARTING STORYBOOK')
  const { storybookPort: port, storybookScript } = options

  await new Promise((resolve, reject) => {
    const server = net.createServer()
    console.log('INSIDE PROMISE')

    server.once('error', (err: NodeJS.ErrnoException) => {
      log('Error when listening to port', port, err)
      if (err.code === 'EADDRINUSE') {
        log('Storybook is already running')
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
        console.log('EXECUTING SCRIPT')
        execa.command(script, {
          stdio: 'pipe',
          cwd: process.cwd(),
        })

        log('waiting on Storybook to be ready')
        console.log('GLOBAL SETUP')
        await waitOn({
          resources: ['tcp:localhost:6006'],
        })
        log('Storybook is ready!')

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

export const setup = ({ config }: GlobalSetupContext) => {
  console.log('SETUP', config.watch)

  if (config.watch) {
    startStorybookIfNeeded().then(() => {
      log('Storybook is ready and resolved')
    })
  }
}

export const teardown = () => {
  console.log('TEARDOWN')
}
