// src/auth/token.js
const axios = require("axios");

// Environment-aware configuration
const ENV = process.env.PHONEPE_ENV;
const config = {
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
}[ENV];

// Construct OAuth URL dynamically
const OAUTH_URL = `${config.apiUrl}/v1/oauth/token`;

// ---- Internal state ----
let token = null;
let expiresAtMs = 0;
let inflight = null; // promise for deduplication

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
    // Don’t throw at module load; throw here with specifics.
    const msg =
      `[AUTH] Missing environment variables: ${missing.join(", ")}. ` +
      `Check your .env and process.env.`;
    // Log once for visibility
    console.error(msg);
    throw new Error(msg);
  }

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    client_version: CLIENT_VERSION,
    grant_type: GRANT_TYPE,
  });

  let res;
  try {
    res = await axios.post(OAUTH_URL, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 75_000,
      validateStatus: () => true, // we’ll inspect status manually
    });
  } catch (netErr) {
    // Network/timeout/DNS, etc.
    console.error("[AUTH] Network error requesting token:", netErr.message);
    throw new Error(`[AUTH] Network error requesting token: ${netErr.message}`);
  }

  if (!res || res.status < 200 || res.status >= 300) {
    const safeData = res && res.data ? JSON.stringify(res.data) : "<no body>";
    console.error(
      `[AUTH] Token endpoint non-2xx (${res && res.status}):`,
      safeData
    );
    throw new Error(
      `[AUTH] Token request failed with status ${
        res && res.status
      }. Body: ${safeData}`
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

  // Support either expires_at (epoch seconds) or expires_in (seconds)
  const now = Date.now();
  const expiresFromAt =
    typeof data.expires_at === "number" ? data.expires_at * 1000 : null;
  const expiresFromIn =
    typeof data.expires_in === "number" ? now + data.expires_in * 1000 : null;

  expiresAtMs = expiresFromAt ?? expiresFromIn ?? now + 15 * 60 * 1000; // default 15m
  token = accessToken;

  return token;
}

/**
 * Get a valid access token. Refreshes when missing/expired.
 * Concurrent callers share the same in-flight request.
 */
async function getToken() {
  if (isValid()) return token;
  if (inflight) return inflight;

  inflight = requestToken()
    .catch((err) => {
      // Reset cache on failure so next call can retry
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
  return { Authorization: `O-Bearer ${t}` }; // PhonePe expects 'Bearer', not 'O-Bearer'
}

// Export configuration for use in other files
module.exports = {
  getToken,
  getAuthHeader,
  config,
  OAUTH_URL,
  ENV,
};
