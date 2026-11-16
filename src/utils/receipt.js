// Builds a clean, printable receipt and downloads it as an .html file
// (open it in any browser, then use Print > Save as PDF if a PDF is needed).

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function buildReceiptHtml({
  title = 'Payment Receipt',
  receiptNumber = '',
  status = 'Paid',
  amount = '',
  rows = [],
  note = ''
}) {
  const generatedOn = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  const rowsHtml = rows
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(([label, value]) => `<tr><td class="k">${escapeHtml(label)}</td><td class="v">${escapeHtml(value)}</td></tr>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)} ${escapeHtml(receiptNumber)}</title>
<style>
  body { font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 32px 12px; color: #0f172a; }
  .card { max-width: 520px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
  .head { background: #172b49; color: #fff; padding: 22px 28px; }
  .brand { font-size: 17px; font-weight: 800; letter-spacing: -0.3px; }
  .brand span { color: #38bdf8; }
  .head p { margin: 4px 0 0; font-size: 12px; color: #94a3b8; }
  .body { padding: 28px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .num { font-size: 12px; color: #64748b; }
  .amount { text-align: center; padding: 22px 0 18px; border-bottom: 1px solid #e2e8f0; margin-bottom: 8px; }
  .amount .big { font-size: 34px; font-weight: 800; letter-spacing: -1px; }
  .amount .st { display: block; margin-top: 6px; font-size: 12px; font-weight: 700; color: #059669; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  td { padding: 9px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  td.k { color: #64748b; width: 40%; }
  td.v { font-weight: 600; text-align: right; word-break: break-word; }
  .note { margin-top: 18px; font-size: 11.5px; color: #64748b; line-height: 1.5; }
  .foot { padding: 14px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  @media print { body { background: #fff; padding: 0; } .card { border: none; } }
</style>
</head>
<body>
  <div class="card">
    <div class="head">
      <div class="brand"><span>Alteration</span> Connect</div>
      <p>Your craft. One workspace.</p>
    </div>
    <div class="body">
      <h1>${escapeHtml(title)}</h1>
      <div class="num">Receipt ${escapeHtml(receiptNumber)}</div>
      <div class="amount">
        <span class="big">${escapeHtml(amount)}</span>
        <span class="st">&#9679; ${escapeHtml(status)}</span>
      </div>
      <table>${rowsHtml}</table>
      ${note ? `<p class="note">${escapeHtml(note)}</p>` : ''}
    </div>
    <div class="foot">Generated ${escapeHtml(generatedOn)} &middot; Alteration Connect</div>
  </div>
</body>
</html>`;
}

export function downloadReceipt(receipt) {
  const html = buildReceiptHtml(receipt);
  const safeId = String(receipt.receiptNumber || 'receipt').replace(/[^A-Za-z0-9_-]+/g, '-');
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Receipt-${safeId}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
