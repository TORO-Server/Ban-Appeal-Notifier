# Ban Appeal Notifier

Google フォームで送信された異議申立て（Ban Appeal）の回答結果を、Google Apps Script (GAS) を介して Discord Webhook へ即座に通知する自動化ツールです。

---

## 主な機能

- **Discord 自動通知**: フォーム送信時に指定した Discord チャンネルへ Embed 形式で即時通知。
- **TypeScript 対応**: 型安全な開発と `clasp` を用いた自動デプロイに対応。
- **環境変数管理**: `.env` による設定管理に対応。

---

## ディレクトリ構造

```text
Ban-Appeal-Notifier/
├── .env.example              # 環境変数テンプレート
├── .clasp.json               # clasp 設定ファイル
├── package.json              # 依存関係定義
├── tsconfig.json             # TypeScript 設定
├── ARCHITECTURE.md           # アーキテクチャ仕様書
└── src/
    ├── appsscript.json       # GAS マニフェスト
    ├── types.ts              # 型定義
    ├── config.ts             # 設定読み込み処理
    ├── builder.ts            # Discord Embed 構築処理
    ├── notifier.ts           # Discord 送信処理
    └── code.ts               # GAS エントリーポイント (getForms)
```

---

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` を作成し、必要な設定値を入力します。

```bash
cp .env.example .env
```

`.env` の設定項目:
- `DISCORD_WEBHOOK_URL`: Discord Webhook URL
- `NONE_TEXT`: 未回答項目の代替テキスト (例: "なし")
- `EMBED_COLOR`: Embed のカラーコード (10進数)

---

## ビルドおよびデプロイ

### 1. ビルド

```bash
npm run build
```

### 2. GAS へのデプロイ

```bash
# 必要に応じて clasp へログイン
npx clasp login

# コードのプッシュ
npm run push
```

---

## Google フォーム（GAS）側の設定

1. 対象の Google フォームに紐付く Apps Script エディタを開きます。
2. 左メニューの **トリガー (時計アイコン)** > **[トリガーを追加]** を選択します。
3. 以下の通り設定し保存します:
   - **実行する関数**: `getForms`
   - **実行するデプロイ**: `Head`
   - **イベントの源泉**: `フォームから`
   - **イベントの種類**: `フォーム送信時`

---

## 詳細設計

コンポーネント構成やクラス図などの詳細設計については [ARCHITECTURE.md](file:///d:/Dev/Ban-Appeal-Notifier/ARCHITECTURE.md) を参照してください。
