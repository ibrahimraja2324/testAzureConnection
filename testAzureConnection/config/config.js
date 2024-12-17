import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const config = {
  apiKeyMYOB: process.env.MYOB_API_KEY,
  apiSecretMYOB: process.env.MYOB_API_SECRET,
  redirectUriMYOB: process.env.MYOB_REDIRECT_URI,
  cfUriMYOB: process.env.MYOB_CF_URI,
  authorizationCodeMYOB: process.env.MYOB_AUTH_CODE,
  accessTokenExpiryTime: process.env.MYOB_TOKEN_EXPIRY_TIME,
  accessTokenMYOB: process.env.MYOB_ACCESS_TOKEN,
  refreshTokenMYOB: process.env.MYOB_REFRESH_TOKEN,
  refreshTokenExpiresTime: process.env.MYOB_REFRESH_TOKEN_EXPIRY,

  
  // our own api key config
  itTokenKey: process.env.IT_TOKEN_KEY,
};

export default config;
