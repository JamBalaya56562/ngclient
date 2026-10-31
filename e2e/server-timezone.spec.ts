import { mkdir } from 'node:fs/promises';
import { expect, test } from './fixtures/authenticated';

const systemInfo = {
  ServerTimeZone: 'Europe/Prague',
  TimeZones: [
    { ID: 'Europe/Prague', DisplayName: '(UTC+01:00) Prague', CurrentUTCOffset: '01:00:00' },
    { ID: 'Asia/Tokyo', DisplayName: '(UTC+09:00) Tokyo', CurrentUTCOffset: '09:00:00' },
  ],
};
test.use({ initialSystemInfo: systemInfo });
test.beforeEach(async ({ authenticatedPage: page }) => {
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page).toHaveURL('/settings');
});

for (const { stored, label } of [
  { stored: '', label: 'Not set (system time zone: Europe/Prague)' },
  { stored: 'Europe/Prague', label: '(UTC+01:00) Prague' },
]) {
  test.describe(`stored zone ${JSON.stringify(stored)}`, () => {
    test.use({ initialServerSettings: { 'server-timezone': stored } });
    test('shows the setting without silently choosing the OS zone', async ({
      authenticatedPage: page,
      serverApi,
    }, testInfo) => {
      const section = page
        .locator('section')
        .filter({ has: page.getByRole('heading', { name: 'Server time zone', exact: true }) });
      await expect(section.locator('.selected-value')).toContainText(label);
      expect(serverApi.settingsRequests).toHaveLength(0);
      if (!process.env['CI']) {
        await mkdir('tmp/server-timezone-20261031/screenshots', { recursive: true });
        const screenshot = await section.screenshot({
          path: `tmp/server-timezone-20261031/screenshots/${stored ? 'explicit' : 'unset'}.png`,
        });
        await testInfo.attach('server-timezone', { body: screenshot, contentType: 'image/png' });
      }
    });
  });
}

test.describe('changing the zone', () => {
  test.use({ initialServerSettings: { 'server-timezone': 'Europe/Prague' } });
  for (const { label, stored } of [
    { label: '(UTC+09:00) Tokyo', stored: 'Asia/Tokyo' },
    { label: 'Not set (system time zone: Europe/Prague)', stored: '' },
  ]) {
    test(`saves ${JSON.stringify(stored)} and locks the selector while pending`, async ({
      authenticatedPage: page,
      serverApi,
    }) => {
      const select = page.locator('app-server-timezone-settings sh-select');
      await select.locator('sh-form-field').click();
      await page.getByRole('option', { name: label, exact: true }).click();
      await expect.poll(() => serverApi.settingsRequests.length).toBe(1);
      expect(serverApi.settingsRequests[0].request().postDataJSON()).toEqual({ 'server-timezone': stored });
      await expect(select.locator('sh-spinner[prefix]')).toBeVisible();
      await expect(select.locator('sh-form-field')).toHaveClass(/readonly/);
      await serverApi.settingsRequests[0].fulfill({ status: 200, json: {} });
      await expect(select.locator('sh-spinner[prefix]')).toHaveCount(0);
      await expect(select.locator('.selected-value')).toContainText(label);
    });
  }
  test('rolls back a rejected change and allows retry', async ({ authenticatedPage: page, serverApi }) => {
    const select = page.locator('app-server-timezone-settings sh-select');
    await select.locator('sh-form-field').click();
    await page.getByRole('option', { name: '(UTC+09:00) Tokyo', exact: true }).click();
    await expect.poll(() => serverApi.settingsRequests.length).toBe(1);
    await serverApi.settingsRequests[0].fulfill({ status: 500, json: { Error: 'Time zone rejected' } });
    await expect(select.locator('.selected-value')).toContainText('(UTC+01:00) Prague');
    await expect(select.locator('sh-spinner[prefix]')).toHaveCount(0);
    await select.locator('sh-form-field').click();
    await page.getByRole('option', { name: '(UTC+09:00) Tokyo', exact: true }).click();
    await expect.poll(() => serverApi.settingsRequests.length).toBe(2);
    await serverApi.settingsRequests[1].fulfill({ status: 200, json: {} });
  });
});
