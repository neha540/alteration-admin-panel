const LIVE_RENDER_API = 'https://alterations-connect-backend.onrender.com/api';
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isLocal ? 'http://localhost:5000/api' : LIVE_RENDER_API);

const authHeaders = (extra = {}) => {
  let token = null;
  try { token = localStorage.getItem('ac_admin_token') || localStorage.getItem('ac_customer_token'); } catch (e) { }
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
};

export const paymentService = {
  async getStripeConfig() {
    try {
      const res = await fetch(`${API_BASE_URL}/payments/config`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Failed to load Stripe config from server:', err);
      return { publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '' };
    }
  },

  async createPaymentIntent({ orderId, amount, customerEmail, customerName }) {
    const headers = authHeaders({ 'Content-Type': 'application/json' });

    const res = await fetch(`${API_BASE_URL}/payments/create-payment-intent`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ orderId, amount, customerEmail, customerName })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to initialize payment.');
    }
    return data;
  },

  async confirmPayment({ orderId, paymentIntentId }) {
    const headers = authHeaders({ 'Content-Type': 'application/json' });

    const res = await fetch(`${API_BASE_URL}/payments/confirm-payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ orderId, paymentIntentId })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to confirm payment.');
    }
    return data;
  }
};
