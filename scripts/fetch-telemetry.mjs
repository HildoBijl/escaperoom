#!/usr/bin/env node

/**
 * Fetch Telemetry Data (Incremental)
 *
 * Downloads telemetry data from Firestore and saves to local JSON files.
 * On subsequent runs, only fetches new documents (since last fetch).
 * Uses Firebase CLI credentials for authentication.
 *
 * Usage: node scripts/fetch-telemetry.mjs
 */

import https from "https";
import os from "os";
import fs from "fs";
import path from "path";
import { scanNdjson, appendNdjson } from "./lib/ndjson.mjs";

const PROJECT_ID = "vierkantescaperoom";
const __dirname = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
const DATA_DIR = path.join(__dirname, "data");
const PAGE_SIZE = 300;

const COLLECTIONS = [
  "telemetry-analytics",
  "telemetry-bug-reports",
  "telemetry-errors",
  "leaderbord-kamp-a",
  "prizes-kamp-a",
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
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) resolve(parsed.access_token);
          else reject(new Error(parsed.error_description || "Failed to get token"));
        } catch (err) {
          reject(new Error(`Failed to parse OAuth response: ${err.message}`));
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("OAuth token request timeout after 30s")));
    req.write(postData);
    req.end();
  });
}

// POST a structured query to the Firestore runQuery endpoint
function postRunQuery(token, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const req = https.request({
      hostname: "firestore.googleapis.com",
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error("Failed to parse Firestore response")); }
      });
    });
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("Firestore runQuery timeout after 30s")));
    req.write(postData);
    req.end();
  });
}

// Fetch documents from a collection, optionally only newer than sinceTimestamp
async function fetchCollection(token, collectionId, sinceTimestamp) {
  let allDocs = [];
  let cursor = null;

  do {
    const sq = {
      from: [{ collectionId }],
      orderBy: [
        { field: { fieldPath: "createdAt" }, direction: "ASCENDING" },
        { field: { fieldPath: "__name__" }, direction: "ASCENDING" },
      ],
      limit: PAGE_SIZE,
    };

    if (sinceTimestamp) {
      sq.where = {
        fieldFilter: {
          field: { fieldPath: "createdAt" },
          op: "GREATER_THAN_OR_EQUAL",
          value: { timestampValue: sinceTimestamp },
        },
      };
    }

    if (cursor) {
      sq.startAt = { values: cursor, before: false };
    }

    const results = await postRunQuery(token, { structuredQuery: sq });

    if (!Array.isArray(results)) {
      const msg = results?.error?.message || "Unknown Firestore error";
      throw new Error(`Query failed for ${collectionId}: ${msg}`);
    }

    const docs = results.filter(r => r.document).map(r => r.document);
    if (docs.length === 0) break;

    allDocs = allDocs.concat(docs);
    if (docs.length < PAGE_SIZE) break;

    // Cursor for next page: last doc's createdAt + document path
    const lastDoc = docs[docs.length - 1];
    cursor = [
      { timestampValue: lastDoc.fields?.createdAt?.timestampValue },
      { referenceValue: lastDoc.name },
    ];
  } while (true);

  return allDocs;
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

// Stream an existing NDJSON file and return the set of known ids + the latest
// createdAt timestamp. Constant memory regardless of file size.
async function scanExistingState(filePath) {
  const ids = new Set();
  let latestCreatedAt = null;
  await scanNdjson(filePath, (doc) => {
    if (doc.id) ids.add(doc.id);
    if (doc.createdAt && (!latestCreatedAt || doc.createdAt > latestCreatedAt)) {
      latestCreatedAt = doc.createdAt;
    }
  });
  return { ids, latestCreatedAt };
}

async function main() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  console.log("Fetching telemetry data from Firestore...\n");

  const token = await getAccessToken(getRefreshToken());

  for (const collection of COLLECTIONS) {
    const filePath = path.join(DATA_DIR, `${collection}.ndjson`);

    const t0 = Date.now();
    process.stdout.write(`${collection}: scanning existing... `);
    const { ids, latestCreatedAt } = await scanExistingState(filePath);
    process.stdout.write(`${ids.size} docs in ${Date.now() - t0}ms; `);

    process.stdout.write(latestCreatedAt ? `since ${latestCreatedAt.slice(0, 19)}; ` : `full fetch; `);

    const t1 = Date.now();
    process.stdout.write(`fetching... `);
    const newDocs = await fetchCollection(token, collection, latestCreatedAt);
    process.stdout.write(`got ${newDocs.length} in ${Date.now() - t1}ms; `);

    // Convert and filter out ids we already have
    const toAppend = [];
    for (const raw of newDocs) {
      const doc = convertDoc(raw);
      if (!ids.has(doc.id)) toAppend.push(doc);
    }

    const t2 = Date.now();
    process.stdout.write(`appending... `);
    if (toAppend.length > 0) {
      await appendNdjson(filePath, toAppend);
    }
    process.stdout.write(`done in ${Date.now() - t2}ms; `);

    console.log(`+${toAppend.length} new (${ids.size + toAppend.length} total)`);
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("\nError:", err.stack || err.message);
  process.exit(1);
});
