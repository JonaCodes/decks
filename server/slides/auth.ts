import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/presentations',
];

const DEFAULT_TOKEN_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../.google-slides-oauth-token.json'
);

interface OAuthClientConfig {
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
}

interface OAuthCredentialsFile {
  installed?: OAuthClientConfig;
  web?: OAuthClientConfig;
}

type StoredOAuthTokens = {
  refresh_token?: string | null;
  [key: string]: unknown;
};

async function loadOAuthClientConfig(): Promise<{
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tokenPath: string;
}> {
  const credentialsPath = process.env.GOOGLE_OAUTH_CLIENT_SECRET_PATH;

  if (!credentialsPath) {
    throw new Error(
      'GOOGLE_OAUTH_CLIENT_SECRET_PATH is required and must point to the OAuth client JSON downloaded from Google Cloud.'
    );
  }

  const raw = await fs.readFile(credentialsPath, 'utf8');
  const parsed = JSON.parse(raw) as OAuthCredentialsFile;
  const oauthConfig = parsed.installed ?? parsed.web;

  if (!oauthConfig) {
    throw new Error(
      `OAuth client file "${credentialsPath}" is missing an "installed" or "web" section.`
    );
  }

  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI ??
    oauthConfig.redirect_uris[0] ??
    'http://localhost';

  return {
    clientId: oauthConfig.client_id,
    clientSecret: oauthConfig.client_secret,
    redirectUri,
    tokenPath: process.env.GOOGLE_OAUTH_TOKEN_PATH ?? DEFAULT_TOKEN_PATH,
  };
}

async function loadSavedToken(
  tokenPath: string
): Promise<StoredOAuthTokens | null> {
  try {
    const raw = await fs.readFile(tokenPath, 'utf8');
    return JSON.parse(raw) as StoredOAuthTokens;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function saveToken(tokenPath: string, tokens: unknown): Promise<void> {
  await fs.mkdir(path.dirname(tokenPath), { recursive: true });
  await fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2));
}

function extractAuthorizationCode(inputValue: string): string {
  const trimmed = inputValue.trim();

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const parsed = new URL(trimmed);
    const code = parsed.searchParams.get('code');
    if (!code) {
      throw new Error(
        'The pasted callback URL did not contain a "code" query parameter.'
      );
    }
    return code;
  }

  return trimmed;
}

async function promptForAuthorizationCode(authUrl: string): Promise<string> {
  console.log('\nOpen this URL in your browser and approve access:\n');
  console.log(authUrl);
  console.log('');
  console.log(
    'After Google redirects you, paste either the full callback URL from the browser address bar or just the code.'
  );
  console.log('');

  const rl = createInterface({ input, output });
  try {
    return extractAuthorizationCode(
      await rl.question('Paste the authorization code here: ')
    );
  } finally {
    rl.close();
  }
}

async function getOAuthClient() {
  const { clientId, clientSecret, redirectUri, tokenPath } =
    await loadOAuthClientConfig();
  const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const savedToken = await loadSavedToken(tokenPath);
  if (savedToken) {
    auth.setCredentials(savedToken);
    return auth;
  }

  const authUrl = auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });

  const code = await promptForAuthorizationCode(authUrl);
  const { tokens } = await auth.getToken(code);

  if (!tokens.refresh_token) {
    throw new Error(
      'Google did not return a refresh token. Remove any existing app consent for this OAuth client and retry.'
    );
  }

  auth.setCredentials(tokens);
  await saveToken(tokenPath, tokens);
  return auth;
}

export async function getGoogleClients() {
  try {
    const auth = await getOAuthClient();

    const slides = google.slides({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });

    return { slides, drive };
  } catch (error) {
    throw new Error(
      `Failed to initialize Google API clients: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
