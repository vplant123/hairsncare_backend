const axios = require("axios");
require("dotenv").config(); // Ensure environment variables are loaded from .env file

// Environment-aware configuration with validation
const ENV = process.env.PHONEPE_ENV;
console.log("[AUTH] Environment:", ENV);

if (!["sandbox", "prod"].includes(ENV)) {
  throw new Error(
    `[AUTH] Invalid PHONEPE_ENV: ${ENV}. Must be 'sandbox' or 'prod'`
  );
}

// Configuration object for both sandbox and production environments
const envConfig = {
  sandbox: {
    apiUrl: process.env.SANDBOX_API_URL,
    clientId: process.env.SANDBOX_CLIENT_ID,
    clientSecret: process.env.SANDBOX_CLIENT_SECRET,
    clientVersion: process.env.SANDBOX_CLIENT_VERSION,
    grantType: process.env.SANDBOX_GRANT_TYPE,
  },
  prod: {
    apiUrl: process.env.PROD_API_URL,
    clientId: process.env.PROD_CLIENT_ID,
    clientSecret: process.env.PROD_CLIENT_SECRET,
    clientVersion: process.env.PROD_CLIENT_VERSION,
    grantType: process.env.PROD_GRANT_TYPE,
  },
};

// Selecting the correct config based on the environment

const config = envConfig[ENV];
console.log("[AUTH] Using config for environment:", config);

if (!config || !config.apiUrl) {
  throw new Error(`[AUTH] Missing configuration for environment: ${ENV}`);
}

// Construct OAuth URL dynamically based on selected environment

// const OAUTH_URL = `${config.apiUrl}/v1/oauth/token`;
const OAUTH_URL =
  "https://api.phonepe.com/apis/identity-manager/v1/oauth/token";
console.log("[AUTH] Using OAuth URL:", OAUTH_URL);

// ---- Internal state ----
let token = null;
let expiresAtMs = 0;
let inflight = null; // Promise for deduplication of token request

// Consider token "about to expire" if <60s remain
const isValid = () => token && Date.now() < expiresAtMs - 60_000;

function readEnv() {
  console.log("[AUTH] Reading environment variables...");
  const missing = [];
  if (!config.clientId) missing.push(`${ENV.toUpperCase()}_CLIENT_ID`);
  if (!config.clientSecret) missing.push(`${ENV.toUpperCase()}_CLIENT_SECRET`);
  if (!config.apiUrl) missing.push(`${ENV.toUpperCase()}_API_URL`);
  if (!config.clientVersion)
    missing.push(`${ENV.toUpperCase()}_CLIENT_VERSION`);
  if (!config.grantType) missing.push(`${ENV.toUpperCase()}_GRANT_TYPE`);

  const envVars = {
    CLIENT_ID: config.clientId,
    CLIENT_SECRET: config.clientSecret,
    CLIENT_VERSION: config.clientVersion,
    GRANT_TYPE: config.grantType,
    API_URL: config.apiUrl,
    missing,
  };

  console.log(
    "[AUTH] Environment variables read:",
    JSON.stringify(
      {
        ...envVars,
      },
      null,
      2
    )
  );

  return envVars;
}

async function requestToken() {
  console.log("[AUTH] Starting token request...");
  const {
    CLIENT_ID,
    CLIENT_SECRET,
    CLIENT_VERSION,
    GRANT_TYPE,
    API_URL,
    missing,
  } = readEnv();

  if (missing.length) {
    const msg = `[AUTH] Missing environment variables: ${missing.join(
      ", "
    )}. Check your .env and process.env.`;
    console.error(msg);
    throw new Error(msg);
  }

  console.log("[AUTH] Preparing request body...");
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    client_version: CLIENT_VERSION,
    grant_type: GRANT_TYPE,
  });

  let res;
  try {
    console.log("[AUTH] Sending POST request to:", OAUTH_URL);
    res = await axios.post(OAUTH_URL, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 75_000,
      validateStatus: () => true,
    });
    console.log("[AUTH] Received response with status:", res.status);
  } catch (netErr) {
    console.error("[AUTH] Network error details:", {
      message: netErr.message,
      code: netErr.code,
      stack: netErr.stack,
    });
    throw new Error(`[AUTH] Network error requesting token: ${netErr.message}`);
  }

  if (!res || res.status < 200 || res.status >= 300) {
    const safeData = res && res.data ? JSON.stringify(res.data) : "<no body>";
    console.error(
      `[AUTH] Token endpoint non-2xx (${res && res.status}):`,
      safeData
    );
    throw new Error(
      `[AUTH] Token request failed with status ${res.status}. Body: ${safeData}`
    );
  }

  const data = res.data || {};
  const accessToken = data.access_token;
  if (!accessToken) {
    console.error("[AUTH] Token missing in response:", data);
    throw new Error(
      `[AUTH] Token missing in response: ${JSON.stringify(data)}`
    );
  }

  const now = Date.now();
  const expiresFromAt =
    typeof data.expires_at === "number" ? data.expires_at * 1000 : null;
  const expiresFromIn =
    typeof data.expires_in === "number" ? now + data.expires_in * 1000 : null;

  expiresAtMs = expiresFromAt ?? expiresFromIn ?? now + 15 * 60 * 1000;
  token = accessToken;

  console.log("[AUTH] Token successfully obtained");
  console.log("[AUTH] Token expiration:", new Date(expiresAtMs).toISOString());

  return token;
}

/**
 * Get a valid access token. Refreshes when missing/expired.
 * Concurrent callers share the same in-flight request.
 */
async function getToken() {
  console.log("[AUTH] getToken called");

  if (isValid()) {
    console.log("[AUTH] Using cached valid token");
    return token;
  }

  if (inflight) {
    console.log("[AUTH] Using in-flight token request");
    return inflight;
  }

  console.log("[AUTH] Initiating new token request");
  inflight = requestToken()
    .catch((err) => {
      console.error("[AUTH] Token request failed:", err.message);
      token = null;
      expiresAtMs = 0;
      throw err;
    })
    .finally(() => {
      console.log("[AUTH] Token request completed");
      inflight = null;
    });

  return inflight;
}

/** Convenience header helper */
async function getAuthHeader() {
  console.log("[AUTH] Getting authorization header");
  const t = await getToken();
  const header = { Authorization: `O-Bearer ${t}` };
  console.log("[AUTH] Authorization header created");
  return header;
}

// Export configuration for use in other files
module.exports = {
  getToken,
  getAuthHeader,
  config,
  OAUTH_URL,
  ENV,
};
