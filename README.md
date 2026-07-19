# Bodywork Summary Library

GitHub内のMarkdownから、Workshop SummaryとAdvice Summaryを生成するAstro製の静的サイトです。データベース、API、ログイン、管理画面は使用しません。

## ローカル起動

Node.js 20以上を用意し、リポジトリ直下で実行します。

```bash
npm install
npm run dev
```

表示されたローカルURLをブラウザで開きます。

本番用ビルドの確認：

```bash
npm run build
npm run preview
```

## コンテンツの追加

- Workshop: `content/workshops/`
- Advice: `content/advice/`
- Workshopテンプレート: `templates/workshop-template.md`
- Adviceテンプレート: `templates/advice-template.md`

必須フロントマター：

```yaml
---
type: workshop
title: タイトル
date: 2026-07-19
slug: 2026-07-19-page-url
summary: 一文要約
tags: []
status: published
---
```

`type` は `workshop` または `advice`、`status` は `draft` または `published` です。`status: draft` のファイルは公開ページに生成されません。

## スマートフォンから追加する

1. スマートフォンのブラウザでGitHubリポジトリを開く
2. `content/workshops/` または `content/advice/` を開く
3. **Add file** → **Create new file** を選ぶ
4. テンプレートをコピーして、日付・slug・本文を書き換える
5. 公開する場合は `status: published` にする
6. **Commit changes** で `main` ブランチへコミットする
7. Actionsの完了後、GitHub Pagesへ反映される

Adviceをフォルダ分けする場合は、ファイル名欄に `content/advice/client-002/2026-07-20.md` のように入力すると、フォルダとファイルを同時に作成できます。公開URLにはフロントマターの `slug` が使われ、保存先のフォルダ名は含まれません。

## GitHub Pages公開設定

1. このフォルダをGitHubリポジトリのルートとしてpushする
2. GitHubの **Settings** → **Pages** を開く
3. **Build and deployment** のSourceを **GitHub Actions** にする
4. `main` ブランチへpushする
5. **Actions** タブで `Deploy to GitHub Pages` の完了を確認する

`astro.config.mjs` はGitHub Actionsのリポジトリ名を読み取り、ユーザーサイトとプロジェクトサイトのどちらでも公開パスを自動設定します。

## 個人情報のルール

公開リポジトリには、次の情報を保存しないでください。

- クライアントの本名、連絡先、住所
- 顔写真、音声、未加工の文字起こし
- 医療情報や相談内容の原文
- 勤務先や詳細な経歴など、本人を特定できる情報

Adviceは匿名フォルダで整理し、公開タイトルと本文にも個人を特定できる情報を含めないでください。`status: draft` はサイトへの表示を止めるだけで、GitHub上のファイルを非公開にする機能ではありません。

## ディレクトリ構成

```text
bodywork-summaries/
├── .github/workflows/deploy.yml
├── content/
│   ├── workshops/
│   └── advice/
├── public/
├── src/
│   ├── components/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   └── styles/
├── templates/
├── astro.config.mjs
├── package.json
└── README.md
```
