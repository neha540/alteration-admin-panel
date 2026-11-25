// Admin Data Service for Central Admin Workspace
const LIVE_RENDER_API = 'https://alterations-connect-backend.onrender.com/api';
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isLocal ? 'http://localhost:5000/api' : LIVE_RENDER_API);

// Attach the admin JWT (saved at sign-in) to every admin API call
const authHeaders = (extra = {}) => {
  let token = null;
  try { token = localStorage.getItem('ac_admin_token'); } catch (e) { }
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
};

export const adminDataService = {
  // 1. Studios
  async getStudios() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/studios`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.studios)) {
        return data.studios;
      }
      // If admin endpoint returned 401 or failed, try public studios endpoint as fallback
      try {
        const pubRes = await fetch(`${API_BASE_URL}/studios`);
        if (pubRes.ok) {
          const pubData = await pubRes.json();
          if (pubData.success && Array.isArray(pubData.studios)) {
            return pubData.studios;
          }
        }
      } catch (e) { }
      return [];
    } catch (err) {
      console.warn('Could not fetch admin studios:', err);
      try {
        const pubRes = await fetch(`${API_BASE_URL}/studios`);
        if (pubRes.ok) {
          const pubData = await pubRes.json();
          if (pubData.success && Array.isArray(pubData.studios)) {
            return pubData.studios;
          }
        }
      } catch (e) { }
      return [];
    }
  },

  async updateStudioStatus(id, status, hasConflict = false) {
    // 1. Try Admin Endpoint
    try {
      const res = await fetch(`${API_BASE_URL}/admin/studios/${id}/status`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ status, hasConflict })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Admin status patch failed, trying studio endpoint fallback:', err);
    }

    // 2. Direct Studio Endpoint Fallback
    try {
      const fallbackRes = await fetch(`${API_BASE_URL}/studios/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, hasConflict })
      });
      if (fallbackRes.ok) {
        return await fallbackRes.json();
      }
    } catch (e) { }

    // 3. Direct Studio PATCH Fallback
    const res2 = await fetch(`${API_BASE_URL}/studios/${id}`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status, hasConflict })
    });
    const data2 = await res2.json();
    if (!res2.ok) throw new Error(data2.message || 'Failed to update studio status');
    return data2;
  },

  async updateStudio(id, updates) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/studios/${id}`, {
        method: 'PATCH',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) { }

    const res2 = await fetch(`${API_BASE_URL}/studios/${id}`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(updates)
    });
    const data2 = await res2.json();
    if (!res2.ok) throw new Error(data2.message || 'Failed to update studio details');
    return data2;
  },

  async registerStudio(payload) {
    const res = await fetch(`${API_BASE_URL}/studios/register`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to register studio.');
    return data;
  },

  // 2. Orders
  async getOrders() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/orders`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.orders)) {
        return data.orders;
      }
      return [];
    } catch (err) {
      console.warn('Could not fetch admin orders:', err);
      return [];
    }
  },

  async updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update order status');
    return data;
  },

  // 3. Customers
  async getCustomers() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/customers`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.customers) && data.customers.length > 0) {
        return data.customers;
      }
      if (res.ok && data.success && Array.isArray(data.customers)) {
        // If server returned 0 customers, seamlessly derive from orders
        const orders = await this.getOrders();
        if (Array.isArray(orders) && orders.length > 0) {
          return this.deriveCustomersFromOrders(orders);
        }
        return data.customers;
      }
      const orders = await this.getOrders();
      if (Array.isArray(orders) && orders.length > 0) {
        return this.deriveCustomersFromOrders(orders);
      }
      return [];
    } catch (err) {
      console.warn('Could not fetch admin customers:', err);
      try {
        const orders = await this.getOrders();
        if (Array.isArray(orders) && orders.length > 0) {
          return this.deriveCustomersFromOrders(orders);
        }
      } catch (e) {}
      return [];
    }
  },

  deriveCustomersFromOrders(orders) {
    const customerMap = new Map();
    orders.forEach(o => {
      if (!o.customerEmail && !o.customerName) return;
      const email = (o.customerEmail || `${(o.customerName || 'customer').replace(/\s+/g, '').toLowerCase()}@client.example`).toLowerCase();
      if (!customerMap.has(email)) {
        const cName = o.customerName || 'Customer';
        const initials = cName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CU';
        customerMap.set(email, {
          id: 'cust_' + email.replace(/[^a-z0-9]/gi, '_'),
          fullName: cName,
          name: cName,
          email: o.customerEmail || email,
          phone: o.customerPhone || '',
          initials,
          measurements: o.measurements || {},
          createdAt: o.createdAt || new Date().toISOString(),
          orders: [o]
        });
      } else {
        const existing = customerMap.get(email);
        existing.orders.push(o);
        if ((!existing.measurements || Object.keys(existing.measurements).length === 0) && o.measurements) {
          existing.measurements = o.measurements;
        }
      }
    });

    return Array.from(customerMap.values()).map(c => {
      const userOrders = c.orders;
      const studiosSet = new Set();
      userOrders.forEach(o => {
        if (o.studioName) studiosSet.add(o.studioName);
        else if (o.studioId) studiosSet.add(o.studioId);
      });
      const paidValue = userOrders
        .filter(o => o.isPaid)
        .reduce((sum, o) => sum + (Number(o.price) || 0), 0);
      const completedCount = userOrders.filter(o => o.status === 'Completed').length;
      const activeCount = userOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;

      return {
        ...c,
        ordersCount: userOrders.length,
        studiosVisited: studiosSet.size,
        paidValue: '$' + paidValue,
        completedCount,
        activeOrders: activeCount
      };
    });
  },

  // 4. Support Tickets
  async getSupportTickets() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/support`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.tickets)) {
        return data.tickets;
      }
      return [];
    } catch (err) {
      console.warn('Could not fetch admin support tickets:', err);
      return [];
    }
  },

  async resolveTicket(id) {
    const res = await fetch(`${API_BASE_URL}/admin/support/${id}/resolve`, {
      method: 'PATCH',
      headers: authHeaders({ 'Content-Type': 'application/json' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to resolve ticket');
    return data;
  },

  // 5. Reviews
  async getReviews() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/reviews`, { headers: authHeaders() });
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
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update review status');
    return data;
  },

  async deleteReview(id) {
    const res = await fetch(`${API_BASE_URL}/admin/reviews/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete review');
    return data;
  },

  // 6. Network Settings
  async getSettings() {
    const endpoints = [
      `${API_BASE_URL}/admin/settings`,
      `${API_BASE_URL}/settings`,
      `${LIVE_RENDER_API}/settings`
    ];
    for (const url of endpoints) {
      try {
        const res = await fetch(url, { headers: authHeaders() });
        const data = await res.json();
        if (res.ok && data && (data.settings || data.success)) {
          const s = data.settings || data;
          localStorage.setItem('alteration_network_settings', JSON.stringify(s));
          localStorage.setItem('alteration_admin_network_settings', JSON.stringify(s));
          return s;
        }
      } catch (err) {
        // continue to next endpoint
      }
    }
    try {
      const cached = localStorage.getItem('alteration_network_settings') || localStorage.getItem('alteration_admin_network_settings');
      if (cached) return JSON.parse(cached);
    } catch (e) { }
    return {
      membershipFee: '300',
      discoveryRadius: '15',
      studioSpacing: '5',
      supportEmail: 'support@alterationconnect.example'
    };
  },

  async updateSettings(settings) {
    try {
      localStorage.setItem('alteration_network_settings', JSON.stringify(settings));
      localStorage.setItem('alteration_admin_network_settings', JSON.stringify(settings));
    } catch (e) { }

    const endpoints = [
      { url: `${API_BASE_URL}/admin/settings`, method: 'PATCH', auth: true },
      { url: `${API_BASE_URL}/settings`, method: 'PATCH', auth: false },
      { url: `${LIVE_RENDER_API}/admin/settings`, method: 'PATCH', auth: true },
      { url: `${LIVE_RENDER_API}/settings`, method: 'PATCH', auth: false }
    ];

    for (const ep of endpoints) {
      try {
        const headers = ep.auth
          ? authHeaders({ 'Content-Type': 'application/json' })
          : { 'Content-Type': 'application/json' };
        const res = await fetch(ep.url, {
          method: ep.method,
          headers,
          body: JSON.stringify(settings)
        });
        if (res.ok) {
          const data = await res.json();
          if (data && (data.success || data.settings)) {
            const finalSettings = data.settings || settings;
            localStorage.setItem('alteration_network_settings', JSON.stringify(finalSettings));
            localStorage.setItem('alteration_admin_network_settings', JSON.stringify(finalSettings));
            return finalSettings;
          }
        }
      } catch (err) {
        // continue to fallback
      }
    }

    // Settings are already saved safely in localStorage
    return { ...settings, _offlineSaved: true };
  },

  // 9. FAQ Management
  async getFaqs(params = {}) {
    try {
      const query = new URLSearchParams();
      if (params.category && params.category !== 'All') query.append('category', params.category);
      if (params.search) query.append('search', params.search);
      const res = await fetch(`${API_BASE_URL}/admin/faqs?${query.toString()}`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.faqs)) {
        return data.faqs;
      }
      return [];
    } catch (err) {
      console.warn('Could not fetch admin faqs:', err);
      return [];
    }
  },

  async createFaq(faq) {
    const res = await fetch(`${API_BASE_URL}/admin/faqs`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(faq)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create FAQ');
    return data.faq;
  },

  async updateFaq(id, updates) {
    const res = await fetch(`${API_BASE_URL}/admin/faqs/${id}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update FAQ');
    return data.faq;
  },

  async deleteFaq(id) {
    const res = await fetch(`${API_BASE_URL}/admin/faqs/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete FAQ');
    return data;
  }
};
