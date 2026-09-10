# MEMORY MATCH - PWA Version

スマホで遊べる神経衰弱ゲームです。

## プレイモード

- 1人プレイ
- CPU対戦
- 2人プレイ
- 3人プレイ
- 4人プレイ

2〜4人プレイは、1台のスマホを順番に使うローカル対戦です。

## 難易度

- EASY：16枚 / 8ペア
- NORMAL：24枚 / 12ペア
- HARD：32枚 / 16ペア

## PWA対応

- Web App Manifest
- 192×192 / 512×512 アプリアイコン
- Apple Touch Icon
- Service Worker
- オフライン用キャッシュ
- standalone表示
- Netlify設定ファイル

## VS Codeで確認する

1. フォルダをVS Codeで開く
2. `index.html` を右クリック
3. `Open with Live Server`
4. ブラウザで動作確認

## GitHubへ投稿

GitHubで新しいRepositoryを作り、このフォルダ内のファイルをすべてアップロードしてください。

主なファイル:

```text
index.html
style.css
script.js
manifest.json
service-worker.js
netlify.toml
.gitignore
README.md
icons/
```

## Netlifyへ公開

1. Netlifyにログイン
2. Add new project
3. Import an existing project
4. GitHubを選択
5. このRepositoryを選択
6. Publish directory は `.` のままでOK
7. Deploy / Publish

このプロジェクトには `netlify.toml` が入っているため、静的サイトとしてそのまま公開できます。

## スマホにアプリとして追加

### iPhone
1. Netlifyの公開URLをSafariで開く
2. 共有ボタンを押す
3. 「ホーム画面に追加」
4. 追加

### Android
1. Netlifyの公開URLをChromeで開く
2. メニューを開く
3. 「アプリをインストール」または「ホーム画面に追加」
4. 追加
