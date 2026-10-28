# ngclientの構造改善・モダン化候補

- 調査日: 2026-10-29（Asia/Tokyo）
- リポジトリ: `duplicati/ngclient`、fork: `JamBalaya56562/ngclient`
- 調査対象main: `a05d441a1db5d385a810841659cadffb4f1b4b82`（#612マージ後）
- 用途: 次の実装・リファクタリングを選ぶための調査記録。実装を承認・完了した記録ではない。
- 利用者の方針: テスト追加だけでなく、構築基盤・設計・操作性の改善も進めたい。変更はレビューしやすいPRに分割する。

## 根拠と検証範囲

この調査ではコード、CI設定、ngclientとDuplicati本体のopen Issue、関連コメント、open PRを確認した。コード構造の確認と、不具合の実行時再現は別に扱う。

- **検証済み（静的確認）**: ファイルの内容、import関係、設定、コードの行数、既存の経路・処理の存在。
- **ドキュメント根拠**: Issue本文・コメント、Angular公式ドキュメントの記述。
- **提案・推測**: 変更によって保守性や使いやすさが改善するという判断。
- **未検証**: 報告された不具合の現在のmainでの再現、変更後の動作、性能・通信量の改善効果。この調査のためのビルド・テストは実行していない。

確認に使ったコマンド・方法:

```text
gh issue list --repo duplicati/ngclient --state open --limit 100 --json number,title,body,url
gh issue list --repo duplicati/duplicati --state open --search ngclient --limit 100 --json number,title,body,url
gh issue list --repo duplicati/duplicati --state open --search '"new UI"' --limit 100 --json number,title,body,url
gh issue list --repo duplicati/duplicati --state open --search '"web UI"' --limit 100 --json number,title,body,url
gh issue view 497 --repo duplicati/ngclient --json number,title,comments,url
gh issue view 328 --repo duplicati/ngclient --json number,title,comments,url
gh issue view 6865 --repo duplicati/duplicati --json number,title,body,comments,url
gh issue view 6190 --repo duplicati/duplicati --json number,title,body,comments,url
gh pr list --repo duplicati/ngclient --state open --limit 100 --json number,title,headRefName,url
```

`gh` はmise配下の実体を直接呼んだ。ファイルはNode.jsで読み取り、行数は改行で分割して集計した。取得したDuplicati側Issueの一部は、調査時の作業コピーの無視対象 `tmp/refactor-survey-20261029/` にも保存したが、この記録を継続参照用とする。

## 現状と全体方針

**検証済み（静的確認）**: Angular 22、zoneless、Signal、遅延ロード、TypeScriptのstrict設定とstrictTemplatesがすでに使われている。

根拠:

- `package.json`: Angular `22.2.1`、CLI `22.2.2`。
- `projects/ngclient/src/app/app.config.ts`: `provideZonelessChangeDetection`、`PreloadAllModules`。
- `projects/ngclient/src/app/app.routes.ts`: `loadComponent` / `loadChildren`。
- `tsconfig.json`: `strict: true`、`strictTemplates: true`。

**提案**: 次の主軸は、フォーム・宛先編集・ファイルツリーの責務分離と、保存データを変えてしまわない保証にする。

## 優先候補1: フォームモデル・DTO変換の分離

対象:

- `projects/ngclient/src/app/backup/backup.state.ts`（調査時約830行）
- `backup/general/general.component.ts`
- `backup/source-data/source-data.component.ts`
- `backup/schedule-v2/schedule.component.ts`

**検証済み（静的確認）**: BackupStateがコンポーネントからフォーム生成関数・既定値をimportし、GeneralComponentもBackupStateをimportしている。状態管理と画面定義が相互に依存している。

**実装案**: フォームモデル、既定値、DTOとの変換を専用モジュールへ移す。コンポーネントは表示・入力、Stateは処理の調整、変換モジュールはデータ変換を受け持つ。最初のPRでは保存形式や画面動作を変えない。

**完了条件**: 既存設定の読込→保存で送信内容が変わらない。新規・編集・draft・Syncの既存テスト、app/specの型検査、ビルドが通る。移動したモジュールがコンポーネントをimportしていない。

## 優先候補2: 宛先編集の読込と変更確定を分離

