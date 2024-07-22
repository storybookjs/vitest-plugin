import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/make-test.ts', 'src/browser-mocks.ts'],
  format: ['esm', 'cjs'],
  clean: true,
  dts: true,
})
