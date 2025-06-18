const GITHUB_TOKEN = ''; // Token removed for security
const REPO_OWNER = 'lasrado-b';
const REPO_NAME = 'pet-wellness-tracker';
const FILE_PATH = 'charts/mendes_chart.png';
const BRANCH = 'main';

function exportChartToGitHub() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const chart = sheet.getSheets()[0].getCharts()[0]; 
  const blob = chart.getAs('image/png').setName('mendes_chart.png');
  const base64Content = Utilities.base64Encode(blob.getBytes());

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

  const shaResponse = UrlFetchApp.fetch(url, {
    method: 'get',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json'
    },
    muteHttpExceptions: true
  });

  let sha = null;
  if (shaResponse.getResponseCode() === 200) {
    const parsed = JSON.parse(shaResponse.getContentText());
    sha = parsed.sha;
  }

  const payload = {
    message: "Auto-update Mendes' weight chart",
    content: base64Content,
    branch: BRANCH,
    ...(sha && { sha }) // Only include SHA if it's defined
  };

  const options = {
    method: 'put',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  Logger.log(response.getContentText());
MailApp.sendEmail({
  to: Session.getActiveUser().getEmail(),
  subject: "Mendes Chart Updated on GitHub ✅",
  body: "Your pet wellness chart was successfully uploaded to GitHub. View it here:\n\nhttps://github.com/lasrado-b/pet-wellness-tracker/blob/main/charts/mendes_chart.png"
});}
