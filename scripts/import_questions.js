#!/usr/bin/env node
/* ════════════════════════════════════════════
   import_questions.js — BRAIN CLASH (one-shot)
   Lit questions/brain_clash_questions_all.csv
   Écrit dans Firebase :
     /questions/{themeSlug}/{difficulty}/[array]
     /questions/_themes/[ { slug, name } ]
   Usage : node scripts/import_questions.js
   ════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// ── Config Firebase (URL prise depuis js/firebase.js) ──
const FB = "https://quiz-buzz-3-default-rtdb.europe-west1.firebasedatabase.app";

// ── Chemin du CSV (relatif à la racine projet) ──
const CSV_PATH = path.resolve(__dirname, "..", "questions", "brain_clash_questions_all.csv");

// ── Difficultés acceptées ──
const VALID_DIFF = new Set(["Facile", "Intermédiaire", "Expert"]);
const VALID_LETTER = new Set(["A", "B", "C", "D"]);

// ─────────────────────────────────────────────
// Parser CSV minimal (gère guillemets et "" échappés)
// Retourne un tableau de lignes, chaque ligne = tableau de champs
function parseCSV(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // strip BOM
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === "\r") { /* skip */ }
      else field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

// ─────────────────────────────────────────────
// "Cinéma & Films" → "cinema_films"
function slugify(s) {
  return s
    .normalize("NFD").replace(/[̀-ͯ]/g, "") // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, " ") // non-alpha → space
    .trim()
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
}

// ─────────────────────────────────────────────
// Firebase REST helpers
async function fbGet(p) {
  const r = await fetch(`${FB}/${p}.json`);
  if (!r.ok) throw new Error(`GET ${p} → ${r.status}`);
  return await r.json();
}
async function fbPut(p, data) {
  const r = await fetch(`${FB}/${p}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`PUT ${p} → ${r.status} ${await r.text()}`);
}

// ─────────────────────────────────────────────
// stdin yes/no
function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question(question, (a) => { rl.close(); res(/^y(es)?$/i.test(a.trim())); }));
}

// ─────────────────────────────────────────────
async function main() {
  // 1. Lire CSV
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV introuvable : ${CSV_PATH}`);
    process.exit(1);
  }
  const text = fs.readFileSync(CSV_PATH, "utf8");
  const rows = parseCSV(text);
  if (rows.length < 2) { console.error("CSV vide"); process.exit(1); }

  // 2. Header check
  const header = rows[0].map((h) => h.trim());
  const expected = ["Thème", "Difficulté question", "Questions", "A", "B", "C", "D", "Réponse"];
  for (let i = 0; i < expected.length; i++) {
    if (header[i] !== expected[i]) {
      console.error(`Header inattendu colonne ${i + 1}: "${header[i]}" (attendu "${expected[i]}")`);
      process.exit(1);
    }
  }

  // 3. Construire la structure groupée
  const grouped = {};   // grouped[slug][difficulty] = [ {question, answers, correct} ]
  const themeNames = {}; // slug → nom original
  let skipped = 0;

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (r.length === 1 && r[0].trim() === "") continue; // ligne vide
    if (r.length < 8) { skipped++; continue; }

    const themeName = r[0].trim();
    const difficulty = r[1].trim();
    const question = r[2].trim();
    const A = r[3].trim();
    const B = r[4].trim();
    const C = r[5].trim();
    const D = r[6].trim();
    const correct = r[7].trim().toUpperCase();

    if (!themeName || !VALID_DIFF.has(difficulty) || !question) { skipped++; continue; }
    if (!VALID_LETTER.has(correct)) { skipped++; continue; }
    if (!A || !B || !C || !D) { skipped++; continue; }

    const slug = slugify(themeName);
    if (!slug) { skipped++; continue; }

    themeNames[slug] = themeName;
    if (!grouped[slug]) grouped[slug] = { Facile: [], Intermédiaire: [], Expert: [] };
    grouped[slug][difficulty].push({
      theme: themeName,
      difficulty,
      question,
      answers: { A, B, C, D },
      correct,
    });
  }

  // 4. Construire la payload finale
  const payload = {};
  const themeIndex = [];
  const slugs = Object.keys(grouped).sort();
  for (const slug of slugs) {
    payload[slug] = grouped[slug];
    themeIndex.push({ slug, name: themeNames[slug] });
  }
  payload._themes = themeIndex;

  const dryRun = process.argv.includes("--dry-run");

  // 5. Vérifier si /questions existe déjà
  if (!dryRun) {
    let exists = false;
    try {
      const existing = await fbGet("questions");
      exists = existing !== null && existing !== undefined;
    } catch (e) {
      console.error("Erreur lecture Firebase :", e.message);
      process.exit(1);
    }

    if (exists) {
      const ok = await confirm("⚠️  /questions existe déjà dans Firebase. Écraser ? (yes/no) ");
      if (!ok) { console.log("Annulé."); process.exit(0); }
    }

    // 6. Écrire en une seule PUT (remplace tout /questions)
    console.log(`\nÉcriture dans Firebase (${FB}/questions)…`);
    await fbPut("questions", payload);
  } else {
    console.log("\n[--dry-run] Pas d'écriture Firebase.");
  }

  // 7. Stats
  console.log("\n═══════════════════════════════════════════════");
  console.log(`✅ Import terminé`);
  console.log(`Thèmes importés : ${slugs.length}`);
  if (skipped > 0) console.log(`Lignes ignorées (mal formées) : ${skipped}`);
  console.log("───────────────────────────────────────────────");
  let total = 0;
  for (const slug of slugs) {
    const g = grouped[slug];
    const f = g.Facile.length, i = g.Intermédiaire.length, e = g.Expert.length;
    const sub = f + i + e;
    total += sub;
    console.log(`${themeNames[slug].padEnd(32)} ${String(sub).padStart(4)}  (F:${f}  I:${i}  E:${e})`);
  }
  console.log("───────────────────────────────────────────────");
  console.log(`TOTAL                            ${String(total).padStart(4)}`);
  console.log("═══════════════════════════════════════════════\n");
}

main().catch((e) => { console.error(e); process.exit(1); });
