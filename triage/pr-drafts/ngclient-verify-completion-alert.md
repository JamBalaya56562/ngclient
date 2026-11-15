# Report the outcome of Verify files when the task finishes

Fixes duplicati/duplicati#1510

## Summary
- The home page "Verify files" action only flashed a success mark when the verify request was accepted. That means the task was queued, not that the verification passed, so the result could only be found in the log.
- `verifyFiles` now waits for the queued task through the existing `ServerStateService.waitForTaskToComplete`, the same way the restore flow does. When the task finishes, it shows a success alert, or an error alert with the task's error message if the task failed or finished with errors in its results.
- No server change. `GET /api/v1/task/{id}` already reports `Failed` when the task throws and sets `ErrorMessage` when the results contain errors.

## Testing
- `ng test ngclient --watch=false --include=projects/ngclient/src/app/home/home.component.spec.ts`: 8 passed.
- Without the component change, the 4 new tests fail: success, failure, completed-with-errors and still-running.
- The tests check the outbound verify call, check that the returned task ID is the one waited on, and check which alert is shown.
- Not checked against a running server in a browser.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
