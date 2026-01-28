# GitHubへのプッシュ手順

コードの準備は完了しています。以下の手順でGitHubにプッシュしてください。

## 方法1: Personal Access Tokenを使用（推奨）

### 1. GitHub Personal Access Tokenの作成

1. GitHubにログイン
2. Settings > Developer settings > Personal access tokens > Tokens (classic)
3. "Generate new token" > "Generate new token (classic)"
4. Note: `coffee-log-deploy`
5. Expiration: 適切な期間を選択
6. Scope: `repo`にチェック
7. "Generate token"をクリック
8. 表示されたトークンをコピー（後で確認できないので注意）

### 2. プッシュコマンド実行

ターミナルで以下を実行：

```bash
cd /home/kohkun1002/coffee-log-app
git push -u origin main
```

Username: あなたのGitHubユーザー名 (`Koh1002`)
Password: 先ほどコピーしたPersonal Access Token（パスワードではない）

---

## 方法2: GitHub CLIを使用

### 1. GitHub CLIのインストールと認証

```bash
# GitHub CLIのインストール（未インストールの場合）
# WSL2/Ubuntuの場合
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# 認証
gh auth login
```

### 2. プッシュコマンド実行

```bash
cd /home/kohkun1002/coffee-log-app
git push -u origin main
```

---

## 方法3: SSH鍵を使用

### 1. SSH鍵の生成（未作成の場合）

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
# Enterを3回押す（パスフレーズなし）
```

### 2. SSH鍵をGitHubに登録

```bash
cat ~/.ssh/id_ed25519.pub
# 表示された内容をコピー
```

1. GitHub > Settings > SSH and GPG keys > New SSH key
2. Title: `WSL2` など
3. Key: コピーした内容を貼り付け
4. "Add SSH key"をクリック

### 3. リモートURLをSSHに変更してプッシュ

```bash
cd /home/kohkun1002/coffee-log-app
git remote set-url origin git@github.com:Koh1002/coffee_claude.git
git push -u origin main
```

---

## トラブルシューティング

### エラー: "Repository not found"

- リポジトリが実際に存在するか確認: https://github.com/Koh1002/coffee_claude
- リポジトリが存在しない場合、GitHubで作成してください

### エラー: "Permission denied"

- Personal Access Tokenの権限を確認
- トークンが有効期限内か確認

---

## プッシュ完了後

プッシュが完了したら、Vercelでのデプロイに進みます。

次のドキュメント: **VERCEL_DEPLOY_INSTRUCTIONS.md**
