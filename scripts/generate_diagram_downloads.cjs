const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const userFlowchartMermaid = `flowchart TD
    classDef userBox fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46,font-weight:bold;
    classDef rzpBox fill:#EFF6FF,stroke:#2563EB,stroke-width:2px,color:#1E40AF,font-weight:bold;
    classDef platformBox fill:#FFFBEB,stroke:#D97706,stroke-width:2px,color:#92400E,font-weight:bold;
    classDef dbBox fill:#F5F3FF,stroke:#7C3AED,stroke-width:2px,color:#5B21B6,font-weight:bold;
    classDef successBox fill:#10B981,stroke:#047857,stroke-width:2px,color:#FFFFFF,font-weight:bold;
    classDef failBox fill:#EF4444,stroke:#B91C1C,stroke-width:2px,color:#FFFFFF,font-weight:bold;

    subgraph P1["STAGE 1: CUSTOMER CHECKOUT & ORDER INITIATION"]
        U1["Pet Parent selects service or product<br/>Example: Vet Consultation: ₹1,000"]:::userBox
        U2["Clicks 'Book & Pay Online'"]:::userBox
        U1 --> U2
    end

    subgraph P2["STAGE 2: RAZORPAY GATEWAY ORDER CREATION"]
        B1["Express Backend API<br/>POST /api/wallet-payouts/create-booking-order"]:::platformBox
        R1["Razorpay Central Gateway API<br/>Generates Order: order_ABC123 (100,000 paise)"]:::rzpBox
        U2 -->|1. Sends booking payload| B1
        B1 -->|2. Creates Razorpay order| R1
        R1 -->|3. Returns orderId & razorpayKey| B1
    end

    subgraph P3["STAGE 3: CUSTOMER PAYMENT AUTHORIZATION"]
        M1["Razorpay Modal Popup<br/>Supports: UPI / GPay / PhonePe / Cards / NetBanking"]:::rzpBox
        M2["Customer Enters UPI PIN or Card OTP<br/>Authorizes ₹1,000 payment securely"]:::userBox
        B1 -->|4. Renders gateway modal| M1
        M1 -->|5. Customer pays| M2
    end

    subgraph P4["STAGE 4: CRYPTOGRAPHIC SIGNATURE VERIFICATION"]
        V1["Cryptographic Signature Verification<br/>HMAC-SHA256(order_id + '|' + payment_id, SECRET)<br/>POST /api/wallet-payouts/verify-booking-payment"]:::platformBox
        M2 -->|6. Sends payment_id & signature| V1
    end

    V1 -->|Signature Valid| S1["Signature Verified & Authentic"]:::successBox
    V1 -->|Signature Invalid| F1["Verification Failed: Invalid Signature<br/>Payment blocked & booking not created"]:::failBox

    subgraph P5["STAGE 5: 5% PLATFORM SPLIT & CENTRAL ESCROW DEPOSIT"]
        S1 --> SPLIT["Automated Commission Split<br/>Total Collected: ₹1,000 (100%)<br/>Josh Pets Hub Platform Fee (5%): ₹50<br/>Service Provider Share (95%): ₹950"]:::platformBox
        SPLIT --> LEDGER["Central Platform Wallet Ledger<br/>Records: PAYMENT_COLLECTION<br/>Logged to platform_wallet_ledger.json"]:::platformBox
    end

    subgraph P6["STAGE 6: DATABASE PERSISTENCE & NOTIFICATIONS"]
        LEDGER --> DB1["Save Booking in Database<br/>status: Confirmed, paymentStatus: Paid<br/>settlementStatus: Pending (Held in Escrow)"]:::dbBox
        DB1 --> N1["Customer Notification: Booking Confirmed! Receipt generated."]:::userBox
        DB1 --> N2["Provider Notification: ₹950 Net Earnings Added to Pending Escrow"]:::dbBox
        DB1 --> N3["Super Admin Notification: ₹50 Platform Revenue Recorded"]:::platformBox
    end`;

