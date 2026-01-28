# Coffee Log - クイックデプロイガイド

このガイドに従って、**5ステップ**でCoffee Logを本番環境にデプロイできます。

---

## 📋 事前準備

必要なアカウント（すべて無料プランあり）:
- ✅ GitHubアカウント
- ✅ Vercelアカウント（GitHubでサインアップ可能）
- ✅ Supabaseアカウント（GitHubでサインアップ可能）

---

## 🚀 5ステップデプロイ

### ステップ1️⃣: GitHubにプッシュ

コードは既にコミット済みです。以下のコマンドでプッシュ:

```bash
cd /home/kohkun1002/coffee-log-app
git push -u origin main
```

**認証情報を求められたら**:
- Username: `Koh1002`
- Password: GitHubの **Personal Access Token**（パスワードではない）

> Personal Access Tokenの作成方法は [GITHUB_PUSH_INSTRUCTIONS.md](./GITHUB_PUSH_INSTRUCTIONS.md) を参照

---

### ステップ2️⃣: Supabaseでデータベース作成

1. https://supabase.com/ にアクセス → "Start your project"
2. "New project" をクリック
3. 設定:
   - Name: `coffee-log-production`
   - Database Password: 強力なパスワードを生成（**メモ必須**）
   - Region: **Tokyo** を選択
4. "Create new project" をクリック（2-3分待つ）

#### データベース接続情報をコピー:

**Settings > Database > Connection string > URI**
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

パスワードを置き換えて、末尾に追加:
```
?pgbouncer=true&connection_limit=1
```

#### ストレージバケット作成:

**Storage > New bucket**
- Name: `coffee-photos`
- Public bucket: ✅ 有効化

#### APIキーをコピー:

**Settings > API**
- Project URL: `https://xxxxx.supabase.co`
- anon public key: `eyJhbGci...`

---

### ステップ3️⃣: AUTH_SECRETを生成

ターミナルで実行:

```bash
openssl rand -base64 32
```

出力された文字列をコピー（後で使用）

---

### ステップ4️⃣: Vercelでインポート

1. https://vercel.com/ にアクセス → "Continue with GitHub"
2. "Add New..." > "Project" をクリック
3. `Koh1002/coffee_claude` を選択 → "Import"

#### 環境変数を設定:

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `DATABASE_URL` | Supabaseの接続文字列 | All ✅ |
| `AUTH_SECRET` | ステップ3で生成 | All ✅ |
| `AUTH_URL` | `https://your-app.vercel.app`（仮） | Production ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabaseの Project URL | All ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabaseの anon key | All ✅ |

4. "Deploy" をクリック（3-5分待つ）

---

### ステップ5️⃣: AUTH_URLを更新

1. デプロイ完了後、本番URLをコピー（例: `https://coffee-claude.vercel.app`）
2. Vercel > Settings > Environment Variables
3. `AUTH_URL` を編集して実際のURLに更新
4. 保存（自動的に再デプロイ開始）

---

## ✅ 確認

本番URLにアクセス:
- サインアップページでユーザー登録
- ログインして各機能をテスト

---

## 🎉 デプロイ完了！

今後はコードをGitHubにプッシュするだけで自動デプロイされます。

```bash
git add .
git commit -m "Update"
git push origin main
```

---

## 📚 詳細ドキュメント

- **基本**: [GITHUB_PUSH_INSTRUCTIONS.md](./GITHUB_PUSH_INSTRUCTIONS.md)
- **詳細**: [VERCEL_DEPLOY_INSTRUCTIONS.md](./VERCEL_DEPLOY_INSTRUCTIONS.md)
- **完全版**: [DEPLOY.md](./DEPLOY.md)
- **ローカル開発**: [STARTUP.md](./STARTUP.md)

---

## 🆘 トラブルシューティング

### デプロイ失敗

1. Vercel > Logs でエラー確認
2. DATABASE_URLが正しいか確認
3. すべての環境変数が設定されているか確認

### 画像アップロード失敗

1. Supabaseで `coffee-photos` バケット確認
2. バケットが Public 設定か確認
3. Supabase APIキーが正しいか確認

---

**問題が解決しない場合**: [VERCEL_DEPLOY_INSTRUCTIONS.md](./VERCEL_DEPLOY_INSTRUCTIONS.md) のトラブルシューティングセクションを参照
