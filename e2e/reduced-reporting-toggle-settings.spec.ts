import { expect, test } from './fixtures/authenticated';

test.use({ initialServerSettings: { 'reduced-reporting': 'False' } });

test('loads and saves both states of reduced-reporting', async ({ authenticatedPage: page, serverApi }) => {
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  const section = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Reduced reporting', exact: true }) });
  const toggle = section.locator('#reduced-reporting');
  await expect(toggle).not.toBeChecked();
  expect(serverApi.settingsRequests).toHaveLength(0);

  await section.locator('label[for=reduced-reporting]').click();
  await expect(toggle).toBeChecked();
  await expect.poll(() => serverApi.settingsRequests.length).toBe(1);
  expect(serverApi.settingsRequests[0].request().postDataJSON()).toEqual({ 'reduced-reporting': 'True' });
  await expect(toggle).toBeDisabled();
  await serverApi.settingsRequests[0].fulfill({ status: 200, json: {} });

  await expect(toggle).toBeEnabled();
  await toggle.press('Space');
  await expect(toggle).not.toBeChecked();
  await expect.poll(() => serverApi.settingsRequests.length).toBe(2);
  expect(serverApi.settingsRequests[1].request().postDataJSON()).toEqual({ 'reduced-reporting': 'False' });
  await serverApi.settingsRequests[1].fulfill({ status: 200, json: {} });
});
