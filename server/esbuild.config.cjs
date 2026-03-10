const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  outfile: 'dist/server.cjs',
  format: 'cjs',
}).catch(() => process.exit(1));