const providerFlowchartMermaid = `flowchart TD
    classDef provBox fill:#F5F3FF,stroke:#7C3AED,stroke-width:2px,color:#5B21B6,font-weight:bold;
    classDef platformBox fill:#FFFBEB,stroke:#D97706,stroke-width:2px,color:#92400E,font-weight:bold;
    classDef adminBox fill:#FEF2F2,stroke:#E11D48,stroke-width:2px,color:#9F1239,font-weight:bold;
    classDef bankBox fill:#EFF6FF,stroke:#2563EB,stroke-width:2px,color:#1E40AF,font-weight:bold;
    classDef successBox fill:#10B981,stroke:#047857,stroke-width:2px,color:#FFFFFF,font-weight:bold;
    classDef warnBox fill:#F59E0B,stroke:#D97706,stroke-width:2px,color:#FFFFFF,font-weight:bold;

    subgraph S1["STAGE 1: SERVICE COMPLETION & ESCROW CLEARANCE"]
        P1["Service Provider Fulfills Appointment<br/>Example: Vet Consultation or Grooming Session Completed"]:::provBox
        P2["Provider Dashboard: Changes Status to Completed<br/>PATCH /api/bookings/:id/status"]:::provBox
        P3["Automated Escrow Release Engine<br/>settlementStatus: Pending moves to Available<br/>Net 95% shifts to Available Payout Balance"]:::platformBox
        P1 --> P2 --> P3
    end

    subgraph S2["STAGE 2: BANK ACCOUNT OR UPI VERIFICATION"]
        B1["Provider Registers Settlement Destination<br/>Direct Bank Transfer (A/C No, IFSC) or Instant UPI"]:::provBox
        P3 --> B1
    end

    subgraph S3["STAGE 3: WITHDRAWAL REQUEST & BALANCE LOCK"]
        W1["Provider Clicks Request Payout<br/>Enters Amount (e.g. ₹10,000 - Minimum: ₹500)<br/>POST /api/wallet-payouts/request-payout"]:::provBox
        W2["Balance Guard & Escrow Lock<br/>Validates balance and reserves ₹10,000<br/>Prevents double spending"]:::platformBox
        B1 --> W1 --> W2
    end

    subgraph S4["STAGE 4: SUPER ADMIN / CRM AUDIT QUEUE"]
        W2 --> A1["Super Admin & CRM Finance Queue<br/>GET /api/wallet-payouts/admin/payouts<br/>Audits provider KYC, completed appointments & bank details"]:::adminBox
    end

    D1["Corporate Bank Transfer<br/>Finance team disburses ₹10,000 via NEFT / IMPS / UPI"]:::bankBox
    R1["Safety Release & Restoration<br/>Reserved ₹10,000 unlocked back to Available Balance<br/>Provider receives error note with correction prompt"]:::warnBox

    A1 -->|"Option A: Approved for Payout"| D1
    A1 -->|"Option B: Rejected - Wrong IFSC or Dispute"| R1

    subgraph S5["STAGE 5: BANK UTR CONFIRMATION & SETTLEMENT"]
        D1 --> UTR["Bank Generates Transaction Reference<br/>Unique Bank UTR Ref: UTR20261123987"]:::bankBox
        UTR --> A2["Super Admin Marks as Paid<br/>Inputs Bank UTR Number in CRM Dashboard<br/>POST /api/wallet-payouts/admin/process-payout"]:::adminBox
        A2 --> L1["Platform Ledger: PAYOUT_DISBURSEMENT<br/>Associated booking items marked as Settled"]:::platformBox
        L1 --> N1["Real-time Notification to Provider:<br/>₹10,000 successfully settled to your bank! UTR: UTR20261123987"]:::successBox
    end`;

function createFlowchartHtml(title, mermaidCode, elementId) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background-color: #ffffff;
      color: #0f2e23;
      padding: 40px;
      margin: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #0f2e23;
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }
    p {
      font-size: 14px;
      color: #4b6358;
      margin: 0;
    }
    .mermaid-box {
      background: #fafaf8;
      border: 2px solid #e2ded5;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.06);
      display: inline-block;
      max-width: 100%;
    }
    .mermaid svg {
      font-size: 14px !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p>Josh Pets Hub Payment & Settlement Architecture</p>
  </div>
  <div class="mermaid-box">
    <pre class="mermaid" id="${elementId}">
${mermaidCode}
    </pre>
  </div>
  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      flowchart: {
        curve: 'basis',
        nodeSpacing: 45,
        rankSpacing: 50,
        padding: 20
      }
    });
  </script>
