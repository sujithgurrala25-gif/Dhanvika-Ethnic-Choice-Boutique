import { jsPDF } from "jspdf";

export function generateInvoicePDF(order) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Title: DHANVIKA ETHNIC CHOICE BOUTIQUE
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 0);
  doc.text("DHANVIKA ETHNIC CHOICE BOUTIQUE", 20, 20);

  // Line separator
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 25, 190, 25);

  // Section: ORDER DETAILS
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 80, 160); // Blue color similar to screenshot
  doc.text("ORDER DETAILS", 20, 36);
  doc.setTextColor(0, 0, 0); // Reset to black

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const customerName = order.customerName || order.customer_name || "Customer";
  const orderId = order.orderNum || order.id || "N/A";
  const outfitTitle = order.outfit?.title || order.outfit_title || "Custom Outfit";
  const priceVal = Number(order.price || order.total_price || 0);
  const status = order.status || "Order Received";
  const neckStyle = order.neckStyle || order.neck_style || "Round";
  const sleeveStyle = order.sleeveStyle || order.sleeve_style || "Short";
  const fitting = order.fittingStyle || order.fitting || "Regular";

  let orderDateStr = "";
  if (order.createdAt) {
    orderDateStr = new Date(order.createdAt).toLocaleDateString("en-IN");
  } else {
    orderDateStr = new Date().toLocaleDateString("en-IN");
  }

  doc.text(`Hello ${customerName},`, 20, 46);
  doc.text("Your order has been placed.", 20, 54);

  doc.text(`Order ID: ${orderId}`, 20, 64);
  doc.text(`Outfit: ${outfitTitle}`, 20, 72);
  doc.text(`Price: Rs. ${priceVal.toLocaleString("en-IN")}`, 20, 80);
  doc.text(`Status: ${status}`, 20, 88);
  doc.text(`Neck Style: ${neckStyle}`, 20, 96);
  doc.text(`Sleeve Style: ${sleeveStyle}`, 20, 104);
  doc.text(`Fitting: ${fitting}`, 20, 112);
  doc.text(`Order Date: ${orderDateStr}`, 20, 120);

  let deliveryDateStr = "";
  if (order.deliveryDate) {
    deliveryDateStr = new Date(order.deliveryDate).toLocaleDateString("en-IN");
  }

  if (deliveryDateStr) {
    doc.text(`Delivery Date: ${deliveryDateStr}`, 20, 128);
    doc.text("Thank you for choosing StitchAura Boutique.", 20, 138);
  } else {
    doc.text("Thank you for choosing StitchAura Boutique.", 20, 130);
  }

  const invoiceY = deliveryDateStr ? 154 : 146;
  const tableY = deliveryDateStr ? 162 : 154;

  // Section: INVOICE
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 80, 160);
  doc.text("INVOICE", 20, invoiceY);
  doc.setTextColor(0, 0, 0);

  // Calculate invoice split
  let stitchingPrice = 200;
  let clothPrice = 1000;
  if (priceVal === 1200) {
    stitchingPrice = 200;
    clothPrice = 1000;
  } else {
    stitchingPrice = Math.round(priceVal * 0.2);
    clothPrice = priceVal - stitchingPrice;
  }

  const rowHeight = 8;

  // Draw table borders and cells
  doc.setLineWidth(0.2);
  doc.setDrawColor(0, 0, 0);

  // Row 1: Stitching price
  doc.rect(20, tableY, 80, rowHeight);
  doc.rect(100, tableY, 80, rowHeight);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Stitching price", 23, tableY + 5);
  doc.text(`Rs. ${stitchingPrice.toLocaleString("en-IN")}`, 103, tableY + 5);

  // Row 2: Cloth price
  doc.rect(20, tableY + rowHeight, 80, rowHeight);
  doc.rect(100, tableY + rowHeight, 80, rowHeight);
  doc.text("Cloth price", 23, tableY + rowHeight + 5);
  doc.text(`Rs. ${clothPrice.toLocaleString("en-IN")}`, 103, tableY + rowHeight + 5);

  // Row 3: Total cost
  doc.rect(20, tableY + (rowHeight * 2), 80, rowHeight);
  doc.rect(100, tableY + (rowHeight * 2), 80, rowHeight);
  doc.setFont("helvetica", "bold");
  doc.text("Total cost", 23, tableY + (rowHeight * 2) + 5);
  doc.text(`Rs. ${priceVal.toLocaleString("en-IN")}`, 103, tableY + (rowHeight * 2) + 5);

  // Save the PDF
  doc.save(`invoice_${orderId}.pdf`);
}
