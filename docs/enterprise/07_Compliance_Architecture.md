# RedRainbow Compliance & Evidence Architecture

## 1. Compliance Framework Mapping
RedRainbow automatically maps technical security findings to global compliance frameworks.

- **Supported Frameworks:** ISO 27001, SOC 2, HIPAA, PCI DSS, NIST CSF, CIS Controls.
- **Mapping Engine:** When a finding is generated (e.g., "Port 22 Open to 0.0.0.0/0"), the `Compliance Service` cross-references it against the `compliance_mappings` database.
  - *Example:* Maps to SOC 2 CC6.6, PCI DSS Req 1.2.1, ISO 27001 A.13.1.1.
- **Compliance Scoring:** The platform calculates a real-time compliance score (0-100%) for each framework based on the number of open, mapped findings.

## 2. Evidence Vault
The Evidence Vault is critical for audits and digital forensics. It guarantees the integrity of security data.

### Storage Architecture
- **Backend:** S3-compatible object storage (AWS S3, MinIO) with Object Lock (WORM - Write Once Read Many) enabled.
- **Stored Artifacts:**
  - Raw Scan JSON/XML
  - PCAP Files
  - Memory Dumps
  - Quarantined Malware Samples
  - SentinelX AI Reports
  - End-of-month Compliance PDF Reports

### Integrity & Chain of Custody
- **Hash Verification:** Every file uploaded to the Vault is hashed (SHA-256). The hash is stored in the MySQL `audit_records` table and MongoDB `evidence_metadata`.
- **Immutable Storage:** Retention policies strictly enforce that evidence cannot be deleted or modified until the retention period (e.g., 7 years) expires.
- **Audit Trails:** Any access (download/view) of evidence is logged in the SIEM for non-repudiation.
