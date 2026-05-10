export function getAllRules() {
  return [
    {
      id: 'cmd-injection',
      severity: 'HIGH',
      message: 'Potential Command Injection detected (os.system, subprocess with shell=True)',
      query: '(call_expression (identifier) @func (#match? @func "(system|exec|subprocess)") )',
      fix: 'Use subprocess.run with shell=False and input sanitization'
    },
    {
      id: 'xss',
      severity: 'HIGH',
      message: 'Potential Cross-Site Scripting (innerHTML, document.write)',
      query: '(assignment_expression left: (member_expression property: (property_identifier) @prop (#eq? @prop "innerHTML")))',
      fix: 'Use textContent or sanitize with DOMPurify'
    },
    {
      id: 'hardcoded-secret',
      severity: 'MEDIUM',
      message: 'Hardcoded credential or API key detected',
      query: '(string) @str (#match? @str "(password|api_key|secret|key=)")',
      fix: 'Use environment variables or secret manager'
    },
    {
      id: 'insecure-random',
      severity: 'MEDIUM',
      message: 'Use of insecure random (Math.random in crypto context)',
      query: '(call_expression (identifier) @f (#eq? @f "random"))',
      fix: 'Use crypto.getRandomValues() or secrets module'
    }
  ];
}