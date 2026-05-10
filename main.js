import { initDB, saveScan, loadHistory } from './db.js';
import { getAllRules } from './rules.js';

let parser;

async function init() {
  await TreeSitter.init();
  const pythonLang = await TreeSitter.Language.load('https://cdn.jsdelivr.net/npm/tree-sitter-wasms@0.1.13/tree-sitter-python.wasm');
  parser = new TreeSitter();
  parser.setLanguage(pythonLang);
  await initDB();
  renderHistory();
}

async function startScan() {
  const code = document.getElementById('codeInput').value.trim();
  if (!code) {
    alert('Please provide code to scan');
    return;
  }

  const tree = parser.parse(code);
  const findings = [];

  getAllRules().forEach(rule => {
    try {
      const query = parser.getLanguage().query(rule.query);
      const matches = query.matches(tree.rootNode);
      matches.forEach(m => {
        findings.push({
          id: rule.id,
          severity: rule.severity,
          message: rule.message,
          line: m.captures[0]?.node.startPosition.row + 1 || 1,
          fix: rule.fix
        });
      });
    } catch(e) {}
  });

  const scanResult = {
    timestamp: new Date().toISOString(),
    findings,
    codeSnippet: code.substring(0, 300)
  };

  await saveScan(scanResult);
  renderResults(scanResult);
  renderHistory();
}

function renderResults(scan) {
  let html = `<h2>Scan Results (${scan.findings.length} findings)</h2>`;
  if (scan.findings.length === 0) {
    html += '<p style="color:green">✅ No vulnerabilities detected in this scan.</p>';
  } else {
    html += '<table><tr><th>Severity</th><th>Rule</th><th>Line</th><th>Message</th><th>Fix</th></tr>';
    scan.findings.forEach(f => {
      html += `<tr>
        <td class="${f.severity.toLowerCase()}">${f.severity}</td>
        <td>${f.id}</td>
        <td>${f.line}</td>
        <td>${f.message}</td>
        <td>${f.fix}</td>
      </tr>`;
    });
    html += '</table>';
  }
  document.getElementById('results').innerHTML = html;
}

function renderHistory() {
  document.getElementById('history').innerHTML = '<p>Scan history stored locally in Browser SQLite.</p>';
}

window.onload = init;