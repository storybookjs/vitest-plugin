import React from 'react'
import { describe, expect, test, beforeEach } from 'vitest'
import { snapshot } from 'rrweb-snapshot'
import { server, cdp } from '@vitest/browser/context'

import { composeStories } from '@storybook/react'
import { cleanup, render, screen } from '@testing-library/react'
import * as stories from './Button.stories'

const { writeFile } = server.commands
describe('Archive experiment', () => {
  const cdpSession = cdp()
  beforeEach(() => {
    cleanup()
  })

  const { Input } = composeStories(stories)

  test('Primary', async () => {
    const { getByRole } = render(<Input />)
    const textInput = getByRole('textbox') as HTMLInputElement
    textInput.focus()
    // Using CDP to send a key event
    // https://main.vitest.dev/guide/browser/commands.html#cdp-session
    await cdpSession.send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      text: '🎉',
    })
    // console.log('this is what the document.body looks like')
    // screen.debug()
    expect(textInput.value).toBe('🎉')

    const domSnapshot = snapshot(document)
    const bufferedSnapshot = JSON.stringify(domSnapshot);
    const snapshotPath = '__snapshot__/Button.snapshot.json'
    await writeFile(snapshotPath, bufferedSnapshot, (err) => {
      if (err) throw err;
    })
    console.log("snapshot was written to", snapshotPath)
  })
})
