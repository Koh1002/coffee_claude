# Coffee Log - デプロイガイド

このドキュメントでは、Coffee LogアプリケーションをVercelにデプロイする詳細な手順を説明します。

## 目次

1. [事前準備](#事前準備)
2. [データベースのセットアップ](#データベースのセットアップ)
3. [Vercelへのデプロイ](#vercelへのデプロイ)
4. [環境変数の設定](#環境変数の設定)
5. [デプロイ後の確認](#デプロイ後の確認)

---

## 事前準備

### 必要なアカウント

1. **GitHubアカウント** - コードをホスティング
2. **Vercelアカウント** - アプリケーションのホスティング
3. **データベースプロバイダー** - 以下のいずれか:
   - [Supabase](https://supabase.com/) - PostgreSQL + Storage（推奨）
   - [Neon](https://neon.tech/) - PostgreSQL
   - [Railway](https://railway.app/) - PostgreSQL
4. **Supabaseアカウント** - 画像ストレージ用（データベースと別でも可）

### GitHubリポジトリの作成

```bash
# Gitの初期化（未初期化の場合）
git init

# リモートリポジトリを追加
git remote add origin https://github.com/your-username/coffee-log-app.git

# コミット＆プッシュ
git add .
git commit -m "Initial commit"
git push -u origin main
```

---

## データベースのセットアップ

### オプション 1: Supabase（推奨）

Supabaseを使用すると、PostgreSQLデータベースと画像ストレージを1つのプラットフォームで管理できます。

#### 1. プロジェクト作成

1. [Supabase](https://supabase.com/)にログイン
2. "New Project"をクリック
3. プロジェクト名、データベースパスワードを設定
4. リージョンを選択（推奨: Tokyo - Northeast Asia）
5. "Create new project"をクリック

#### 2. データベース接続情報の取得

1. プロジェクトダッシュボード > Settings > Database
2. "Connection string"セクションで"URI"を選択
3. `postgres://postgres:[YOUR-PASSWORD]@...` の形式の接続文字列をコピー
4. `[YOUR-PASSWORD]`を実際のパスワードに置き換え
5. 末尾に `?pgbouncer=true&connection_limit=1` を追加（推奨）

例:
```
postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
```

#### 3. ストレージバケットの作成

1. Storage > New bucket
2. Bucket name: `coffee-photos`
3. Public bucket: **有効化**
4. "Create bucket"をクリック

#### 4. Supabase APIキーの取得

1. Settings > API
2. `Project URL`をコピー → `NEXT_PUBLIC_SUPABASE_URL`に使用
3. `anon public`キーをコピー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`に使用

### オプション 2: Neon

1. [Neon](https://neon.tech/)にログイン
2. "Create Project"をクリック
3. プロジェクト名を入力
4. リージョンを選択（推奨: Tokyo）
5. Connection stringをコピー
6. 別途Supabaseで画像ストレージを設定（オプション1の手順3-4を参照）

### オプション 3: Railway

1. [Railway](https://railway.app/)にログイン
2. "New Project" > "Provision PostgreSQL"
3. データベースが作成されたら"Connect"タブを開く
4. "Postgres Connection URL"をコピー
5. 別途Supabaseで画像ストレージを設定（オプション1の手順3-4を参照）

---

## Vercelへのデプロイ

### 1. Vercelにログイン

1. [Vercel](https://vercel.com/)にアクセス
2. "Continue with GitHub"でログイン

### 2. プロジェクトのインポート

1. ダッシュボードで"Add New..." > "Project"をクリック
2. GitHubリポジトリ一覧から`coffee-log-app`を選択
3. "Import"をクリック

### 3. プロジェクト設定

**Framework Preset**: Next.js（自動検出）
**Root Directory**: ./
**Build Command**: `npm run vercel-build`（自動設定済み）
**Output Directory**: .next（自動設定）

---

## 環境変数の設定

### 1. Vercelで環境変数を設定

プロジェクト設定画面で、以下の環境変数を追加：

#### 必須の環境変数

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://...` | データベース接続文字列 |
| `AUTH_SECRET` | ランダムな文字列 | NextAuth用シークレットキー |
| `AUTH_URL` | `https://your-app.vercel.app` | デプロイ後のURL |

#### オプションの環境変数（画像アップロード機能用）

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | SupabaseプロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Supabase anonキー |

### 2. AUTH_SECRETの生成

ターミナルで以下を実行：

```bash
openssl rand -base64 32
```

出力された文字列をコピーして`AUTH_SECRET`に設定。

### 3. AUTH_URLの設定

最初のデプロイ時は仮のURL（例: `https://your-app.vercel.app`）を設定。
デプロイ完了後、実際のURLに更新して再デプロイ。

### 4. 環境ごとの設定

すべての環境変数に対して、以下のチェックボックスを有効化：

- ✅ Production
- ✅ Preview
- ✅ Development

---

## デプロイの実行

### 1. デプロイ開始

環境変数の設定が完了したら、"Deploy"ボタンをクリック。

デプロイプロセス:
1. ソースコードのクローン
2. 依存関係のインストール
3. Prisma Clientの生成
4. データベーススキーマの適用
5. Next.jsのビルド
6. デプロイ

### 2. ビルドログの確認

デプロイ中、ビルドログをリアルタイムで確認できます。
エラーが発生した場合は、ログを確認して修正。

よくあるエラー:
- **DATABASE_URLが無効**: 接続文字列を確認
- **Prismaスキーマエラー**: `prisma/schema.prisma`の構文を確認
- **依存関係エラー**: `package.json`を確認

### 3. デプロイ完了

デプロイが成功すると、本番URLが表示されます。
例: `https://coffee-log-app.vercel.app`

---

## デプロイ後の確認

### 1. AUTH_URLの更新

1. Vercel > Project Settings > Environment Variables
2. `AUTH_URL`を実際のURLに更新
3. 変更を保存
4. 自動的に再デプロイが開始

### 2. データベースの確認

デプロイ後、データベースにテーブルが作成されているか確認：

```bash
# ローカルから本番DBに接続
DATABASE_URL="<本番DB URL>" npx prisma studio
```

### 3. アプリケーションの動作確認

1. 本番URLにアクセス
2. サインアップページで新規ユーザー登録
3. ログイン
4. 各機能の動作確認:
   - ログの作成
   - 豆の登録
   - Taste Mapの表示
   - ダッシュボードの表示

### 4. 初期データの投入（オプション）

本番環境にデモデータを投入する場合：

```bash
# Vercel CLIのインストール
npm i -g vercel

# ログイン
vercel login

# プロジェクトにリンク
vercel link

# シードデータ投入
DATABASE_URL="<本番DB URL>" npm run db:seed
```

---

## 継続的デプロイ（CI/CD）

Vercelは、GitHubとの連携により自動デプロイを提供：

### 自動デプロイの仕組み

- **mainブランチへのプッシュ** → 本番環境にデプロイ
- **プルリクエスト作成** → プレビュー環境にデプロイ
- **その他のブランチへのプッシュ** → プレビュー環境にデプロイ

### デプロイの確認

1. GitHubでコードをプッシュ
2. Vercelダッシュボードでデプロイ状況を確認
3. デプロイ完了後、自動的に反映

### プレビューデプロイ

プルリクエストごとに一意のプレビューURLが生成されます。
例: `https://coffee-log-app-pr-123.vercel.app`

---

## トラブルシューティング

### デプロイエラー

**エラー: Database connection failed**

解決策:
1. `DATABASE_URL`が正しいか確認
2. データベースプロバイダーのIPホワイトリスト設定を確認（必要に応じて0.0.0.0/0を許可）
3. 接続文字列の末尾に`?connection_limit=1`を追加

**エラー: Prisma schema validation failed**

解決策:
1. `prisma/schema.prisma`の構文を確認
2. ローカルで`npx prisma validate`を実行
3. 問題を修正してコミット＆プッシュ

**エラー: Build exceeded maximum duration**

解決策:
1. 不要な依存関係を削除
2. `.vercelignore`を作成して不要なファイルを除外
3. ビルドキャッシュをクリア（Vercel Settings > General > Clear Cache）

### ランタイムエラー

**エラー: 500 Internal Server Error**

解決策:
1. Vercel > Logs で詳細なエラーログを確認
2. 環境変数が正しく設定されているか確認
3. データベース接続を確認

**エラー: NextAuth configuration error**

解決策:
1. `AUTH_SECRET`が設定されているか確認
2. `AUTH_URL`が本番URLと一致しているか確認
3. 環境変数が Production 環境に設定されているか確認

---

## パフォーマンス最適化

### 1. データベース最適化

**Supabaseの場合:**
- Connection poolingを有効化（`?pgbouncer=true`を接続文字列に追加）
- `connection_limit=1`を設定

**Neonの場合:**
- Autoscalingが有効になっているか確認

### 2. 画像最適化

- Next.js Image コンポーネントの使用
- Supabase Storageの画像変換機能を活用

### 3. キャッシング

Vercelは自動的にキャッシングを行いますが、さらに最適化するには：

```typescript
// app/api/route.ts
export const revalidate = 60; // 60秒ごとに再生成
```

---

## セキュリティ

### 環境変数の管理

- 環境変数に機密情報を保存
- `.env`ファイルをGitにコミットしない（`.gitignore`で除外）
- クライアント側で必要な変数のみ`NEXT_PUBLIC_`プレフィックスを使用

### データベースセキュリティ

- 強力なデータベースパスワードを使用
- 必要に応じてIPホワイトリストを設定
- SSL/TLS接続を有効化

### 認証セキュリティ

- `AUTH_SECRET`は強力なランダム文字列を使用
- 定期的に`AUTH_SECRET`をローテーション
- セッションタイムアウトを適切に設定

---

## モニタリング

### Vercel Analytics

1. Vercel > Project > Analytics で有効化
2. Web Vitals、訪問者数、パフォーマンスメトリクスを確認

### ログ確認

1. Vercel > Project > Logs
2. リアルタイムログとエラーログを確認
3. フィルター機能で特定のログを検索

### アラート設定

Vercelの通知設定でエラーアラートを有効化：
- デプロイ失敗時
- ランタイムエラー時
- パフォーマンス低下時

---

## 更新とメンテナンス

### アプリケーションの更新

```bash
# 機能追加や修正
git add .
git commit -m "Add new feature"
git push origin main
# → 自動的にVercelにデプロイ
```

### データベーススキーマの変更

```bash
# ローカルでマイグレーション作成
npm run db:migrate

# コミット＆プッシュ
git add .
git commit -m "Update database schema"
git push origin main
# → vercel-buildスクリプトが自動的にスキーマを適用
```

### ロールバック

問題が発生した場合、Vercelダッシュボードから前のデプロイに戻すことができます：

1. Vercel > Deployments
2. 以前のデプロイを選択
3. "Promote to Production"をクリック

---

## コスト管理

### Vercelの料金プラン

- **Hobby（無料）**: 個人プロジェクト向け
- **Pro（$20/月）**: 商用利用
- **Enterprise**: カスタム

### データベースの料金

- **Supabase**: 無料プランあり（500MB、50,000リクエスト/月）
- **Neon**: 無料プランあり（3GB、100時間/月）
- **Railway**: 使用量ベース

### コスト削減のヒント

1. 不要なデプロイを削除
2. プレビューデプロイの保持期間を短縮
3. データベースのアイドル時間を活用

---

## サポート

デプロイに関する問題:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

データベース関連:
- [Supabase Docs](https://supabase.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Railway Docs](https://docs.railway.app/)

---

**最終更新日: 2026-01-28**
