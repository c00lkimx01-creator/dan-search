# DAN search 🔍

最新のグラスUIデザインを備えた高機能検索エンジン

## 特徴

✨ **グラスモーフィズムUI** - モダンなグラスデザイン
🌙 **ダークモード対応** - テーマ切り替え機能
📱 **完全レスポンシブ** - PC・タブレット・スマートフォン対応
⚡ **高速検索** - リアルタイム結果表示
🔗 **複数検索機能** - Web / 画像 / 動画検索に対応
📍 **URLパラメータ対応** - /search?q=キーワード で直接検索可能
💾 **オフライン対応** - Service Worker によるキャッシング

## インストール方法

### ローカルで実行

1. ファイルをダウンロード
```bash
unzip dan-search.zip
cd dan-search
```

2. ローカルサーバーで実行
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (http-server)
npx http-server
```

3. ブラウザで開く
```
http://localhost:8000
```

### GitHub Pagesで公開

1. GitHubでリポジトリを作成
```
https://github.com/your-username/dan-search
```

2. ファイルをプッシュ
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/dan-search.git
git push -u origin main
```

3. GitHub Pages設定
   - Settings → Pages
   - Source → Deploy from a branch
   - Branch → main / (root) で保存

4. アクセス
```
https://your-username.github.io/dan-search
```

## 使用方法

### 基本検索
1. 検索ボックスにキーワードを入力
2. Web / 画像 / 動画 からタイプを選択
3. 検索ボタンをクリック

### URLでの直接検索
```
?q=キーワード&type=web      # Web検索
?q=キーワード&type=image    # 画像検索
?q=キーワード&type=video    # 動画検索
```

### テーマ変更
右上の太陽/月アイコンをクリックしてテーマを切り替え

## API設定

デフォルトAPI:
```
https://find-joy-feed.lovable.app/api/public/search
```

APIを変更する場合は、`script.js` の `API_BASE` を編集してください。

```javascript
// script.js の約58行目
const API_BASE = 'your-api-endpoint';
```

### APIレスポンス形式

対応形式:
- `[{}, {}]` 配列
- `{results: [{}, {}]}`
- `{data: [{}, {}]}`

### 検索結果フィールド

**Web検索:**
- `title` / `name` - タイトル
- `url` / `link` - リンクURL
- `snippet` / `description` - 説明文

**画像検索:**
- `image` / `url` / `src` - 画像URL
- `title` / `alt` - タイトル
- `sourceUrl` / `source_url` / `page_url` - ソースページ

**動画検索:**
- `title` / `name` - タイトル
- `url` / `link` - リンクURL
- `thumbnail` / `image` - サムネイル画像
- `channel` / `source` - チャンネル名
- `duration` - 動画時間

## カスタマイズ

### カラースキーム
`style.css` の `:root` セクションで色を変更:

```css
:root {
    --primary: #4F46E5;           /* プライマリカラー */
    --secondary: #06B6D4;         /* セカンダリカラー */
    --accent: #EC4899;            /* アクセントカラー */
}
```

### ロゴを変更
`index.html` の `<h1 class="logo">` を編集

### フォント変更
`style.css` の `font-family` を変更

## トラブルシューティング

### CORS エラーが出る場合
APIがCORSに対応していない場合、プロキシサーバーを使用してください。

### 結果が表示されない
1. コンソール（F12）でエラーを確認
2. APIエンドポイントが正しいか確認
3. APIレスポンス形式が対応形式か確認

### Service Worker が動作しない
HTTPSまたはlocalhostでのみ動作します。

## ブラウザサポート

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## ライセンス

MIT License

## 開発者向け情報

### ファイル構成
```
dan-search/
├── index.html      # メインHTML
├── style.css       # スタイルシート
├── script.js       # メインスクリプト
├── sw.js          # Service Worker
├── 404.html       # GitHub Pages SPA対応
└── README.md      # このファイル
```

### 主なJavaScript関数

- `performSearch()` - 検索実行
- `fetchResults()` - API呼び出し
- `displayResults()` - 結果表示
- `toggleTheme()` - テーマ切り替え
- `handleURLParams()` - URLパラメータ処理

### localStorage キー
- `dan-search-theme` - 現在のテーマ（light / dark）

## 更新履歴

### v1.0.0 (2024)
- 初版リリース
- グラスUIデザイン
- マルチスクリーン対応
- テーマ切り替え機能

## お問い合わせ・バグ報告

Issues や Pull Request をお待ちしています！

---

作成: 2024
更新日時: 2024年
