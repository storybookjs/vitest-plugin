import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/test-utils.ts', 'src/browser-mocks.ts'],
  format: ['esm', 'cjs'],
  clean: true,
  dts: true,
})
