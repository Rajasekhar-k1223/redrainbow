const API_BASE = "http://localhost:8080";

export async function login(username, password) {
  const body = new URLSearchParams();
  body.append("username", username);
  body.append("password", password);

  const res = await fetch(`${API_BASE}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json();
}

export async function me(token) {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("Fetch profile failed");
  }

  return res.json();
}

export async function getEvidence(token) {
  const res = await fetch(`${API_BASE}/evidence/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load evidence");
  return res.json();
}

export async function createEvidence(token, data) {
  const res = await fetch(`${API_BASE}/evidence/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save evidence");
  return res.json();
}

export async function uploadEvidence(token, evidenceId, file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/evidence/${evidenceId}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload file");
  return res.json();
}

export async function health() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Health failed");
  return res.json();
}

export async function healthRedis() {
  const res = await fetch(`${API_BASE}/health/redis`);
  if (!res.ok) throw new Error("Redis health failed");
  return res.json();
}

export async function healthMongo() {
  const res = await fetch(`${API_BASE}/health/mongo`);
  if (!res.ok) throw new Error("Mongo health failed");
  return res.json();
}