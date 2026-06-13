import { outfitOptions } from "./data.js";

const extraCharges = {
  Lining: 300,
  Padding: 250,
  Tassels: 180,
  Embroidery: 650,
};

const fittingCharges = {
  "Tight Fit": 250,
  "Regular Fit": 0,
  "Loose Fit": 150,
};

export function estimatePrice(outfitId, customization = {}) {
  const outfit = outfitOptions.find((item) => item.id === outfitId);
  const basePrice = outfit?.basePrice || 1800;
  const extras = customization.extras || [];
  const extraTotal = extras.reduce((sum, option) => sum + (extraCharges[option] || 0), 0);
  const fittingTotal = fittingCharges[customization.fittingStyle] || 0;

  return basePrice + extraTotal + fittingTotal;
}

export function formatPrice(price) {
  return `Rs. ${Number(price || 0).toLocaleString("en-IN")}`;
}
