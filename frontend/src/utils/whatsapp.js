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
  return [
    `Hello ${order.customerName || "Customer"},`,
    "",
    "Your Dhanvika Ethnic Choice Boutique order has been saved.",
    "",
    `Order ID: ${order.id}`,
    `Outfit: ${order.outfit?.title || "Custom outfit"}`,
    `Price: Rs. ${Number(order.price || 0).toLocaleString("en-IN")}`,
    `Status: ${order.status}`,
    `Neck Style: ${order.customization?.neckStyle || "N/A"}`,
    `Sleeve Style: ${order.customization?.sleeveStyle || "N/A"}`,
    `Fitting: ${order.customization?.fittingStyle || "N/A"}`,
    `Order Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`,
    "",
    "Thank you for choosing Dhanvika Ethnic Choice Boutique.",
  ].join("\n");
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
    `Order ID: ${order.id}`,
    `Outfit: ${order.outfit?.title || "Custom outfit"}`,
    `Price: Rs. ${Number(order.price || 0).toLocaleString("en-IN")}`,
    "",
    "Please visit Dhanvika Ethnic Choice Boutique to collect your order.",
    "",
    "Thank you for choosing us! 🙏",
  ].join("\n");
}
