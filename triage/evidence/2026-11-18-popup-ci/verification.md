# NGT-103 — Chromiumの別タブ初期化競合と修正 (2026-11-18)

## 状態

PR [#757](https://github.com/duplicati/ngclient/pull/757)、`codex/update-playwright-popup-fix`。head `54ceafee09122bddaf6c83490cf344a8204ac88a`、親 `b856d9ce4dd9881291bb440650a9a2fc76685498`（着手時の最新main）。origin push済み。NGT-103はPR_OPENとし、マージ前にDONEにしない。

両PRの製品コードを変更する必要はなく、共通のテスト依存更新を1件にまとめた。`package.json`と`bun.lock`だけを変更。Playwright関連3パッケージのバージョン更新は1.63.0→1.65.1。Bunのlock再生成では同じバージョンのBabel peer aliasも整理される（lock-delta.json）。#751・#752・#756のheadは変更していない。

## CI原本（検証済み）

| PR | run / browser job | 失敗 |
| --- | --- | --- |
| #751 | [44078898340 / 134026456885](https://github.com/duplicati/ngclient/actions/runs/44078898340/job/134026456885) | AboutのServer settingsをControlOrMetaで別タブに開く操作 |
| #752 | [44079022230 / 134046660763](https://github.com/duplicati/ngclient/actions/runs/44079022230/job/134046660763) | Delete画面のExport configurationをControlOrMetaで別タブに開く操作 |
| #756 | [44127475182 / 134195397170](https://github.com/duplicati/ngclient/actions/runs/44127475182/job/134195397170) | Commandline Backの別タブ操作とExportの中クリック |

いずれも `browserContext.waitForEvent: Test timeout of 30000ms exceeded`。#751/#752はproduction-build・型チェック成功、ブラウザー操作で失敗。#756のUnit Testsは成功している。

#751/#752のartifactを`gh run download <run> --repo duplicati/ngclient --name playwright-diagnostics`で取得しtraceを展開。

- #751: click終了4137.016、Route.fulfill終了4148.437。遷移先 `/about/server-settings` はHTTP200（17.403ms）。
- #752: click終了44965.548、Route.fulfill終了44970.199。遷移先 `/backup/42/export` はHTTP200（8.952ms）。
- 時刻はtrace内monotonic ms。両traceのpageイベントは最初のopenerの1件のみで、新規ページイベントがない。入力前にwaitForEventを登録済みで、クリック不発やHTTPエラーではない。
- CI原本にはCDP Target/Frameの詳細はない。下記の単純リンク再現でその情報を補った。

## ブラウザー単体の比較（検証済み）

Angular/ngclientを含めず、HTTPの普通の`<a>`に修飾キー・中クリックを送る`probe.mjs`で再現。Node 26.13.1、Linux/Ubuntu Noble、Docker Desktop、CPU上限2・メモリー2GiB、4コンテキスト並行、各400回。負荷を使った不具合診断であり、性能測定ではない。正常なページ通知とタイトルを待ち、再クリックやretryは行わない。

| SDK / 同梱ブラウザー | 5秒時点のpage通知欠落 | 追加の遷移/load待ち失敗 | 結果 |
| --- | --- | --- | --- |
| Playwright 1.63.0 / Chromium headless shell 153.0.8010.12 | 20/400 | 10/400 | 最初の通知欠落は30秒超も未通知 |
| Playwright 1.65.1 / Chromium headless shell 159.0.8154.6 | 0/400 | 0/400 | 400/400成功 |

20件全てが30秒を超えたとは主張しない（診断の通常閾値は5秒）。30秒保持した例はprobe-shell.jsonに保存。CDP Target.getTargetsでは正しいURLとタイトルの新規タブが存在しattached=trueなのに、context.pagesは1件、pageイベント0件だった。製品コードなしでCIと同じ通知欠落を再現した。

コンテナー内の旧SDKは`/work/node_modules`、新SDKは`/probe165/node_modules`へ隔離して同じスクリプトを実行。例: `node /work/probe.mjs shell 400 4` と `node /probe165/probe.mjs shell 400 4`。出力先`/out`を用意する。summaryはprobe-shell.json / probe-165-shell.json。全ログと全30失敗の詳細はGit管理外のtmpに保存。

## 上流根拠（ドキュメント根拠＋取得検証）

- [Playwright #42142](https://github.com/microsoft/playwright/issues/42142): 修飾キー/中クリックの背景タブが開かない・初期化されない既知事象。
- [Chromiumの修正CL 8613032](https://chromium-review.googlesource.com/c/chromium/src/+/8613032)、commit `d9c9952f007025c5292ba603cf51e790431de872`: 余分なabout:blank遷移と一時RenderFrameHostを作らない修正。
- [旧153のソース](https://chromium.googlesource.com/chromium/src/+/153.0.8010.12/headless/lib/browser/headless_web_contents_impl.cc)には`create_params.initial_url = std::nullopt`がなく、[新159のソース](https://chromium.googlesource.com/chromium/src/+/159.0.8154.6/headless/lib/browser/headless_web_contents_impl.cc)にはあることを実際に取得して確認。
- [Playwright 1.65.1リリース](https://github.com/microsoft/playwright/releases/tag/v1.65.1)とインストールログはChromium 159.0.8154.6を示す。古いコメントの「1.66になる見込み」だけで収録版を判断しない。

初期に通常版Chromiumへの切替も試したが、1.63では別タブの初回要求がcontext.routeのモックを通らず既存契約と合わなかったため不採用。設定・CI・READMEの変更を全て取り消し、単純な安定版依存更新へ絞った。単一の設定ファイルを維持し、既存テストを弱めていない。

## 実際のE2E・ビルド（検証済み）

- Linuxの全E2E: **193 passed**。Node26.13.1/Bun1.4.4/sirv3.0.1、リポジトリのplaywright.config.tsと`bun run preview`をそのまま使用。workers=1/retries=0。APIは既存fixtureによるモック。
- #751/#752の元のCI production-browser artifactを取得し、それぞれ修飾キー・中クリックを`--repeat-each=5`で実行: **各20 passed**。アプリ本体は失敗時の成果物のまま、SDKだけを更新した。
- Windowsでも同じ2specの別タブ操作を反復: **20 passed**。
- 2spec・認証fixture・設定を各PRのheadとバイト比較し**8比較すべて同一**（source-equivalence.json）。テスト本体や閾値・retry設定を変えない比較。
- `tsc --noEmit -p e2e/tsconfig.json`: 終了コード0。
- `bun run test:build`: **6 pass / 0 fail**。
- `bun run test:ci --exclude=**/backups.enable-disable.spec.ts --exclude=**/backups.refresh.spec.ts`: **2465 passed / 192 files**。
- `bun run build:prod`: 終了コード0、Application bundle generation complete。
- `prettier --check package.json`: 終了コード0。
- `bun install --frozen-lockfile`: 終了コード0、lockのSHA-256が前後一致。

全単体テストのコンパイルはbase mainのfixture不足（#756で別途修正）で止まるため、除外付き結果をフルスイート成功とは呼ばない。テスト設定に除外を追加していない。既存のCSS解析・NO_COLOR/FORCE_COLOR警告は残る。

原本: `tmp/popup-ci-20261118/`。linux-full-browser.log、artifact751-browser.log、artifact752-browser.log、windows-navigation-browser.log、unit.log、build.log、各trace・CI成果物・再現環境スクリプト。

## CI再実行権限と次の作業

`gh run rerun 44078898340 --failed --repo duplicati/ngclient` は `Must have admin rights to Repository` で拒否された。最初の要求で停止し、#752/#756の再実行要求は送っていない。コードやコミットを変えてのCI再起動も今回行っていない。

#756のfixture修正と#757のブラウザー修正をmainへ取り込んだ後、既存PRを最新mainへrebase/pushしCIを確認する。マージ後の既存PRのCI成功は未検証。#757のリモートCI完了もローカル成功とは別に確認する。

## 片付け

検証に使った専用コンテナーと専用イメージを削除済み。最初のbind mount試行は未起動のcreated状態で残っていたため、コマンド・マウント元・イメージを確認して自分のものだけ削除した。既存のDockerイメージ・他作業のコンテナーには触れていない。ログ・trace・成果物はGit管理外のtmpに保持する。

