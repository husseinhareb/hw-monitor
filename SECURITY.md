# Security Policy

## Supported Versions

Only the latest release on the `main` branch receives security fixes.

| Version | Supported |
|---------|-----------|
| Latest (`main`) | ✅ |
| Older releases  | ❌ |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities privately by emailing the maintainer or using [GitHub's private vulnerability reporting](https://github.com/husseinhareb/hw-monitor/security/advisories/new).

Please include:
- A description of the vulnerability and its potential impact
- Steps to reproduce
- Any relevant logs or screenshots

You can expect an acknowledgement within **72 hours** and a fix or mitigation plan within **14 days** for critical issues.

## Scope

hw-monitor is a local desktop application that reads hardware metrics from `/proc` and `/sys`. It does **not** expose any network services or accept remote input. The primary security concerns are:

- Local privilege escalation via Tauri IPC commands
- Unsafe handling of data read from `/proc/<pid>/` (process injection via process names)
- Config file injection

## Out of Scope

- Issues requiring physical access to the machine
- Vulnerabilities in third-party dependencies (report those upstream)
