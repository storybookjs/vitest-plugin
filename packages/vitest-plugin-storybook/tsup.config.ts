import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: [
      'src/index.ts',
      'src/test-utils.ts',
      'src/setup-file.ts',
      'src/global-setup.ts',
    ],
    format: 'esm',
    dts: true,
    clean: true,
    treeshake: true,
    target: 'node18',
  },
])
