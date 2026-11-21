import { expect, test } from './fixtures/authenticated';

test.use({ initialServerSettings: { 'server-listen-interface': 'loopback' } });

test('loads and saves both states of the remote access toggle', async ({ authenticatedPage: page, serverApi }) => {
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  const section = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Allow remote access (requires restart)', exact: true }) });
  const toggle = section.locator('sh-toggle input[type=checkbox]:not(.internal-input)');
  await expect(toggle).not.toBeChecked();
  expect(serverApi.settingsRequests).toHaveLength(0);

  await section.locator('sh-toggle label').click();
  await expect(toggle).toBeChecked();
  await expect.poll(() => serverApi.settingsRequests.length).toBe(1);
  expect(serverApi.settingsRequests[0].request().postDataJSON()).toEqual({ 'server-listen-interface': 'any' });
  await serverApi.settingsRequests[0].fulfill({ status: 200, json: {} });

  await toggle.press('Space');
  await expect(toggle).not.toBeChecked();
  await expect.poll(() => serverApi.settingsRequests.length).toBe(2);
  expect(serverApi.settingsRequests[1].request().postDataJSON()).toEqual({ 'server-listen-interface': 'loopback' });
  await serverApi.settingsRequests[1].fulfill({ status: 200, json: {} });
});
