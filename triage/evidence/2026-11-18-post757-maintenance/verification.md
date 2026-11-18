# #757 merge cleanup and remaining branch rebases

検証済み: upstream/main and fork main are `0bcf31797dd07fe356899ce236447038c178627e`, the merge of #757. GitHub API reported #757 MERGED at 2026-11-18T08:18:03Z (17:18 JST), while our #758–#765 remain OPEN. #766 belongs to upstream and is not our fork branch.

The merged `codex/update-playwright-popup-fix` bookmark was deleted locally and from origin. Its commit `1a5488aa7e54d4ed02ae69a0fe923737aad77bc6` is an ancestor of main and remains part of main's history; no main commits or repository objects were forcibly removed.

All 13 remaining implementation bookmarks were rebased directly onto main without conflicts. The git-format patch for each bookmark was compared before/after and matched exactly. Each parent was verified as the new main. The triage branch's 79 commits were also rebased, and its complete documentation patch matched. rebased.json records old/new SHAs, parents and patch identity.

Four immutable image/evidence references are deliberately preserved rather than rebased: the existing three screenshot branches and `codex/pr-eight-evidence`, pointing to the original pre-rebase triage `6192fc6ebc1e27b5995eb818146a6e5c4e3c2aca`. This retains both the 922e15e7 image links and 6192fc6e CI evidence links in published PR bodies. The separate claude-fixes workspace and upstream-only branches were not edited.

## Checks executed

Using direct mise-managed Bun/Node/jj executables (see tmp/maintenance-20261118b/verify.ps1):

- `bun install --frozen-lockfile`: success; Playwright 1.65.1 installed, matching the merged lockfile.
- On latest main, `bun run test:ci`: 197 files / 2,526 tests passed.
- On latest main, `bun run build:prod`: success.
- On each of all 13 rebased implementation heads, `node node_modules/typescript/bin/tsc --noEmit -p e2e/tsconfig.json`: success. type-results.json records each checked SHA.
- No temporary Vitest patch was needed for this run. Existing jsdom CSS diagnostics remain; no warning-free claim is made.

Scope: full per-branch unit suites and production builds were not repeated in this maintenance turn. The implementation patches are identical, and prior branch-specific results remain evidence for their original SHAs. Main was fully tested/built and the changed Playwright API types were checked on every implementation branch. Pushing the eight open PR heads triggers their CI again; post-rebase CI results are separate from these local checks.

## Publication and remaining work

Main, the evidence anchor, all 13 implementation bookmarks and triage are pushed to origin. No new PR or public Issue comment is created. The five backend-dependent implementations remain unpublished; rebasing does not resolve their backend dependency.

NGT-103 is complete via #757. The four previous popup CI failures recorded under 2026-11-18-eight-prs were against old heads; the eight open PRs now include the merged dependency fix through their main parent. Observe new CI results rather than treating old failures as current.
