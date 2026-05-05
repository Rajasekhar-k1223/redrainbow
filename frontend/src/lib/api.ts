const API_BASE = "http://127.0.0.1:8080";

async function handleUnauthorized(res: Response) {
  if (res.status === 401) {
    localStorage.removeItem("redrainbow_token");
    window.location.replace("/login"); // Use replace to clear back history
    throw new Error("Session expired. Please authenticate.");
  }
  return res;
}

export interface User {
  username: string;
  email: string;
  full_name?: string;
  avatar?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface Evidence {
  id: number;
  title: string;
  description: string;
  evidence_type: string;
  created_at: string;
  file_path?: string;
  metadata?: Record<string, any>;
}

export async function login(username: string, password: string): Promise<AuthToken> {
  const body = new URLSearchParams();
  body.append("username", username);
  body.append("password", password);

  const res = await fetch(`${API_BASE}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Authentication failed");
  }

  return res.json();
}

export async function register(username: string, password: string, invite_code: string): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, invite_code }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Registration failed");
  }

  return res.json();
}

export async function me(token: string): Promise<User> {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleUnauthorized(res);

  if (!res.ok) {
    throw new Error("Failed to retrieve operator profile");
  }

  return res.json();
}

export async function getEvidence(
  token: string, 
  filters?: { severity?: string; evidence_type?: string; search?: string }
): Promise<Evidence[]> {
  const query = new URLSearchParams();
  if (filters?.severity) query.append("severity", filters.severity);
  if (filters?.evidence_type) query.append("evidence_type", filters.evidence_type);
  if (filters?.search) query.append("search", filters.search);

  const res = await fetch(`${API_BASE}/evidence/?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleUnauthorized(res);
  
  if (!res.ok) {
    throw new Error("Failed to synchronize evidence vault");
  }
  
  return res.json();
}

export async function createEvidence(token: string, data: Partial<Evidence>): Promise<Evidence> {
  const res = await fetch(`${API_BASE}/evidence/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    throw new Error("Failed to commit tactical evidence");
  }
  
  return res.json();
}

export async function uploadEvidence(token: string, evidenceId: number, file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await fetch(`${API_BASE}/evidence/${evidenceId}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  
  if (!res.ok) {
    throw new Error("Payload binary upload failed");
  }
  
  return res.json();
}

export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.ok;
}

export async function getHealthRedis() {
  const res = await fetch(`${API_BASE}/health/redis`);
  return res.ok;
}

export async function getHealthMongo() {
  const res = await fetch(`${API_BASE}/health/mongo`);
  return res.ok;
}

export interface ScanResponse {
  scan_id: string;
  target: string;
  status: string;
  message: string;
}

export async function submitTarget(token: string, url?: string, file?: File): Promise<ScanResponse> {
  const formData = new FormData();
  if (url) formData.append("url", url);
  if (file) formData.append("file", file);

  const res = await fetch(`${API_BASE}/orchestrator/scan`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  await handleUnauthorized(res);
  
  if (!res.ok) {
    throw new Error("Failed to initialize orchestrator scan");
  }
  return res.json();
}

export async function deleteEvidence(token: string, evidenceId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/evidence/${evidenceId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleUnauthorized(res);
  
  if (!res.ok) {
    throw new Error("Failed to decommission evidence");
  }
}

export async function getDeletedEvidence(token: string): Promise<Evidence[]> {
  const res = await fetch(`${API_BASE}/evidence/deleted`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleUnauthorized(res);
  
  if (!res.ok) {
    throw new Error("Failed to synchronize intelligence trash");
  }
  return res.json();
}

export async function recoverEvidence(token: string, evidenceId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/evidence/${evidenceId}/recover`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleUnauthorized(res);
  
  if (!res.ok) {
    throw new Error("Failed to salvage evidence");
  }
}

export async function getScanStatus(token: string, scanId: string): Promise<{status: string, logs: string[]}> {
  const res = await fetch(`${API_BASE}/orchestrator/scan/${scanId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleUnauthorized(res);
  
  if (!res.ok) {
    throw new Error("Failed to fetch scan status");
  }
  return res.json();
}

export async function getActiveScan(token: string): Promise<{scan_id: string, status: string, target: string} | null> {
  const res = await fetch(`${API_BASE}/orchestrator/active`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleUnauthorized(res);
  
  if (!res.ok) {
    return null;
  }
  return res.json();
}
export async function downloadEvidence(token: string, evidenceId: number, filename: string): Promise<void> {
  const res = await fetch(`${API_BASE}/evidence/${evidenceId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleUnauthorized(res);
  
  if (!res.ok) {
    throw new Error("Failed to retrieve evidence binary from secure node");
  }
  
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function getNodeStats(token: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/orchestrator/nodes/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleUnauthorized(res);
  
  if (!res.ok) {
    throw new Error("Failed to synchronize constellation telemetry");
  }
  return res.json();
}

export async function getScans(token: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/orchestrator/all`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleUnauthorized(res);
  
  if (!res.ok) {
    throw new Error("Failed to synchronize mission registry");
  }
  return res.json();
}

export async function stopScan(token: string, scanId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/orchestrator/stop/${scanId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleUnauthorized(res);
  
  if (!res.ok) {
    throw new Error("Failed to terminate mission");
  }
}

export interface Signal {
  source: string;
  type: string;
  severity: string;
  time: string;
  count: number;
}

export async function getSignals(token: string): Promise<Signal[]> {
  const res = await fetch(`${API_BASE}/orchestrator/signals`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleUnauthorized(res);
  
  if (!res.ok) {
    throw new Error("Failed to synchronize signal mesh");
  }
  
  return res.json();
}
