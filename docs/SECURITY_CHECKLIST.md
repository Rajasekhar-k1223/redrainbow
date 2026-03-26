# Security Testing Checklist (All OS Covered)

This checklist maps each OS to its best-use testing activities to ensure full coverage without gaps.

## Pre-Testing Rules
- Written authorization for all tests.
- Isolated lab network for high-risk activities.
- Snapshot all lab systems before tests.
- Log all actions and findings.

## Kali Linux (General Pentest)
- Network discovery and service enumeration.
- Default credential checks (authorized only).
- Common web vulnerabilities scan (OWASP Top 10).
- API enumeration and auth testing.

## Parrot OS (Lightweight Pentest + Privacy)
- Lightweight recon and quick scans.
- Privacy checks for app tracking and data leakage.
- Browser security checks for storage and cookies.

## BlackArch (Advanced Tool Coverage)
- Deep fuzzing of APIs and endpoints.
- Advanced exploitation validation.
- Edge-case and lesser-known tool checks.

## BackBox (Standard Pentest Workflow)
- Repeat baseline scans for consistency.
- Validate findings from other OSs.
- Run standard web pentest playbooks.

## Pentoo (Wireless and Live Tests)
- Wireless network exposure validation (lab only).
- Live boot testing in isolated environment.

## SECHub (Web App Security Focus)
- Session management validation.
- CSRF and CORS misconfiguration checks.
- Auth flow and access control testing.
- Input validation and output encoding tests.

## Security Onion (Blue Team Monitoring)
- Collect logs from API, DB, and infrastructure.
- Validate alert rules for suspicious behavior.
- Confirm SIEM visibility for auth and data events.

## CAINE (Forensics)
- Evidence collection and preservation.
- Chain-of-custody documentation.
- Disk and memory analysis of incidents.

## REMnux (Malware Analysis)
- Analyze suspicious files and scripts.
- Safe detonation for malware behavior.

## Tails (Privacy/Anonymity)
- Verify external tracking protections.
- Validate data exposure from anonymous sessions.

## Qubes OS (Isolation)
- Run high-risk tests in separated qubes.
- Validate separation and least-privilege tasks.

## Post-Testing
- Triage and rank vulnerabilities.
- Fix critical and high findings first.
- Retest and document closure.
- Update threat model and controls.
