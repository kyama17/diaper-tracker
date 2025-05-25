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

## Cloudflare Pagesでのデプロイ方法

このプロジェクトは静的サイトとしてCloudflare Pagesに簡単にデプロイできます。

### 1. Cloudflare Pagesにプロジェクトを接続

1.  Cloudflareダッシュボードにログインします。
2.  「Workers & Pages」セクションで、「アプリケーションを作成」を選択し、「Pages」タブを選びます。
3.  「Gitに接続」を選択し、このリポジトリを選びます。
4.  「セットアップを開始」をクリックします。

### 2. ビルド設定

プロジェクトのセットアップ画面で、以下のビルド設定を行います。

*   **プロジェクト名:** 任意の名前に設定します（例: `diaper-tracker`）。
*   **実稼働ブランチ:** デプロイしたいブランチを選択します（例: `main` や `master`）。

*   **ビルドコマンド:**
    *   このプロジェクトはビルドステップを必要としない純粋な静的ファイル（HTML, CSS, JavaScript）で構成されているため、ビルドコマンドは**空欄にする**か、`exit 0` と入力します。
    *   もし将来的にNode.jsなどを使ったビルドプロセス（例: TypeScriptのコンパイル、CSSプリプロセッサの使用など）を導入する場合は、適切なビルドコマンド（例: `npm run build`）を設定する必要があります。

*   **ビルド出力ディレクトリ:**
    *   プロジェクトのフロントエンドファイルは `public` ディレクトリに格納されています。そのため、ビルド出力ディレクトリには `public` と指定します。
    *   Cloudflare Pagesはこのディレクトリ内のファイルをホスティングします。

*   **ルートディレクトリ:**
    *   プロジェクトのルートに `public` ディレクトリや `package.json` などが存在するため、ルートディレクトリはデフォルトのまま（リポジトリのルート `/`）で問題ありません。
    *   もしプロジェクトの構造が異なり、例えば `frontend` のようなサブディレクトリ内に `public` フォルダがある場合は、そのサブディレクトリ（例: `frontend`）をルートディレクトリとして指定します。

*   **環境変数 (オプション):**
    *   このプロジェクトでは現時点ではビルド時に必須となる環境変数はありません。
    *   将来的にAPIキーなどが必要になった場合は、「環境変数」セクションで設定できます。Cloudflare Pagesは以下のシステム環境変数を自動的に提供します。
        *   `CF_PAGES`: `1` (Pages環境であることを示す)
        *   `CF_PAGES_COMMIT_SHA`: GitのコミットSHA
        *   `CF_PAGES_BRANCH`: デプロイされるブランチ名
        *   `CF_PAGES_URL`: デプロイ先のURL

### 3. 保存してデプロイ

設定が完了したら、「保存してデプロイする」をクリックします。
Cloudflare Pagesが自動的にビルド（この場合はファイルのコピー）とデプロイを実行します。完了すると、`*.pages.dev` のサブドメインでサイトが公開されます。

### 注意点

*   このプロジェクトは主にフロントエンドの静的ファイル (`public` ディレクトリ内) のホスティングを想定しています。
*   `backend` ディレクトリ内のNode.jsサーバーは、Cloudflare Pagesの静的ホスティング環境では直接動作しません。バックエンド機能が必要な場合は、Cloudflare Workersなどのサーバーレス関数や、別途サーバー環境を用意することを検討してください。

## 作者 (Author)

kyama17

---

*このアプリケーションは赤ちゃんの健康管理をサポートし、育児をより楽にするために作成されました。ご質問やご提案がございましたら、お気軽にお声かけください！*