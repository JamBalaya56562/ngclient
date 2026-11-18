// Drives the dev-served ngclient against a local test server and checks the idle sign-out end to end
import { createRequire } from 'node:module';
const { chromium } = createRequire('C:/Users/Jam/AppData/Local/Temp/claude/eb7164b3a8a8609a/2ade3d67-588b-4a0d-82ef-8acf31aad402/scratchpad/wt/n1/package.json')('@playwright/test');

const base = 'http://localhost:4304';
const browser = await chromium.launch();
const page = await browser.newPage();
const logouts = [];
page.on('request', (req) => {
  if (req.url().includes('/api/v1/auth/refresh/logout')) logouts.push(req.method());
});

await page.clock.install();
await page.goto(base + '/login');
await page.locator('input[autocomplete="current-password"]').fill('easy1234');
await page.locator('button.login-button').click();
await page.waitForURL((u) => !u.pathname.endsWith('/login'), { timeout: 30000 });
console.log('signed in at', new URL(page.url()).pathname);

await page.goto(base + '/settings');
const section = page.locator('section', { has: page.getByRole('heading', { name: 'Sign out when idle' }) });
await section.waitFor({ timeout: 30000 });
console.log('section input value:', await section.locator('input').inputValue());
await section.locator('sh-select').click();
await page.getByText('After 5 minutes without activity').click();
await page.waitForTimeout(300);
console.log('stored minutes:', await page.evaluate(() => localStorage.getItem('v1:duplicati:idleLogoutMinutes')));

await page.clock.runFor(4 * 60_000);
console.log('after 4 min idle: url', new URL(page.url()).pathname, 'logout requests', logouts.length);
await page.mouse.move(10, 10);
await page.mouse.move(200, 200);
await page.clock.runFor(4 * 60_000);
console.log('after activity + 4 min: url', new URL(page.url()).pathname, 'logout requests', logouts.length);
await page.clock.runFor(70_000);
await page.waitForURL((u) => u.pathname.endsWith('/login'), { timeout: 15000 });
console.log('after 5+ min idle: url', new URL(page.url()).pathname, 'logout requests', logouts);

await browser.close();
