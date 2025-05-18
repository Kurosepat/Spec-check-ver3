const { Octokit } = require("@octokit/rest");
const fetch = require('node-fetch');  // Webhook送信用

// 環境変数からSecretsを取得
const githubToken = process.env.GITHUB_TOKEN;  // GitHubのAPIトークン
const webhookURL = process.env.WEBHOOK_URL;  // WebhookのURL

// GitHubのOctokitクライアントを設定
const octokit = new Octokit({ auth: githubToken });

// GitHub APIを使ってファイルをアップロードする処理
async function uploadToGitHub(file, path) {
  const buffer = await file.arrayBuffer();
  const base64Content = btoa(
    new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
  );

  await octokit.repos.createOrUpdateFileContents({
    owner: 'YourGitHubUsername',  // 自分のGitHubユーザー名
    repo: 'YourRepoName',  // 自分のリポジトリ名
    path,  // アップロードするファイルのパス
    message: `Upload ${path}`,
    content: base64Content,  // Base64エンコードされたファイルコンテンツ
    branch: 'main',  // 使用するブランチ
  });

  return `https://raw.githubusercontent.com/${'YourGitHubUsername'}/${'YourRepoName'}/main/${path}`;
}

// Webhookを呼び出してAIチェックを開始する処理
async function triggerWebhook(docUrl, figUrl) {
  const response = await fetch(webhookURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ docUrl, figUrl })
  });

  if (!response.ok) {
    console.error('Webhook call failed');
  }
}

// 使用例
async function main() {
  // 実際のファイルとパスはリポジトリ内のファイルから取得する必要があります
  const docFile = ...;  // Wordファイル
  const pdfFile = ...;  // PDFファイル

  const docPath = `docs/${Date.now()}_${docFile.name}`;
  const pdfPath = `drawings/${Date.now()}_${pdfFile.name}`;

  const docUrl = await uploadToGitHub(docFile, docPath);
  const figUrl = await uploadToGitHub(pdfFile, pdfPath);

  await triggerWebhook(docUrl, figUrl);
}

main().catch(console.error);
