// Admin & Studio Auth Service for Alteration Connect Admin Workspace

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://alterations-connect-backend.onrender.com/api';

export const adminAuthService = {
  // 1. Admin Sign In
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to sign in as admin');
    }
    if (data.token || data.accessToken) {
      localStorage.setItem('ac_admin_token', data.token || data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('ac_admin_refresh_token', data.refreshToken);
      }
      if (data.user) {
        localStorage.setItem('ac_admin_user', JSON.stringify(data.user));
      }
    }
    return data;
  },

  // 2. Admin 2FA Verification
  async verifyTwoFactor(email, code, twoFactorToken) {
    const response = await fetch(`${API_BASE_URL}/admin/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, twoFactorToken })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Invalid or expired 2FA code. Please use the code sent to your email or demo code 123456.');
    }
    if (data.token || data.accessToken) {
      localStorage.setItem('ac_admin_token', data.token || data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('ac_admin_refresh_token', data.refreshToken);
      }
      if (data.user) {
        localStorage.setItem('ac_admin_user', JSON.stringify(data.user));
      }
    }
    return data;
  },

  // 3. Admin Forgot Password
  async forgotPassword(email) {
    const response = await fetch(`${API_BASE_URL}/admin/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to send password reset code.');
    }
    return data;
  },

  // 3.5 Admin Verify Reset Code
  async verifyResetCode(email, code) {
    const response = await fetch(`${API_BASE_URL}/admin/auth/verify-reset-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Invalid or incorrect verification code. Please check your email and try again.');
    }
    return data;
  },

  // 4. Admin Set New Password
  async resetPassword(email, newPassword) {
    const response = await fetch(`${API_BASE_URL}/admin/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to update admin password.');
    }
    return data;
  },

  // 5. Admin Activate Account
  async activate(payload) {
    const response = await fetch(`${API_BASE_URL}/admin/auth/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to activate admin account');
    }
    if (data.token || data.accessToken) {
      localStorage.setItem('ac_admin_token', data.token || data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('ac_admin_refresh_token', data.refreshToken);
      }
      if (data.user) {
        localStorage.setItem('ac_admin_user', JSON.stringify(data.user));
      }
    }
    return data;
  },

  // 6. Refresh Admin Token
  async refreshToken() {
    try {
      const storedRefresh = localStorage.getItem('ac_admin_refresh_token');
      if (!storedRefresh) return null;

      const response = await fetch(`${API_BASE_URL}/admin/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefresh })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('ac_admin_token', data.token || data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('ac_admin_refresh_token', data.refreshToken);
        }
        if (data.user) {
          localStorage.setItem('ac_admin_user', JSON.stringify(data.user));
        }
        return data;
      }
      return null;
    } catch {
      return null;
    }
  },

  // 7. Get Stored Admin
  getCurrentAdmin() {
    try {
      const stored = localStorage.getItem('ac_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  // 8. Get Stored Token
  getToken() {
    return localStorage.getItem('ac_admin_token') || null;
  },

  // 9. Sign Out
  logout() {
    localStorage.removeItem('ac_admin_token');
    localStorage.removeItem('ac_admin_refresh_token');
    localStorage.removeItem('ac_admin_user');
  }
};
