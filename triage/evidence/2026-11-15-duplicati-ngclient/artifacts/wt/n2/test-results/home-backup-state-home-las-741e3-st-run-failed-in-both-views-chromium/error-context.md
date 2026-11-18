# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home-backup-state.spec.ts >> home last run failure >> marks only the backup whose latest run failed in both views
- Location: e2e\home-backup-state.spec.ts:124:7

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: locator('.backups .backup').filter({ hasText: 'Documents' }).locator('sh-chip.error')
Expected pattern: /Last run failed/
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveText" locator('.backups .backup').filter({ hasText: 'Documents' }).locator('sh-chip.error') with timeout 5000ms
  - waiting for locator('.backups .backup').filter({ hasText: 'Documents' }).locator('sh-chip.error')

```

```yaml
- navigation:
  - img "Duplicati"
  - heading "duplicati" [level=2]
  - button "Switch to dark mode"
  - list:
    - link "Home":
      - /url: /
    - link "Add backup":
      - /url: /add-backup
    - link "Restore":
      - /url: /restore
    - link "Destinations":
      - /url: /destinations
    - link "System status":
      - /url: /status
    - link "Settings":
      - /url: /settings
  - list:
    - text: Browser test server
    - separator
    - link "About Duplicati":
      - /url: /about
    - link "Documentation":
      - /url: https://docs.duplicati.com
    - link "Visit forum":
      - /url: https://forum.duplicati.com
    - button "Log out"
- main:
  - text: No scheduled tasks
  - link "Click to register":
    - /url: /connect/logon
  - button "Pause"
  - button
  - link "Backups Keep your data safe at your chosen destination. Create":
    - heading "Backups" [level=3]
    - paragraph: Keep your data safe at your chosen destination.
    - button "Create"
  - link "Restores Recover your files from any backup set. Start":
    - heading "Restores" [level=3]
    - paragraph: Recover your files from any backup set.
    - button "Start"
  - heading "My backups" [level=2]:
    - text: My backups
    - group:
      - button "List" [pressed]
      - button "Details"
    - combobox:
      - 'button "Time: Relative"':
        - text: "Time:"
        - strong: Relative
    - combobox:
      - 'button "Order by: id"':
        - text: "Order by:"
        - strong: id
  - heading "Documents Local" [level=3]
  - paragraph: "Last successful backup: 2 months ago"
  - paragraph: Duration:-
  - paragraph: Source:-
  - paragraph: Destination:-
  - link "2 Versions"
  - button "Start"
  - button "Edit"
  - combobox:
    - button "More actions"
  - heading "Photos Local" [level=3]
  - paragraph: "Last successful backup: 2 months ago"
  - paragraph: Duration:-
  - paragraph: Source:-
  - paragraph: Destination:-
  - link "2 Versions"
  - button "Start"
  - button "Edit"
  - combobox:
    - button "More actions"
  - button
  - button
