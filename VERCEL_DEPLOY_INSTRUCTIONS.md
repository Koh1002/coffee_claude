# Vercelデプロイ手順

GitHubへのプッシュが完了したら、この手順に従ってVercelにデプロイしてください。

---

## ステップ1: Supabaseのセットアップ

### 1. Supabaseプロジェクト作成

1. https://supabase.com/ にアクセス
2. "Start your project" をクリック
3. GitHubでサインイン
4. "New project" をクリック
5. Organization: 既存または新規作成
6. プロジェクト設定:
   - Name: `coffee-log-production`
   - Database Password: 強力なパスワードを生成（メモしておく）
   - Region: `Northeast Asia (Tokyo)` を選択
   - Pricing Plan: Free でOK
7. "Create new project" をクリック（2-3分待つ）

### 2. データベース接続情報の取得

1. プロジェクトダッシュボード > Settings > Database
2. "Connection string" セクション
3. "URI" タブを選択
4. 接続文字列をコピー:
   ```
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
   ```
5. `[YOUR-PASSWORD]` を実際のパスワードに置き換え
6. 末尾に以下を追加（重要）:
   ```
   ?pgbouncer=true&connection_limit=1
   ```

**最終的な接続文字列の例:**
```
postgresql://postgres.xxxxx:your-password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### 3. ストレージバケットの作成

1. Storage > New bucket
2. 設定:
   - Name: `coffee-photos`
   - Public bucket: **有効化** ✅
   - File size limit: 5MB
   - Allowed MIME types: image/*
3. "Create bucket" をクリック

### 4. APIキーの取得

1. Settings > API
2. 以下をコピー:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: `eyJhbGci...`（長い文字列）

---

## ステップ2: AUTH_SECRETの生成

ターミナルで以下を実行:

```bash
openssl rand -base64 32
```

出力された文字列をコピーしておく。

---

## ステップ3: Vercelでプロジェクトをインポート

### 1. Vercelにログイン

1. https://vercel.com/ にアクセス
2. "Continue with GitHub" でログイン

### 2. プロジェクトをインポート

1. ダッシュボードで "Add New..." > "Project" をクリック
2. "Import Git Repository" セクション
3. `Koh1002/coffee_claude` リポジトリを探す
4. "Import" をクリック

### 3. プロジェクト設定

**Configure Project** 画面で:

- **Framework Preset**: Next.js（自動検出）
- **Root Directory**: `./`
- **Build Command**: `npm run vercel-build`（自動設定済み）
- **Output Directory**: `.next`（自動設定）
- **Install Command**: `npm install`

---

## ステップ4: 環境変数の設定

"Environment Variables" セクションで以下を追加:

### 必須の環境変数

#### DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: Supabaseからコピーした接続文字列
  ```
  postgresql://postgres.xxxxx:password@...?pgbouncer=true&connection_limit=1
  ```
- **Environment**: Production, Preview, Development すべてにチェック ✅

#### AUTH_SECRET
- **Name**: `AUTH_SECRET`
- **Value**: `openssl rand -base64 32` で生成した文字列
- **Environment**: Production, Preview, Development すべてにチェック ✅

#### AUTH_URL
- **Name**: `AUTH_URL`
- **Value**: 仮のURL `https://your-app.vercel.app`（後で更新）
- **Environment**: Production にチェック ✅

#### NEXT_PUBLIC_SUPABASE_URL
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Supabaseの Project URL
  ```
  https://xxxxx.supabase.co
  ```
- **Environment**: Production, Preview, Development すべてにチェック ✅

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Supabaseの anon public key
  ```
  eyJhbGci...
  ```
- **Environment**: Production, Preview, Development すべてにチェック ✅

---

## ステップ5: デプロイ実行

1. すべての環境変数を設定したら "Deploy" をクリック
2. デプロイプロセスが開始（3-5分）:
   - ✓ Building...
   - ✓ Running Prisma migrations...
   - ✓ Building Next.js...
   - ✓ Deploying...

3. デプロイ完了後、本番URLが表示されます
   例: `https://coffee-claude.vercel.app`

---

## ステップ6: AUTH_URLの更新

1. 本番URLをコピー
2. Vercel > Project Settings > Environment Variables
3. `AUTH_URL` を見つけて "Edit" をクリック
4. Value を実際のURLに更新
   ```
   https://coffee-claude.vercel.app
   ```
5. "Save" をクリック
6. 自動的に再デプロイが開始

---

## ステップ7: デプロイ確認

### 1. アプリケーションにアクセス

本番URLにアクセス: `https://coffee-claude.vercel.app`

### 2. 動作確認

1. サインアップページで新規ユーザー登録
2. ログイン
3. 各機能をテスト:
   - ✓ ログの作成
   - ✓ 豆の登録
   - ✓ Taste Mapの表示
   - ✓ ダッシュボード
   - ✓ 画像アップロード

### 3. デモデータの投入（オプション）

ローカルから本番DBにシードデータを投入する場合:

```bash
DATABASE_URL="<本番DB URL>" npm run db:seed
```

---

## トラブルシューティング

### デプロイエラー: "Database connection failed"

**原因**: DATABASE_URLが間違っているか、接続できない

**解決策**:
1. Supabaseの接続文字列を再確認
2. パスワードが正しいか確認
3. `?pgbouncer=true&connection_limit=1` が末尾にあるか確認
4. Supabaseプロジェクトが起動しているか確認

### デプロイエラー: "Prisma Client validation failed"

**原因**: prisma/schema.prisma に問題がある

**解決策**:
1. ローカルで `npx prisma validate` を実行
2. エラーを修正
3. GitHubにプッシュして再デプロイ

### ランタイムエラー: "NextAuth configuration error"

**原因**: AUTH_SECRET または AUTH_URL が正しくない

**解決策**:
1. Vercel > Settings > Environment Variables で確認
2. AUTH_SECRET が設定されているか
3. AUTH_URL が本番URLと一致しているか
4. 環境変数が "Production" 環境に設定されているか確認

### 画像アップロードエラー

**原因**: Supabase設定が正しくない

**解決策**:
1. `coffee-photos` バケットが作成されているか確認
2. バケットが Public に設定されているか確認
3. NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY が正しいか確認

---

## デプロイ完了！

すべてが正常に動作したら、デプロイ完了です！ 🎉

アプリケーションは以下のURLでアクセス可能:
- **本番環境**: https://coffee-claude.vercel.app
- **Vercelダッシュボード**: https://vercel.com/dashboard

---

## 今後の更新方法

コードを更新してGitHubにプッシュすると、Vercelが自動的に再デプロイします:

```bash
git add .
git commit -m "Update feature"
git push origin main
# → 自動的にVercelにデプロイ
```

---

## サポート

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- このプロジェクトの詳細: [DEPLOY.md](./DEPLOY.md)
