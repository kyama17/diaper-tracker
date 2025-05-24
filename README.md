# 赤ちゃんのおしっことうんち記録 (Baby Diaper Tracker)

赤ちゃんのおしっことうんちの記録を簡単に管理できるWebアプリケーションです。

## 機能 (Features)

- 📝 おしっことうんちの記録
- ⏰ 日時の記録
- 📱 レスポンシブデザイン（スマートフォン対応）
- 💾 ローカルストレージによるデータ保存
- 🗑️ 記録の削除機能
- ✅ 自動テスト機能

## 使い方 (How to Use)

1. ブラウザで `index.html` を開きます
2. 種類（おしっこ/うんち）を選択します
3. 時間を設定します（デフォルトで現在時刻が設定されます）
4. 「記録する」ボタンをクリックします
5. 記録一覧で過去の記録を確認できます
6. 不要な記録は「削除」ボタンで削除できます

## ファイル構成 (File Structure)

```
diaper-tracker/
├── index.html      # メインのHTMLファイル
├── script.js       # JavaScript機能
├── style.css       # スタイルシート
├── test.js         # テストファイル
└── README.md       # このファイル
```

## 技術仕様 (Technical Specifications)

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **データ保存**: ブラウザのローカルストレージ
- **対応ブラウザ**: モダンブラウザ（Chrome, Firefox, Safari, Edge）
- **レスポンシブ**: モバイルデバイス対応

## セットアップ (Setup)

このアプリケーションはサーバーを必要としません。以下の手順で実行できます：

1. リポジトリをクローンまたはダウンロード
```bash
git clone https://github.com/kyama17/diaper-tracker.git
cd diaper-tracker
```

2. ブラウザで `index.html` を開く
```bash
# ローカルサーバーを起動する場合（推奨）
python -m http.server 8000
# または
npx serve .
```

3. ブラウザで `http://localhost:8000` にアクセス

## テスト (Testing)

アプリケーションには自動テストが含まれています：

1. ブラウザで `index.html` を開く
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

プルリクエストや課題報告を歓迎します。以下の手順で貢献できます：

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 今後の改善予定 (Future Improvements)

- [ ] データのエクスポート機能
- [ ] 統計表示機能
- [ ] 複数の赤ちゃんの管理
- [ ] PWA（Progressive Web App）対応
- [ ] ダークモード対応

## 作者 (Author)

kyama17

---

*このアプリケーションは赤ちゃんの健康管理をサポートするために作成されました。*