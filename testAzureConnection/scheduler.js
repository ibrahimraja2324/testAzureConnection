import schedule from 'node-schedule';
import open from 'open';
import config from './config/config.js';

export const scheduleReauthentication = (refreshTokenExpiresAt) => {
  const reauthTime = new Date(refreshTokenExpiresAt - 3 * 24 * 60 * 60 * 1000); 
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
