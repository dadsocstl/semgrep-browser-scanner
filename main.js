// Main scanner logic
let parser;

async function init() {
  await TreeSitter.init();
  const pythonLang = await TreeSitter.Language.load('https://cdn.jsdelivr.net/npm/tree-sitter-wasms@0.1.13/tree-sitter-python.wasm');
  parser = new TreeSitter();
  parser.setLanguage(pythonLang);
  renderHistory();
}

async function startScan() {
  const code = document.getElementById('codeInput').value.trim();
  if (!code) { alert('Please paste some code'); return; }

  const tree = parser.parse(code);
  const findings = [];

  const rules = [
    { severity: 'HIGH', message: 'Potential Command Injection (os.system / exec)', pattern: /os\.system|subprocess\.call.*shell=True|exec\(/i },
    { severity: 'HIGH', message: 'Potential XSS (innerHTML)', pattern: /\.innerHTML|document\.write/i },
    { severity: 'MEDIUM', message: 'Hardcoded Secret', pattern: /password|api_key|secret.*=\s*['"].*['"]/i }
  ];

  rules.forEach(rule => {
    const matches = [...code.matchAll(rule.pattern)];
    matches.forEach((m, idx) => {
      const line = (code.substring(0, m.index).match(/\n/g) || []).length + 1;
      findings.push({severity: rule.severity, message: rule.message, line: line, snippet: m[0].substring(0,80)});
    });
  });

  const result = {
    timestamp: new Date().toISOString(),
    findings,
    snippet: code.substring(0, 200)
  };

  saveScan(result);
  renderResults(result);
  renderHistory();
}

function renderResults(result) {
  let html = `<h2>Scan Results (${result.findings.length} findings)</h2>`;
  result.findings.forEach(f => {
    html += `
      <div class="finding ${f.severity}">
        <strong>${f.severity}</strong> Line ${f.line}: ${f.message}<br>
        <small>${f.snippet}</small>
      </div>`;
  });
  if (result.findings.length === 0) html += '<p style="color:#4ade80;">✅ No high-risk issues detected in this scan.</p>';
  document.getElementById('results').innerHTML = html;
}

function saveScan(scan) {
  let history = JSON.parse(localStorage.getItem('cyberScans') || '[]');
  history.unshift(scan);
  localStorage.setItem('cyberScans', JSON.stringify(history.slice(0, 10)));
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('cyberScans') || '[]');
  let html = '<h3>Recent Scans (local only)</h3>';
  history.forEach((s, i) => {
    html += `<p>${new Date(s.timestamp).toLocaleString()} — ${s.findings.length} findings</p>`;
  });
  document.getElementById('history').innerHTML = html;
}

window.onload = init;