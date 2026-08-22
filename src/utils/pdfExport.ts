interface ExportPdfOptions {
  date: string;
  totalGross: number;
  salonNet: number;
  artisanPool: number;
  commissionRate: number;
  barberEarnings: Record<string, number>;
  bookings: any[];
  history: any[];
}

export const exportDailyPdfReport = ({
  date,
  totalGross,
  salonNet,
  artisanPool,
  commissionRate,
  barberEarnings,
  bookings,
  history,
}: ExportPdfOptions) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export the PDF financial statement.");
    return;
  }

  const allRecords = [
    ...history.map((h) => ({
      customer: h.customerName,
      service: h.service,
      artisan: h.artisan,
      time: h.displayTime || h.time,
      price: Number(h.price || 0),
      status: "COMPLETED",
    })),
    ...bookings.map((b) => ({
      customer: b.customerName,
      service: b.service,
      artisan: b.artisan,
      time: b.time,
      price: Number(b.price || 0),
      status: b.status.toUpperCase(),
    })),
  ];

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>CAD CUTZ & ICE - Daily Atelier Financial Report (${date})</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Playfair+Display:wght@700;900&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Montserrat', sans-serif;
          background: #fff;
          color: #111;
          padding: 40px;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #c5a059;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .brand-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 900;
          color: #050505;
          letter-spacing: 2px;
        }
        .brand-sub {
          color: #c5a059;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 4px;
          display: block;
        }
        .report-meta {
          text-align: right;
          font-size: 12px;
          color: #555;
        }
        .report-title {
          font-size: 18px;
          font-weight: 700;
          color: #111;
          margin-bottom: 4px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        .summary-card {
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 16px;
          background: #fafafa;
        }
        .summary-label {
          font-size: 10px;
          text-transform: uppercase;
          color: #666;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }
        .summary-val {
          font-size: 22px;
          font-weight: 700;
          color: #050505;
        }
        .gold { color: #8c6e30; }
        .green { color: #15803d; }
        
        .section-heading {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 12px;
          color: #222;
          border-bottom: 1px solid #eee;
          padding-bottom: 6px;
        }
        
        .splits-table, .records-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          font-size: 12px;
        }
        
        .splits-table th, .records-table th {
          background: #f4f4f4;
          text-align: left;
          padding: 10px;
          font-weight: 700;
          border-bottom: 1px solid #ccc;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 1px;
        }
        
        .splits-table td, .records-table td {
          padding: 10px;
          border-bottom: 1px solid #eee;
        }
        
        .records-table tr:nth-child(even) {
          background: #fafafa;
        }
        
        .status-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .status-completed { background: #dcfce7; color: #15803d; }
        .status-in-chair { background: #fef3c7; color: #b45309; }
        .status-active { background: #e0f2fe; color: #0369a1; }
        
        .footer {
          margin-top: 40px;
          border-top: 1px solid #ddd;
          padding-top: 15px;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #777;
        }
        
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand-title">CAD CUTZ & ICE</div>
          <span class="brand-sub">LUXURY ATELIER & SALON</span>
          <p style="font-size: 11px; color: #666; margin-top: 4px;">Port Harcourt, Rivers State, Nigeria</p>
        </div>
        <div class="report-meta">
          <div class="report-title">DAILY FINANCIAL STATEMENT</div>
          <div>Report Date: <strong>${date}</strong></div>
          <div>Generated on: ${new Date().toLocaleString()}</div>
        </div>
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Total Daily Gross</div>
          <div class="summary-val green">₦${totalGross.toLocaleString()}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Salon Net Cut (${100 - commissionRate}%)</div>
          <div class="summary-val gold">₦${salonNet.toLocaleString()}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Artisan Payout Pool (${commissionRate}%)</div>
          <div class="summary-val">₦${artisanPool.toLocaleString()}</div>
        </div>
      </div>

      <div class="section-heading">Master Artisan Commission Split</div>
      <table class="splits-table">
        <thead>
          <tr>
            <th>Artisan Name</th>
            <th>Gross Generated</th>
            <th>Commission Rate</th>
            <th>Net Artisan Payout</th>
          </tr>
        </thead>
        <tbody>
          ${
            Object.keys(barberEarnings).length === 0
              ? `<tr><td colspan="4" style="text-align:center; color:#999;">No recorded artisan settlements for this date.</td></tr>`
              : Object.entries(barberEarnings)
                  .map(([name, val]) => {
                    const cut = Math.round(Number(val) * (commissionRate / 100));
                    return `
                      <tr>
                        <td><strong>${name}</strong></td>
                        <td>₦${Number(val).toLocaleString()}</td>
                        <td>${commissionRate}%</td>
                        <td style="font-weight:700; color:#15803d;">₦${cut.toLocaleString()}</td>
                      </tr>
                    `;
                  })
                  .join("")
          }
        </tbody>
      </table>

      <div class="section-heading">Itemized Session Transactions (${allRecords.length} Total)</div>
      <table class="records-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Customer</th>
            <th>Service Details</th>
            <th>Assigned Artisan</th>
            <th>Time</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${
            allRecords.length === 0
              ? `<tr><td colspan="7" style="text-align:center; color:#999; padding:20px;">No transaction records available.</td></tr>`
              : allRecords
                  .map(
                    (r, i) => `
                      <tr>
                        <td>${i + 1}</td>
                        <td><strong>${r.customer}</strong></td>
                        <td>${r.service}</td>
                        <td>${r.artisan}</td>
                        <td>${r.time}</td>
                        <td><strong>₦${r.price.toLocaleString()}</strong></td>
                        <td>
                          <span class="status-badge ${
                            r.status === "COMPLETED"
                              ? "status-completed"
                              : r.status === "IN-CHAIR"
                              ? "status-in-chair"
                              : "status-active"
                          }">${r.status}</span>
                        </td>
                      </tr>
                    `
                  )
                  .join("")
          }
        </tbody>
      </table>

      <div class="footer">
        <span>CAD CUTZ & ICE • Official Confidential Atelier Records</span>
        <span>Authorized Signature: _______________________</span>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