関連Issue: [ngclient #328: Resilience for broken editors](https://github.com/duplicati/ngclient/issues/328)。**ドキュメント根拠**: エディタの不具合により、読み込むだけで接続文字列が変わるという報告。現在のmainでの再現は未検証。

**検証済み（静的確認）**: `backup/destination/single-destination/single-destination.component.ts` には、URLをフォームへ展開する `destinationTypeEffect` と、フォームを `toTargetPath` でURLへ戻す `destinationFormEffect` がある（調査時229行目・364行目付近）。

**実装案**:

- 元の接続文字列、編集用データ、利用者が変更した項目を区別する。
- 読込時の変換と、編集を反映する処理を分ける。
- 未変更のURL、未知のオプション、エンコード、認証情報・placeholderを保持する。
- provider固有の変換と、共通の編集状態管理を分離する。

**完了条件**: 開くだけ・キャンセル・無関係な項目の変更で、他の設定を失わない。既存のfile/SFTP/WebDAV/pCloud mapperテストを維持し、未知のオプションや特殊文字を含む回帰ケースを追加する。保存データの同一性をどこまで要求するか（元の文字列か、意味上の同一性か）は操作ごとに明示する。

## 優先候補3: Signal Formsへの段階的移行

関連Issue: [ngclient #497](https://github.com/duplicati/ngclient/issues/497)。**ドキュメント根拠**: メンテナが、特にバックアップフローのobject of signalsをSignal Formsへ置き換えたいと記載している。

Angular公式:

- [フォーム方式の比較](https://angular.dev/guide/forms/signals/comparison): Signal Formsはv22以降stable。
- [Reactive Formsからの移行](https://angular.dev/guide/forms/signals/migration): 共存を使った段階移行。
- [effectの用途](https://angular.dev/guide/signals/effect): 状態の伝播目的でeffectを使うことを避け、派生状態にはcomputedなどを使う指針。

**実装案**: 候補1の分離を進め、まずGeneral画面で値・検証・touched/dirty・disabled状態を整理する。名前・説明・暗号化・パスワードを対象に、Reactive FormsとSignalの橋渡しを減らす。結果を確認してSource・Scheduleへ広げ、複雑な宛先編集は後段とする。

**未検証・事前確認**: Ship UIの入力・選択部品、既存ControlValueAccessorとの連携。小さな試作で確かめ、必要な互換処理を決める。

**完了条件**: 新規・編集・draft・Syncの値と保存DTOが維持され、条件付き必須、パスワード一致、暗号化変更制限などの検証が既存動作と一致する。画面操作と送信内容の両方で確認する。

## その他の候補

| 優先度 | 候補                           | 確認した現状・実装方向                                                                                                                                                                                                                  | 検証方法・注意点                                                                                                                                       |
| ------ | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 高     | ファイルツリーの責務分離       | `core/components/file-tree/file-tree.component.ts` は約1,723行。各種取得、選択・フィルター判定、検索結果、表示構築が集まる。取得処理→共通ノード形式→選択・表示の順に分離する。                                                          | 既存ツリーテスト、ページング、remote sources、復元の回帰確認。分割だけで関連Issueが直るとは扱わない。                                                  |
| 高     | キーボード操作・フォーカス表示 | [#111](https://github.com/duplicati/ngclient/issues/111)、[#349](https://github.com/duplicati/ngclient/issues/349)。ツリーテンプレートにはクリック操作を持つdivがある。矢印キー、Space選択、展開状態通知、focus-visibleを段階実装する。 | キーボードのみのPlaywright操作、フォーカス順、展開・選択の状態確認。Ship UIが追加する挙動も含め、実際のDOMを確認する。                                 |
| 高     | 非同期操作の状態管理           | 保存・接続テストなどの処理中・成功・失敗・中断を明示し、二重実行・画面遷移後の反映を扱いやすくする。                                                                                                                                    | 遅延応答、失敗、取消、対象URL変更。接続テストは#589のマージ後に差分を確認してから着手する。                                                            |
| 中     | ビルド・依存解決の統一         | `bun.lock` と `package-lock.json` があり、テスト系CIはBun、公開CIはnpm ci。一部buildスクリプトはフォント生成とビルドを `&` で並行実行する。依存解決の基準を決め、生成→ビルドを順番実行する。                                            | クリーン環境の本番ビルド、成果物・フォント生成、公開用packageの確認。npm publishの認証・provenanceを維持する。現時点で競合による失敗は再現していない。 |
| 中     | ロケール定義の重複整理         | `angular.json`、`core/locales/locales.utility.ts`、Day.jsなどに言語・別名・ファイルの対応がある。共通カタログから生成・検証する方式を検討する。                                                                                         | 既存locale-startup E2E、翻訳失敗時のfallback、対応言語のasset検査。方式変更による効果は未検証。                                                        |
| 中     | 起動時ロードの見直し           | app.config.tsはPreloadAllModules。初期通信量と画面遷移を計測し、選択的な先読みを検討する。                                                                                                                                              | 変更前後の転送量・要求数・初回表示・初回遷移を同条件で比較する。高速化は未検証。                                                                       |

ファイルツリーに関係するIssue:

- [#580: 選択範囲外のフィルターハイライト](https://github.com/duplicati/ngclient/issues/580)
- [#449: 異なるOS間で復元するとファイルとフォルダーの区別が失われる](https://github.com/duplicati/ngclient/issues/449)

いずれも報告内容を読み、関連実装を確認した段階。現在のmainでの不具合再現と原因の特定は未検証。

## Duplicati本体側のIssueからの候補

| Issue                                                                                     | 調査結果と扱い                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [#6865: UNC/SMBからの直接復元](https://github.com/duplicati/duplicati/issues/6865)        | コメントではFile system経由でUNCを入力する既存手順が案内されている。既知のUNCパスを迷わず入力できる導線の改善候補。新しいバックエンド対応が必須とは判断しない。接続失敗は未再現。 |
| [#6611: 設定の由来・暗号化状態の表示](https://github.com/duplicati/duplicati/issues/6611) | 診断画面を分かりやすくする機能候補。設定の由来や実際の暗号化状態を表示するには、サーバーAPIが提供する情報の確認が必要。推測で状態を表示しない。                                   |
| [#6190: 宛先の重複警告](https://github.com/duplicati/duplicati/issues/6190)               | メンテナのコメントにngclient #188で簡易版を実装したとの記載がある。既存警告の対象範囲を確認してから追加案を判断する。                                                             |

## 実装済み・既存作業との重複に注意

- open Issueだけで未実装と判断しない。復元検索、世代削除、purge files、broken filesには既存の関連コード・経路がある。Issueの要求全体を満たすかは別途差分を確認する。
- 再接続処理には、すでに4401でのtoken refresh、接続世代の判定、再接続タイマー・stop時の解除がある（`core/services/server-status-websocket.service.ts`）。[#283](https://github.com/duplicati/ngclient/issues/283)がopenでも、全面的に未対応とは扱わない。
- 古い `backup/schedule/` と `schedule-v2/` は、参照を確認する前に削除しない。現在のbackup.routes.tsはschedule-v2を参照する。

調査時のopen PR:

| PR                                                     | 内容                               |
| ------------------------------------------------------ | ---------------------------------- |
| [#589](https://github.com/duplicati/ngclient/pull/589) | 宛先接続テストの共有・二重実行対策 |
| [#590](https://github.com/duplicati/ngclient/pull/590) | JSONでないジョブログ行の保持       |
| [#613](https://github.com/duplicati/ngclient/pull/613) | 使用統計設定の保存失敗・処理中表示 |
| [#614](https://github.com/duplicati/ngclient/pull/614) | サーバー機能判定のテスト           |
| [#615](https://github.com/duplicati/ngclient/pull/615) | 詳細オプション編集のテスト         |
| [#616](https://github.com/duplicati/ngclient/pull/616) | 画面幅・テーマ切替のテスト         |

未PRの準備済みブランチも、候補選定前に存在・SHA・変更範囲を確認する:

- `codex/test-backup-progress-visibility`
- `codex/test-size-form-integration`

## 移行を支える実サーバーE2E

**検証済み（静的確認）**: `e2e/fixtures/authenticated.ts` はAPIとWebSocketのモックを使う。現在のE2Eにはログイン、認証の復元、一覧更新、locale起動、使用統計設定がある。production-build.ymlは本番成果物をChromiumでテストする。

**提案**: 別の検証経路として、実サーバーに対する次の一連の操作を1本用意する。

1. 隔離したローカルの入力・宛先・復元先を用意する。
2. UIからバックアップを作成し、実行する。
3. UIからファイルを復元する。
4. 復元したファイルの内容を元と比較する。
5. テスト専用ジョブ・サーバー・データを片付ける。

関連: [ngclient #273](https://github.com/duplicati/ngclient/issues/273)。サーバーの版・実行環境を固定し、通常のモックE2Eと分ける。大きなフォーム移行の検証基盤として利用する。単体テストが多いことだけを、一連の操作が動く根拠にしない。

## 推奨する実施順

1. フォームモデル・DTO変換をコンポーネントから分離する。
2. 宛先編集で未変更の設定を保持する構造にする。
3. General画面をSignal Formsへ移行する。
4. ファイルツリーの取得処理を分離する。
5. キーボード操作・フォーカス表示を改善する。

実サーバーE2Eとビルド経路の整理は、独立して進められる候補。フォーム移行など先行変更に依存するPRは、先行PRのマージ後に提出する。

次回は、候補ごとに最新のmain・既存ブランチ・open/merged PRを確認し、再現または変更前の契約をテストで固定してから実装する。今回の調査により、上記候補が一括で実装承認されたとは扱わない。
