import { build } from 'esbuild';
import { cpSync, chmodSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const isWatch = process.argv.includes('--watch');

async function main() {
  const buildOptions = {
    entryPoints: [resolve(rootDir, 'src/index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    outfile: resolve(rootDir, 'build/index.js'),
    sourcemap: true,
    packages: 'external',
    banner: {
      js: '#!/usr/bin/env node\n',
    },
    logLevel: 'info',
  };

  if (isWatch) {
    const watchCtx = await import('esbuild').then((m) =>
      m.context(buildOptions)
    );
    await watchCtx.watch();
    console.log('Watching for changes...');
  } else {
    await build(buildOptions);
  }

  // Copy stack templates to build directory
  const stacksSrc = resolve(rootDir, 'src/templates/stacks');
  const stacksDest = resolve(rootDir, 'build/templates/stacks');
  if (existsSync(stacksSrc)) {
    mkdirSync(stacksDest, { recursive: true });
    cpSync(stacksSrc, stacksDest, { recursive: true });
  }

  // Copy feature templates to build directory
  const featuresSrc = resolve(rootDir, 'src/features');
  const featuresDest = resolve(rootDir, 'build/features');
  if (existsSync(featuresSrc)) {
    mkdirSync(featuresDest, { recursive: true });
    // Only copy template directories from features
    const { readdirSync } = await import('node:fs');
    const features = readdirSync(featuresSrc, { withFileTypes: true });
    for (const feat of features) {
      if (feat.isDirectory()) {
        const templatesSrc = resolve(featuresSrc, feat.name, 'templates');
        if (existsSync(templatesSrc)) {
          const templatesDest = resolve(featuresDest, feat.name, 'templates');
          mkdirSync(templatesDest, { recursive: true });
          cpSync(templatesSrc, templatesDest, { recursive: true });
        }
      }
    }
  }

  // Make the output executable
  chmodSync(resolve(rootDir, 'build/index.js'), 0o755);

  console.log('✅ Build complete');
}

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
