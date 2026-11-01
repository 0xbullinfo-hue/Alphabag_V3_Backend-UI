import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const sourceOnly = process.argv.includes('--source-only');
const sourceSecretPattern = /(?:import\.meta\.env\.|process\.env\.)(VITE_[A-Z0-9_]*(?:KEY|SECRET|TOKEN|PASSWORD)[A-Z0-9_]*)/g;
const bundlePatterns = [
  /AIza[0-9A-Za-z\-_]{35}/,
  /sk-[A-Za-z0-9]{32,}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
];
const allowedPublicVariables = new Set([
  'VITE_WALLETCONNECT_PROJECT_ID',
  'VITE_GA_MEASUREMENT_ID',
  'VITE_TURNSTILE_SITE_KEY',
  'VITE_BAG_TOKEN_ADDRESS_MAINNET',
  'VITE_BAG_TOKEN_ADDRESS_TESTNET',
  'VITE_ENABLE_TOKEN_GATING',
]);

let failed = false;

function walk(directory, callback) {
  if (!existsSync(directory)) return;
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) walk(path, callback);
    else callback(path);
  }
}

walk('src', (path) => {
  if (!/\.(ts|tsx|js|jsx)$/.test(path)) return;
  const contents = readFileSync(path, 'utf8');
  for (const match of contents.matchAll(sourceSecretPattern)) {
    if (!allowedPublicVariables.has(match[1])) {
      console.error(`Forbidden secret-like environment variable ${match[1]} in ${path}`);
      failed = true;
    }
  }
});

if (!sourceOnly) {
  walk('dist', (path) => {
    if (!/\.(js|mjs|css|html|json|map)$/.test(path)) return;
    const contents = readFileSync(path, 'utf8');
    for (const pattern of bundlePatterns) {
      if (pattern.test(contents)) {
        console.error(`Secret-like value found in build output ${path}`);
        failed = true;
      }
    }
  });
}

if (failed) process.exit(1);
console.log(sourceOnly ? 'Source secret scan passed.' : 'Source and build secret scan passed.');