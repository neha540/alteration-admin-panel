// Professional PDF Receipt Generator for Alteration Connect Admin Console
import { jsPDF } from 'jspdf';

function formatCurrency(val) {
  if (val === undefined || val === null) return '$0.00';
  const str = String(val).trim();
  if (str.startsWith('$')) return str;
  const num = parseFloat(str);
  return isNaN(num) ? `$${str}` : `$${num.toFixed(2)}`;
}

export function downloadReceipt(receipt = {}) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const title = receipt.title || 'Studio Membership Receipt';
    const receiptNumber = receipt.receiptNumber || `REC-${Date.now().toString().slice(-6)}`;
    const status = receipt.status || 'Paid';
    const amount = formatCurrency(receipt.amount || '$0.00');
    const rows = Array.isArray(receipt.rows) ? receipt.rows.filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '') : [];
    const note = receipt.note || 'Official Alteration Connect platform invoice and receipt record.';
    const isMembership = title.toLowerCase().includes('membership');

    // ==========================================
    // 1. TOP HEADER BANNER (Navy & Clean Accents)
    // ==========================================
    doc.setFillColor(15, 23, 42); // #0F172A
    doc.rect(0, 0, 210, 32, 'F');

    // Brand Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('ALTERATION CONNECT', 15, 14);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184); // #94A3B8
    doc.text('Central Admin Console • Verified Financial Record', 15, 21);

    // Title on Right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(56, 189, 248); // #38BDF8
    doc.text(isMembership ? 'MEMBERSHIP INVOICE' : 'ADMIN RECEIPT', 195, 14, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`Invoice #: ${receiptNumber}`, 195, 21, { align: 'right' });

    // Blue separator accent line
    doc.setFillColor(37, 99, 235); // #2563EB
    doc.rect(0, 32, 210, 1.5, 'F');

    // ==========================================
    // 2. STATUS & SUMMARY BAR
    // ==========================================
    let y = 43;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, 15, y);

    // Green Paid Badge
    const badgeW = 34;
    const badgeH = 7;
    const badgeX = 195 - badgeW;
    const badgeY = y - 5;
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.5, 1.5, 'F');
    doc.setDrawColor(134, 239, 172);
    doc.setLineWidth(0.3);
    doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 1.5, 1.5, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(22, 163, 74);
    doc.text(`● ${status.toUpperCase()}`, badgeX + (badgeW / 2), badgeY + 4.7, { align: 'center' });

    // ==========================================
    // 3. AMOUNT CALLOUT BOX
    // ==========================================
    y = 52;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(15, y, 180, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL BILLED AMOUNT', 105, y + 7, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(amount, 105, y + 16, { align: 'center' });

    // ==========================================
    // 4. TRANSACTION DETAILS TABLE
    // ==========================================
    y = 82;
    doc.setFillColor(30, 41, 59);
    doc.rect(15, y, 180, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('BILLING ATTRIBUTE', 20, y + 5.5);
    doc.text('VALUE', 190, y + 5.5, { align: 'right' });

    y += 8;

    rows.forEach(([label, value], index) => {
      const rowBg = index % 2 === 0 ? 255 : 248;
      doc.setFillColor(rowBg, rowBg === 248 ? 250 : 255, rowBg === 248 ? 252 : 255);
      doc.rect(15, y, 180, 9, 'F');

      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.3);
      doc.line(15, y + 9, 195, y + 9);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(String(label), 20, y + 6);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const valStr = String(value);
      doc.text(valStr.length > 50 ? valStr.slice(0, 50) + '...' : valStr, 190, y + 6, { align: 'right' });

      y += 9;
    });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(15, y, 195, y);

    // ==========================================
    // 5. GUARANTEE / COMPLIANCE NOTE
    // ==========================================
    y += 12;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.setLineWidth(0.4);
    doc.roundedRect(15, y, 180, 20, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(22, 101, 52);
    doc.text(isMembership ? '✓ VERIFIED STUDIO MEMBERSHIP LICENSE' : '✓ VERIFIED FINANCIAL TRANSACTION', 20, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(21, 128, 61);
    doc.text(note, 20, y + 12, { maxWidth: 170 });

    // ==========================================
    // 6. FOOTER
    // ==========================================
    const footerY = 275;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(15, footerY, 195, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('This is an official computer-generated tax invoice & receipt from Alteration Connect Administration.', 105, footerY + 5, { align: 'center' });
    doc.text('Platform Operations & Accounting: finance@alterationconnect.com • alterationsconnect.com', 105, footerY + 9, { align: 'center' });
    doc.text(`Record ID: ${receiptNumber} • Certified Digital Archive`, 105, footerY + 13, { align: 'center' });

    const safeId = String(receiptNumber).replace(/[^A-Za-z0-9_-]+/g, '-');
    doc.save(`Receipt-${safeId}.pdf`);
    return true;
  } catch (err) {
    console.error('Failed to generate PDF receipt:', err);
    alert('Failed to generate PDF receipt. Please check your browser settings.');
    return false;
  }
}
