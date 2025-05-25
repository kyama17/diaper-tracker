# 赤ちゃんのおしっことうんち記録 (Baby Diaper Tracker)

赤ちゃんのおしっことうんちの記録を簡単に管理できるWebアプリケーションです。

## 機能 (Features)

- 📝 おしっことうんちの記録
- ⏰ 日時の記録
- 📊 **統計グラフ表示**
  - 🥧 おしっこ・うんちの比率円グラフ
  - 📈 日別記録数グラフ（過去7日間）
  - ⏰ 時間帯別分析グラフ
- 📱 レスポンシブデザイン（スマートフォン対応）
- 💾 ローカルストレージによるデータ保存
- 🗑️ 記録の削除機能
- ✅ 自動テスト機能

## 使い方 (How to Use)

1. ブラウザで [`public/index.html`](public/index.html) を開きます
2. 種類（おしっこ/うんち）を選択します
3. 時間を設定します（デフォルトで現在時刻が設定されます）
4. 「記録する」ボタンをクリックします
5. 記録一覧で過去の記録を確認できます
6. 不要な記録は「削除」ボタンで削除できます

## ファイル構成 (File Structure)

```
diaper-tracker/
├── public/
│   ├── index.html      # メインのHTMLファイル
│   ├── script.js       # JavaScript機能
│   ├── style.css       # スタイルシート
│   └── test.js         # テストファイル
├── backend/
│   ├── server.js       # Node.jsサーバー
│   ├── db.js           # データベース設定
│   ├── package.json    # Node.js依存関係
│   └── package-lock.json
└── README.md           # このファイル
```

## 技術仕様 (Technical Specifications)

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
  - メインファイル: [`public/index.html`](public/index.html), [`public/script.js`](public/script.js), [`public/style.css`](public/style.css)
- **バックエンド**: Node.js (オプション)
  - サーバーファイル: [`backend/server.js`](backend/server.js)
  - 依存関係: [`backend/package.json`](backend/package.json)
- **グラフライブラリ**: Chart.js 4.x
- **データ保存**: ブラウザのローカルストレージ
- **対応ブラウザ**: モダンブラウザ（Chrome, Firefox, Safari, Edge）
- **レスポンシブ**: モバイルデバイス対応

## セットアップ (Setup)

このアプリケーションはサーバーを必要としません。以下の簡単な手順ですぐに使い始められます：

1. リポジトリをクローンまたはダウンロード
```bash
git clone https://github.com/kyama17/diaper-tracker.git
cd diaper-tracker
```

2. 必要なパッケージをインストール
```bash
npm install
```

3. アプリケーションを起動
```bash
# バックエンドとフロントエンドの両方を同時に起動
npm start

# または、個別に起動
# バックエンドを起動
npm run start:backend
# フロントエンドを起動
npm run start:frontend
```

4. ブラウザで `http://localhost:5000` にアクセス

## テスト (Testing)

アプリケーションには自動テストが含まれています（[`public/test.js`](public/test.js)）：

1. ブラウザで [`public/index.html`](public/index.html) を開く
2. 開発者ツールのコンソールを開く
3. `runAllTests()` を実行

テストは以下の機能をカバーしています：
- ログの追加と取得
- ログの削除
- ローカルストレージの永続化

## データ形式 (Data Format)

記録されるデータの形式：

```javascript
{
  id: 1234567890123,        // タイムスタンプベースのユニークID
  type: "pee" | "poop",     // 種類（おしっこ/うんち）
  time: "2024-05-24T10:30"  // 日時（ISO形式）
}
```

## ブラウザサポート (Browser Support)

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## ライセンス (License)

このプロジェクトはMITライセンスの下で公開されています。

## 貢献 (Contributing)

プルリクエストや課題報告を歓迎します！以下の手順で貢献していただけます：

1. このリポジトリをフォーク
2. 機能ブランチを作成
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. 変更をコミット
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. ブランチにプッシュ
   ```bash
   git push origin feature/amazing-feature
   ```
5. プルリクエストを作成

## 今後の改善予定 (Future Improvements)

- [ ] データのエクスポート機能
- [x] ~~統計表示機能~~ ✅ 実装済み
- [ ] 複数の赤ちゃんの管理
- [ ] PWA（Progressive Web App）対応
- [ ] ダークモード対応
- [ ] 週別・月別の統計表示
- [ ] 平均間隔の計算機能

## Cloudflare Workers デプロイ設定 (Cloudflare Workers Deployment)

