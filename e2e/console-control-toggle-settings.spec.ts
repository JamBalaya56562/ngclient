import { expect, test } from './fixtures/authenticated';

test.use({ initialServerSettings: { 'disable-console-control': 'True' } });

test('loads and saves both states of console-control', async ({ authenticatedPage: page, serverApi }) => {
  await expect.poll(() => serverApi.subscriptions).toContain('remotecontrol');
  serverApi.sendRemoteControlStatus({ IsRegistering: true, CanEnable: false, RegistrationUrl: null });
  await page.getByRole('link', { name: 'Settings', exact: true }).click();
  const section = page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Configure console control', exact: true }) });
  const toggle = section.locator('#disable-console-control');
  await expect(toggle).not.toBeChecked();
  expect(serverApi.settingsRequests).toHaveLength(0);

  await section.locator('label[for=disable-console-control]').click();
  await expect(toggle).toBeChecked();
  await expect.poll(() => serverApi.settingsRequests.length).toBe(1);
  expect(serverApi.settingsRequests[0].request().postDataJSON()).toEqual({ 'disable-console-control': 'False' });

  await serverApi.settingsRequests[0].fulfill({ status: 200, json: {} });

  await expect(toggle).toBeEnabled();
  await toggle.press('Space');
  await expect(toggle).not.toBeChecked();
  await expect.poll(() => serverApi.settingsRequests.length).toBe(2);
  expect(serverApi.settingsRequests[1].request().postDataJSON()).toEqual({ 'disable-console-control': 'True' });
  await serverApi.settingsRequests[1].fulfill({ status: 200, json: {} });
});
