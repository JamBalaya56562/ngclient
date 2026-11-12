> 現在の作業状態・依存関係・着手候補は[タスク台帳](tasks.md)を正本とします。この文書は調査根拠と日付時点の記録です。

# Angular公式機能の活用と構造改善 — 2026-11-12

## この記録の位置付け

実装候補の現在の判断表。2026-10-29の調査を置き換える現在地であり、過去の検証結果を最新mainで再実行したという意味ではない。実装は最新mainから独立したブランチで行い、この記録ブランチを親にしない。PR作成・既存ブランチの更新は個別の指示に従う。

**検証済み（今回の読み取り）**: upstream/mainは `d788d0c592306dffe8105ae5f4c357156f94a38c`。`jj git fetch --all-remotes` は `Nothing changed`。package.jsonのAngularは22.2.1、CLIは22.2.2。GitHubではIssue18件、PR11件がopen。件数・状態は2026-11-12のスナップショットであり、着手前に再取得する。

## すでに使っているAngularの仕組み

**検証済み（ソース検索。実行時の網羅検証ではない）**:

- standalone、signals / computed / input / output / model / viewChild、OnPush、`provideZonelessChangeDetection`。
- RouterLink、functional guards、loadComponent / loadChildren、`withComponentInputBinding`、StartupPreloadingStrategy。
- `@if` / `@for` / `@defer`、fetchベースHttpClientとinterceptors。
- rxResourceはspec以外の8ファイル、takeUntilDestroyedは6ファイルで使用。httpResourceの使用は検索では0件。

Angularらしい実装が未導入という状況ではない。以下は足りない機能を全部導入する計画ではなく、現存する保守上の負担に公式の仕組みが適合するか評価する計画。

## 次の候補と受け入れ条件

| 優先 | 候補 | 対象・判断 | 受け入れ条件・依存 |
| --- | --- | --- | --- |
| 1 | 独自Signalラッパーの公開APIへの整理 | `core/functions/localstorage-signal.ts`、`core/signals/revertable-signal.ts`、`settings/settings.component.ts` のdebounceSignal。低水準のSignalノード操作やset/updateの置き換えを減らす | 同期的なstorage保存、外部値の反映、重複保存時のrollback、debounceのタイミング・破棄・flushを先にテスト。公開signal/computed/linkedSignalと明示的な保存処理を比較。低水準APIを一律に「非公開」とは断定しない |
| 2 | 非同期の読み取りと破棄処理の整理 | 既存ObservableクライアントにはrxResourceを優先検討。長寿命subscription・timerにはDestroyRef / takeUntilDestroyed / effect cleanupを適用できるか監査 | loading/error/reload、古い応答の上書き防止、画面破棄後の挙動をテスト。有限HTTP購読を全てリーク扱いしない。実行・削除などの書き込みをresourceに移さない |
| 3 | Routerの意味と画面データ取得の整理 | RouterLink付きbutton・クリック可能なカードと通常リンクの役割を確認。route input bindingも既存設定を利用可能か検討 | Ctrl+クリック、新しいタブ、Tab/Enter、戻る、フォーカスをE2Eで確認。タブのARIA契約を無視して全てaへ変えない。guard・エラー・ロード状態を維持 |
| 4 | 動的リストの安定したtrack | homeとrestoreのfilteredBackupsが`track $index` | 一意で安定したIDと仮ジョブの扱いを確認。並べ替え・検索・削除後のフォーカスと行状態をテスト。ホーム検索・復元検索の準備済みブランチと重なるため、マージ後に行う |
| 5 | Angular Aria / CDKと既存UI部品の境界整理 | file-tree・menu等の手製キーボード/フォーカス処理を評価。Ship UIに任せる部分と分ける | まず現在のキーボード・読み上げ・選択契約をテスト化。locked/link-target変更との重複を避ける。導入前に対応バージョンと安定性を確認。一括置換しない |
| 継続 | Signal Forms #497 | 下記のPR・準備済み範囲を除いたフォームのみ | model、検証、disabled、送信・キャンセル、サーバーへの値を維持。フォームを削っただけでnative submitのreloadを生まないこともE2E確認 |

