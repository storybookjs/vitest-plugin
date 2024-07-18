import React from 'react';
import { describe, test, beforeEach } from 'vitest';
import { createResourceArchive } from '@chromatic-com/playwright';
import { snapshot } from 'rrweb-snapshot';
import { server, cdp } from '@vitest/browser/context';

import { composeStories } from '@storybook/react';
import { cleanup, render, screen } from '@testing-library/react';
import * as stories from './Button.stories';

import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;

const { writeFile } = server.commands;
describe('Archive experiment', () => {
  beforeEach(() => {
    cleanup();
  });

  const { Primary } = composeStories(stories);

  test('Primary', async () => {
    const mockPage = {
      context: () => ({
        newCDPSession: () => cdp(),
      }),
      // No-op for testing, would need to be implemented
      waitForLoadState: async () =>
        new Promise((r) => {
          setTimeout(r, 2000);
        }),
      // No-op
      on: () => {},
      evaluate: (code: string) => eval(code),
    };
    const completeArchive = await createResourceArchive({ page: mockPage as any });

    render(<Primary />);

    const mockTestInfo = {
      testId: '123',
    };
    const domSnapshot = snapshot(document);

    const resourceArchive = await completeArchive();
    console.log(Object.entries(resourceArchive));

    const bufferedSnapshot = JSON.stringify(domSnapshot);
    const snapshotPath = '__snapshot__/Button.snapshot.json';
    await writeFile(snapshotPath, bufferedSnapshot, (err) => {
      if (err) throw err;
    });
    console.log('snapshot was written to', snapshotPath);
  });
});
