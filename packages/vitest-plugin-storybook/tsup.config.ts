import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts', 'src/test-utils.ts', 'src/global-setup.ts'],
    format: ['esm', 'cjs'],
    clean: true,
    dts: true,
  },
  {
    entry: ['src/setup-file.ts'],
    format: 'esm',
    clean: true,
  },
])
