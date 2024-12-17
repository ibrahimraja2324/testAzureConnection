import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export const updateEnvVariable = (key, value) => {
  const envPath = path.resolve(__dirname, '../.env');  // Correct path to .env file
  console.log(`Path to .env file: ${envPath}`);  // Log the path

  if (!fs.existsSync(envPath)) {
    console.error(`.env file does not exist at path: ${envPath}`);
    throw new Error('.env file not found');
  }

  try {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    envConfig[key] = value;
    const newEnvConfig = Object.keys(envConfig)
      .map((k) => `${k}=${envConfig[k]}`)
      .join("\n");
    fs.writeFileSync(envPath, newEnvConfig);
  } catch (err) {
    console.error(`Error reading or writing to .env file: ${err.message}`);
    throw err;
  }
};
