#!/usr/bin/env node

/**
 * Export prize entries to CSV
 *
 * Reads local prizes-kamp-a.json (fetched by fetch-telemetry.mjs) and
 * writes a CSV file that can be opened in Excel / Google Sheets.
 *
 * Usage:
 *   node scripts/fetch-telemetry.mjs   # refresh data first
 *   node scripts/export-prizes.mjs     # generate CSV
 */

import fs from "fs";
import path from "path";

const __dirname = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
const DATA_DIR = path.join(__dirname, "data");
const INPUT = path.join(DATA_DIR, "prizes-kamp-a.json");
const OUTPUT = path.join(DATA_DIR, "prijzen-overzicht.csv");

// Column definitions: [jsonKey, csvHeader]
const COLUMNS = [
  ["firstName", "Voornaam"],
  ["lastName", "Achternaam"],
  ["gender", "Geslacht"],
  ["birthdate", "Geboortedatum"],
  ["age", "Leeftijd"],
  ["groupText", "Groep"],
  ["school", "School"],
  ["address", "Adres"],
  ["postcode", "Postcode"],
  ["city", "Plaats"],
  ["email", "E-mail"],
  ["phone", "Telefoon"],
  ["parentsPhone", "Telefoon ouders"],
  ["campPreference", "Kampvoorkeur"],
  ["beenBefore", "Eerder geweest"],
  ["createdAt", "Ingevuld op"],
];

function formatValue(key, value) {
  if (value === null || value === undefined) return "";
  if (key === "beenBefore") return value ? "Ja" : "Nee";
  if (key === "campPreference") {
    if (value === "geen") return "Geen voorkeur";
    return `Kamp ${value}`;
  }
  if (key === "birthdate") {
    // YYYY-MM-DD → DD-MM-YYYY
    const [y, m, d] = String(value).split("-");
    return `${d}-${m}-${y}`;
  }
  if (key === "createdAt") {
    const dt = new Date(value);
    return dt.toLocaleString("nl-NL", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }
  return String(value);
}

function escapeCsv(value) {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes(";")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// --- Main ---

if (!fs.existsSync(INPUT)) {
  console.error("Geen data gevonden. Draai eerst: node scripts/fetch-telemetry.mjs");
  process.exit(1);
}

const entries = JSON.parse(fs.readFileSync(INPUT, "utf8"));

// Sort by createdAt (oldest first)
entries.sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));

// BOM for Excel UTF-8 recognition + semicolon separator (Excel NL default)
const SEP = ";";
const BOM = "\uFEFF";

const header = COLUMNS.map(([, label]) => label).join(SEP);
const rows = entries.map((entry) =>
  COLUMNS.map(([key, _]) => escapeCsv(formatValue(key, entry[key]))).join(SEP)
);

const csv = BOM + [header, ...rows].join("\n") + "\n";
fs.writeFileSync(OUTPUT, csv, "utf8");

console.log(`${entries.length} inzendingen geschreven naar ${path.relative(process.cwd(), OUTPUT)}`);
