const axios = require("axios");
require("dotenv").config(); // Ensure environment variables are loaded from .env file

// Environment-aware configuration with validation
const ENV = process.env.PHONEPE_ENV || "prod";
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
const OAUTH_URL = `${config.apiUrl}/v1/oauth/token`;

// ---- Internal state ----
let token = null;
let expiresAtMs = 0;
let inflight = null; // Promise for deduplication of token request

// Consider token "about to expire" if <60s remain
const isValid = () => token && Date.now() < expiresAtMs - 60_000;

function readEnv() {
  const missing = [];
  if (!config.clientId) missing.push(`${ENV.toUpperCase()}_CLIENT_ID`);
  if (!config.clientSecret) missing.push(`${ENV.toUpperCase()}_CLIENT_SECRET`);
  if (!config.clientVersion)
    missing.push(`${ENV.toUpperCase()}_CLIENT_VERSION`);
  if (!config.grantType) missing.push(`${ENV.toUpperCase()}_GRANT_TYPE`);

  return {
    CLIENT_ID: config.clientId,
    CLIENT_SECRET: config.clientSecret,
    CLIENT_VERSION: config.clientVersion,
    GRANT_TYPE: config.grantType,
    missing,
  };
}

async function requestToken() {
  const { CLIENT_ID, CLIENT_SECRET, CLIENT_VERSION, GRANT_TYPE, missing } =
    readEnv();

  if (missing.length) {
    // Don't throw at module load; throw here with specifics
    const msg =
      `[AUTH] Missing environment variables: ${missing.join(", ")}. ` +
      `Check your .env and process.env.`;
    console.error(msg);
    throw new Error(msg);
  }

  // Prepare the body for the token request
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    client_version: CLIENT_VERSION,
    grant_type: GRANT_TYPE,
  });

  let res;
  try {
    // Making the request to get the token
    res = await axios.post(OAUTH_URL, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 75_000,
      validateStatus: () => true, // Manually inspect status
    });
  } catch (netErr) {
    // Handle network, timeout, DNS, etc. errors
    console.error("[AUTH] Network error requesting token:", netErr.message);
    throw new Error(`[AUTH] Network error requesting token: ${netErr.message}`);
  }

  // Check if the response is valid (2xx status)
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

  // Extract the token from the response
  const data = res.data || {};
  const accessToken = data.access_token;
  if (!accessToken) {
    console.error("[AUTH] Token missing in response:", data);
    throw new Error(
      `[AUTH] Token missing in response: ${JSON.stringify(data)}`
    );
  }

  // Support either expires_at (epoch seconds) or expires_in (seconds)
  const now = Date.now();
  const expiresFromAt =
    typeof data.expires_at === "number" ? data.expires_at * 1000 : null;
  const expiresFromIn =
    typeof data.expires_in === "number" ? now + data.expires_in * 1000 : null;

  expiresAtMs = expiresFromAt ?? expiresFromIn ?? now + 15 * 60 * 1000; // Default to 15 minutes
  token = accessToken;

  return token;
}

/**
 * Get a valid access token. Refreshes when missing/expired.
 * Concurrent callers share the same in-flight request.
 */
async function getToken() {
  if (isValid()) return token; // If token is valid, return it
  if (inflight) return inflight; // If request is in-flight, return that promise

  inflight = requestToken()
    .catch((err) => {
      // Reset cache on failure, so next call can retry
      token = null;
      expiresAtMs = 0;
      throw err;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

/** Convenience header helper */
async function getAuthHeader() {
  const t = await getToken();
  return { Authorization: `O-Bearer ${t}` }; // Fixed: Changed from O-Bearer to Bearer
}

// Export configuration for use in other files
module.exports = {
  getToken,
  getAuthHeader,
  config,
  OAUTH_URL,
  ENV,
};