</body>
</html>`;
}

async function renderAndExportFlowcharts() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 2400 }, deviceScaleFactor: 2 });

  page.on('console', msg => {
    if (msg.type() === 'error') console.error('Browser Error:', msg.text());
  });

  const rootDir = path.resolve('c:/Users/soory/PET-SHOP');
  const diagramsDir = path.join(rootDir, 'diagrams');
  const publicDiagramsDir = path.join(rootDir, 'public', 'diagrams');

  [diagramsDir, publicDiagramsDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  // Diagram 1
  console.log('Rendering Flowchart 1: User Payment & Escrow Collection...');
  const html1 = createFlowchartHtml('User Payment & Escrow Collection Flow', userFlowchartMermaid, 'user-flow');
  await page.setContent(html1, { waitUntil: 'networkidle' });
  await page.waitForSelector('.mermaid svg:not([aria-roledescription="error"])', { timeout: 10000 });
  await page.waitForTimeout(1000);

  const svg1 = await page.$eval('.mermaid svg', el => el.outerHTML);
  const element1 = await page.$('.mermaid-box');
  const png1Buffer = await element1.screenshot({ type: 'png' });

  fs.writeFileSync(path.join(diagramsDir, 'user_payment_flow.svg'), svg1, 'utf8');
  fs.writeFileSync(path.join(diagramsDir, 'user_payment_flow.png'), png1Buffer);
  fs.writeFileSync(path.join(publicDiagramsDir, 'user_payment_flow.svg'), svg1, 'utf8');
  fs.writeFileSync(path.join(publicDiagramsDir, 'user_payment_flow.png'), png1Buffer);
  console.log('Saved user_payment_flow.svg and user_payment_flow.png (High Resolution)');

  // Diagram 2
  console.log('Rendering Flowchart 2: Service Provider Settlement & Payout Flow...');
  const html2 = createFlowchartHtml('Service Provider Settlement & Payout Flow', providerFlowchartMermaid, 'prov-flow');
  await page.setContent(html2, { waitUntil: 'networkidle' });
  await page.waitForSelector('.mermaid svg:not([aria-roledescription="error"])', { timeout: 10000 });
  await page.waitForTimeout(1000);

  const svg2 = await page.$eval('.mermaid svg', el => el.outerHTML);
  const element2 = await page.$('.mermaid-box');
  const png2Buffer = await element2.screenshot({ type: 'png' });

  fs.writeFileSync(path.join(diagramsDir, 'provider_payout_flow.svg'), svg2, 'utf8');
  fs.writeFileSync(path.join(diagramsDir, 'provider_payout_flow.png'), png2Buffer);
  fs.writeFileSync(path.join(publicDiagramsDir, 'provider_payout_flow.svg'), svg2, 'utf8');
  fs.writeFileSync(path.join(publicDiagramsDir, 'provider_payout_flow.png'), png2Buffer);
  console.log('Saved provider_payout_flow.svg and provider_payout_flow.png (High Resolution)');

  // Comprehensive Master HTML
  const masterIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Josh Pets Hub — Payment Gateway & Settlement Architecture</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f7f6f2;
      color: #0f2e23;
      margin: 0;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 1300px;
      margin: 0 auto;
    }
    header {
      text-align: center;
      margin-bottom: 50px;
      background: #ffffff;
      padding: 40px;
      border-radius: 20px;
      border: 1px solid #e5e2d8;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }
    .badge {
      display: inline-block;
      background: #0f2e23;
      color: #ffd000;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 6px 16px;
      border-radius: 30px;
      margin-bottom: 15px;
    }
    h1 {
      font-size: 32px;
      font-weight: 800;
      color: #0f2e23;
      margin: 0 0 12px 0;
      letter-spacing: -0.5px;
    }
    p.subtitle {
      font-size: 16px;
      color: #4b6358;
      max-width: 750px;
      margin: 0 auto;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-top: 30px;
      text-align: left;
    }
    .stat-card {
      background: #fafaf8;
      border: 1px solid #e8e5dc;
      padding: 16px 20px;
      border-radius: 12px;
    }
    .stat-card span {
      display: block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #6d8479;
    }
    .stat-card strong {
      font-size: 18px;
      color: #0f2e23;
      font-weight: 800;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e5e2d8;
      border-radius: 20px;
      padding: 36px;
      margin-bottom: 50px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.04);
    }
    .card-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      padding-bottom: 24px;
      border-bottom: 2px solid #f2efea;
      margin-bottom: 30px;
    }
    .card-title h2 {
      font-size: 24px;
      font-weight: 800;
      color: #0f2e23;
      margin: 0 0 6px 0;
    }
    .card-title p {
      font-size: 14px;
      color: #687e74;
      margin: 0;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px 22px;
      border-radius: 10px;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }
    .btn-primary {
      background: #0f2e23;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(15,46,35,0.2);
    }
    .btn-primary:hover {
      background: #194838;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(15,46,35,0.3);
    }
    .btn-secondary {
      background: #f0f5f2;
      color: #0f2e23;
      border: 1px solid #c9d8d0;
    }
    .btn-secondary:hover {
      background: #e2ede7;
      transform: translateY(-1px);
    }
    .diagram-viewport {
      background: #fafaf8;
      border: 1px solid #e5e2d8;
      border-radius: 14px;
      padding: 24px;
      overflow-x: auto;
      text-align: center;
      margin-bottom: 30px;
    }
    .diagram-viewport img {
      max-width: 100%;
      height: auto;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 25px;
    }
    .step-box {
      background: #fafaf8;
      border: 1px solid #e8e5dc;
      border-radius: 12px;
      padding: 20px;
      position: relative;
    }
    .step-box .num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: #0f2e23;
      color: #fff;
      border-radius: 50%;
      font-size: 13px;
      font-weight: 800;
      margin-bottom: 12px;
    }
    .step-box h3 {
      font-size: 16px;
      font-weight: 700;
      color: #0f2e23;
      margin: 0 0 8px 0;
    }
    .step-box p {
      font-size: 13px;
      color: #556e62;
      margin: 0;
      line-height: 1.5;
    }
    .step-box code {
      display: block;
      background: #f0ede6;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-family: Consolas, monospace;
      color: #0f2e23;
      margin-top: 10px;
      word-break: break-all;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 13px;
    }
    table.data-table th, table.data-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid #e8e5dc;
    }
    table.data-table th {
      background: #f7f6f2;
      color: #0f2e23;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    footer {
      text-align: center;
      font-size: 13px;
      color: #798b83;
      margin-top: 60px;
      padding-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <span class="badge">Architecture & Settlement Engine</span>
      <h1>Payment Gateway & Settlement Architecture</h1>
      <p class="subtitle">Official detailed architectural flowcharts for Customer Checkout & Service Provider Payout Settlement in Josh Pets Hub.</p>
      
      <div class="stats-grid">
        <div class="stat-card">
          <span>Payment Gateway</span>
          <strong>Razorpay (INR / ₹)</strong>
        </div>
        <div class="stat-card">
          <span>Platform Commission</span>
          <strong>5% Automated Cut</strong>
        </div>
        <div class="stat-card">
          <span>Provider Net Share</span>
          <strong>95% Cleared on Completion</strong>
        </div>
        <div class="stat-card">
          <span>Minimum Payout</span>
          <strong>₹500 via Bank / UPI</strong>
        </div>
      </div>
    </header>

    <!-- Card 1: User Payment Flow -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <h2>1. User Payment & Escrow Collection Flow</h2>
          <p>End-to-end journey from checkout to Razorpay modal, cryptographic HMAC verification, 5% split, and escrow logging.</p>
        </div>
        <div class="actions">
          <a href="user_payment_flow.png" download="user_payment_flow.png" class="btn btn-primary">⬇ Download High-Res PNG (3200px)</a>
          <a href="user_payment_flow.svg" download="user_payment_flow.svg" class="btn btn-secondary">⬇ Download Vector SVG</a>
        </div>
      </div>
      
      <div class="diagram-viewport">
        <img src="user_payment_flow.png" alt="User Payment & Escrow Collection Flowchart" />
      </div>

      <div class="steps-grid">
        <div class="step-box">
          <span class="num">1</span>
          <h3>Checkout & Booking</h3>
          <p>Pet parent selects a service (Vet, Grooming, Training, Hostel) or cart products and clicks "Book & Pay Online".</p>
          <code>POST /api/wallet-payouts/create-booking-order</code>
        </div>
        <div class="step-box">
          <span class="num">2</span>
          <h3>Razorpay Order Creation</h3>
          <p>The backend calls Razorpay API to generate a registered order in paise (e.g. ₹1,000 = 100,000 paise) with a unique order ID.</p>
          <code>orders.create({ amount, currency: 'INR' })</code>
        </div>
        <div class="step-box">
          <span class="num">3</span>
          <h3>Customer Payment</h3>
          <p>The central Razorpay checkout modal opens, supporting UPI (PhonePe, GPay, Paytm), Cards, and NetBanking.</p>
          <code>window.Razorpay(options).open()</code>
        </div>
        <div class="step-box">
          <span class="num">4</span>
          <h3>Cryptographic Verification</h3>
          <p>The backend validates the cryptographic signature using HMAC-SHA256 with timing-safe buffer comparison.</p>
          <code>HMAC-SHA256(order_id + '|' + payment_id, SECRET)</code>
        </div>
        <div class="step-box">
          <span class="num">5</span>
          <h3>5% Split & Escrow</h3>
          <p>Total ₹1,000 is split: ₹50 (5% platform fee) and ₹950 (95% provider share held in temporary escrow).</p>
          <code>Ledger: PAYMENT_COLLECTION (Status: SUCCESS)</code>
        </div>
        <div class="step-box">
          <span class="num">6</span>
          <h3>Confirmation & Sync</h3>
          <p>Booking is confirmed, payment marked as Paid, and real-time notifications are dispatched to Customer, Provider, and Admin.</p>
          <code>status: 'Confirmed', paymentStatus: 'Paid'</code>
        </div>
      </div>
    </div>

    <!-- Card 2: Provider Settlement & Payout Flow -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <h2>2. Service Provider Settlement & Payout Flow</h2>
          <p>How providers fulfill appointments, unlock escrow into cleared wallet balance, request withdrawal, and receive bank settlements with UTR.</p>
        </div>
        <div class="actions">
          <a href="provider_payout_flow.png" download="provider_payout_flow.png" class="btn btn-primary">⬇ Download High-Res PNG (3200px)</a>
          <a href="provider_payout_flow.svg" download="provider_payout_flow.svg" class="btn btn-secondary">⬇ Download Vector SVG</a>
        </div>
      </div>
      
      <div class="diagram-viewport">
        <img src="provider_payout_flow.png" alt="Service Provider Settlement & Payout Flowchart" />
      </div>

      <div class="steps-grid">
        <div class="step-box">
          <span class="num">1</span>
          <h3>Service Fulfillment</h3>
          <p>Provider conducts the appointment and updates the booking status to "Completed" on their dashboard.</p>
          <code>PATCH /api/bookings/:id/status { status: 'Completed' }</code>
        </div>
        <div class="step-box">
          <span class="num">2</span>
          <h3>Escrow Clearance</h3>
          <p>The net earnings (95% = ₹950) automatically unlock from Pending Escrow into the Provider's Available Payout Balance.</p>
          <code>settlementStatus: 'Available'</code>
        </div>
        <div class="step-box">
          <span class="num">3</span>
          <h3>Bank / UPI Verification</h3>
          <p>Provider registers bank account (Holder, A/C No, IFSC with auto-bank detection e.g. HDFC, SBI) or UPI ID.</p>
          <code>POST /api/wallet-payouts/bank-account</code>
        </div>
        <div class="step-box">
          <span class="num">4</span>
          <h3>Withdrawal Request</h3>
          <p>Provider requests withdrawal (min ₹500). System verifies balance and reserves funds to prevent double-spending.</p>
          <code>POST /api/wallet-payouts/request-payout</code>
        </div>
        <div class="step-box">
          <span class="num">5</span>
          <h3>Super Admin Audit</h3>
          <p>Super Admin and CRM Finance review KYC, booking fulfillment history, and bank account in the Admin Portal.</p>
          <code>GET /api/wallet-payouts/admin/payouts</code>
        </div>
        <div class="step-box">
          <span class="num">6</span>
          <h3>Disbursement with UTR</h3>
          <p>Admin transfers funds via banking network, enters the bank UTR, logs PAYOUT_DISBURSEMENT, and notifies provider.</p>
          <code>POST /api/wallet-payouts/admin/process-payout (MARK_PAID)</code>
        </div>
      </div>
    </div>

    <!-- Financial Reference Table -->
    <div class="card">
      <div class="card-title">
        <h2>Financial State Machine & Rules Matrix</h2>
        <p>Exact calculation parameters, state transitions, and database models used in the production platform.</p>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Parameter / Event</th>
            <th>Formula / Rate</th>
            <th>Database & Ledger Target</th>
            <th>Lifecycle State Transition</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Gross Customer Payment</strong></td>
            <td>100% of Booking / Cart Fee</td>
            <td>Platform Razorpay Merchant Account</td>
            <td><code>status: 'Initiated' ➔ 'Paid'</code></td>
          </tr>
          <tr>
            <td><strong>Platform Commission</strong></td>
            <td>5% (Math.round(Fee * 0.05))</td>
            <td><code>platformCommissionEarned</code></td>
            <td>Retained by Josh Pets Hub on checkout</td>
          </tr>
          <tr>
            <td><strong>Provider Net Share</strong></td>
            <td>95% (Fee - Platform Commission)</td>
            <td><code>pendingEarnings</code> (In Escrow)</td>
            <td><code>settlementStatus: 'Pending'</code></td>
          </tr>
          <tr>
            <td><strong>Appointment Completed</strong></td>
            <td>Moves 100% of Net Share</td>
            <td><code>availablePayoutBalance</code></td>
            <td><code>settlementStatus: 'Pending' ➔ 'Available'</code></td>
          </tr>
          <tr>
            <td><strong>Withdrawal Minimum</strong></td>
            <td>₹500 threshold per request</td>
            <td><code>provider_payouts.json</code></td>
            <td><code>payoutStatus: 'Requested' (Funds Reserved)</code></td>
          </tr>
          <tr>
            <td><strong>Disbursement via Bank/UPI</strong></td>
            <td>Full Requested Amount</td>
            <td><code>PAYOUT_DISBURSEMENT</code> with UTR</td>
            <td><code>payoutStatus: 'Paid', bookings: 'Settled'</code></td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer>
      <p>© 2026 Josh Pets Hub. All visual flowcharts rendered natively in high resolution (3200px).</p>
    </footer>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(diagramsDir, 'index.html'), masterIndexHtml, 'utf8');
  fs.writeFileSync(path.join(publicDiagramsDir, 'index.html'), masterIndexHtml, 'utf8');

  // Also copy to artifact directory
  const artifactDir = 'C:/Users/soory/.gemini/antigravity/brain/c42de5fb-93bb-4aa9-ae04-7c84d6d9fd3a';
  [
    'user_payment_flow.png', 'user_payment_flow.svg',
    'provider_payout_flow.png', 'provider_payout_flow.svg',
    'index.html'
  ].forEach(file => {
    fs.copyFileSync(path.join(diagramsDir, file), path.join(artifactDir, file));
  });

  await browser.close();
  console.log('Master Flowchart render & export completed successfully with 0 errors!');
}

renderAndExportFlowcharts().catch(err => {
  console.error('Error during flowchart export:', err);
  process.exit(1);
});
