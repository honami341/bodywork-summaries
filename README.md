# Bodywork Summary Receiver

公開用に匿名化済みのJSONを `summary-inbox/` へ追加すると、GitHub Actionsがスマホ向けアコーディオンHTMLを生成し、GitHub Pagesへ公開します。

## 使い方

1. 文字起こしから、クライアントへ渡す内容だけを抽出する。
2. `examples/summary.example.json` と同じ形式のJSONを作る。
3. `summary-inbox/<shareId>.json` として `main` に追加する。
4. Actionsの `Publish summary from inbox` が完了するまで待つ。
5. `https://honami341.github.io/bodywork-summaries/s/<shareId>/` を共有する。

## 完了判定

公開用アドバイスサマリーは、ローカルでJSONやHTMLを作っただけでは完了としない。ユーザが公開を求めている場合は、次をすべて確認してから完了とする。

1. 公開JSONにクライアント番号、通称、実名、Speaker表示が含まれない。
2. `scripts/render-summary.mjs` でローカル生成が成功する。
3. 対象JSONだけをcommitして `main` へpushする。
4. `Publish summary from inbox` の成功を確認する。
5. 共有URLがHTTP 200で開き、対象タイトルと本文が表示される。

上記が未確認の間は、「ローカル作成済み・未公開」と報告し、タスクを閉じない。

## 岩月の通常依頼の扱い

岩月が、クライアント番号と文字起こしを渡して「アドバイスサマリーにして」と依頼した場合、匿名化済みJSONの作成、ローカル検証、commit、`main` へのpush、Actions成功、公開URL確認までを一つの依頼範囲とする。

- push前に「公開してよいか」と再確認するワンクッションは置かない。
- 「ドラフトだけ」「公開前に確認したい」「今回は公開しない」と明示された場合だけpushを止める。
- クライアント番号、通称、実名、Speaker表示は引き続き公開データに含めない。

## 公開してはいけないもの

- 文字起こし原文
- 実名、電話番号、メール、住所
- 病歴、診断名、第三者の個人情報
- 施術者だけが読む内部メモ

このリポジトリは公開されています。`noindex` は検索除外の希望を示すだけで、アクセス制限ではありません。

## ローカル確認

```powershell
node scripts/render-summary.mjs --input examples/summary.example.json --output public/s/example-summary-2026/
```

