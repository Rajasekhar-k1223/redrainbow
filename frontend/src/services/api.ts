import { getAuthHeaders } from './auth';

export const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// We mock a tenant ID for demonstration purposes
export const TENANT_ID = 'tenant-1234-5678';

export const fetchIncidents = async () => {
  const response = await fetch(`${API_BASE_URL}/incidents`, {
    headers: {
      'x-tenant-id': TENANT_ID,
      ...getAuthHeaders(),
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch incidents');
  }
  
  return response.json();
};

export const fetchAssets = async () => {
  const response = await fetch(`${API_BASE_URL}/assets`, {
    headers: {
      'x-tenant-id': TENANT_ID,
      ...getAuthHeaders(),
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch assets');
  }
  
  return response.json();
};

export const fetchPlaybooks = async () => {
  const response = await fetch(`${API_BASE_URL}/soar/playbooks`, {
    headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to fetch playbooks');
  return response.json();
};

export const executePlaybook = async (playbookId: string) => {
  const response = await fetch(`${API_BASE_URL}/soar/execute/${playbookId}`, {
    method: 'POST',
    headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to execute playbook');
  return response.json();
};

export const triggerScan = async (assetId: string) => {
  const response = await fetch(`${API_BASE_URL}/orchestrator/scan/${assetId}`, {
    method: 'POST',
    headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to trigger scan');
  return response.json();
};

export const generateRemediation = async (incidentId: string) => {
  const response = await fetch(`${API_BASE_URL}/incidents/${incidentId}/remediation`, {
    method: 'POST',
    headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to generate remediation plan');
  return response.json();
};

export const fetchAuditLogs = async () => {
  const response = await fetch(`${API_BASE_URL}/audit/`, {
    headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to fetch audit logs');
  return response.json();
};

// --- Domain Security ---
export const scanDomain = async (assetId: string) => {
  const response = await fetch(`${API_BASE_URL}/assets/${assetId}/scan-domain`, {
    method: 'POST',
    headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to trigger domain scan');
  return response.json();
};

// --- Web Security ---
export const scanWeb = async (assetId: string) => {
  const response = await fetch(`${API_BASE_URL}/assets/${assetId}/scan-web`, {
    method: 'POST',
    headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to trigger web scan');
  return response.json();
};

// --- Server Security ---
export const scanServer = async (assetId: string) => {
  const response = await fetch(`${API_BASE_URL}/assets/${assetId}/scan-server`, {
    method: 'POST',
    headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to trigger server scan');
  return response.json();
};

// --- Container Security ---
export const scanContainer = async (assetId: string) => {
  const response = await fetch(`${API_BASE_URL}/assets/${assetId}/scan-container`, {
    method: 'POST',
    headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to trigger container scan');
  return response.json();
};

// --- Cloud Security ---
export const scanCloud = async (assetId: string) => {
  const response = await fetch(`${API_BASE_URL}/assets/${assetId}/scan-cloud`, {
    method: 'POST',
    headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to trigger cloud scan');
  return response.json();
};

// --- Monitorix ---
export const fetchFleetStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/monitorix/fleet`, {
    headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to fetch fleet status');
  return response.json();
};

// --- SIEM ---
export const fetchSiemLogs = async (severity?: string) => {
  const url = severity 
    ? `${API_BASE_URL}/siem/logs?limit=200&severity=${severity}`
    : `${API_BASE_URL}/siem/logs?limit=200`;
  const response = await fetch(url, {
    headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to fetch siem logs');
  return response.json();
};

// --- Evidence Vault ---
export const fetchEvidence = async () => {
  const response = await fetch(`${API_BASE_URL}/evidence`, {
    headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to fetch evidence');
  return response.json();
};

export const uploadEvidence = async (file: File, title: string, type: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('evidence_type', type);

  const response = await fetch(`${API_BASE_URL}/evidence/upload`, {
    method: 'POST',
    headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() },
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to upload evidence');
  return response.json();
};

export const downloadEvidenceUrl = (id: string) => {
  // Since we require headers for auth in a real app, returning a direct URL for <a> tags 
  // is tricky if auth is strictly via headers. But since this MVP uses local dev and 
  // maybe loose CORS, we can return the URL and let the browser hit it. If strict header auth 
  // is needed, you'd fetch blob and create object URL. For simplicity in demo:
  return `${API_BASE_URL}/evidence/${id}/download?tenant=${TENANT_ID}`; // Assuming the API might need to be tweaked or browser sends cookies
};

// --- MFA ---
export const setupMfa = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/mfa/setup`, {
    headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to setup MFA');
  return response.json();
};

export const verifyMfa = async (secret: string, mfaCode: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/mfa/verify`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-tenant-id': TENANT_ID, 
      ...getAuthHeaders() 
    },
    body: JSON.stringify({ secret, mfa_code: mfaCode }),
  });
  if (!response.ok) throw new Error('Failed to verify MFA');
  return response.json();
};

// --- Compliance Engine ---
export const fetchComplianceReport = async () => {
  const response = await fetch(`${API_BASE_URL}/compliance/report`, {
    headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to fetch compliance report');
  return response.json();
};

// --- Threat Intel ---
export const fetchThreatIntel = async () => {
  const response = await fetch(`${API_BASE_URL}/intel/pulses`, {
    headers: { 'x-tenant-id': TENANT_ID, ...getAuthHeaders() },
  });
  if (!response.ok) throw new Error('Failed to fetch threat intel');
  return response.json();
};
