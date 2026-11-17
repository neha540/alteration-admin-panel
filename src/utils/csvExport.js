// CSV Export Helper for Admin Workspace
export function downloadCsvFile(filename, headers, rows) {
  if (!rows || rows.length === 0) {
    alert('No records available to export.');
    return;
  }

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = headers.map(h => escapeCell(h)).join(',');
  const dataRows = rows.map(row => row.map(cell => escapeCell(cell)).join(',')).join('\r\n');
  const csvContent = '\uFEFF' + headerRow + '\r\n' + dataRows;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Format an Admin Order record into a standardized CSV row
export function formatAdminOrderForCsv(order) {
  const o = order?.raw || order || {};
  const price = o.price ? (String(o.price).startsWith('$') ? o.price : `$${o.price}`) : 'Pending';
  const isPaid = Boolean(o.isPaid || o.status === 'Completed' || o.status === 'Paid');
  const title = o.title || (o.garment && o.alterationType ? `${o.garment} - ${o.alterationType}` : (o.garment || 'Alteration request'));
  
  let formattedDate = 'N/A';
  if (o.createdAt) {
    try {
      formattedDate = new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      formattedDate = String(o.createdAt);
    }
  }

  return [
    o.id || 'N/A',
    o.studioName || o.studio || 'N/A',
    o.customerName || o.customer || 'Customer',
    o.customerEmail || '',
    o.customerPhone || '',
    title,
    o.status || 'New request',
    price,
    isPaid ? 'Paid' : 'Unpaid',
    o.fittingDate || 'N/A',
    o.completionDate || o.targetCompletion || 'N/A',
    formattedDate,
    o.description || o.notes || o.requestNote || ''
  ];
}

export const ADMIN_ORDER_CSV_HEADERS = [
  'Order ID',
  'Studio Name',
  'Customer Name',
  'Customer Email',
  'Customer Phone',
  'Garment / Service',
  'Order Status',
  'Amount',
  'Payment Status',
  'Fitting Appointment',
  'Target Completion',
  'Created Date',
  'Notes / Details'
];

// Format an Admin Subscription/Membership record into a standardized CSV row
export function formatAdminSubscriptionForCsv(sub) {
  const s = sub?.rawStudio || sub || {};
  return [
    s.id || 'N/A',
    s.name || 'Studio',
    s.owner || 'Owner',
    s.email || s.contactEmail || '',
    s.phone || '',
    s.city || '',
    s.zip || '',
    '$200',
    'Monthly',
    sub.status || (s.membership === 'Paid' ? 'Paid' : 'Payment required'),
    s.status || 'Approved',
    s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-US') : 'N/A'
  ];
}

export const ADMIN_SUBSCRIPTION_CSV_HEADERS = [
  'Studio ID',
  'Studio Name',
  'Owner',
  'Email',
  'Phone',
  'City',
  'Postal Code',
  'Membership Fee',
  'Billing Cycle',
  'Payment Status',
  'Studio Approval Status',
  'Joined Date'
];

