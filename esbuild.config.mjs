import { build } from 'esbuild';

await build({
  entryPoints: ['src/cli.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/cli.js',
  format: 'cjs',
  banner: { js: '#!/usr/bin/env node' },
});