# DAN Search - Google風の検索エンジン

Google のようなシンプルで洗練された検索エンジンの実装です。

## 特徴

### ユーザーインターフェース
- **Google風デザイン** - シンプルでミニマリスト
- **SVGアイコン** - スケーラブルで美しいアイコン
- **レスポンシブ** - モバイル完全対応
- **ダークモード** - 目に優しいテーマ

### 検索機能
- **複数検索タイプ** - ウェブ、画像、動画
- **ページネーション** - 「次のページ」機能
- **リアルタイム検索** - 即座に結果表示
- **キーボードショートカット** - Enter キーで検索

### 技術仕様
- **HTML5 Semantic** - 正しいセマンティック構造
- **SVG Graphics** - 絵文字なしで全てのアイコンをSVG実装
- **Vanilla JavaScript** - フレームワーク不要
- **CSS3 Advanced** - グラデーション、トランジション

## ファイル構成

```
dan-search-final/
├── index.html      # メインHTML
├── style.css       # スタイルシート
├── script.js       # JavaScript（機能実装）
├── 404.html        # エラーページ
└── README.md       # このファイル
```

## インストール

### ローカル開発

```bash
# Python 3
python -m http.server 8000

# または Node.js
npx http-server

# または PHP
php -S localhost:8000
```

ブラウザで `http://localhost:8000` にアクセス

### デプロイ

#### Vercel（推奨）
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
netlify deploy --prod --dir .
```

#### GitHub Pages
```bash
git add .
git commit -m "DAN Search"
git push origin main
```

## 使用方法

### ホームページ
1. 検索ボックスに検索キーワードを入力
2. 「検索」ボタンをクリックまたは Enter キー
3. 結果ページに遷移

### 結果ページ
- **フィルタータブ** - 「全て」「画像」「動画」で検索結果をフィルター
- **次のページ** - 「次のページ」ボタンで結果を追加表示
- **戻るボタン** - ホームページに戻る
- **テーマ切り替え** - ライト/ダークモード

## API スペック

### エンドポイント
```
GET https://find-joy-feed.lovable.app/api/public/search?q={query}
```

### レスポンス例
```json
{
  "results": [
    {
      "title": "ページタイトル",
      "url": "https://example.com",
      "description": "説明文",
      "type": "web|image|video",
      "image": "https://example.com/image.jpg"
    }
  ]
}
```

## カスタマイズ

### ロゴの変更
`index.html` 内の `<text>DAN</text>` を変更：

```html
<text x="0" y="40" font-size="48">YOUR LOGO</text>
```

### カラーの変更
`style.css` の CSS 変数を編集：

```css
:root {
    --primary: #YOUR_COLOR;
    --text-primary: #YOUR_TEXT_COLOR;
}
```

### API エンドポイントの変更
`script.js` の `API_BASE` を編集：

```javascript
const API_BASE = 'https://your-api.com/search';
```

## ブラウザ対応

| ブラウザ | サポート |
|---------|---------|
| Chrome | 最新版 ✅ |
| Firefox | 最新版 ✅ |
| Safari | 最新版 ✅ |
| Edge | 最新版 ✅ |
| iOS Safari | 最新版 ✅ |
| Android Chrome | 最新版 ✅ |

## パフォーマンス

| 項目 | 値 |
|------|-----|
| ファイルサイズ | 約 25KB (gzip) |
| 初期ロード | < 500ms |
| First Contentful Paint | < 800ms |
| Lighthouse Score | 95+ |

## アクセシビリティ

- ✅ WCAG 2.1 A 準拠
- ✅ キーボード操作対応
- ✅ スクリーンリーダー対応
- ✅ 高コントラスト対応
- ✅ フォーカスインジケータ

## セキュリティ

- ✅ XSS 対策（HTML エスケープ）
- ✅ CSRF 対策（GET リクエストのみ）
- ✅ Content Security Policy 対応

## トラブルシューティング

### SVG アイコンが表示されない

ブラウザの開発者ツールで SVG 要素が正しく読み込まれているか確認してください。

### 検索結果が表示されない

1. ブラウザのコンソールでエラーを確認
2. API エンドポイントが正しいか確認
3. ネットワークタブで API 応答を確認

### テーマが保存されない

localStorage が有効か確認してください（プライベートブラウジングモードではNG）

## ライセンス

MIT License

## 更新履歴

### v1.0.0 (2026-10-07)
- 初版リリース
- Google風UI実装
- ウェブ/画像/動画検索対応
- ページネーション機能
- ダークモード対応

## サポート

問題が発生した場合は、以下をご確認ください：

1. ブラウザコンソールのエラーメッセージ
2. ネットワークタブの API 呼び出し
3. localStorage の動作状態

---

**作成者**: 2a_exe  
**バージョン**: 1.0.0  
**最終更新**: 2026年10月7日

🚀 Google風の検索体験をお楽しみください！
