// Admin Data Service for Central Admin Workspace
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isLocal ? 'http://localhost:5000/api' : 'https://alterations-connect-backend.onrender.com/api');

export const adminDataService = {
  // 1. Studios
  async getStudios() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/studios`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.studios)) {
        return data.studios;
      }
      return null;
    } catch (err) {
      console.warn('Could not fetch admin studios:', err);
      return null;
    }
  },

  async updateStudioStatus(id, status, hasConflict = false) {
    const res = await fetch(`${API_BASE_URL}/admin/studios/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, hasConflict })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update studio status');
    return data;
  },

  async updateStudio(id, updates) {
    const res = await fetch(`${API_BASE_URL}/admin/studios/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update studio details');
    return data;
  },

  // 2. Orders
  async getOrders() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.orders)) {
        return data.orders;
      }
      return null;
    } catch (err) {
      console.warn('Could not fetch admin orders:', err);
      return null;
    }
  },

  async updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update order status');
    return data;
  },

  // 3. Customers
  async getCustomers() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/customers`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.customers)) {
        return data.customers;
      }
      return null;
    } catch (err) {
      console.warn('Could not fetch admin customers:', err);
      return null;
    }
  },

  // 4. Support Tickets
  async getSupportTickets() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/support`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.tickets)) {
        return data.tickets;
      }
      return null;
    } catch (err) {
      console.warn('Could not fetch admin support tickets:', err);
      return null;
    }
  },

  async resolveTicket(id) {
    const res = await fetch(`${API_BASE_URL}/admin/support/${id}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to resolve ticket');
    return data;
  },

  // 5. Reviews
  async getReviews() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reviews`);
      const data = await res.json();
      if (res.ok && data.success) {
        return data;
      }
      return null;
    } catch (err) {
      console.warn('Could not fetch admin reviews:', err);
      return null;
    }
  },

  async updateReviewStatus(id, status) {
    const res = await fetch(`${API_BASE_URL}/admin/reviews/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update review status');
    return data;
  },

  async deleteReview(id) {
    const res = await fetch(`${API_BASE_URL}/admin/reviews/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete review');
    return data;
  },

  // 6. Network Settings
  async getSettings() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings`);
      const data = await res.json();
      if (res.ok && data.success && data.settings) {
        localStorage.setItem('alteration_admin_network_settings', JSON.stringify(data.settings));
        return data.settings;
      }
    } catch (err) {
      console.warn('Could not fetch admin settings from backend:', err);
    }
    try {
      const cached = localStorage.getItem('alteration_admin_network_settings');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return {
      membershipFee: '200',
      discoveryRadius: '15',
      studioSpacing: '5',
      supportEmail: 'support@alterationconnect.example'
    };
  },

  async updateSettings(settings) {
    try {
      localStorage.setItem('alteration_admin_network_settings', JSON.stringify(settings));
    } catch (e) {}
    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update settings');
    return data.settings || settings;
  }
};
