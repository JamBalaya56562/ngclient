# Add a Report an issue link to the sidenav

Fixes duplicati/duplicati#2259

## Summary
- Adds a "Report an issue" entry to the sidenav, below "Visit forum". It opens https://github.com/duplicati/duplicati/issues/new/choose in a new tab, so the reporter can pick the bug report or the feature request template.
- It is marked up the same way as the existing Documentation and forum links (`action`, `i18n`, external-link suffix icon) and uses the `bug` icon. The build-time `gen:font` step adds that icon to the font.
- Adds `layout.component.spec.ts`, which renders the real layout template and checks the new link's href and target. It also checks that the Documentation and forum links are still there.

## Testing
- `ng test ngclient --watch=false --include=projects/ngclient/src/app/layout/layout.component.spec.ts`: 2 passed.
- With the template change reverted, the new-link test fails (`expected undefined to be defined`) and the existing-links test still passes.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
