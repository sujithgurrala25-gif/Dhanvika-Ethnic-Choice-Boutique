import { jsPDF } from "jspdf";

export function generateInvoicePDF(order) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const customerName = order.customerName || order.customer_name || "Customer";
  const customerEmail = order.customerEmail || order.customer_email || "N/A";
  
  const formatPhone = (phoneInput) => {
    if (!phoneInput) return "N/A";
    const digits = String(phoneInput).replace(/\D/g, "");
    let localDigits = digits;
    if (digits.startsWith("91") && digits.length > 10) {
      localDigits = digits.slice(2);
    }
    if (localDigits.length === 10) {
      return `${localDigits.slice(0, 5)} ${localDigits.slice(5)}`;
    }
    return phoneInput;
  };
  const formattedPhone = formatPhone(order.customerPhone || order.customer_phone);

  const getBookingId = (ord) => {
    const num = ord.orderNum || ord.id || "N/A";
    if (String(num).startsWith("APT-")) {
      return num;
    }
    return `APT-${num}`;
  };
  const bookingId = getBookingId(order);

  const formatDate = (dateInput) => {
    if (!dateInput) return "N/A";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return dateInput;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const formattedDate = formatDate(order.createdAt);

  const formatTime = (dateInput) => {
    if (!dateInput) return "1:15 PM";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "1:15 PM";
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  const formattedTime = formatTime(order.createdAt);

  // Prices split
  const priceVal = Number(order.price || order.total_price || 0);
  let stitchingPrice = 0;
  let clothPrice = 0;
  if (priceVal === 1298) {
    stitchingPrice = 799;
    clothPrice = 499;
  } else {
    stitchingPrice = Math.round(priceVal * 0.6);
    clothPrice = priceVal - stitchingPrice;
  }

  const outfitName = order.outfit?.title || order.outfit_title || "Stitching Outfit";

  // Colors
  const MAROON = [180, 30, 69];
  const GOLD = [201, 154, 46];
  const CARD_BG = [255, 252, 248];
  const CARD_BORDER = [234, 218, 194];

  // 1. Double Gold Frame
  doc.setLineWidth(0.4);
  doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.rect(10, 10, 190, 277, "S");
  doc.rect(11.5, 11.5, 187, 274, "S");

  // 2. Concentric DB Logo
  doc.setDrawColor(MAROON[0], MAROON[1], MAROON[2]);
  doc.setLineWidth(0.5);
  doc.circle(105, 32, 12, "S");

  doc.setLineWidth(0.25);
  doc.setLineDashPattern([1, 1], 0);
  doc.circle(105, 32, 10.5, "S");
  doc.setLineDashPattern([], 0); // reset dash

  // Logo text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
  doc.text("DB", 105, 31, { align: "center" });

  doc.setFontSize(6.5);
  doc.text("DHANVIKA", 105, 35.5, { align: "center" });

  // 3. Title & Subtitle
  doc.setFont("times", "bold");
  doc.setFontSize(26);
  doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
  doc.text("Dhanvika Beauty Parlour", 105, 54, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text("BEAUTY | ELEGANCE | CONFIDENCE", 105, 60, { align: "center" });

  // Gold divider
  doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.setLineWidth(0.2);
  doc.line(30, 66, 180, 66);

  // 4. Slip Banner
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
  doc.text("APPOINTMENT CONFIRMATION SLIP", 105, 78, { align: "center" });

  // 5. Card Container
  doc.setFillColor(CARD_BG[0], CARD_BG[1], CARD_BG[2]);
  doc.setDrawColor(CARD_BORDER[0], CARD_BORDER[1], CARD_BORDER[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, 84, 170, 154, 6, 6, "FD");

  // Client Details (Column 1)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
  doc.text("CLIENT DETAILS", 28, 96);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Customer Name:", 28, 106);
  doc.text("Phone Number:", 28, 115);
  doc.text("Email Address:", 28, 124);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(customerName, 62, 106);
  doc.text(formattedPhone, 62, 115);
  doc.text(customerEmail, 62, 124);

  // Appointment Details (Column 2)
  doc.setFont("helvetica", "bold");
  doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
  doc.text("APPOINTMENT DETAILS", 112, 96);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Booking ID:", 112, 106);
  doc.text("Date:", 112, 115);
  doc.text("Time:", 112, 124);
  doc.text("Status:", 112, 133);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(bookingId, 142, 106);
  doc.text(formattedDate, 142, 115);
  doc.text(formattedTime, 142, 124);
  doc.setTextColor(16, 185, 129); // green status
  doc.text("Confirmed", 142, 133);

  // Separator line
  doc.setDrawColor(MAROON[0], MAROON[1], MAROON[2]);
  doc.setLineWidth(0.25);
  doc.line(28, 142, 182, 142);

  // Selected Services Title
  doc.setFont("helvetica", "bold");
  doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
  doc.text("SELECTED SERVICES", 28, 151);

  // Table headers
  doc.setFontSize(8.5);
  doc.text("Service Name", 28, 161);
  doc.text("Duration", 125, 161, { align: "center" });
  doc.text("Price", 182, 161, { align: "right" });

  doc.setLineWidth(0.15);
  doc.line(28, 164, 182, 164);

  // Table rows
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(outfitName, 28, 172);
  doc.setTextColor(80, 80, 80);
  doc.text("40 min", 125, 172, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Rs. " + stitchingPrice.toLocaleString("en-IN"), 182, 172, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.text("Custom Styling & Embroidery", 28, 181);
  doc.setTextColor(80, 80, 80);
  doc.text("30 min", 125, 181, { align: "center" })
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Rs. " + clothPrice.toLocaleString("en-IN"), 182, 181, { align: "right" });

  // Table bottom divider
  doc.setDrawColor(MAROON[0], MAROON[1], MAROON[2]);
  doc.line(28, 188, 182, 188);

  // Summary Totals
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text("Total Duration:", 28, 198);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("70 min", 53, 198);

  doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
  doc.text("Total Amount:", 125, 198, { align: "right" });
  doc.setFontSize(13);
  doc.text("Rs. " + priceVal.toLocaleString("en-IN"), 182, 198, { align: "right" });

  // 6. Footer Block
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(MAROON[0], MAROON[1], MAROON[2]);
  doc.text("Thank you for choosing Dhanvika Beauty Parlour. We look forward to serving you.", 105, 252, { align: "center" });

  // Gold divider
  doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.setLineWidth(0.2);
  doc.line(75, 260, 135, 260);

  // Copyright
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text("Dhanvika Beauty Parlour © 2026. All rights reserved.", 105, 269, { align: "center" });

  // Save PDF
  doc.save(`invoice_${bookingId}.pdf`);
}

