import express from 'express';
import open from 'open';
import config from './config/config.js';
import schedule from 'node-schedule';
import dotenv from 'dotenv';
import { startAuth, getAuthCode } from './controllers/authController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Scheduling function
const scheduleReauthentication = (refreshTokenExpiresAt) => {
  const reauthTime = new Date(refreshTokenExpiresAt - 2 * 60 * 1000); // 2 minutes before expiry (for testing)
  console.log(`Reauthentication scheduled for: ${reauthTime}`);

  schedule.scheduleJob(reauthTime, () => {
    console.log("Time to reauthenticate");

    // Initiate the reauthentication process
    const clientId = config.apiKeyMYOB;
    const redirectUri = config.redirectUriMYOB;
    const scope = "CompanyFile la.global";
    const authUrl = `https://secure.myob.com/oauth2/account/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

    console.log("Opening the browser to:", authUrl);
    open(authUrl).catch(console.error);
  });
};

// Check token validity and reauthenticate if needed
const checkAndReauthenticate = () => {
  const now = new Date().getTime();
  const refreshTokenExpiresAt = parseInt(process.env.MYOB_REFRESH_TOKEN_EXPIRY, 10);
  
  if (!refreshTokenExpiresAt || now > refreshTokenExpiresAt) {
    console.log("Refresh token expired or invalid, starting authentication process...");
    const clientId = config.apiKeyMYOB;
    const redirectUri = config.redirectUriMYOB;
    const scope = "CompanyFile la.global";
    const authUrl = `https://secure.myob.com/oauth2/account/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

    console.log("Opening the browser to:", authUrl);
    open(authUrl).catch(console.error);
  } else if (now > refreshTokenExpiresAt - 2 * 60 * 1000) { // 2 minutes before expiry (for testing)
    // If within 2 minutes of expiry (for testing)
    scheduleReauthentication(refreshTokenExpiresAt);
  } else {
    // Regular schedule
    scheduleReauthentication(refreshTokenExpiresAt);
  }
};

checkAndReauthenticate();

app.get('/auth/start', startAuth);
app.get('/callback', getAuthCode);

app.listen(PORT, async () => {
  console.log(`Auth server running on port ${PORT}`);
  
  const clientId = config.apiKeyMYOB;
  const redirectUri = config.redirectUriMYOB;
  const scope = "CompanyFile la.global";
  const authUrl = `https://secure.myob.com/oauth2/account/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  
  console.log("Opening the browser to:", authUrl);
  await open(authUrl);
});
