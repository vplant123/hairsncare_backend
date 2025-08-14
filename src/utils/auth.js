// src/auth/token.js
const axios = require("axios");

const OAUTH_URL =
  "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";

// ---- Internal state ----
let token = null;
let expiresAtMs = 0;
let inflight = null; // promise for deduplication

// Consider token "about to expire" if <60s remain
const isValid = () => token && Date.now() < expiresAtMs - 60_000;

function readEnv() {
  const { CLIENT_ID, CLIENT_SECRET, CLIENT_VERSION, GRANT_TYPE } = process.env;

  const missing = [];
  if (!CLIENT_ID) missing.push("CLIENT_ID");
  if (!CLIENT_SECRET) missing.push("CLIENT_SECRET");
  if (!CLIENT_VERSION) missing.push("CLIENT_VERSION");
  if (!GRANT_TYPE) missing.push("GRANT_TYPE");

  return {
    CLIENT_ID,
    CLIENT_SECRET,
    CLIENT_VERSION,
    GRANT_TYPE,
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
  return { Authorization: `O-Bearer ${t}` }; // <-- FIXED
}

module.exports = { getToken, getAuthHeader };