```

# Test source

```ts
  27  |   });
  28  | 
  29  |   test('marks queued backups in both views', async ({ authenticatedPage: page, serverApi }) => {
  30  |     serverApi.sendServerStatus({ SchedulerQueueIds: [{ Item1: 11, Item2: '2' }] });
  31  | 
  32  |     const photos = page.locator('.backups .backup').filter({ hasText: 'Photos' });
  33  |     await expect(photos).toContainText(/Next scheduled run:\s*Queued/);
  34  | 
  35  |     await page.getByRole('button', { name: 'Details', exact: true }).click();
  36  |     const table = page.locator('sh-table');
  37  |     await expect(table.getByRole('row').filter({ hasText: 'Photos' })).toContainText('Queued');
  38  |     await expect(table.getByRole('row').filter({ hasText: 'Documents' })).not.toContainText('Queued');
  39  |   });
  40  | 
  41  |   test('highlights the running backup with progress and icon-only controls in details', async ({
  42  |     authenticatedPage: page,
  43  |     serverApi,
  44  |   }) => {
  45  |     await page.route('**/api/v1/progressstate', (route) =>
  46  |       route.fulfill({
  47  |         json: {
  48  |           TaskID: 7,
  49  |           BackupID: '1',
  50  |           Phase: 'Backup_ProcessingFiles',
  51  |           StillCounting: false,
  52  |           TotalFileCount: 10,
  53  |           ProcessedFileCount: 4,
  54  |           TotalFileSize: 1000,
  55  |           ProcessedFileSize: 420,
  56  |           CurrentFilecomplete: true,
  57  |           CurrentFileoffset: 0,
  58  |         },
  59  |       })
  60  |     );
  61  |     await page.route('**/api/v1/task/7', (route) => route.fulfill({ json: { ID: 7, Status: 'Running' } }));
  62  | 
  63  |     await page.getByRole('button', { name: 'Details', exact: true }).click();
  64  |     serverApi.sendServerStatus({
  65  |       ActiveTask: { Item1: 7, Item2: '1' },
  66  |       SchedulerQueueIds: [
  67  |         { Item1: 7, Item2: '1' },
  68  |         { Item1: 8, Item2: '2' },
  69  |       ],
  70  |     });
  71  | 
  72  |     const table = page.locator('sh-table');
  73  |     const running = table.getByRole('row').filter({ hasText: 'Documents' });
  74  |     await expect(running).toHaveClass(/running/);
  75  |     await expect(running.locator('.row-progress')).toContainText('42%');
  76  |     await expect(running).not.toContainText('Queued');
  77  |     await expect(running.getByRole('button', { name: 'Stop', exact: true })).toBeVisible();
  78  |     await expect(running.locator('button', { has: page.locator('sh-icon', { hasText: 'stop' }) })).toBeVisible();
  79  |     await expect(table.getByRole('row').filter({ hasText: 'Photos' })).toContainText('Queued');
  80  | 
  81  |     await page.screenshot({ path: 'test-results/home-running-details.png' });
  82  |   });
  83  | 
  84  |   test('opens restore from the versions chip in list view', async ({ authenticatedPage: page }) => {
  85  |     // Only the navigation matters here; keep the restore page's own loading quiet.
  86  |     await page.route('**/api/v1/backup/1', (route) => route.fulfill({ json: backup('1', 'Documents') }));
  87  |     await page.route('**/api/v1/backup/1/filesets', (route) => route.fulfill({ json: [] }));
  88  | 
  89  |     const music = page.locator('.backups .backup').filter({ hasText: 'Music' });
  90  |     await expect(music.getByRole('link')).toHaveCount(0);
  91  |     await expect(music).toContainText('No version yet');
  92  | 
  93  |     const documents = page.locator('.backups .backup').filter({ hasText: 'Documents' });
  94  |     await documents.getByRole('link', { name: /2 Versions/ }).click();
  95  |     await expect(page).toHaveURL(/\/restore\/1(\/|$)/);
  96  |   });
  97  | });
  98  | 
  99  | test.describe('home last run failure', () => {
  100 |   const withMetadata = (id: string, name: string, metadata: Record<string, string>) => {
  101 |     const item = backup(id, name);
  102 |     item.Backup.Metadata = { ...item.Backup.Metadata, ...metadata };
  103 |     return item;
  104 |   };
  105 | 
  106 |   test.use({
  107 |     initialBackups: [
  108 |       [
  109 |         withMetadata('1', 'Documents', {
  110 |           LastBackupFinished: '20260921T100000Z',
  111 |           LastErrorDate: '20260921T110000Z',
  112 |           LastErrorMessage: 'The destination is unreachable',
  113 |         }),
  114 |         withMetadata('2', 'Photos', {
  115 |           LastBackupFinished: '20260921T120000Z',
  116 |           LastErrorDate: '20260921T110000Z',
  117 |           LastErrorMessage: 'An older failure',
  118 |         }),
  119 |       ],
  120 |       { scope: 'test' },
  121 |     ],
  122 |   });
  123 | 
  124 |   test('marks only the backup whose latest run failed in both views', async ({ authenticatedPage: page }) => {
  125 |     const documents = page.locator('.backups .backup').filter({ hasText: 'Documents' });
  126 |     const photos = page.locator('.backups .backup').filter({ hasText: 'Photos' });
> 127 |     await expect(documents.locator('sh-chip.error')).toHaveText(/Last run failed/);
      |                                                      ^ Error: expect(locator).toHaveText(expected) failed
  128 |     await expect(photos).toBeVisible();
  129 |     await expect(photos.locator('sh-chip.error')).toHaveCount(0);
  130 | 
  131 |     await documents.locator('sh-chip.error').hover();
  132 |     await expect(page.getByText('The destination is unreachable')).toBeVisible();
  133 | 
  134 |     await page.getByRole('button', { name: 'Details', exact: true }).click();
  135 |     const table = page.locator('sh-table');
  136 |     await expect(table.getByRole('row').filter({ hasText: 'Documents' }).locator('sh-chip.error')).toHaveText(/Failed/);
  137 |     await expect(table.getByRole('row').filter({ hasText: 'Photos' }).locator('sh-chip.error')).toHaveCount(0);
  138 |   });
  139 | });
  140 | 
```