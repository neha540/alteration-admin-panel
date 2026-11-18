// Premium Vector PDF Receipt Generator for Alteration Connect Admin Console
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

    // 1. Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');

    // Blue vertical accent pill on top left
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(18, 16, 3.5, 15, 1, 1, 'F');

    // Brand Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text('ALTERATION CONNECT', 25, 21.5);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Central Admin Console • Verified Financial Record', 25, 26.5);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('alterationsconnect.com  •  finance@alterationconnect.com', 25, 30.5);

    // Right Side Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text(isMembership ? 'MEMBERSHIP INVOICE' : 'ADMIN RECEIPT', 192, 21.5, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Invoice #: ${receiptNumber}`, 192, 26.5, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, 192, 30.5, { align: 'right' });

    // Status Pill
    const statusPillW = 26;
    const statusPillH = 6;
    const statusPillX = 192 - statusPillW;
    const statusPillY = 32.5;

    doc.setFillColor(220, 252, 231);
    doc.setDrawColor(134, 239, 172);
    doc.setLineWidth(0.3);
    doc.roundedRect(statusPillX, statusPillY, statusPillW, statusPillH, 1.2, 1.2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(21, 128, 61);
    doc.text(status.toUpperCase().includes('PAID') ? 'PAID' : 'COMPLETED', statusPillX + (statusPillW / 2), statusPillY + 4.2, { align: 'center' });

    // Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(18, 42, 192, 42);

    // Total Amount Highlight Card
    let y = 47;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(18, y, 174, 20, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('TOTAL BILLED AMOUNT', 105, y + 6.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text(amount, 105, y + 15, { align: 'center' });

    // Transaction Details Table
    y = 73;
    const tableW = 174;

    doc.setFillColor(241, 245, 249);
    doc.rect(18, y, tableW, 8, 'F');

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(18, y, 192, y);
    doc.line(18, y + 8, 192, y + 8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('BILLING ATTRIBUTE', 24, y + 5.2);
    doc.text('VALUE & SPECIFICATION', 188, y + 5.2, { align: 'right' });

    y += 8;

    rows.forEach(([label, value], index) => {
      const rowBg = index % 2 === 0 ? 255 : 250;
      doc.setFillColor(rowBg, rowBg, rowBg);
      doc.rect(18, y, tableW, 9.5, 'F');

      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.3);
      doc.line(18, y + 9.5, 192, y + 9.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(String(label), 24, y + 6.2);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      const valStr = String(value);
      doc.text(valStr.length > 55 ? valStr.slice(0, 55) + '...' : valStr, 188, y + 6.2, { align: 'right' });

      y += 9.5;
    });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(18, y, 192, y);

    // Policy & Compliance Box
    y += 12;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.setLineWidth(0.4);
    doc.roundedRect(18, y, tableW, 20, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(22, 101, 52);
    const boxTitle = isMembership ? 'VERIFIED STUDIO MEMBERSHIP LICENSE' : 'VERIFIED FINANCIAL TRANSACTION';
    doc.text(boxTitle, 24, y + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(21, 128, 61);
    doc.text(note, 24, y + 12, { maxWidth: 162 });

    // Footer
    const footerY = 274;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(18, footerY, 192, footerY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('This is an official computer-generated tax invoice & receipt from Alteration Connect Administration.', 105, footerY + 5, { align: 'center' });
    doc.text('Platform Operations & Accounting: finance@alterationconnect.com  •  alterationsconnect.com', 105, footerY + 9, { align: 'center' });
    doc.text(`Record ID: ${receiptNumber}  •  Certified Digital Archive`, 105, footerY + 13, { align: 'center' });

    const safeId = String(receiptNumber).replace(/[^A-Za-z0-9_-]+/g, '-');
    doc.save(`Receipt-${safeId}.pdf`);
    return true;
  } catch (err) {
    console.error('Failed to generate PDF receipt:', err);
    alert('Failed to generate PDF receipt. Please check your browser settings.');
    return false;
  }
}
