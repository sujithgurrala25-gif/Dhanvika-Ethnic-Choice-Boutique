import { boutiqueImages } from "../assets/images.js";

export const outfitOptions = [
  {
    id: "blouse",
    title: "Designer Blouse Stitching",
    category: "Blouse",
    image: boutiqueImages.blouse,
    basePrice: 1600,
    description: "Premium blouse stitching with custom neck, sleeve, lining, and fitting options.",
    subDesigns: [
      { id: "bridal-blouse", title: "Bridal Blouse", description: "Luxurious bridal blouse with heavy embroidery, rich silk lining, and intricate beadwork." },
      { id: "maggam-work-blouse", title: "Maggam Work Blouse", description: "Traditional maggam work with gold/silver thread, zardosi, and mirror embellishments." },
      { id: "boat-neck-blouse", title: "Boat Neck Blouse", description: "Elegant boat neck style with a clean finish, perfect for sarees and festive wear." },
      { id: "designer-blouse", title: "Designer Blouse", description: "Trendy designer blouse with modern cuts, patchwork, and unique style patterns." },
    ],
  },
  {
    id: "kurti",
    title: "Elegant Kurti Stitching",
    category: "Kurti",
    image: boutiqueImages.kurti,
    basePrice: 1900,
    description: "Comfortable daily or festive kurti stitching based on exact body measurements.",
    subDesigns: [
      { id: "short-kurti", title: "Short Kurti", description: "Casual hip-length kurti with comfortable fit, ideal for everyday and office wear." },
      { id: "long-kurti", title: "Long Kurti", description: "Floor-length kurti with graceful drape, suitable for festive and semi-formal occasions." },
      { id: "a-line-kurti", title: "A-Line Kurti", description: "Classic A-line silhouette with a flattering flare that suits all body types." },
      { id: "anarkali-kurti", title: "Anarkali Kurti", description: "Royal Anarkali pattern with fitted bodice and flowing skirt for a regal look." },
    ],
  },
  {
    id: "long-frock",
    title: "Long Frock Stitching",
    category: "Long Frock",
    image: boutiqueImages.frock,
    basePrice: 2600,
    description: "Flowing long frock design with graceful fall, neat finish, and modern silhouette.",
    subDesigns: [
      { id: "party-wear-frock", title: "Party Wear Frock", description: "Glamorous party wear frock with stylish cuts, shimmer fabric, and modern design." },
      { id: "anarkali-frock", title: "Anarkali Frock", description: "Traditional Anarkali frock with a full flare, rich embroidery, and elegant look." },
      { id: "layered-frock", title: "Layered Frock", description: "Multi-layered frock with tiered skirt, adding volume and a beautiful cascading effect." },
      { id: "gown-style-frock", title: "Gown Style Frock", description: "Western-inspired gown style frock with a structured bodice and flowing trail." },
    ],
  },
  {
    id: "lehenga",
    title: "Bridal Lehenga Stitching",
    category: "Lehenga",
    image: boutiqueImages.lehenga,
    basePrice: 5200,
    description: "Occasion-ready lehenga stitching with lining, embroidery, tassels, and structured fit.",
    subDesigns: [
      { id: "bridal-lehenga", title: "Bridal Lehenga", description: "Grand bridal lehenga with heavy zari, stone work, cancan lining, and custom blouse." },
      { id: "a-line-lehenga", title: "A-Line Lehenga", description: "Sleek A-line lehenga with minimal flare for a modern, elegant bridal or festive look." },
      { id: "designer-lehenga", title: "Designer Lehenga", description: "Contemporary designer lehenga with unique prints, cutwork, and fusion styling." },
      { id: "party-wear-lehenga", title: "Party Wear Lehenga", description: "Lightweight party wear lehenga with sequins, shimmer, and comfortable fit for events." },
    ],
  },
];

export const trendingDesigns = [
  {
    title: "Trending Neck Designs",
    image: boutiqueImages.neck,
    description: "Boat, V, collar, and deep-neck styles finished for your outfit type.",
  },
  {
    title: "Sleeve Styles",
    image: boutiqueImages.sleeve,
    description: "Puff, short, elbow, and sleeveless patterns with comfortable arm movement.",
  },
  {
    title: "Bridal Patterns",
    image: boutiqueImages.bridal,
    description: "Occasion wear with rich texture, lining, tassels, and embroidery options.",
  },
];

export const boutiqueProducts = [
  {
    id: "product-blouse-001",
    name: "Designer Blouse Stitching",
    category: "Blouse",
    price: 1600,
    stock: 18,
    image: boutiqueImages.blouse,
    description: "Premium blouse stitching with custom neck, sleeve, lining, and fitting options.",
  },
  {
    id: "product-kurti-001",
    name: "Elegant Kurti Stitching",
    category: "Kurti",
    price: 1900,
    stock: 24,
    image: boutiqueImages.kurti,
    description: "Comfortable daily or festive kurti stitching based on exact body measurements.",
  },
  {
    id: "product-frock-001",
    name: "Long Frock Stitching",
    category: "Long Frock",
    price: 2600,
    stock: 12,
    image: boutiqueImages.frock,
    description: "Flowing long frock design with graceful fall, neat finish, and modern silhouette.",
  },
  {
    id: "product-lehenga-001",
    name: "Bridal Lehenga Stitching",
    category: "Lehenga",
    price: 5200,
    stock: 8,
    image: boutiqueImages.lehenga,
    description: "Occasion-ready lehenga stitching with lining, embroidery, tassels, and structured fit.",
  },
];

