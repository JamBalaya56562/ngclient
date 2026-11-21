import { expect, test } from './fixtures/authenticated';

test.use({
  initialServerSettings: { 'use-out-of-process-controller': 'False' },
  extraApiExtensions: ['v1:ipc:controller'],
});

test('loads and saves both states of backup process isolation', async ({ authenticatedPage: page, serverApi }) => {
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  const section = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Experimental options', exact: true }) });
  const toggle = section.locator('#use-out-of-process-controller');
  await expect(toggle).not.toBeChecked();
  expect(serverApi.settingsRequests).toHaveLength(0);

  await section
    .locator('label[for=use-out-of-process-controller]')
    .filter({ hasText: 'Operations run inside the server process' })
    .click();
  await expect(toggle).toBeChecked();
  await expect.poll(() => serverApi.settingsRequests.length).toBe(1);
  expect(serverApi.settingsRequests[0].request().postDataJSON()).toEqual({ 'use-out-of-process-controller': 'True' });
  await serverApi.settingsRequests[0].fulfill({ status: 200, json: {} });

  await toggle.press('Space');
  await expect(toggle).not.toBeChecked();
  await expect.poll(() => serverApi.settingsRequests.length).toBe(2);
  expect(serverApi.settingsRequests[1].request().postDataJSON()).toEqual({ 'use-out-of-process-controller': 'False' });
  await serverApi.settingsRequests[1].fulfill({ status: 200, json: {} });
});
