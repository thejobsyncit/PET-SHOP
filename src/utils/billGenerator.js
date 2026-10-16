/**
 * Josh Pets Hub - Official Standard Tax Invoice & Payment Bill Generator
 * Provides uniform high-quality bill formatting with clear company branding,
 * embedded logo, GST compliance, and instant download/print capabilities.
 */

let cachedLogoBase64 = null;

export const getLogoDataUrl = async () => {
  if (cachedLogoBase64) return cachedLogoBase64;
  if (typeof window === 'undefined') return '/logo.png';

  try {
    const res = await fetch('/logo.png');
    if (!res.ok) throw new Error('Logo fetch failed');
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        cachedLogoBase64 = reader.result;
        resolve(cachedLogoBase64);
      };
      reader.onerror = () => resolve(window.location.origin + '/logo.png');
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    return window.location.origin ? `${window.location.origin}/logo.png` : '/logo.png';
  }
};

/**
 * Generate standard HTML for official Josh Pets Hub Tax Invoice
 */
export const generateBillHtml = ({
  invoiceNumber = 'TXN_PET_000000',
  invoiceTitle = 'TAX INVOICE',
  invoiceDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  statusText = '✓ PAYMENT COMPLETED',
  customer = {},
  payment = {},
  items = [],
  totals = {},
  notes = '',
  logoUrl = '/logo.png',
}) => {
  const baseSubtotal = totals.baseAmount ?? 0;
  const cgstAmount = totals.cgst ?? (baseSubtotal * 0.09);
  const sgstAmount = totals.sgst ?? (baseSubtotal * 0.09);
  const shippingAmount = totals.shipping ?? 0;
  const grandTotal = totals.total ?? (baseSubtotal + cgstAmount + sgstAmount + shippingAmount);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Tax Invoice - ${invoiceNumber}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      margin: 0;
      padding: 32px 16px;
      color: #0f172a;
    }
    .bill-card {
      max-width: 680px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 36px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2.5px solid #0F2E23;
      padding-bottom: 22px;
      gap: 16px;
    }
    .brand-container {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-logo {
      height: 56px;
      width: auto;
      max-width: 70px;
      object-fit: contain;
      display: block;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.08));
    }
    .brand-title {
      font-size: 22px;
      font-weight: 900;
      color: #0F2E23;
      letter-spacing: 0.5px;
      line-height: 1.1;
    }
    .brand-title span {
      color: #D4AF37;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #64748b;
      margin-top: 3px;
      font-weight: 600;
    }
    .brand-gst {
      font-size: 11px;
      color: #334155;
      margin-top: 4px;
      font-weight: 700;
    }
    .inv-header {
      text-align: right;
      shrink: 0;
    }
    .inv-header h1 {
      margin: 0;
      font-size: 18px;
      font-weight: 900;
      color: #0F2E23;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .status-badge {
      display: inline-block;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      font-weight: 800;
      font-size: 10px;
      padding: 3px 10px;
      border-radius: 999px;
      margin-top: 6px;
      letter-spacing: 0.5px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin: 28px 0;
    }
    .section-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      color: #94a3b8;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    .section-content {
      font-size: 12.5px;
      line-height: 1.6;
      color: #334155;
    }
    .section-content strong {
      color: #0f172a;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
    }
    .table th {
      background: #f8fafc;
      border-bottom: 2px solid #e2e8f0;
      padding: 10px 12px;
      text-align: left;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #475569;
      letter-spacing: 0.5px;
    }
    .table td {
      padding: 13px 12px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 12.5px;
      color: #1e293b;
    }
    .totals {
      width: 270px;
      margin-left: auto;
      margin-top: 18px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 12px;
      color: #64748b;
    }
    .total-row.grand {
      border-top: 2px solid #0F2E23;
      margin-top: 8px;
      padding-top: 10px;
      font-size: 16px;
      font-weight: 900;
      color: #0F2E23;
    }
    .footer {
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px dashed #cbd5e1;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.5;
    }
    .btn-print {
      background: #0F2E23;
      color: #D4AF37;
      font-weight: 800;
      border: 1px solid #D4AF37;
      padding: 10px 24px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.2s;
    }
    .btn-print:hover {
      background: #164E3D;
      color: #ffffff;
    }
    @media print {
      body { background: white; padding: 0; }
      .bill-card { border: none; box-shadow: none; padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="bill-card">
    <div class="header">
      <div class="brand-container">
        <img src="${logoUrl}" alt="Josh Pets Hub" class="brand-logo" />
        <div>
          <div class="brand-title">JOSH PETS <span>HUB</span></div>
          <div class="brand-subtitle">Official Verified Pet Care Network</div>
          <div class="brand-gst">GSTIN: 29AABCU9603R1ZM | SAC: 998399</div>
        </div>
      </div>
      <div class="inv-header">
        <h1>${invoiceTitle}</h1>
        <div class="status-badge">${statusText}</div>
      </div>
    </div>

    <div class="grid">
      <div>
        <div class="section-label">Billed To (Customer)</div>
        <div class="section-content">
          <strong>${customer.name || 'Valued Customer'}</strong><br/>
          <span>${customer.email || ''}</span><br/>
          ${customer.phone ? `<span>${customer.phone}</span><br/>` : ''}
          ${customer.address ? `<span>${customer.address}</span>` : ''}
        </div>
      </div>
      <div>
        <div class="section-label">Payment Information</div>
        <div class="section-content">
          <strong>Ref / Txn ID:</strong> <span style="font-family: monospace;">${invoiceNumber}</span><br/>
          <strong>Date:</strong> ${invoiceDate}<br/>
          <strong>Payment Mode:</strong> ${payment.method || 'UPI / Online'}<br/>
          <strong>Validity:</strong> ${payment.validity || '1 Year Unlimited Pass'}
        </div>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Item & Description</th>
          <th style="text-align: right;">SAC / HSN</th>
          <th style="text-align: right;">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item) => `
          <tr>
            <td>
              <strong>${item.name}</strong>
              ${item.quantity && item.quantity > 1 ? `<span style="font-size: 11px; color: #64748b;"> (Qty: ${item.quantity})</span>` : ''}
              ${item.description ? `<br/><span style="font-size: 11px; color: #64748b;">${item.description}</span>` : ''}
            </td>
            <td style="text-align: right; color: #64748b; font-family: monospace;">${item.sacOrHsn || '998399'}</td>
            <td style="text-align: right; font-weight: 700;">₹${Number(item.amount || 0).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row"><span>Base Amount:</span><span>₹${Number(baseSubtotal).toFixed(2)}</span></div>
      ${cgstAmount > 0 ? `<div class="total-row"><span>CGST (9%):</span><span>₹${Number(cgstAmount).toFixed(2)}</span></div>` : ''}
      ${sgstAmount > 0 ? `<div class="total-row"><span>SGST (9%):</span><span>₹${Number(sgstAmount).toFixed(2)}</span></div>` : ''}
      ${shippingAmount > 0 ? `<div class="total-row"><span>Shipping / Handling:</span><span>₹${Number(shippingAmount).toFixed(2)}</span></div>` : ''}
      <div class="total-row grand"><span>Total Paid:</span><span>₹${Number(grandTotal).toFixed(2)}</span></div>
    </div>

    ${notes ? `
      <div style="margin-top: 18px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 11.5px; color: #475569;">
        <strong>Note:</strong> ${notes}
      </div>
    ` : ''}

    <div class="footer">
      This is a digitally generated tax invoice and payment bill for your records.<br/>
      Thank you for being a Josh Pets Hub member! For any queries or support, contact us at support@joshpetshub.com
    </div>

    <div class="no-print" style="margin-top: 24px; text-align: center;">
      <button onclick="window.print()" class="btn-print">
        Print / Save as PDF
      </button>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Trigger file download of the official tax invoice bill
 */
export const downloadBill = async (billData) => {
  try {
    const logoUrl = await getLogoDataUrl();
    const html = generateBillHtml({ ...billData, logoUrl });
    const invNo = billData.invoiceNumber || 'BILL';
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JoshPetsHub_Bill_${invNo}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Failed to download bill:', err);
    return false;
  }
};

/**
 * Open bill in printable window directly
 */
export const printBill = async (billData) => {
  try {
    const logoUrl = await getLogoDataUrl();
    const html = generateBillHtml({ ...billData, logoUrl });
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      return true;
    }
    return downloadBill(billData);
  } catch (err) {
    console.error('Failed to print bill:', err);
    return downloadBill(billData);
  }
};
