// Admin Data Service for Central Admin Workspace
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://alterations-connect-backend.onrender.com/api';

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
  }
};
