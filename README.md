# Audio Scribe

MTG（会議）などの人の音声を読み取り、画面にリアルタイムで文字起こしするサービスです。

## 🎯 機能

- **リアルタイム音声録音**: マイクからの音声をリアルタイムで録音し、文字起こし
- **ファイルアップロード**: 音声ファイル（MP3, WAV, M4A, WEBM）をアップロードして文字起こし
- **ドラッグ&ドロップ対応**: 直感的なファイルアップロード
- **日本語最適化**: 日本語音声認識に最適化
- **結果管理**: 文字起こし結果の表示、クリア、クリップボードへのコピー

## 🛠 技術構成

- **フロントエンド**: Nuxt v4 (Vue 3)
- **音声認識**: OpenAI Whisper API
- **スタイル**: CSS3（レスポンシブデザイン）
- **ランタイム**: Node.js v24.4.1
- **パッケージマネージャー**: npm v11.4.2
- **バージョン管理**: Volta

## 📦 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、OpenAI APIキーを設定：

```env
OPENAI_API_KEY=your_openai_api_key_here
BASE_URL=http://localhost:3000
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## 🚀 使用方法

### リアルタイム録音

1. 「録音開始」ボタンをクリック
2. ブラウザがマイクアクセスを許可するよう求めてきたら許可
3. 音声を話す
4. 「録音停止」ボタンをクリック
5. 自動的に文字起こしが実行され、結果が表示されます

### ファイルアップロード

1. 音声ファイルをドラッグ&ドロップするか、ファイル選択エリアをクリック
2. 対応形式（MP3, WAV, M4A, WEBM）のファイルを選択
3. 自動的に文字起こしが実行され、結果が表示されます

## 📝 サポートされる音声形式

- MP3
- WAV
- M4A
- WEBM
- 最大ファイルサイズ: 25MB

## 🌟 特徴

- **高精度**: OpenAI Whisperによる高精度な音声認識
- **リアルタイム**: ライブ音声の録音と即座の文字起こし
- **使いやすいUI**: 直感的でモダンなユーザーインターフェース
- **レスポンシブ**: デスクトップ・モバイル両対応
- **日本語最適化**: 日本語音声に特化した設定

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プレビュー
npm run preview

# 型チェック
npm run postinstall
```

## 📋 要件

- Node.js v24.4.1+
- npm v11.4.2+
- Volta（バージョン管理）
- OpenAI APIキー
- HTTPS環境（本番環境でマイクアクセスが必要な場合）

## 🛡 セキュリティ

- APIキーは環境変数で管理
- アップロードファイルは一時ファイルとして処理後に自動削除
- ファイルサイズ制限（25MB）
- MIME タイプチェック

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを開く

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🔗 関連リンク

- [Nuxt v4 Documentation](https://nuxt.com/)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [Volta](https://volta.sh/)
- [Vue 3](https://vuejs.org/)