export const sampleFabrics = [
  { name: "Silk Cloth", image: boutiqueImages.fabricSilk },
  { name: "Cotton Print", image: boutiqueImages.fabricCotton },
  { name: "Embroidery Cloth", image: boutiqueImages.fabricEmbroidery },
];

export const commonMeasurementFields = [
  { name: "Bust", key: "bust" },
  { name: "Waist", key: "waist" },
  { name: "Shoulder", key: "shoulder" },
  { name: "Sleeve Length", key: "sleeveLength" },
  { name: "Neck Depth", key: "neckDepth" },
];

export const measurementFieldsByOutfit = {
  blouse: [
    { name: "Chest Round", key: "chestRound" },
    { name: "Under Bust", key: "underBust" },
    { name: "Waist", key: "waist" },
    { name: "Blouse Length", key: "blouseLength" },
    { name: "Shoulder", key: "shoulder" },
    { name: "Sleeve Length", key: "sleeveLength" },
    { name: "Arm Hole", key: "armHole" },
    { name: "Neck Depth", key: "neckDepth" },
    { name: "Sleeve Opening", key: "sleeveOpening" },
  ],
  kurti: [
    { name: "Bust", key: "bust" },
    { name: "Waist", key: "waist" },
    { name: "Hip", key: "hip" },
    { name: "Shoulder", key: "shoulder" },
    { name: "Sleeve Length", key: "sleeveLength" },
    { name: "Arm Round", key: "armRound" },
    { name: "Dress Length", key: "dressLength" },
    { name: "Neck Depth", key: "neckDepth" },
  ],
  "long-frock": [
    { name: "Bust", key: "bust" },
    { name: "Waist", key: "waist" },
    { name: "Hip", key: "hip" },
    { name: "Shoulder", key: "shoulder" },
    { name: "Sleeve Length", key: "sleeveLength" },
    { name: "Arm Round", key: "armRound" },
    { name: "Dress Length", key: "dressLength" },
    { name: "Neck Depth", key: "neckDepth" },
  ],
  lehenga: [
    { name: "Bust", key: "bust" },
    { name: "Waist", key: "waist" },
    { name: "Hip", key: "hip" },
    { name: "Shoulder", key: "shoulder" },
    { name: "Sleeve Length", key: "sleeveLength" },
    { name: "Arm Round", key: "armRound" },
    { name: "Dress Length", key: "dressLength" },
    { name: "Neck Depth", key: "neckDepth" },
  ],
};

export const measureInstructions = {
  bust: "Measure around the fullest part of the bust while keeping the tape level.",
  chestRound: "Measure around the chest at the fullest point without tightening the tape.",
  underBust: "Measure directly under the bust where the blouse lower band sits.",
  waist: "Measure around the natural waistline, usually the narrowest part of the torso.",
  hip: "Measure around the fullest part of the hips while standing straight.",
  shoulder: "Measure from one shoulder tip to the other across the back.",
  sleeveLength: "Measure from the shoulder tip to the desired sleeve ending point.",
  armRound: "Measure around the fullest part of the upper arm.",
  armHole: "Wrap the tape around the shoulder joint and underarm comfortably.",
  dressLength: "Measure from the shoulder point down to the desired dress length.",
  blouseLength: "Measure from the shoulder near the neck down to the blouse ending point.",
  neckDepth: "Measure from the shoulder neckline down to the desired front neck depth.",
  sleeveOpening: "Measure around the point where the sleeve should end.",
};

export const neckStyles = ["Boat Neck", "V Neck", "Collar Neck", "Deep Neck"];
export const sleeveStyles = ["Puff Sleeve", "Short Sleeve", "Elbow Sleeve", "Sleeveless"];
export const fittingOptions = ["Tight Fit", "Regular Fit", "Loose Fit"];
export const extraOptions = ["Lining", "Padding", "Tassels", "Embroidery"];
export const orderStatusOptions = ["Order Received", "Cutting", "Stitching", "Ready", "Delivered"];

export const defaultFeedback = [
  {
    id: "seed-1",
    name: "Anika",
    outfitType: "Blouse",
    rating: 5,
    message: "The fitting was clean and the sleeve finish looked premium.",
  },
  {
    id: "seed-2",
    name: "Meera",
    outfitType: "Lehenga",
    rating: 5,
    message: "Loved the fabric preview and the final order summary.",
  },
  {
    id: "seed-3",
    name: "Riya",
    outfitType: "Kurti",
    rating: 4,
    message: "Easy measurement flow and very neat customization choices.",
  },
];
