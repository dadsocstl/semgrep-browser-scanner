// Browser SQLite using sql.js
let db;

export async function initDB() {
  if (db) return;
  const SQL = await initSqlJs({
    locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.10.0/dist/${file}`
  });
  db = new SQL.Database();
  db.run(`CREATE TABLE IF NOT EXISTS scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    findings TEXT,
    snippet TEXT
  )`);
}

export async function saveScan(scan) {
  if (!db) await initDB();
  db.run('INSERT INTO scans (timestamp, findings, snippet) VALUES (?, ?, ?)', 
    [scan.timestamp, JSON.stringify(scan.findings), scan.codeSnippet]);
}

export function loadHistory() {
  if (!db) return [];
  const res = db.exec('SELECT * FROM scans ORDER BY timestamp DESC LIMIT 10');
  return res[0] ? res[0].values : [];
}