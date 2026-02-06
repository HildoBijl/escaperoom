#!/usr/bin/env node

/**
 * Fetch Telemetry Data
 *
 * Downloads all telemetry data from Firestore and saves to local JSON files.
 * Uses Firebase CLI credentials for authentication.
 *
 * Usage: node scripts/fetch-telemetry.mjs
 */

import https from "https";
import os from "os";
import fs from "fs";
import path from "path";

const PROJECT_ID = "vierkantescaperoom";
const DATA_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), "data");

const COLLECTIONS = [
  "telemetry-analytics",
  "telemetry-bug-reports",
  "telemetry-errors",
];

// Load Firebase CLI credentials
function getRefreshToken() {
  const configPath = path.join(os.homedir(), ".config/configstore/firebase-tools.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  return (config.tokens || config.user?.tokens).refresh_token;
}

// Exchange refresh token for access token
function getAccessToken(refreshToken) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
      client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
    }).toString();

    const req = https.request({
      hostname: "oauth2.googleapis.com",
      path: "/token",
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        const parsed = JSON.parse(data);
        if (parsed.access_token) resolve(parsed.access_token);
        else reject(new Error(parsed.error_description || "Failed to get token"));
      });
    });
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

// Fetch all documents from a Firestore collection (handles pagination)
function fetchCollection(token, collection) {
  return new Promise(async (resolve) => {
    let allDocs = [];
    let pageToken = null;

    do {
      const result = await new Promise((res) => {
        let urlPath = `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collection}?pageSize=300`;
        if (pageToken) urlPath += `&pageToken=${encodeURIComponent(pageToken)}`;

        const req = https.request({
          hostname: "firestore.googleapis.com",
          path: urlPath,
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }, (r) => {
          let data = "";
          r.on("data", (chunk) => data += chunk);
          r.on("end", () => res(JSON.parse(data)));
        });
        req.end();
      });

      if (result.error) {
        console.error(`Error fetching ${collection}:`, result.error.message);
        resolve(allDocs);
        return;
      }

      allDocs = allDocs.concat(result.documents || []);
      pageToken = result.nextPageToken;
    } while (pageToken);

    resolve(allDocs);
  });
}

// Convert Firestore document format to plain objects
function convertDoc(doc) {
  const id = doc.name.split("/").pop();
  const data = {};

  function convertValue(val) {
    if (val.stringValue !== undefined) return val.stringValue;
    if (val.integerValue !== undefined) return parseInt(val.integerValue);
    if (val.doubleValue !== undefined) return val.doubleValue;
    if (val.booleanValue !== undefined) return val.booleanValue;
    if (val.timestampValue !== undefined) return val.timestampValue;
    if (val.nullValue !== undefined) return null;
    if (val.arrayValue) {
      return (val.arrayValue.values || []).map(convertValue);
    }
    if (val.mapValue) {
      const obj = {};
      for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
        obj[k] = convertValue(v);
      }
      return obj;
    }
    return val;
  }

  for (const [key, val] of Object.entries(doc.fields || {})) {
    data[key] = convertValue(val);
  }

  return { id, ...data };
}

async function main() {
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  console.log("Fetching telemetry data from Firestore...\n");

  const token = await getAccessToken(getRefreshToken());

  for (const collection of COLLECTIONS) {
    process.stdout.write(`Fetching ${collection}... `);

    const docs = await fetchCollection(token, collection);
    const converted = docs.map(convertDoc);

    const filePath = path.join(DATA_DIR, `${collection}.json`);
    fs.writeFileSync(filePath, JSON.stringify(converted, null, 2));

    console.log(`${converted.length} documents → ${path.relative(process.cwd(), filePath)}`);
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
