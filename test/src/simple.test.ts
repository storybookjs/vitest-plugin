import { describe, test, expect } from 'vitest'

const delay = async (time = 1000) =>
  await new Promise((r) => setTimeout(r, time))

describe('1', () => {
  describe('2', () => {
    test('2.1', ({ task }) => {
      // @ts-ignore
      task.meta.customData = 'customData 2.1'
      expect(1).toBe(1)
    })
    test('2.2', async ({ task }) => {
      await delay()
      // @ts-ignore
      task.meta.customData = 'customData 2.2'
      expect(1).toBe(1)
    })
  })

  describe('3', () => {
    test('3.1', ({ task }) => {
      // @ts-ignore
      task.meta.customData = 'customData 3.1'
      expect(1).toBe(4)
    })
  })

  test('4.1', async () => {
    await delay()
    expect(1).toBe(2)
  })
})