このアプリケーションはCloudflare Workersにもデプロイできます。以下はそのための設定ガイドです。

### 1. コード変更 (Code Changes)

-   **`backend/server.js`**:
    -   Express アプリケーション (`app`) をエクスポートするように変更し、`app.listen()` の呼び出しを削除（または条件付きに）します。Cloudflare Workers は独自の方法で HTTP リクエストを処理します。
    ```javascript
    // backend/server.js の変更例
    const express = require('express');
    const app = express();
    // ... (既存のミドルウェアとルート設定)
    module.exports = app; // app をエクスポート
    ```
-   **`src/index.js` (新規作成):**
    -   このファイルをプロジェクトのルート直下に `src` フォルダを作成して配置します (例: `<project_root>/src/index.js`)。これが Worker のエントリーポイントになります。
    -   このスクリプトは `backend/server.js` から `app` をインポートし、Cloudflare の `fetch` イベントを Express アプリが処理できるようにするためのアダプターロジックを含みます。
    ```javascript
    // src/index.js の基本構造
    import app from '../backend/server.js'; // backend/server.js へのパスを調整

    // Express アプリを Cloudflare Workers の fetch ハンドラに接続するアダプターが必要です。
    // (例: 'hono' や他のアダプターライブラリを使用するか、カスタムで実装)
    // このアダプターは Cloudflare Request を Express が理解できる形式に変換し、
    // Express のレスポンスを Cloudflare Response に変換します。

    export default {
      async fetch(request, env, ctx) {
        // ここにアダプターロジックを実装します。
        // return await someAdapter(app)(request, env, ctx);
        return new Response('Adapter logic for Express on Cloudflare Workers needed here.', { status: 501 });
      }
    };
    ```
    -   **注意**: 適切なアダプターの実装は主要な開発作業となります。

### 2. Wrangler 設定 (`wrangler.toml`)

プロジェクトルートに `wrangler.toml` ファイルを作成し、以下のように設定します。

```toml
# wrangler.toml
name = "your-diaper-tracker-worker" # Cloudflare でのワーカー名
main = "src/index.js"               # Worker のエントリーポイント

compatibility_date = "2024-09-23"   # Node.js 互換機能などを有効化
compatibility_flags = [ "nodejs_compat" ]

# 静的アセット (public フォルダ) の配信設定
[site]
bucket = "./public"

# ビルド設定
[build]
command = "npm install" # 依存関係をインストール

# 環境変数 (非シークレット)
[vars]
AUTH0_CLIENT_ID = "your_production_auth0_client_id"
AUTH0_ISSUER_BASE_URL = "https://your-auth0-domain.auth0.com"
# 他の必要な非シークレット変数をここに追加
```

### 3. 環境変数とシークレット (Environment Variables & Secrets)

-   **非シークレット**: `wrangler.toml` の `[vars]` セクションに設定します。
-   **シークレット** (`MONGODB_URI`, `AUTH0_SECRET`, `AUTH0_CLIENT_SECRET` など):
    -   `wrangler.toml` には記載せず、以下のコマンドで Cloudflare に安全に保存します。
        ```bash
        npx wrangler secret put MONGODB_URI
        npx wrangler secret put AUTH0_SECRET
        # 他のシークレットも同様に設定
        ```
    -   `npx wrangler secret put VAR_NAME --local` でローカル開発用のシークレットも設定できます。

### 4. ビルドコマンド (Build Command)

-   `wrangler.toml` の `[build]` セクションに `command = "npm install"` と指定します。
-   これにより、デプロイ時に `npm install` が実行され、必要なパッケージがインストールされます。

### 5. デプロイコマンド (Deployment Command)

1.  **Wrangler にログイン:**
    ```bash
    npx wrangler login
    ```
2.  **シークレットを設定** (上記参照)。
3.  **デプロイ実行:**
    ```bash
    npx wrangler deploy
    ```
    環境に応じて `npx wrangler deploy -e <environment_name>` も使用可能です。

### 6. ルートディレクトリ (Root Directory for Cloudflare UI)

Cloudflare ダッシュボードで設定する場合、「ルートディレクトリ」は通常、`wrangler.toml` が存在するプロジェクトのルートディレクトリを指します。

## 作者 (Author)

kyama17

---

*このアプリケーションは赤ちゃんの健康管理をサポートし、育児をより楽にするために作成されました。ご質問やご提案がございましたら、お気軽にお声かけください！*