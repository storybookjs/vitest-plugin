import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts', 'src/test-utils.ts'],
    format: ['esm', 'cjs'],
    dts: true,
  },
  {
    entry: ['src/setup-file.ts', 'src/global-setup.ts'],
    format: 'esm',
  },
])
