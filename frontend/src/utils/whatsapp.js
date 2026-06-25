export function normalizeWhatsAppPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.length >= 11 && digits.length <= 15) {
    return digits;
  }

  return "";
}

export function buildWhatsAppOrderMessage(order) {
  const lines = [
    `Hello ${order.customerName || "Customer"},`,
    "",
    "Your Dhanvika Ethnic Choice Boutique order has been saved.",
    "",
    `Order ID: ${order.orderNum || order.id}`,
    `Outfit: ${order.outfit?.title || "Custom outfit"}`,
    `Price: Rs. ${Number(order.price || 0).toLocaleString("en-IN")}`,
    `Status: ${order.status}`,
    `Neck Style: ${order.customization?.neckStyle || "N/A"}`,
    `Sleeve Style: ${order.customization?.sleeveStyle || "N/A"}`,
    `Fitting: ${order.customization?.fittingStyle || "N/A"}`,
  ];

  if (order.description) {
    lines.push(`Description: ${order.description}`);
  }

  if (order.measurements && Object.keys(order.measurements).length > 0) {
    lines.push("");
    lines.push("*Measurements:*");
    Object.entries(order.measurements).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        lines.push(`- ${label}: ${val} ${order.unit || "Inches"}`);
      }
    });
  }

  lines.push("");
  lines.push(`Order Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`);
  if (order.deliveryDate) {
    lines.push(`Delivery Date: ${new Date(order.deliveryDate).toLocaleDateString("en-IN")}`);
  }
  lines.push("");
  lines.push("Thank you for choosing Dhanvika Ethnic Choice Boutique.");

  return lines.join("\n");
}

export function buildWhatsAppOrderLink(order, message = buildWhatsAppOrderMessage(order)) {
  const phone = normalizeWhatsAppPhone(order.customerPhone);

  if (!phone) {
    throw new Error(
      "Enter a valid WhatsApp mobile number, such as 9876543210 or 919876543210.",
    );
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppReadyMessage(order) {
  return [
    `Hello ${order.customerName || "Customer"},`,
    "",
    "🎉 Great news! Your order is *Ready* for pickup/delivery.",
    "",
    `Order ID: ${order.orderNum || order.id}`,
    `Outfit: ${order.outfit?.title || "Custom outfit"}`,
    `Price: Rs. ${Number(order.price || 0).toLocaleString("en-IN")}`,
    "",
    "Please visit Dhanvika Ethnic Choice Boutique to collect your order.",
    "",
    "Thank you for choosing us! 🙏",
  ].join("\n");
}
