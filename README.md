# Bodywork Summary Receiver

公開用に匿名化済みのJSONを `summary-inbox/` へ追加すると、GitHub Actionsがスマホ向けアコーディオンHTMLを生成し、GitHub Pagesへ公開します。

## 使い方

1. 文字起こしから、クライアントへ渡す内容だけを抽出する。
2. `examples/summary.example.json` と同じ形式のJSONを作る。
3. `summary-inbox/<shareId>.json` として `main` に追加する。
4. Actionsの `Publish summary from inbox` が完了するまで待つ。
5. `https://honami341.github.io/bodywork-summaries/s/<shareId>/` を共有する。

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

