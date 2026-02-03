#!/usr/bin/env node
/**
 * Lees .env.local en push de benodigde variabelen naar Vercel (production).
 * Gebruik: node scripts/push-env-to-vercel.js
 * Vereist: npx vercel login en npx vercel link (eenmalig), en .env.local in project root.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ENV_FILE = path.join(PROJECT_ROOT, '.env.local');

const VAR_NAMES = [
  'OPENAI_API_KEY',
  'OPENAI_MODEL',
  'DATABASE_URL',
  'SLACK_WEBHOOK_URL',
  'SESSION_SECRET',
  'NEXTAUTH_SECRET',
  'ENCRYPTION_KEY',
];

function parseEnv(content) {
  const out = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1).replace(/\\n/g, '\n');
    }
    out[key] = value;
  }
  return out;
}

function main() {
  if (!fs.existsSync(ENV_FILE)) {
    console.error('❌ .env.local niet gevonden in project root.');
    process.exit(1);
  }

  const content = fs.readFileSync(ENV_FILE, 'utf8');
  const env = parseEnv(content);

  const toPush = VAR_NAMES.filter((key) => env[key]);
  const missing = VAR_NAMES.filter((key) => !env[key]);

  if (missing.length > 0) {
    console.log('Ontbrekend in .env.local (worden overgeslagen):', missing.join(', '));
    console.log('');
  }

  if (toPush.length === 0) {
    console.error('Geen van de verwachte variabelen staat in .env.local. Stoppen.');
    console.error('Voeg minimaal één van deze toe:', VAR_NAMES.join(', '));
    process.exit(1);
  }

  console.log('Variabelen naar Vercel (production) pushen:', toPush.join(', '));
  console.log('');

  for (const key of toPush) {
    const value = env[key];
    const r = spawnSync('npx', ['vercel', 'env', 'add', key, 'production'], {
      cwd: PROJECT_ROOT,
      input: value,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const out = [r.stdout, r.stderr].filter(Boolean).join('');
    if (r.status === 0) {
      console.log(`✅ ${key}`);
    } else if (out.includes('already exists') || out.includes('Duplicate')) {
      console.log(`⏭️  ${key} (bestaat al)`);
    } else {
      if (r.stderr) process.stderr.write(r.stderr);
      console.error(`❌ ${key} mislukt (code ${r.status})`);
    }
  }

  console.log('');
  console.log('Klaar. Voer een redeploy uit: npx vercel --prod');
}

main();
