Part of duplicati/duplicati#7850

Suppressing a log warning saves the job definition, but the request omitted `OperationType`. Released servers defaulted the missing value to Backup, so this action could silently turn a Sync job into a Backup job.

Send the fetched `OperationType` and `Enabled` values when suppressing or restoring a warning. This preserves the job kind and explicitly retains disabled jobs as well.

### Validation

- Eight regression cases failed before the fix; all 31 related log tests pass afterward. Covers Sync/Backup, enabled/disabled, and suppress/un-suppress, while retaining the other settings and schedule.
- App/spec TypeScript checks, Prettier, and the production build pass.
- Isolated 2.4.1.101 Canary, without the server-side fix: omitting the type reproduced Sync → Backup. Using the production UI, Suppress and Un-suppress both retained Sync and `Enabled:false`. Re-enabling and running the same job updated the destination's plain file correctly.
- The live test used a local destination and a deliberately unsupported test option to produce a real warning; the reported SMB listing warning was not reproduced.

The companion server-side safeguard for omitted fields is separate. This PR does not close duplicati/duplicati#7850 by itself.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
