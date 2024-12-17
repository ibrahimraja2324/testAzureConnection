import axios from 'axios';
import qs from 'qs';
import { updateEnvVariable } from '../utils/envUtils.js';
import config from '../config/config.js';
import { scheduleReauthentication } from '../scheduler.js'; // Import the function

export const startAuth = (req, res) => {
  const clientId = config.apiKeyMYOB;
  const redirectUri = config.redirectUriMYOB;
  const scope = "CompanyFile la.global";
  const authUrl = `https://secure.myob.com/oauth2/account/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  console.log("Redirecting to:", authUrl);
  res.redirect(authUrl);
};

export const getAuthCode = async (req, res) => {
  const authCode = req.query.code;
  if (authCode) {
    updateEnvVariable("MYOB_AUTH_CODE", authCode);
    await exchangeCodeForTokens(authCode, res);
  } else {
    res.status(400).send("Authorization code not found");
  }
};

export const exchangeCodeForTokens = async (authCode, res) => {
  try {
    console.log("Exchanging code for tokens...");
    const response = await axios.post(
      "https://secure.myob.com/oauth2/v1/authorize",
      qs.stringify({
        client_id: config.apiKeyMYOB,
        client_secret: config.apiSecretMYOB,
        scope: "CompanyFile",
        code: authCode,
        redirect_uri: config.redirectUriMYOB,
        grant_type: "authorization_code",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    
    console.log("Response Data:", response.data);
    const { access_token, refresh_token, expires_in } = response.data;
    
    const now = new Date();
    const expiresAt = now.getTime() + expires_in * 1000;
    const refreshTokenExpiresAt = now.getTime() + 7 * 24 * 60 * 60 * 1000;  // 10 minutes from now (for testing)

    updateEnvVariable("MYOB_ACCESS_TOKEN", access_token);
    updateEnvVariable("MYOB_REFRESH_TOKEN", refresh_token);
    updateEnvVariable("MYOB_TOKEN_EXPIRY_TIME", expiresAt);
    updateEnvVariable("MYOB_REFRESH_TOKEN_EXPIRY", refreshTokenExpiresAt);

    const payload = {
      access_token,
      refresh_token,
      expires_in: expires_in, 
      refresh_token_expires_in: 7 * 24 * 60 * 60
    };
    
    console.log("Payload being sent to /store-data:", payload);

    // Post tokens to another endpoint
    const postResponse = await axios.post(
      "http://localhost:3000/store-data",  // Replace with your actual endpoint
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': config.itTokenKey  // Using the itTokenKey for authorization
        }
      }
    );
    console.log("Post Response:", postResponse.data);

    res.json({
      message: "Tokens updated successfully",
      response_data: response.data
    });

    // Schedule reauthentication 2 minutes before refresh token expiry (for testing)
    scheduleReauthentication(refreshTokenExpiresAt);
  } catch (error) {
    console.error("Error exchanging code for tokens:", error.response?.data || error.message);
    res.status(500).send("Failed to exchange code for tokens");
  }
};