**検証済み（静的観測）**: service-hub.tsにはsetIntervalがあり、同ファイル内でclearInterval / DestroyRef / onCleanupは検索できなかった。**推測**: ライフサイクル整理の候補。リークや重複ポーリングそのものは**未検証**であり、再現せず不具合と断定しない。上記変更の速度・通信量の改善も**未検証**。性能を理由にする場合は変更前後を同条件で計測する。

## 公式APIの安定性と導入しないもの

**ドキュメント根拠**（2026-11-12に公式資料を参照。導入時は対象バージョンで再確認）:

- [Signal Forms](https://angular.dev/guide/forms/signals/comparison)はAngular 22でstable。既存Reactive/Template Formsも利用可能で、全置換自体を目的にしない。
- [computedとeffectの使い分け](https://angular.dev/guide/signals/effect)、[linkedSignal](https://angular.dev/guide/signals/linked-signal): 純粋な派生値と外部への副作用を分ける。
- [httpResource](https://angular.dev/guide/http/http-resource): 読み取りとキャンセルに適する。生成クライアント、認証ヘッダー、relayを迂回して導入しない。
- [takeUntilDestroyed](https://angular.dev/ecosystem/rxjs-interop/take-until-destroyed)、[control flowのtrack](https://angular.dev/guide/templates/control-flow)、[RouterLink](https://angular.dev/guide/routing/navigate-to-routes)を適合する箇所で利用する。
- [Router resources](https://angular.dev/guide/routing/data-fetching-with-resources)はDeveloper Preview、[coreのdebounced](https://angular.dev/guide/signals/debounced)はexperimental。現時点の一括移行先にはしない。Formsのdebounceと独自setterの意味が同一とは限らない。
- [Angular Aria](https://angular.dev/guide/aria/overview)はキーボード・フォーカス・ARIAの実装候補。既存部品より適合するか小さい範囲で評価する。
- [SSR/hydration](https://angular.dev/guide/ssr)は現状の.NET配信の静的管理UIに直ちに追加しない。Next.jsのServer Actions相当のためだけにNodeサーバーを増やさない。

NgOptimizedImageやアニメーションも、表示性能・UXの課題が観測されたときに検討する。公式に機能があることと、このアプリに導入すべきことは別の判断。

## #497: 重複を避けるための現在地

**検証済み**: Generalの互換フィールド移行はmainの#682に入っている。Issue全体はopen。次の8PRはopenで、全て部分対応として`Refs #497`。これらの作業を新たに実装しない。

| PR | 範囲 | ブックマーク（codex/以下） |
| --- | --- | --- |
| [#687](https://github.com/duplicati/ngclient/pull/687) | Schedule / Options | migrate-schedule-options-signal-forms |
| [#688](https://github.com/duplicati/ngclient/pull/688) | Source data | migrate-source-data-signal-forms |
| [#689](https://github.com/duplicati/ngclient/pull/689) | 詳細オプションの値 | migrate-option-values-signal-forms |
| [#690](https://github.com/duplicati/ngclient/pull/690) | Import encryption | migrate-import-encryption-signal-forms |
| [#691](https://github.com/duplicati/ngclient/pull/691) | Restore encryption | migrate-restore-encryption-signal-forms |
| [#692](https://github.com/duplicati/ngclient/pull/692) | Restore config | migrate-restore-config-signal-forms |
| [#693](https://github.com/duplicati/ngclient/pull/693) | Login | migrate-login-signal-forms |
| [#694](https://github.com/duplicati/ngclient/pull/694) | Import file | migrate-import-file-signal-forms |

**検証済み（ブックマークと既存のローカル検証記録）**: 次の10件はoriginへpush済み、未PR。いずれも上記mainから独立し、#687〜694の後段スタックではない。今回テストを再実行したという意味ではない。詳細は各ブックマークのdiffと`tmp/<証拠ディレクトリ>/verification.md`を読む。tmpはGit管理外で共有・永続保存は保証されないため、公開前に再検証する。

| ブックマーク（codex/以下） | 完全なSHA | 証拠ディレクトリ |
| --- | --- | --- |
| migrate-export-signal-forms | 4d62658f7c7a7403390d25b67ab3e3b9754b5921 | export-signals |
| migrate-throttle-signal-forms | 9b61076384d3153ac0c75cbf93a1d1b13aa40be4 | throttle-signals |
| migrate-database-path-signal-forms | 5906d559a3f0fa906fc89bfa978fab08eb319e6c | database-path-signals |
| migrate-remote-registration-signal-forms | 01b21ca1924763d05791f96776f0f41ee6b16958 | remote-registration-signals |
| migrate-restore-url-signal-forms | 925641e1cfa953c1302c2fe481d4c138b4ddfe14 | restore-url-signals |
| migrate-import-selection-signal-forms | 87cd737939c0b9d219d46fff2bff2f7286aa5f49 | import-selection-signals |
| migrate-home-search-signal-forms | ec819d66245f803c2a25300489e744c99d64f834 | home-search-signals |
| migrate-initial-passphrase-signal-forms | 086bd05d8c522767adc34f05a86ad0804a7ccb4f | initial-passphrase-signals |
| migrate-restore-search-signal-forms | 7e7033a1db98100cef723d6c0e1858bd47dea8d8 | restore-search-signals |
| migrate-version-labels-signal-forms | 4d3a21f981f4f4659ff3f84fce7b1862649b06a8 | version-label-signals |

これらの検証は主にAPIモックのunit/E2Eであり、全件の実サーバー確認済みとはしない。移行時はFormFieldによるdisabled反映、FormsModuleを外した後のsubmit、custom controlへのプログラム更新、親の更新とローカル編集の同期も確認する。Vitest固有の部品初期化問題を本番コードの回避策で隠さない。

その他open PRは[#684](https://github.com/duplicati/ngclient/pull/684) locked展開防止・Access denied、[#685](https://github.com/duplicati/ngclient/pull/685) pause E2E、[#686](https://github.com/duplicati/ngclient/pull/686) job deletion E2E。`codex/show-file-tree-link-target`は未PRで本体#7775待ち。`fix/folder-filter-separators`は保留候補で、マージ済み#663と混同しない。スクリーンショット用ブランチ・triageは実装候補ではない。

## 前回の優先候補から変わったこと

**検証済み（mainのファイル・履歴）**:

- フォームモデルとDTO変換は`backup/models/{general-form,source-data-form,schedule-form,backup-form-mappers}.ts`へ分離済み。残る問題が再現しない限り同じ分離を繰り返さない。
- 宛先編集には`destination-edit-session.ts`があり、file-treeには取得処理・presentationの分離が進んでいる（presentationは#680）。大きいファイルという理由だけで同じ作業を再提案しない。
- ロケール定義は`scripts/locale-catalog.ts`に集約され、生成・テストがある。
- 起動時ロードはStartupPreloadingStrategyを使用。旧調査のPreloadAllModules前提は無効。
- CIの依存解決はBun frozen lockfile、Node 26。Playwright設定は`playwright.config.ts`へ統一済み。設定ファイルを用途ごとに増やす方針へ戻さない。
- キーボード、非同期状態、ビルド等にも変更が入っている。各カテゴリ全体の完了やIssue全体の解消を意味しない。新候補は現在の具体的な欠落とテストから選ぶ。

## 更新の再現手順

今回はコード・履歴・既存証拠・GitHub状態の読み取りと文書更新のみ。新しい動作検証・通信量計測・フォーラム全件再調査は行っていない。

```text
jj git fetch --all-remotes
jj log -r main@upstream --no-graph
jj log -r ancestors(main@upstream) --limit 65
jj bookmark list --all-remotes
gh issue list --repo duplicati/ngclient --state open --limit 100 --json number,title,url
gh pr list --repo duplicati/ngclient --state open --limit 100 --json number,title,headRefName,headRefOid,url
gh pr view 7775 --repo duplicati/duplicati --json state,mergedAt,url
rg -n 'rxResource|httpResource|takeUntilDestroyed|provideZonelessChangeDetection|withComponentInputBinding' projects/ngclient/src
```

実際にはjj/ghのmise管理下実体を直接使用。GitHubの状態やmainが変われば、この表を先に更新してから実装候補を選ぶ。Issueの要求全体を満たして検証できたPRにだけFixesを付け、部分対応はRefsと残件を明記する。

