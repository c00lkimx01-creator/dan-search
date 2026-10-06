# DAN Search - シンプル検索エンジン

Google、DuckDuckGo、StartPage のようなシンプルで洗練された検索エンジンの実装です。

## 特徴

### UI/UX
- **シンプルで洗練されたデザイン** - Google風の最小限のインターフェース
- **レスポンシブデザイン** - モバイル、タブレット、デスクトップ対応
- **ダークモード対応** - 目に優しいダークテーマ
- **高速なレスポンス** - 軽量で高速読み込み

### 機能
- **複数検索タイプ** - ウェブ、画像、動画検索に対応
- **クイックフィルタ** - ホームページからタイプを選択可能
- **検索履歴** - URLパラメータで検索履歴を保持
- **キーボード操作** - Enter キーで検索実行
- **クリアボタン** - 検索ボックスのクイークリア

## ファイル構成

```
├── index.html      # メインHTMLファイル
├── style.css       # スタイルシート (Google/DuckDuckGo風)
├── script.js       # JavaScript（状態管理、API連携）
├── 404.html        # 404エラーページ
└── README.md       # このファイル
```

## カラースキーム

### ライトモード
- 背景: `#ffffff`
- テキスト: `#202124`
- プライマリ: `#4F46E5`（紫系）
- ボーダー: `#DADCE0`

### ダークモード
- 背景: `#121212`
- テキスト: `#E8EAED`
- プライマリ: `#4F46E5`（紫系）
- ボーダー: `#3C4043`

## API エンドポイント

現在、以下のAPIエンドポイントを使用しています：

```
https://find-joy-feed.lovable.app/api/public/search?q={query}
```

レスポンス形式：
```json
{
  "results": [
    {
      "title": "ページタイトル",
      "url": "https://example.com",
      "description": "説明文",
      "type": "web|image|video"
    }
  ]
}
```

## 使用方法

### ローカル開発

```bash
# ローカルサーバーで実行
python -m http.server 8000
# または
npm install -g http-server
http-server
```

ブラウザで `http://localhost:8000` にアクセス

### デプロイ

任意のスタティックサイトホスティングにデプロイ可能：
- Vercel
- Netlify
- GitHub Pages
- Amazon S3 + CloudFront
- など

## ブラウザ対応

- Chrome/Edge: 最新版
- Firefox: 最新版
- Safari: 最新版
- Mobile browsers: 最新版

## パフォーマンス

- ファイルサイズ: 約 30KB（圧縮時）
- 初期ロード: < 1秒
- 検索実行: < 500ms（API時間を除く）

## アクセシビリティ

- WCAG 2.1 AAA 準拠を目指した実装
- キーボード操作サポート
- スクリーンリーダー対応
- 減速アニメーション対応（prefers-reduced-motion）

## カスタマイズ

### ロゴの変更

`index.html` の `<h1 class="logo">` を編集：

```html
<h1 class="logo">Your Search</h1>
```

### カラーの変更

`style.css` の CSS 変数を編集：

```css
:root {
    --primary: #YourColor;
    /* その他の色 */
}
```

### API エンドポイントの変更

`script.js` の API_BASE を編集：

```javascript
const API_BASE = 'https://your-api.com/search';
```

## トラブルシューティング

### 検索結果が表示されない

1. ブラウザの開発者ツール（F12）でコンソールを確認
2. CORS エラーが出ていないか確認
3. API エンドポイントが正しいか確認

### スタイルが反映されない

1. ブラウザのキャッシュをクリア（Ctrl+Shift+R / Cmd+Shift+R）
2. style.css のパスが正しいか確認

### テーマが保存されない

1. ブラウザの localStorage が有効か確認
2. プライベートブラウジングモードで試す

## ライセンス

MIT License

## 更新履歴

### v2.0.0 (Enhanced)
- UI を Google/DuckDuckGo/StartPage 風に完全リデザイン
- シンプルで洗練されたインターフェース
- パフォーマンス最適化
- ダークモード改善
- モバイル対応強化

### v1.0.0 (Original)
- 初版リリース
- 基本的な検索機能
- ダークモード対応

## サポート

問題が発生した場合は、以下をご確認ください：

1. ブラウザコンソールのエラー
2. ネットワークタブの API 呼び出し
3. localStorage の状態

## 今後の予定

- [ ] 検索提案（オートコンプリート）
- [ ] キャッシング機能
- [ ] 複数言語対応
- [ ] PWA化（オフライン対応）
- [ ] 高度なフィルタリング
- [ ] カスタム検索エンジン選択

---

作成者: 2a_exe  
最終更新: 2026年10月
