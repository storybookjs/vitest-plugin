import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/reporter.ts'],
  format: ['esm', 'cjs'],
  splitting: false,
  clean: true,
  dts: true,
})
