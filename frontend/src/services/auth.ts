const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export const login = async (username: string, password: string, mfaCode?: string) => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  if (mfaCode) {
    formData.append('mfa_code', mfaCode);
  }

  const response = await fetch(`${API_BASE_URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    if (data.detail === 'MFA_REQUIRED') {
      throw new Error('MFA_REQUIRED');
    }
    throw new Error(data.detail || 'Invalid credentials');
  }

  localStorage.setItem('access_token', data.access_token);
  return data;
};

export const logout = () => {
  localStorage.removeItem('access_token');
  window.location.href = '/login';
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};
