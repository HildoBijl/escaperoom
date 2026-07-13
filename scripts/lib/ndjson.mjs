/**
 * NDJSON (newline-delimited JSON) helpers.
 *
 * NDJSON = one JSON object per line, no wrapping array, no commas between
 * records. Lets us stream-read and append-write arbitrarily large datasets
 * without ever holding the full file in memory.
 */

import fs from "fs";
import readline from "readline";

/**
 * Stream a NDJSON file line by line, calling onDoc(doc) for each parsed doc.
 * Constant memory regardless of file size. Skips blank lines.
 * Returns silently if the file does not exist.
 */
export async function scanNdjson(filePath, onDoc) {
  if (!fs.existsSync(filePath)) return;

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  let lineNo = 0;
  for await (const line of rl) {
    lineNo++;
    if (!line) continue;
    let doc;
    try {
      doc = JSON.parse(line);
    } catch (err) {
      throw new Error(`Invalid NDJSON at ${filePath}:${lineNo}: ${err.message}`);
    }
    await onDoc(doc);
  }
}

/**
 * Read a NDJSON file fully into memory as an array.
 * Use only for small files — prefer scanNdjson for large ones.
 */
export async function readNdjsonAll(filePath) {
  const docs = [];
  await scanNdjson(filePath, (doc) => { docs.push(doc); });
  return docs;
}

/**
 * Append docs to a NDJSON file, one per line. Creates the file if missing.
 * Resolves when the write stream has flushed.
 */
export function appendNdjson(filePath, docs) {
  return new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(filePath, { flags: "a" });
    ws.on("error", reject);
    ws.on("finish", resolve);

    for (const doc of docs) {
      ws.write(JSON.stringify(doc) + "\n");
    }
    ws.end();
  });
}
