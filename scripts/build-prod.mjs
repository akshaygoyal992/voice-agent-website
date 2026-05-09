import { spawnSync } from 'node:child_process';

const defaultLoginUrl = 'https://app.example.com/login';
const loginUrl = process.env.LOGIN_URL || defaultLoginUrl;

const args = [
  'ng',
  'build',
  '--configuration',
  'production',
  '--define',
  `__LOGIN_URL__=${JSON.stringify(loginUrl)}`,
];

const result = spawnSync('npx', args, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
