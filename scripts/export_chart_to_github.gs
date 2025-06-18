const GITHUB_TOKEN = ''; // Token removed for security
const REPO_OWNER = 'lasrado-b';
const REPO_NAME = 'pet-wellness-tracker';
const FILE_PATH = 'charts/mendes_chart.png';
const BRANCH = 'main';

function exportChartToGitHub() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const chart = sheet.getSheets()[0].getCharts()[0];
    const blob = chart.getAs('image/png').setName('mendes_chart.png');
    const base64Content = Utilities.base64Encode(blob.getBytes());

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

    // Get current file SHA
    const shaResponse = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
      muteHttpExceptions: true,
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
      ...(sha && { sha }),
    };

    const options = {
      method: 'put',
      contentType: 'application/json',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const response = UrlFetchApp.fetch(url, options);
    Logger.log(response.getContentText());

    // Success Email
    MailApp.sendEmail({
      to: Session.getActiveUser().getEmail(),
      subject: "Mendes Chart Successfully Uploaded",
      body: "Your pet wellness chart was successfully pushed to GitHub.\n\nView it here:\nhttps://github.com/lasrado-b/pet-wellness-tracker/blob/main/charts/mendes_chart.png"
    });

  } catch (error) {
    // Error Alert
    MailApp.sendEmail({
      to: Session.getActiveUser().getEmail(),
      subject: "Error Uploading Mendes Chart",
      body: `Something went wrong during the GitHub upload:\n\n${error.message || error.toString()}\n\nPlease check the script execution log for details.`
    });
    throw error; // Re-throw so it's visible in execution log
  }
}
