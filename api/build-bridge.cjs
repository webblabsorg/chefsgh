/*
  Bridge build for Vercel when project root is set to /api.
  - Builds the parent Vite app
  - Copies dist/ into ./dist (so Vercel serves it)
  - Copies server/ into ./server (so the serverless function can import it)
*/
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const apiRoot = process.cwd();
const repoRoot = path.resolve(apiRoot, '..');

function log(step) {
  console.log(`\n[build-bridge] ${step}`);
}

const rimraf = (p) => {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
};

try {
  log('Installing root dependencies (npm ci in parent)');
  execSync('npm ci', { cwd: repoRoot, stdio: 'inherit' });

  log('Building Vite app (npm run build in parent)');
  execSync('npm run build', { cwd: repoRoot, stdio: 'inherit' });

  const parentDist = path.join(repoRoot, 'dist');
  const apiDist = path.join(apiRoot, 'dist');
  if (!fs.existsSync(parentDist)) {
    throw new Error(`Parent dist not found at ${parentDist}`);
  }

  log('Copying dist/ into /api/dist');
  rimraf(apiDist);
  fs.mkdirSync(apiDist, { recursive: true });
  if (fs.cpSync) {
    fs.cpSync(parentDist, apiDist, { recursive: true });
  } else {
    // Fallback: simple shell copy
    execSync(`cp -r "${parentDist}"/* "${apiDist}"/`, { stdio: 'inherit' });
  }
  log('Copied dist/');

  const parentServer = path.join(repoRoot, 'server');
  const apiServer = path.join(apiRoot, 'server');
  if (fs.existsSync(parentServer)) {
    log('Copying server/ into /api/server');
    rimraf(apiServer);
    fs.mkdirSync(apiServer, { recursive: true });
    if (fs.cpSync) {
      fs.cpSync(parentServer, apiServer, { recursive: true });
    } else {
      execSync(`cp -r "${parentServer}"/* "${apiServer}"/`, { stdio: 'inherit' });
    }
    log('Copied server/');
  } else {
    log('No server/ directory found in parent; skipping copy');
  }

  log('Build bridge completed');
} catch (err) {
  console.error('[build-bridge] Error:', err);
  process.exit(1);
}
