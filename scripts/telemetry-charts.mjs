#!/usr/bin/env node

/**
 * Telemetry Charts Report
 *
 * Generates a self-contained HTML report (Chart.js inlined) with all key
 * telemetry charts. Single file, opens in any browser, works offline,
 * shareable as an email attachment.
 *
 * Usage: node scripts/telemetry-charts.mjs
 * Output: scripts/output/telemetry-report-YYYY-MM-DD.html
 */

import fs from "fs";
import path from "path";
import { aggregate, dayLabel } from "./lib/telemetry-aggregate.mjs";

const __dirname = import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(__dirname, "data");
const OUTPUT_DIR = path.join(__dirname, "output");
const CHART_JS_PATH = path.join(PROJECT_ROOT, "node_modules", "chart.js", "dist", "chart.umd.min.js");
const START_DATE = "2026-02-02";

const fmt = (n) => n.toLocaleString("nl-NL");
const pct = (n, total) => total === 0 ? "0%" : ((n / total) * 100).toFixed(0) + "%";

// Escape so user-supplied strings (wrong answers, urls) are safe in HTML and JS.
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}

// JSON.stringify is safe to embed in <script>, except for </script> sequences and
// line/paragraph separators that JS treats as line terminators.
function safeJson(obj) {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function chartBlock({ id, title, subtitle, height = 320, init }) {
  return `
  <section class="chart-block">
    <h2>${escapeHtml(title)}</h2>
    ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle)}</p>` : ""}
    <div class="chart-wrap" style="height:${height}px"><canvas id="${id}"></canvas></div>
  </section>
  <script>(function(){${init}})();</script>`;
}

function buildHtml(a) {
  const chartJs = fs.readFileSync(CHART_JS_PATH, "utf8");
  const generatedOn = new Date().toISOString().slice(0, 10);

  // Common color palette
  const COLOR = {
    blue: "#3b82f6",
    green: "#10b981",
    amber: "#f59e0b",
    red: "#ef4444",
    purple: "#8b5cf6",
    cyan: "#06b6d4",
    pink: "#ec4899",
    slate: "#64748b",
  };

  // 1. Sessies per dag (totaal + v1 + v2)
  const dayLabels = a.allDays.map(d => dayLabel(d));
  const sessionsTotal = a.allDays.map(d => a.sessionsByDay[d] || 0);
  const sessionsV1 = a.allDays.map(d => a.sessionsByDayV1[d] || 0);
  const sessionsV2 = a.allDays.map(d => a.sessionsByDayV2[d] || 0);

  const chart1 = chartBlock({
    id: "sessions-per-day",
    title: "Sessies per dag",
    subtitle: `Totaal ${fmt(a.sessions.length)} unieke sessies (${fmt(a.v1Sessions.length)} v1 + ${fmt(a.v2Sessions.length)} v2)`,
    height: 360,
    init: `new Chart(document.getElementById("sessions-per-day"), {
      type: "line",
      data: {
        labels: ${safeJson(dayLabels)},
        datasets: [
          { label: "Totaal", data: ${safeJson(sessionsTotal)}, borderColor: "${COLOR.blue}", backgroundColor: "${COLOR.blue}33", tension: 0.2 },
          { label: "v1", data: ${safeJson(sessionsV1)}, borderColor: "${COLOR.slate}", backgroundColor: "${COLOR.slate}22", tension: 0.2 },
          { label: "v2", data: ${safeJson(sessionsV2)}, borderColor: "${COLOR.green}", backgroundColor: "${COLOR.green}22", tension: 0.2 },
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });`,
  });

  // 2. Per puzzel: starts/completes/abandons/fails (grouped bar)
  const puzzleKeys = [...new Set([
    ...Object.keys(a.puzzleStarts),
    ...Object.keys(a.puzzleCompletions),
    ...Object.keys(a.puzzleAbandons),
  ])].sort((x, y) => (a.puzzleStarts[y] || 0) - (a.puzzleStarts[x] || 0));

  const chart2 = chartBlock({
    id: "per-puzzle",
    title: "Per puzzel: gestart / voltooid / verlaten / foute pogingen",
    subtitle: `${fmt(a.totals.puzzleStarts)} gestart, ${fmt(a.totals.puzzleCompletes)} voltooid, ${fmt(a.totals.abandons)} verlaten (v2), ${fmt(a.totals.attemptFails)} foute pogingen (v2)`,
    height: 420,
    init: `new Chart(document.getElementById("per-puzzle"), {
      type: "bar",
      data: {
        labels: ${safeJson(puzzleKeys)},
        datasets: [
          { label: "Gestart", data: ${safeJson(puzzleKeys.map(k => a.puzzleStarts[k] || 0))}, backgroundColor: "${COLOR.blue}" },
          { label: "Voltooid", data: ${safeJson(puzzleKeys.map(k => a.puzzleCompletions[k] || 0))}, backgroundColor: "${COLOR.green}" },
          { label: "Verlaten", data: ${safeJson(puzzleKeys.map(k => a.puzzleAbandons[k] || 0))}, backgroundColor: "${COLOR.amber}" },
          { label: "Foute pogingen", data: ${safeJson(puzzleKeys.map(k => a.puzzleAttemptFails[k] || 0))}, backgroundColor: "${COLOR.red}" },
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });`,
  });

  // 3. Funnel — alle sessies (horizontal bar)
  const funnelAllLabels = a.funnelAll.map(([label]) => label);
  const funnelAllData = a.funnelAll.map(([, n]) => n);
  const funnelAllPct = a.funnelAll.map(([, n]) => pct(n, a.funnelAll[0][1]));
  const chart3 = chartBlock({
    id: "funnel-all",
    title: "Funnel — alle sessies (v1 + v2)",
    subtitle: `Van ${fmt(a.sessions.length)} bezoekers tot ${fmt(a.prizeDocs.length)} prijsinzendingen`,
    height: 320,
    init: `new Chart(document.getElementById("funnel-all"), {
      type: "bar",
      data: {
        labels: ${safeJson(funnelAllLabels)},
        datasets: [{ label: "Sessies", data: ${safeJson(funnelAllData)}, backgroundColor: "${COLOR.blue}" }]
      },
      options: {
        indexAxis: "y", responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: {
          callbacks: { label: (ctx) => ctx.parsed.x.toLocaleString("nl-NL") + " (" + ${safeJson(funnelAllPct)}[ctx.dataIndex] + ")" }
        } },
        scales: { x: { beginAtZero: true } }
      }
    });`,
  });

  // 4. Funnel — v2 only
  let chart4 = "";
  if (a.funnelV2) {
    const funnelV2Labels = a.funnelV2.map(([label]) => label);
    const funnelV2Data = a.funnelV2.map(([, n]) => n);
    const funnelV2Pct = a.funnelV2.map(([, n]) => pct(n, a.funnelV2[0][1]));
    chart4 = chartBlock({
      id: "funnel-v2",
      title: "Funnel — alleen v2-sessies",
      subtitle: `Sinds v2 deploy. Van ${fmt(a.v2Sessions.length)} bezoekers.`,
      height: 320,
      init: `new Chart(document.getElementById("funnel-v2"), {
        type: "bar",
        data: {
          labels: ${safeJson(funnelV2Labels)},
          datasets: [{ label: "Sessies", data: ${safeJson(funnelV2Data)}, backgroundColor: "${COLOR.green}" }]
        },
        options: {
          indexAxis: "y", responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: {
            callbacks: { label: (ctx) => ctx.parsed.x.toLocaleString("nl-NL") + " (" + ${safeJson(funnelV2Pct)}[ctx.dataIndex] + ")" }
          } },
          scales: { x: { beginAtZero: true } }
        }
      });`,
    });
  }

  // 5. Leaderboard + prijzen per dag
  const leaderboardSeries = a.allDays.map(d => a.leaderboardByDay[d] || 0);
  const prizesSeries = a.allDays.map(d => a.prizesByDay[d] || 0);
  const chart5 = chartBlock({
    id: "leaderboard-prizes-day",
    title: "Leaderboard + prijsinzendingen per dag",
    subtitle: `${fmt(a.leaderboardDocs.length)} leaderboard-inzendingen, ${fmt(a.prizeDocs.length)} prijsinzendingen`,
    height: 360,
    init: `new Chart(document.getElementById("leaderboard-prizes-day"), {
      type: "line",
      data: {
        labels: ${safeJson(dayLabels)},
        datasets: [
          { label: "Leaderboard", data: ${safeJson(leaderboardSeries)}, borderColor: "${COLOR.purple}", backgroundColor: "${COLOR.purple}22", tension: 0.2 },
          { label: "Prijzen", data: ${safeJson(prizesSeries)}, borderColor: "${COLOR.pink}", backgroundColor: "${COLOR.pink}22", tension: 0.2 },
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });`,
  });

  // 6. Kampvoorkeur (donut)
  const campLabels = Object.keys(a.campPref);
  const campData = Object.values(a.campPref);
  const chart6 = campLabels.length === 0 ? "" : chartBlock({
    id: "camp-pref",
    title: "Kampvoorkeur (prijsinzendingen)",
    subtitle: `${fmt(a.prizeDocs.length)} totaal`,
    height: 340,
    init: `new Chart(document.getElementById("camp-pref"), {
      type: "doughnut",
      data: {
        labels: ${safeJson(campLabels)},
        datasets: [{ data: ${safeJson(campData)}, backgroundColor: ["${COLOR.blue}", "${COLOR.green}", "${COLOR.amber}", "${COLOR.purple}", "${COLOR.cyan}", "${COLOR.pink}"] }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });`,
  });

  // 7. Groepsverdeling
  const groupEntries = Object.entries(a.groups).sort((x, y) => Number(x[0]) - Number(y[0]));
  const groupLabels = groupEntries.map(([k]) => `gr. ${k}`);
  const groupData = groupEntries.map(([, v]) => v);
  const chart7 = groupLabels.length === 0 ? "" : chartBlock({
    id: "groups",
    title: "Groepsverdeling (prijsinzendingen)",
    subtitle: `${fmt(a.prizeDocs.length)} totaal`,
    height: 320,
    init: `new Chart(document.getElementById("groups"), {
      type: "bar",
      data: {
        labels: ${safeJson(groupLabels)},
        datasets: [{ label: "Aantal", data: ${safeJson(groupData)}, backgroundColor: "${COLOR.cyan}" }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });`,
  });

  // 8. Cumulatief over tijd — sessies + game_completes
  let cumSessions = 0, cumCompletes = 0;
  const cumSessionsSeries = a.allDays.map(d => (cumSessions += (a.sessionsByDay[d] || 0)));
  const cumCompletesSeries = a.allDays.map(d => (cumCompletes += (a.gameCompletesByDay[d] || 0)));
  const chart8 = chartBlock({
    id: "cumulative",
    title: "Cumulatief over tijd",
    subtitle: `${fmt(a.sessions.length)} sessies en ${fmt(a.totals.gameCompletes)} game-voltooiingen totaal`,
    height: 360,
    init: `new Chart(document.getElementById("cumulative"), {
      type: "line",
      data: {
        labels: ${safeJson(dayLabels)},
        datasets: [
          { label: "Sessies (cumulatief)", data: ${safeJson(cumSessionsSeries)}, borderColor: "${COLOR.blue}", backgroundColor: "${COLOR.blue}22", tension: 0.1, fill: true },
          { label: "Game voltooid (cumulatief)", data: ${safeJson(cumCompletesSeries)}, borderColor: "${COLOR.green}", backgroundColor: "${COLOR.green}22", tension: 0.1, fill: true },
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });`,
  });

  const overviewRows = [
    ["Unieke sessies", `${fmt(a.sessions.length)} (${fmt(a.v1Sessions.length)} v1 + ${fmt(a.v2Sessions.length)} v2)`],
    ["Unieke spelers (v2)", fmt(a.playerIds.size)],
    ["Games gestart (v2)", fmt(a.totals.gameStarts)],
    ["Puzzels gestart", fmt(a.totals.puzzleStarts)],
    ["Puzzels voltooid", fmt(a.totals.puzzleCompletes)],
    ["Foute pogingen (v2)", fmt(a.totals.attemptFails)],
    ["Puzzels verlaten (v2)", fmt(a.totals.abandons)],
    ["Spellen voltooid", fmt(a.totals.gameCompletes)],
    ["Leaderboard inzendingen", fmt(a.leaderboardDocs.length)],
    ["Prijsinzendingen", fmt(a.prizeDocs.length)],
    ["Errors gelogd", fmt(a.errorDocs.length)],
  ];

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<title>Telemetrie-rapport — Escape Vierkant — ${generatedOn}</title>
<script>${chartJs}</script>
<style>
  body { font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; background: #f8fafc; color: #1e293b; }
  .container { max-width: 1100px; margin: 0 auto; }
  header { background: white; padding: 24px 28px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
  header h1 { margin: 0 0 4px; font-size: 22px; }
  header .meta { color: #64748b; font-size: 13px; }
  .overview { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin-top: 18px; }
  .overview .cell { background: #f1f5f9; padding: 10px 14px; border-radius: 6px; }
  .overview .cell .label { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: .5px; }
  .overview .cell .value { font-size: 18px; font-weight: 600; margin-top: 2px; }
  .chart-block { background: white; padding: 20px 24px; border-radius: 8px; margin-bottom: 18px; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
  .chart-block h2 { margin: 0 0 4px; font-size: 17px; }
  .chart-block .subtitle { color: #64748b; font-size: 13px; margin: 0 0 14px; }
  .chart-wrap { position: relative; }
  .versions { background: #fefce8; border-left: 4px solid #eab308; padding: 14px 18px; border-radius: 6px; margin-bottom: 18px; }
  .versions summary { cursor: pointer; font-weight: 600; color: #713f12; }
  .versions[open] summary { margin-bottom: 8px; }
  .versions p { margin: 8px 0; font-size: 14px; color: #422006; }
  .versions ul { margin: 6px 0 8px 18px; font-size: 14px; color: #422006; }
  .versions li { margin: 2px 0; }
  footer { color: #94a3b8; font-size: 12px; text-align: center; margin: 20px 0 8px; }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>Telemetrie-rapport — Escape Vierkant</h1>
    <div class="meta">Gegenereerd op ${generatedOn} · data sinds ${START_DATE} · ${fmt(a.rawCount)} documents → ${fmt(a.sessions.length)} unieke sessies</div>
    <div class="overview">
      ${overviewRows.map(([k, v]) => `<div class="cell"><div class="label">${escapeHtml(k)}</div><div class="value">${escapeHtml(v)}</div></div>`).join("")}
    </div>
  </header>

  <details class="versions" open>
    <summary>Wat is een sessie? En wat is v1 vs v2? (klik om in te klappen)</summary>
    <p>Op <strong>9 februari 2026</strong> is de telemetrie uitgebreid. <strong>v1</strong> = sessies van vóór die datum; <strong>v2</strong> = sessies vanaf die datum.</p>
    <p><strong>Wat is een sessie?</strong> Een sessie (v1 én v2) telt zodra iemand de site laadt en het spel in de browser opstart — dus al vóórdat ze de Start-knop zien of erop klikken. Iemand die alleen even op de homepage kwam en de tab weer sloot, telt dus óók als sessie. Eén persoon die de site twee keer bezoekt (apart, niet hervatten via dezelfde tab) telt als twee sessies. v2 heeft daarnaast een aparte <code>game_start</code>-event voor "op Start geklikt", waarmee je lurkers van echte spelers kunt onderscheiden — v1 heeft die scheiding niet.</p>
    <p><em>Kleine nuance voor v1:</em> als iemand de tab heel snel sloot konden de events soms verloren gaan voordat ze naar de server gestuurd waren. v2 heeft een opvangbuffer in localStorage die dat repareert. Mogelijk telt v1 dus net iets minder ultra-kort-bezoekers dan v2.</p>
    <p><strong>Wat klopt in v1</strong> (zelfde logica als v2): sessies/dag, puzzels gestart, puzzels voltooid, game voltooid, leaderboard, prijzen. Die kun je gewoon v1 + v2 bij elkaar optellen.</p>
    <p><strong>Wat ontbreekt in v1</strong> (de "(alleen v2)" rijen — voor v1 hebben we deze data simpelweg niet):</p>
    <ul>
      <li><strong>Unieke spelers</strong> — v1 had geen <code>playerId</code>. We weten alleen aantallen sessies, niet hoeveel verschillende personen.</li>
      <li><strong>Games gestart</strong> — v1 logde geen klik op Start/Hervatten. We kunnen voor v1 dus geen lurkers van echte spelers onderscheiden; alleen indirect afleidbaar uit sessies met ≥ 1 <code>puzzle_start</code>.</li>
      <li><strong>Foute pogingen, puzzels verlaten, info-tabs, externe links, substeps</strong> — niet gelogd in v1.</li>
    </ul>
    <p>Belangrijk: "0" voor v1 in deze rijen betekent dus <em>niet</em> "0 in werkelijkheid", maar "v1 hield dit niet bij". De v1-sessies bevatten een onbekend aandeel lurkers die nooit op Start klikten.</p>
    <p><strong>Is v2 te vertrouwen?</strong> Ja, met twee kanttekeningen: (1) "Unieke spelers" telt unieke browsers/apparaten — iemand op laptop én telefoon, of iemand die cookies wiste, telt meerdere keren (lichte <strong>overschatting</strong> van unieke personen). (2) Tussen 9 feb en 27 mrt 2026 was er een bug waardoor <code>puzzle_complete</code> bij een nieuw spel binnen dezelfde sessie soms niet vuurde — voltooiingen in die periode zijn een lichte <strong>onderschatting</strong>. Vanaf 27 mrt opgelost.</p>
  </details>

  ${chart1}
  ${chart8}
  ${chart2}
  ${chart3}
  ${chart4}
  ${chart5}
  ${chart6}
  ${chart7}

  <footer>Self-contained rapport · open in browser · "Print → PDF" om als PDF te delen</footer>
</div>
</body>
</html>`;
}

async function main() {
  if (!fs.existsSync(CHART_JS_PATH)) {
    console.error(`Chart.js niet gevonden op ${CHART_JS_PATH} — run 'npm install' in de project root.`);
    process.exit(1);
  }

  const a = await aggregate({ dataDir: DATA_DIR, startDate: START_DATE });
  const html = buildHtml(a);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `telemetry-report-${new Date().toISOString().slice(0, 10)}.html`);
  fs.writeFileSync(outPath, html, "utf8");

  const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(0);
  console.log(`Rapport gegenereerd: ${outPath} (${sizeKb} KB)`);
  console.log(`  Open in browser, of stuur het bestand door.`);
}

main().catch((err) => {
  console.error("\nError:", err.stack || err.message);
  process.exit(1);
});
