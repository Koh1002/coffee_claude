# Coffee Log - コーヒー記録アプリ

個人のコーヒー体験を記録し、味の好みを可視化。将来的にSNS的に公開・交流できるWebアプリケーション。

## 主な機能

### コーヒー記録（ログ）
- 日時、コーヒー名、場所、ドリンクタイプ、焙煎度などを記録
- 5段階評価
- 味座標（渋み↔酸味、焙煎度）の入力
- 写真添付（Supabase Storage）
- 公開/非公開設定

### My Beans（所有豆の管理）
- 豆の名前、産地、品種、精製方法
- 味座標の登録
- メモ

### Taste Map
- 2D散布図で味わいを可視化
- X軸: 渋み（-100）↔ 酸味（+100）
- Y軸: 浅煎り（0）↔ 深煎り（100）
- 豆とログを切り替えて表示
- フィルタ機能

### ダッシュボード
- 月別記録数（棒グラフ）
- 評価平均の推移（折れ線）
- よく飲む店ランキング
- よく飲む産地ランキング

### SNS機能
- 公開プロフィール
- ログの公開/非公開
- いいね・コメント
- フォロー
- フィード（フォロー中のユーザーの記録）

### データ管理
- CSVエクスポート

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **ORM**: Prisma
- **DB**: PostgreSQL
- **認証**: NextAuth.js (Credentials Provider)
- **バリデーション**: Zod
- **スタイリング**: Tailwind CSS + shadcn/ui
- **グラフ**: Recharts
- **画像ストレージ**: Supabase Storage

## クイックスタート

### ローカル開発

詳細な起動手順は **[STARTUP.md](./STARTUP.md)** を参照してください。

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envを編集

# データベース起動
docker compose up -d

# データベースセットアップ
npm run db:generate
npm run db:push
npm run db:seed

# 開発サーバー起動
npm run dev
```

### 本番環境へのデプロイ

詳細なデプロイ手順は **[DEPLOY.md](./DEPLOY.md)** を参照してください。

Vercelへのデプロイ推奨：
1. GitHubリポジトリを作成
2. Vercelでプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

---

## ドキュメント

- **[STARTUP.md](./STARTUP.md)** - ローカル開発環境のセットアップと起動方法
- **[DEPLOY.md](./DEPLOY.md)** - 本番環境へのデプロイ手順
- **[README.md](./README.md)** - プロジェクト概要（このファイル）

---

## セットアップ（詳細）

### 必要なもの
- Node.js 18+
- Docker Desktop (PostgreSQL用)
- Supabase アカウント（画像アップロード機能を使用する場合）

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env` ファイルを作成:

```bash
cp .env.example .env
```

`.env` を編集:

```env
# Database
DATABASE_URL="postgresql://coffee:coffee123@localhost:5432/coffee_log?schema=public"

# NextAuth
AUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"

# Supabase Storage (optional, for image uploads)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

> `AUTH_SECRET` は `openssl rand -base64 32` で生成できます

### 3. データベースの起動

```bash
docker compose up -d
```

### 4. Prismaのセットアップ

```bash
# Prisma Clientの生成
npm run db:generate

# マイグレーションの実行
npm run db:migrate

# （オプション）シードデータの投入
npm run db:seed
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリにアクセスできます。

### デモアカウント（シードデータ投入後）

- Email: `demo@example.com`
- Password: `password123`

## Supabase Storageの設定（画像アップロード用）

1. [Supabase](https://supabase.com/) でプロジェクトを作成
2. Storage > New bucket で `coffee-photos` バケットを作成
3. バケットの設定で Public を有効化
4. プロジェクト設定から URL と anon key を取得
5. `.env` に設定

## 開発コマンド

```bash
# 開発サーバー
npm run dev

# ビルド
npm run build

# 本番サーバー
npm start

# Lint
npm run lint

# DBマイグレーション
npm run db:migrate

# DBシード
npm run db:seed
```

## ディレクトリ構成

```
coffee-log-app/
├── prisma/
│   ├── schema.prisma      # DBスキーマ
│   └── seed.ts            # シードデータ
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # 認証ページ
│   │   ├── (main)/        # メインページ
│   │   ├── u/[username]/  # 公開プロフィール
│   │   └── api/           # APIルート
│   ├── components/        # UIコンポーネント
│   ├── lib/               # ユーティリティ
│   ├── actions/           # Server Actions
│   └── types/             # 型定義
├── docker-compose.yml     # PostgreSQL
└── README.md
```

## 将来の拡張予定

- [ ] CSVインポート
- [ ] 通知機能
- [ ] ダイレクトメッセージ
- [ ] PWA対応
- [ ] 画像の直接アップロード（現在はURL指定のみ完全対応）

## ライセンス

MIT
