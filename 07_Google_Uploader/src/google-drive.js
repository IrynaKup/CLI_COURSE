import { google } from 'googleapis';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import open from 'open';
import http from 'http';
import url from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const CREDENTIALS_PATH = path.join(__dirname, 'config', 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'config', 'token.json');

async function loadCredentials() {
  try {
    const credentialsFile = await fs.readFile(CREDENTIALS_PATH);
    return JSON.parse(credentialsFile);
  } catch (error) {
    throw new Error('Не удалось загрузить credentials.json. Убедитесь, что файл существует в папке config/');
  }
}

function createOAuth2Client(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  return new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0] || 'http://localhost:3000/oauth2callback'
  );
}

async function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file']
  });

  console.log(chalk.yellow('\n🔑 Открываем браузер для авторизации...'));
  await open(authUrl);

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const queryParams = url.parse(req.url, true).query;
        const code = queryParams.code;

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h1>Авторизация успешна! Можете закрыть это окно.</h1>');
          
          const { tokens } = await oAuth2Client.getToken(code);
          oAuth2Client.setCredentials(tokens);
          
          await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
          
          server.close();
          resolve(oAuth2Client);
        }
      } catch (error) {
        reject(error);
      }
    }).listen(3000, () => {
      console.log(chalk.gray('Ожидание авторизации...'));
    });
  });
}

export async function authenticate() {
  const credentials = await loadCredentials();
  const oAuth2Client = createOAuth2Client(credentials);

  try {
    const token = await fs.readFile(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    
    const expiryDate = oAuth2Client.credentials.expiry_date;
    if (expiryDate && expiryDate < Date.now()) {
      console.log(chalk.yellow('🔄 Токен истек, обновляем...'));
      
      if (oAuth2Client.credentials.refresh_token) {
        const { credentials: newCredentials } = await oAuth2Client.refreshAccessToken();
        oAuth2Client.setCredentials(newCredentials);
        await fs.writeFile(TOKEN_PATH, JSON.stringify(newCredentials));
      } else {
        return await getAccessToken(oAuth2Client);
      }
    }
    
    return oAuth2Client;
  } catch (error) {
    return await getAccessToken(oAuth2Client);
  }
}
export async function uploadToGoogleDrive(auth, filePath, fileName) {
  const drive = google.drive({ version: 'v3', auth });
  
  let folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  
  if (!folderId) {
    const folderMetadata = {
      name: 'Google Uploader',
      mimeType: 'application/vnd.google-apps.folder'
    };
    
    const folder = await drive.files.create({
      resource: folderMetadata,
      fields: 'id'
    });
    
    folderId = folder.data.id;
    console.log(chalk.gray(`Создана папка с ID: ${folderId}`));
  }

  const fileMetadata = {
    name: fileName,
    parents: [folderId]
  };

  const media = {
    mimeType: 'image/jpeg',
    body: fs.createReadStream(filePath)
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, name, size, webViewLink'
  });

  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone'
    }
  });

  return response.data;
}