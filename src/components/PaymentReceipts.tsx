import { useEffect, useState } from "react";
import axiosInstance2 from "../api/axiosInstance";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";

interface DemandNote {
  id: number;
  demand_id: string;
  milestone: string;
  principal: string;
  gst: string;
  tax: string;
  total: string;
  paid: string;
  status: string;
  booking_data: { applicant: number };
}

const PaymentReceipts = () => {
  const [receipts, setReceipts] = useState<DemandNote[]>([]);
  const [loading, setLoading] = useState(true);

  const applicantId = Number(localStorage.getItem("applicant_id"));

  useEffect(() => {
    fetchPaidReceipts();
  }, []);

  const fetchPaidReceipts = async () => {
    try {
      const res = await axiosInstance2.get("/Financial/demand-notes/");
      const myReceipts = res.data.filter(
        (r: any) =>
          r?.booking_data?.applicant === applicantId &&
          r.status === "Paid"
      );
      setReceipts(myReceipts);
    } catch (err) {
      console.error("Error fetching receipts:", err);
    } finally {
      setLoading(false);
    }
  };

  const openReceipt = (r: DemandNote) => {
    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
      <head>
        <title>Payment Receipt</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            background: #f4f6f8;
          }

          /* FORCE COLORS IN PRINT */
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .header-box, .amount-box, th {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }

          .container {
            background: white;
            padding: 25px;
            border-radius: 16px;
            width: 820px;
            margin: auto;
            border: 1px solid #d0d7de;
            box-shadow: 0px 3px 12px rgba(0,0,0,0.12);
          }

          /* EXACT HEADER LIKE PDF */
          .header-box {
            background: #d8f3ed;
            padding: 30px 20px;
            border-radius: 12px;
            text-align: center;
            border: 1px solid #a7e0d4;
          }

          .title {
            margin-top: 10px;
            font-size: 30px;
            font-weight: bold;
            color: #003c3c;
          }

          .section-title {
            margin-top: 35px;
            font-size: 20px;
            font-weight: bold;
            border-left: 6px solid #0a8f6b;
            padding-left: 14px;
            color: #054f3d;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 15px;
          }

          th {
            background: #e2f5f2;
            font-weight: bold;
            border: 1px solid #cfe7e3;
            padding: 12px;
            color: #083d2e;
          }

          td {
            padding: 12px;
            border: 1px solid #dde4e8;
          }

          /* TOTAL AMOUNT BOX EXACT LIKE YOUR PDF */
          .amount-box {
            background: linear-gradient(90deg, #e7fff8, #c9f5e8);
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin-top: 25px;
            border: 1px solid #b2e4d7;
            font-size: 22px;
            font-weight: bold;
            color: #065f48;
          }

          .footer {
            text-align: center;
            margin-top: 35px;
            font-size: 13px;
            color: #555;
          }
        </style>
      </head>

      <body>
        <div class="container">

          <div class="header-box">
            <div class="title">PAYMENT RECEIPT</div>
          </div>

          <div class="section-title">Receipt & Demand Information</div>

          <table>
            <tr><th>Demand ID</th><td>${r.demand_id}</td></tr>
            <tr><th>Milestone</th><td>${r.milestone}</td></tr>
            <tr><th>Transaction Date</th><td>N/A</td></tr>
            <tr><th>Payment Method</th><td>N/A</td></tr>
            <tr><th>UTR / Ref ID</th><td>N/A</td></tr>
            <tr><th>Status</th><td>PAID</td></tr>
          </table>

          <div class="section-title">Amount Breakdown</div>

          <table>
            <tr><th>Principal</th><td>₹${r.principal}</td></tr>
            <tr><th>GST / Tax</th><td>₹${r.gst}</td></tr>
            <tr><th>Total</th><td>₹${r.total}</td></tr>
          </table>

          <div class="amount-box">
            TOTAL AMOUNT PAID — ₹${r.paid}
          </div>

          <div class="footer">
            This receipt confirms that payment has been received successfully.<br>
            Thank you for choosing us.
          </div>

        </div>

        <script>
          window.print();
        </script>
      </body>
      </html>
    `);

    win.document.close();
  };

  if (loading) return <CircularProgress />;

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Payment Receipts
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {receipts.length === 0 ? (
        <Typography>No receipts found.</Typography>
      ) : (
        receipts.map((r) => (
          <Card key={r.id} sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700}>
                Demand ID: {r.demand_id}
              </Typography>

              <Typography>Milestone: {r.milestone}</Typography>
              <Typography>Paid Amount: ₹{r.paid}</Typography>
              <Typography>Status: {r.status}</Typography>

              <Button
                variant="contained"
                sx={{ mt: 1 }}
                onClick={() => openReceipt(r)}
              >
                View / Print Receipt
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default PaymentReceipts;
