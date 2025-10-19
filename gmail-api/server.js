const { google } = require('googleapis');
const fs = require('fs');
const { JSDOM } = require('jsdom'); 

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';

fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading credentials.json', err);
  authorize(JSON.parse(content));
});

function authorize(credentials) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    'http://localhost:3000/oauth2callback' // redirect URI
  );

  // If token exists, use it
  if (fs.existsSync(TOKEN_PATH)) {
    oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));
    listMessages(oAuth2Client);
  } else {
    getNewToken(oAuth2Client);
  }
}

function getNewToken(oAuth2Client) {
  const express = require('express');
  const app = express();

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Open this URL in your browser:', authUrl);

  app.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
    res.send('Authentication successful! You can close this tab.');
    server.close();
    listMessages(oAuth2Client);
  });

  const server = app.listen(3000, () => console.log('Listening on port 3000'));
}

// Text only
async function listMessages(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.messages.list({ userId: 'me', maxResults: 100 });
    const messages = res.data.messages;
    if (!messages || messages.length === 0) return console.log('No messages found.');
    const messagesWithDate = [];


    for (const msg of messages) {
    try {
        const msgRes = await gmail.users.messages.get({ userId: 'me', id: msg.id, format: 'full' });
        const message = msgRes.data;


        const decodeBase64 = (str) => Buffer.from(str, 'base64').toString('utf8');


        let htmlBody = '';


        if (!message.payload.parts) {
            if (message.payload.mimeType === 'text/html') {
            htmlBody = decodeBase64(message.payload.body.data || '');
            }
        } else {
            const part = message.payload.parts.find(p => p.mimeType === 'text/html');
            htmlBody = part ? decodeBase64(part.body.data) : '';
        }


        // Strip HTML tags using JSDOM
        let textBody = htmlBody ? new JSDOM(htmlBody).window.document.body.textContent : '';


        // Remove carriage returns, newlines, and multiple consecutive spaces
        textBody = textBody.replace(/\r|\n/g, '');
        textBody = textBody.replace(/\s{2,}/g, ' '); // replace big gaps with single space


        const date = parseInt(message.internalDate);
        messagesWithDate.push({ textBody, date });


        } catch (err) {
        console.log('Error getting message:', err);
        }
    }


    // Sort newest first
    messagesWithDate.sort((a, b) => b.date - a.date);


    // Print cleaned text bodies
    messagesWithDate.forEach(msg => {
    console.log(`\nDate: ${new Date(msg.date).toLocaleString()}`);
    console.log(`Body:\n${msg.textBody}`);
    });
}





// HTML and text
async function listMessages2(auth) {
const gmail = google.gmail({ version: 'v1', auth });
const res = await gmail.users.messages.list({ userId: 'me', maxResults: 10 });
const messages = res.data.messages;
if (!messages || messages.length === 0) return console.log('No messages found.');


const messagesWithDate = [];


for (const msg of messages) {
try {
    const msgRes = await gmail.users.messages.get({ userId: 'me', id: msg.id, format: 'full' });
    const message = msgRes.data;


    const decodeBase64 = (str) => Buffer.from(str, 'base64').toString('utf8');


    let htmlBody = '';
if (!message.payload.parts) {
if (message.payload.mimeType === 'text/html') {
htmlBody = decodeBase64(message.payload.body.data || '');
}
} else {
const part = message.payload.parts.find(p => p.mimeType === 'text/html');
htmlBody = part ? decodeBase64(part.body.data) : '';
}


const date = parseInt(message.internalDate);
messagesWithDate.push({ htmlBody, date });


} catch (err) {
console.log('Error getting message:', err);
}
}


// Sort newest first
messagesWithDate.sort((a, b) => b.date - a.date);


// Print full HTML bodies
messagesWithDate.forEach(msg => {
console.log(`\nDate: ${new Date(msg.date).toLocaleString()}`);
console.log(`HTML Body:\n${msg.htmlBody}`);
});
}