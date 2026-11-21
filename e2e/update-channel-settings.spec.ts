import { expect, test } from './fixtures/authenticated';

test.use({ initialServerSettings: { 'update-channel': 'stable' } });

test('loads the stored update channel and saves a newly selected channel', async ({
  authenticatedPage: page,
  serverApi,
}) => {
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  const stable = page.locator('.radio-option input[type=radio][value=stable]:not(.internal-input)');
  const beta = page.locator('.radio-option input[type=radio][value=beta]:not(.internal-input)');
  await expect(stable).toBeChecked();
  expect(serverApi.settingsRequests).toHaveLength(0);

  await beta.focus();
  await beta.press('Space');
  await expect(beta).toBeChecked();
  await expect(stable).not.toBeChecked();
  await expect.poll(() => serverApi.settingsRequests.length).toBe(1);
  expect(serverApi.settingsRequests[0].request().postDataJSON()).toEqual({ 'update-channel': 'beta' });
  await serverApi.settingsRequests[0].fulfill({ status: 200, json: {} });
});
