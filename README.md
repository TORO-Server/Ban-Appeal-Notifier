# Ban Appeal Notifier

Google フォームで送られた異議申立て (Ban Appeal) の回答を、Google Apps Script (GAS) を使って Discord へ、すぐに知らせるツールです。

---

## 主な機能

- **Discord への自動通知**: フォームが送信されると、決めた Discord のチャンネルへ、整った形式 (Embed) の投稿で知らせます。
- **送れなかったときの再送**: 送信に失敗した通知は一時的に保存し、1 分後から再び送ります。
- **TypeScript で開発**: 型の検査と、`clasp` による Google Apps Script への反映に対応しています。
- **`.env` で設定**: 表示する文字や色を `.env` で決められます。

ソースコードは `src/`、設定の元になる値は `.env.example` にあります。

---

## 使い始めるまで

### 1. 必要なものを入れる

```bash
npm install
```

### 2. `.env` を作る

`.env.example` をコピーして `.env` を作り、値を入れます。

```bash
cp .env.example .env
```

設定できる項目と既定値は [.env.example](.env.example) に書いてあります。

### 3. clasp の設定ファイルを作る

`.clasp.json.example` をコピーして `.clasp.json` を作り、`scriptId` に自分の Apps Script の ID を入れます。このファイルは Git に入れません。

### 4. Webhook の URL を設定する

Discord の Webhook の URL は秘密なので、`.env` にもコードにも書きません (スクリプトのコードは、フォームの編集者全員が読めます)。
Apps Script エディタの **プロジェクトの設定** > **スクリプト プロパティ** に、`DISCORD_WEBHOOK_URL` という名前で設定します。

---

## 変換と反映

```bash
npm run build   # TypeScript を変換する
npx clasp login # 初回だけ
npm run push    # Google Apps Script へ送る
```

---

## Google フォーム側の設定

1. 対象の Google フォームに結び付いた Apps Script エディタを開きます。
2. 左のメニューの **トリガー** (時計のアイコン) > **トリガーを追加** を選びます。
3. 次のとおり設定して保存します。
   - **実行する関数**: `getForms`
   - **実行するデプロイ**: `Head`
   - **イベントの源泉**: `フォームから`
   - **イベントの種類**: `フォーム送信時`
