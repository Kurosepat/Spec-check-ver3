const { Octokit } = require("@octokit/rest");
const fetch = require('node-fetch');  // Webhook送信用

// 実際のトークンとWebhook URLを直接設定
const githubToken = "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";  // GitHubのAPIトークン
const webhookURL = "https://hook.us2.make.com/drj19p9mvkxe7bbvsh1ogprr3lmm5qlq";  // WebhookのURL

// GitHubのOctokitクライアントを設定
const octokit = new Octokit({ auth: githubToken });

// GitHub APIを使ってファイルをアップロードする処理
async function uploadToGitHub(file, path) {
  const buffer = await file.arrayBuffer();
  const base64Content = btoa(
    new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
  );

  await octokit.repos.createOrUpdateFileContents({
    owner: 'YourGitHubUsername',  // 自分のGitHubユーザー名に変更
    repo: 'YourRepoName',  // 自分のリポジトリ名に変更
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
  // ファイル取得部分（例えば、フォームから送信されたファイルを取得する場合）
  const docFile = document.getElementById("docFile").files[0];  // Wordファイル
  const pdfFile = document.getElementById("pdfFile").files[0];  // PDFファイル

  // ファイルのアップロード先パスを設定
  const docPath = `docs/${Date.now()}_${docFile.name}`;
  const pdfPath = `drawings/${Date.now()}_${pdfFile.name}`;

  // GitHubにファイルをアップロードしてURLを取得
  const docUrl = await uploadToGitHub(docFile, docPath);
  const figUrl = await uploadToGitHub(pdfFile, pdfPath);

  // Webhookを呼び出してAIチェックを開始
  await triggerWebhook(docUrl, figUrl);
}

main().catch(console.error);
