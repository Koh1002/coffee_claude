# Coffee Log - 起動ガイド

このドキュメントには、Coffee Logアプリケーションの起動方法とデプロイ手順が記載されています。

## 目次

1. [ローカル開発環境のセットアップ](#ローカル開発環境のセットアップ)
2. [本番環境へのデプロイ](#本番環境へのデプロイ)
3. [トラブルシューティング](#トラブルシューティング)

---

## ローカル開発環境のセットアップ

### 必要な環境

- Node.js 18以上
- Docker Desktop（PostgreSQL用）
- npm または yarn

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd coffee-log-app
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成：

```bash
cp .env.example .env
```

`.env`ファイルを編集して以下の値を設定：

```env
# Database
DATABASE_URL="postgresql://coffee:coffee123@localhost:5432/coffee_log?schema=public"

# NextAuth
AUTH_SECRET="your-secret-key-here"  # openssl rand -base64 32 で生成
AUTH_URL="http://localhost:3000"

# Supabase Storage (オプション - 画像アップロード機能を使う場合)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

**AUTH_SECRETの生成方法:**
```bash
openssl rand -base64 32
```

### 4. Docker Desktopの起動

Docker Desktopを起動してから、以下のコマンドでPostgreSQLを起動：

```bash
docker compose up -d
```

コンテナの状態確認：
```bash
docker compose ps
```

### 5. データベースのセットアップ

```bash
# Prisma Clientの生成
npm run db:generate

# データベーススキーマの適用
npm run db:push

# デモデータの投入（オプション）
npm run db:seed
```

デモアカウント（シードデータ投入後）:
- Email: `demo@example.com`
- Password: `password123`

### 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

### 開発中の便利なコマンド

```bash
# リント実行
npm run lint

# TypeScript型チェック
npx tsc --noEmit

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# データベースマイグレーション作成
npm run db:migrate

# データベースリセット（開発用）
npx prisma migrate reset
```

---

## 本番環境へのデプロイ

### Vercelへのデプロイ（推奨）

#### 1. 前提条件

- Vercelアカウント
- GitHubリポジトリ
- PostgreSQLデータベース（Supabase、Neon、Railway等）
- Supabaseアカウント（画像アップロード機能用）

#### 2. データベースの準備

**オプション A: Supabase**

1. [Supabase](https://supabase.com/)でプロジェクト作成
2. Database > Connection Stringから接続文字列を取得
3. Storage > New bucketで`coffee-photos`バケットを作成（Public設定）

**オプション B: Neon**

1. [Neon](https://neon.tech/)でプロジェクト作成
2. Connection Stringを取得

**オプション C: Railway**

1. [Railway](https://railway.app/)でPostgreSQLデータベースを作成
2. 接続文字列を取得

#### 3. Vercelへのデプロイ

1. [Vercel](https://vercel.com/)にログイン
2. "New Project"をクリック
3. GitHubリポジトリをインポート
4. 環境変数を設定：

```
DATABASE_URL=<本番用データベースURL>
AUTH_SECRET=<openssl rand -base64 32で生成>
AUTH_URL=<デプロイ後のURL例: https://your-app.vercel.app>
NEXT_PUBLIC_SUPABASE_URL=<SupabaseプロジェクトURL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase Anon Key>
```

5. "Deploy"をクリック

#### 4. デプロイ後の初期設定

デプロイ完了後、データベースのセットアップ：

**方法1: Vercel CLIを使用**

```bash
# Vercel CLIのインストール
npm i -g vercel

# ログイン
vercel login

# プロジェクトにリンク
vercel link

# 本番環境の環境変数を取得
vercel env pull .env.production

# Prismaスキーマを適用
DATABASE_URL="<本番DB URL>" npx prisma db push

# シードデータ投入（オプション）
DATABASE_URL="<本番DB URL>" npm run db:seed
```

**方法2: GitHubリポジトリ経由**

`package.json`に以下を追加（既に追加済み）:

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma db push --skip-generate && next build"
  }
}
```

Vercelの設定でBuild Commandを`npm run vercel-build`に変更。

#### 5. 本番URLの確認

Vercelダッシュボードから本番URLを確認し、`.env`の`AUTH_URL`を更新して再デプロイ。

### 環境変数の管理

Vercelダッシュボード > Project Settings > Environment Variablesで管理：

- **Production**: 本番環境
- **Preview**: プレビュー環境
- **Development**: ローカル開発環境

---

## トラブルシューティング

### Docker関連

**問題: `docker compose up -d`が失敗する**

解決策:
1. Docker Desktopが起動しているか確認
2. WSL2環境の場合、Docker Desktop設定でWSL統合を有効化
3. `docker.exe compose up -d`を試す（Windows環境）

**問題: ポート5432が使用中**

解決策:
```bash
# 既存のPostgreSQLプロセスを確認
lsof -i :5432

# docker-compose.ymlのポートを変更（例: 5433:5432）
# .envのDATABASE_URLも変更
```

### Prisma関連

**問題: `Can't reach database server`**

解決策:
1. PostgreSQLが起動しているか確認: `docker compose ps`
2. DATABASE_URLが正しいか確認
3. データベース接続をテスト: `npx prisma db pull`

**問題: マイグレーションエラー**

解決策:
```bash
# スキーマを強制的に同期（開発環境のみ）
npm run db:push

# データベースをリセット（開発環境のみ）
npx prisma migrate reset
```

### Next.js関連

**問題: ビルドエラー**

解決策:
```bash
# キャッシュをクリア
rm -rf .next
npm run build

# 型エラーを確認
npx tsc --noEmit
```

**問題: 環境変数が反映されない**

解決策:
1. 開発サーバーを再起動
2. `.env`ファイルの変数名が正しいか確認
3. クライアントサイドで使う変数は`NEXT_PUBLIC_`プレフィックスが必要

### Supabase Storage関連

**問題: 画像アップロードが失敗する**

解決策:
1. Supabaseバケット`coffee-photos`が作成されているか確認
2. バケットがPublic設定になっているか確認
3. `NEXT_PUBLIC_SUPABASE_URL`と`NEXT_PUBLIC_SUPABASE_ANON_KEY`が正しいか確認

---

## 定期メンテナンス

### データベースバックアップ

**ローカル環境:**
```bash
docker exec coffee-log-db pg_dump -U coffee coffee_log > backup.sql
```

**本番環境:**
各プロバイダーの管理画面からバックアップを取得

### 依存関係の更新

```bash
# 依存関係の確認
npm outdated

# 更新
npm update

# メジャーバージョン更新（慎重に）
npm install <package>@latest
```

### ログの確認

**ローカル環境:**
開発サーバーのコンソール出力を確認

**本番環境（Vercel）:**
Vercel Dashboard > Logs から確認

---

## サポート

問題が解決しない場合：

1. このドキュメントの[トラブルシューティング](#トラブルシューティング)を確認
2. GitHubのIssuesで既存の問題を検索
3. 新しいIssueを作成して質問

---

**最終更新日: 2026-01-28**
