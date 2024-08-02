// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const log = (...args: any) => {
  if (process.env.DEBUG || process.env.DEBUG === 'storybook') {
    console.log('🟡 ', ...args)
  }
}
