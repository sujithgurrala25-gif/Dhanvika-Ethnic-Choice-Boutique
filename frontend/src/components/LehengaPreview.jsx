import React from "react";

export default function LehengaPreview({
  fabricImage,
  customization = {},
  measurements = {},
  unit = "Inches",
  view = "front",
}) {
  // Normalize measurements to Inches
  const isCM = String(unit).toLowerCase() === "cm";
  const scale = isCM ? 1 / 2.54 : 1;

  const rawBust = Number(measurements.bust) || 36;
  const rawWaist = Number(measurements.waist) || 30;
  const rawHip = Number(measurements.hip) || 38;
  const rawShoulder = Number(measurements.shoulder) || 14;
  const rawSleeve = Number(measurements.sleeveLength) || 8;
  const rawDressLength = Number(measurements.dressLength) || 45;
  const rawNeckDepth = Number(measurements.neckDepth) || 6;

  const bust = rawBust * scale;
  const waist = rawWaist * scale;
  const hip = rawHip * scale;
  const shoulder = rawShoulder * scale;
  const sleeveLength = rawSleeve * scale;
  const dressLength = rawDressLength * scale;
  const neckDepth = rawNeckDepth * scale;

  // Fitting allowance
  let allowance = 0;
  if (customization.fittingStyle === "Tight Fit") allowance = 0;
  else if (customization.fittingStyle === "Loose Fit") allowance = 4;
  else allowance = 2; // Regular Fit default

  const adjBust = bust + allowance;
  const adjWaist = waist + allowance;
  const adjHip = hip + allowance;

  // Coordinates
  const xCenter = 200;
  const yShoulder = 70;

  // 1. Choli Blouse horizontal sizing
  const shoulderWidth = Math.min(150, Math.max(90, shoulder * 10));
  const halfShoulder = shoulderWidth / 2;

  const bustWidth = Math.min(190, Math.max(120, adjBust * 4.3));
  const halfBust = bustWidth / 2;

  const choliWaistWidth = Math.min(160, Math.max(98, adjWaist * 3.6));
  const halfCholiWaist = choliWaistWidth / 2;

  // Heights
  const yArmpit = yShoulder + 48;
  const yCholiBottom = yShoulder + 95; // Short Blouse/Choli height

  // 2. Skirt (Lehenga) Waist & Hem
  const ySkirtWaist = yCholiBottom + 30; // 30px gap for midriff
  const skirtLength = Math.min(300, Math.max(180, dressLength * 6.3));
  const ySkirtBottom = ySkirtWaist + skirtLength;

  const skirtWaistWidth = Math.min(170, Math.max(105, adjWaist * 3.8));
  const halfSkirtWaist = skirtWaistWidth / 2;

  const skirtBottomWidth = Math.min(330, Math.max(190, adjHip * 7.5));
  const halfSkirtBottom = skirtBottomWidth / 2;

  // Points - Choli
  const shoulderLeft = xCenter - halfShoulder;
  const shoulderRight = xCenter + halfShoulder;
  const armpitLeft = xCenter - halfBust;
  const armpitRight = xCenter + halfBust;
  const choliLeft = xCenter - halfCholiWaist;
  const choliRight = xCenter + halfCholiWaist;

  // Points - Skirt
  const skirtWaistLeft = xCenter - halfSkirtWaist;
  const skirtWaistRight = xCenter + halfSkirtWaist;
  const skirtBottomLeft = xCenter - halfSkirtBottom;
  const skirtBottomRight = xCenter + halfSkirtBottom;

  // Neck Configuration
  const neckStyle = customization.neckStyle || "Boat Neck";
  let halfNeckWidth = halfShoulder * 0.65;
  let hNeck = Math.min(90, Math.max(35, neckDepth * 8));

  if (neckStyle === "Boat Neck") {
    halfNeckWidth = halfShoulder * 0.8;
    hNeck = 16;
  } else if (neckStyle === "Collar Neck") {
    halfNeckWidth = halfShoulder * 0.55;
    hNeck = 13;
  } else if (neckStyle === "V Neck") {
    halfNeckWidth = halfShoulder * 0.6;
    hNeck = Math.min(80, Math.max(35, neckDepth * 8));
  } else if (neckStyle === "Deep Neck") {
    halfNeckWidth = halfShoulder * 0.72;
    hNeck = Math.min(105, Math.max(48, neckDepth * 9.5));
  }

  const neckLeft = xCenter - halfNeckWidth;
  const neckRight = xCenter + halfNeckWidth;

  const sleeveStyle = customization.sleeveStyle || "Short Sleeve";
  const patternId = `fabricPattern-lehenga`;

  // 1. FRONT VIEW PATHS
  let frontNeckPath = "";
  if (neckStyle === "V Neck") {
    frontNeckPath = `L ${xCenter} ${yShoulder + hNeck} L ${neckRight} ${yShoulder}`;
  } else {
    frontNeckPath = `Q ${xCenter} ${yShoulder + hNeck} ${neckRight} ${yShoulder}`;
  }

  const frontCholiPath = `
    M ${neckLeft} ${yShoulder}
    ${frontNeckPath}
    L ${shoulderRight} ${yShoulder}
    Q ${armpitRight + 4} ${yShoulder + 22} ${armpitRight} ${yArmpit}
    L ${choliRight} ${yCholiBottom}
    Q ${xCenter} ${yCholiBottom + 6} ${choliLeft} ${yCholiBottom}
    L ${armpitLeft} ${yArmpit}
    Q ${armpitLeft - 4} ${yShoulder + 22} ${shoulderLeft} ${yShoulder}
    Z
  `;

  const lehengaSkirtPath = `
    M ${skirtWaistLeft} ${ySkirtWaist}
    Q ${xCenter} ${ySkirtWaist + 5} ${skirtWaistRight} ${ySkirtWaist}
    Q ${skirtWaistRight + 12} ${ySkirtWaist + 15} ${skirtWaistRight + 15} ${ySkirtWaist + 25}
    Q ${skirtBottomRight + 15} ${ySkirtBottom - 30} ${skirtBottomRight} ${ySkirtBottom}
    Q ${xCenter} ${ySkirtBottom + 12} ${skirtBottomLeft} ${ySkirtBottom}
    Q ${skirtBottomLeft - 15} ${ySkirtBottom - 30} ${skirtWaistLeft - 15} ${ySkirtWaist + 25}
    Q ${skirtWaistLeft - 12} ${ySkirtWaist + 15} ${skirtWaistLeft} ${ySkirtWaist}
    Z
  `;

  // 2. BACK VIEW PATHS
  let backNeckDepth = 22;
  if (neckStyle === "Deep Neck" || neckStyle === "V Neck") {
    backNeckDepth = Math.max(60, hNeck - 8); // Deep back choli neck
  }

  let backNeckPath = "";
  if (neckStyle === "V Neck") {
    backNeckPath = `L ${xCenter} ${yShoulder + backNeckDepth} L ${neckRight} ${yShoulder}`;
  } else {
    backNeckPath = `Q ${xCenter} ${yShoulder + backNeckDepth} ${neckRight} ${yShoulder}`;
  }

  const backCholiPath = `
    M ${neckLeft} ${yShoulder}
    ${backNeckPath}
    L ${shoulderRight} ${yShoulder}
    Q ${armpitRight + 4} ${yShoulder + 22} ${armpitRight} ${yArmpit}
    L ${choliRight} ${yCholiBottom}
    Q ${xCenter} ${yCholiBottom + 6} ${choliLeft} ${yCholiBottom}
    L ${armpitLeft} ${yArmpit}
    Q ${armpitLeft - 4} ${yShoulder + 22} ${shoulderLeft} ${yShoulder}
    Z
  `;

  // 3. SIDE VIEW PATHS (Profile View)
  const profileWidth = 100;
  const pLeft = xCenter - profileWidth / 2; // front side
  const pRight = xCenter + profileWidth / 2; // back side
  const pBustBulge = pLeft - 18;

  // Profile Choli
  const sideCholiPath = `
    M ${xCenter - 10} ${yShoulder}
    L ${xCenter + 12} ${yShoulder + 2}
    Q ${pRight} ${yArmpit} ${pRight - 5} ${yCholiBottom}
    L ${pLeft + 4} ${yCholiBottom}
    C ${pBustBulge - 4} ${yArmpit + 38} ${pBustBulge} ${yArmpit - 2} ${xCenter - 25} ${yShoulder + 18}
    Z
  `;

  // Profile Lehenga Skirt (Midriff gap included)
  const sideSkirtPath = `
    M ${pLeft + 5} ${ySkirtWaist}
    Q ${pLeft - 40} ${ySkirtBottom - 40} ${pLeft - 50} ${ySkirtBottom}
    Q ${xCenter} ${ySkirtBottom + 12} ${pRight + 45} ${ySkirtBottom}
    Q ${pRight + 30} ${ySkirtBottom - 40} ${pRight - 5} ${ySkirtWaist}
    Z
  `;

  // Sleeves paths
  let sleeveLeftPath = "";
  let sleeveRightPath = "";
  let slLen = 50;

  if (sleeveStyle !== "Sleeveless") {
    if (sleeveStyle === "Elbow Sleeve") {
      slLen = Math.min(115, Math.max(70, sleeveLength * 8));
    } else if (sleeveStyle === "Puff Sleeve") {
      slLen = 42;
    } else {
      slLen = Math.min(65, Math.max(30, sleeveLength * 6));
    }

    if (sleeveStyle === "Puff Sleeve") {
      sleeveLeftPath = `
        M ${shoulderLeft} ${yShoulder}
        C ${shoulderLeft - 35} ${yShoulder - 15} ${shoulderLeft - 45} ${yShoulder + 20} ${shoulderLeft - 20} ${yShoulder + slLen}
        L ${armpitLeft} ${yArmpit}
        Q ${armpitLeft - 4} ${yShoulder + 22} ${shoulderLeft} ${yShoulder}
        Z
      `;
      sleeveRightPath = `
        M ${shoulderRight} ${yShoulder}
        C ${shoulderRight + 35} ${yShoulder - 15} ${shoulderRight + 45} ${yShoulder + 20} ${shoulderRight + 20} ${yShoulder + slLen}
        L ${armpitRight} ${yArmpit}
        Q ${armpitRight + 4} ${yShoulder + 22} ${shoulderRight} ${yShoulder}
        Z
      `;
    } else {
      sleeveLeftPath = `
        M ${shoulderLeft} ${yShoulder}
        L ${shoulderLeft - slLen * 0.65} ${yShoulder + slLen * 0.65}
        L ${armpitLeft - slLen * 0.12} ${yArmpit + slLen * 0.18}
        L ${armpitLeft} ${yArmpit}
        Q ${armpitLeft - 4} ${yShoulder + 22} ${shoulderLeft} ${yShoulder}
        Z
      `;
      sleeveRightPath = `
        M ${shoulderRight} ${yShoulder}
        L ${shoulderRight + slLen * 0.65} ${yShoulder + slLen * 0.65}
        L ${armpitRight + slLen * 0.12} ${yArmpit + slLen * 0.18}
        L ${armpitRight} ${yArmpit}
        Q ${armpitRight + 4} ${yShoulder + 22} ${shoulderRight} ${yShoulder}
        Z
      `;
    }
  }

  // Centered single sleeve path for Side View
  let sideSleevePath = "";
  if (sleeveStyle !== "Sleeveless") {
    if (sleeveStyle === "Puff Sleeve") {
      sideSleevePath = `
        M ${xCenter - 22} ${yShoulder + 2}
        C ${xCenter - 45} ${yShoulder - 20} ${xCenter + 45} ${yShoulder - 20} ${xCenter + 22} ${yShoulder + 2}
        C ${xCenter + 32} ${yShoulder + 30} ${xCenter + 15} ${yShoulder + slLen} ${xCenter} ${yShoulder + slLen}
        C ${xCenter - 15} ${yShoulder + slLen} ${xCenter - 32} ${yShoulder + 30} ${xCenter - 22} ${yShoulder + 2}
        Z
      `;
    } else {
      sideSleevePath = `
        M ${xCenter - 25} ${yShoulder + 4}
        Q ${xCenter} ${yShoulder - 6} ${xCenter + 25} ${yShoulder + 4}
        L ${xCenter + 15} ${yShoulder + slLen}
        L ${xCenter - 15} ${yShoulder + slLen}
        Z
      `;
    }
  }

  return (
    <svg
      viewBox="0 0 400 500"
      className="h-full w-full max-w-[320px] drop-shadow-lg transition-all duration-300"
      style={{ overflow: "visible" }}
    >
      <defs>
        {/* Main fabric pattern - scaled up for better detail visibility */}
        <pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width="400"
          height="500"
        >
          <image
            href={fabricImage}
            x="0"
            y="0"
            width="400"
            height="500"
            preserveAspectRatio="xMidYMid slice"
          />
        </pattern>

        {/* Bias-rotated fabric patterns for sleeves to simulate realistic fabric cuts */}
        <pattern
          id={`${patternId}-sleeve-left`}
          patternUnits="userSpaceOnUse"
          width="400"
          height="500"
          patternTransform="rotate(15)"
        >
          <image
            href={fabricImage}
            x="0"
            y="0"
            width="400"
            height="500"
            preserveAspectRatio="xMidYMid slice"
          />
        </pattern>
        <pattern
          id={`${patternId}-sleeve-right`}
          patternUnits="userSpaceOnUse"
          width="400"
          height="500"
          patternTransform="rotate(-15)"
        >
          <image
            href={fabricImage}
            x="0"
            y="0"
            width="400"
            height="500"
            preserveAspectRatio="xMidYMid slice"
          />
        </pattern>

        {/* Weave texture overlay pattern representing linen/silk cloth weave */}
        <pattern id="fabricWeave" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 0 4 L 8 4 M 4 0 L 4 8" stroke="#513252" strokeWidth="0.4" opacity="0.10" />
          <path d="M 0 0 L 8 8" stroke="#ffffff" strokeWidth="0.3" opacity="0.06" />
        </pattern>

        <filter id="sketchShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow
            dx="1"
            dy="3"
            stdDeviation="4"
            floodColor="#513252"
            floodOpacity="0.12"
          />
        </filter>

        {/* 3D Volumetric cylindrical lighting gradient */}
        <linearGradient id="bodyShading" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.22" />
          <stop offset="18%" stopColor="#000000" stopOpacity="0.04" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.24" />
          <stop offset="82%" stopColor="#000000" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
        </linearGradient>

        {/* Diagonal lighting gradient for sleeves / side views */}
        <linearGradient id="shadingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="50%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Sketch Mannequin Dummy Background */}
      <g stroke="#e2d6db" strokeWidth="1.5" fill="none" strokeDasharray="4,4">
        {view !== "side" ? (
          <>
            <path d="M 180 50 Q 200 30 220 50" />
            <path d="M 200 50 L 200 20" />
            <ellipse cx="200" cy="15" rx="14" ry="9" />
            <path d="M 140 80 C 130 160 120 260 145 350 C 165 415 235 415 255 350 C 280 260 270 160 260 80" />
            <line
              x1="200"
              y1="50"
              x2="200"
              y2="455"
              stroke="#dbccd2"
              strokeWidth="2"
            />
          </>
        ) : (
          <>
            <ellipse cx="200" cy="15" rx="11" ry="9" />
            <line
              x1="200"
              y1="26"
              x2="200"
              y2="455"
              stroke="#dbccd2"
              strokeWidth="2"
            />
            <path
              d="M 200 50 Q 185 60 182 80 C 170 140 150 235 175 350 Q 200 360 225 350 C 240 235 220 140 215 80 Z"
              opacity="0.5"
            />
          </>
        )}
        <line
          x1="200"
          y1="455"
          x2="200"
          y2="480"
          stroke="#c0a6b2"
          strokeWidth="3"
          strokeDasharray="none"
        />
        <path
          d="M 160 480 L 240 480 M 180 480 L 200 462 L 220 480"
          stroke="#c0a6b2"
          strokeWidth="2.5"
          strokeDasharray="none"
        />
      </g>

      {/* Lehenga Choli Group */}
      <g filter="url(#sketchShadow)">
        {/* VIEW 1: FRONT VIEW */}
        {view === "front" && (
          <>
            {/* Sleeves */}
            {sleeveStyle !== "Sleeveless" && (
              <>
                <path
                  d={sleeveLeftPath}
                  fill={`url(#${patternId}-sleeve-left)`}
                  stroke="#513252"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d={sleeveLeftPath}
                  fill="url(#shadingGrad)"
                  stroke="none"
                />
                <path
                  d={sleeveLeftPath}
                  fill="url(#fabricWeave)"
                  stroke="none"
                />
                <path
                  d={sleeveRightPath}
                  fill={`url(#${patternId}-sleeve-right)`}
                  stroke="#513252"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d={sleeveRightPath}
                  fill="url(#shadingGrad)"
                  stroke="none"
                />
                <path
                  d={sleeveRightPath}
                  fill="url(#fabricWeave)"
                  stroke="none"
                />
              </>
            )}

            {sleeveStyle === "Sleeveless" && (
              <>
                <path
                  d={`M ${shoulderLeft} ${yShoulder} Q ${armpitLeft - 4} ${yShoulder + 22} ${armpitLeft} ${yArmpit}`}
                  stroke="#513252"
                  strokeWidth="3.5"
                  fill="none"
                  opacity="0.3"
                />
                <path
                  d={`M ${shoulderRight} ${yShoulder} Q ${armpitRight + 4} ${yShoulder + 22} ${armpitRight} ${yArmpit}`}
                  stroke="#513252"
                  strokeWidth="3.5"
                  fill="none"
                  opacity="0.3"
                />
              </>
            )}

            {/* Choli Blouse */}
            <path
              d={frontCholiPath}
              fill={`url(#${patternId})`}
              stroke="#513252"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d={frontCholiPath} fill="url(#bodyShading)" stroke="none" />
            <path d={frontCholiPath} fill="url(#fabricWeave)" stroke="none" />

            {/* Lehenga Skirt */}
            <path
              d={lehengaSkirtPath}
              fill={`url(#${patternId})`}
              stroke="#513252"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d={lehengaSkirtPath} fill="url(#bodyShading)" stroke="none" />
            <path d={lehengaSkirtPath} fill="url(#fabricWeave)" stroke="none" />

            {/* Skirt Waistband detail */}
            <path
              d={`M ${skirtWaistLeft} ${ySkirtWaist} Q ${xCenter} ${ySkirtWaist + 5} ${skirtWaistRight}`}
              stroke="#513252"
              strokeWidth="2.5"
              fill="none"
            />

            {/* Skirt Panels / Kali lines */}
            <g stroke="#513252" strokeWidth="1.2" fill="none" opacity="0.3">
              <path
                d={`M ${skirtWaistLeft + 25} ${ySkirtWaist + 5} Q ${xCenter - 45} ${ySkirtWaist + 100} ${skirtBottomLeft + 45} ${ySkirtBottom}`}
              />
              <path
                d={`M ${skirtWaistLeft + 55} ${ySkirtWaist + 5} Q ${xCenter - 15} ${ySkirtWaist + 100} ${skirtBottomLeft + 95} ${ySkirtBottom}`}
              />
              <path
                d={`M ${xCenter} ${ySkirtWaist + 5} Q ${xCenter} ${ySkirtWaist + 100} ${xCenter} ${ySkirtBottom}`}
              />
              <path
                d={`M ${skirtWaistRight - 55} ${ySkirtWaist + 5} Q ${xCenter + 15} ${ySkirtWaist + 100} ${skirtBottomRight - 95} ${ySkirtBottom}`}
              />
              <path
                d={`M ${skirtWaistRight - 25} ${ySkirtWaist + 5} Q ${xCenter + 45} ${ySkirtWaist + 100} ${skirtBottomRight - 45} ${ySkirtBottom}`}
              />
            </g>

            {/* Extra Options: Embroidery */}
            {customization.extras?.includes("Embroidery") && (
              <>
                <path
                  d={`M ${neckLeft} ${yShoulder} ${frontNeckPath}`}
                  fill="none"
                  stroke="#c99a2e"
                  strokeWidth="3.5"
                  strokeDasharray="2,3"
                  opacity="0.85"
                />
                <path
                  d={`M ${skirtBottomLeft + 12} ${ySkirtBottom - 12} Q ${xCenter} ${ySkirtBottom + 2} ${skirtBottomRight - 12} ${ySkirtBottom - 12}`}
                  fill="none"
                  stroke="#c99a2e"
                  strokeWidth="4"
                  strokeDasharray="2,3"
                  opacity="0.85"
                />
              </>
            )}

            {/* Collar Neck */}
            {neckStyle === "Collar Neck" && (
              <g stroke="#513252" strokeWidth="2" fill="none">
                <path
                  d={`M ${neckLeft} ${yShoulder} L ${xCenter - 4} ${yShoulder + 12} L ${xCenter} ${yShoulder + 10}`}
                  fill={`url(#${patternId})`}
                />
                <path
                  d={`M ${neckLeft} ${yShoulder} L ${xCenter - 4} ${yShoulder + 12} L ${xCenter} ${yShoulder + 10}`}
                  fill="url(#fabricWeave)"
                  stroke="none"
                />
                <path
                  d={`M ${neckRight} ${yShoulder} L ${xCenter + 4} ${yShoulder + 12} L ${xCenter} ${yShoulder + 10}`}
                  fill={`url(#${patternId})`}
                />
                <path
                  d={`M ${neckRight} ${yShoulder} L ${xCenter + 4} ${yShoulder + 12} L ${xCenter} ${yShoulder + 10}`}
                  fill="url(#fabricWeave)"
                  stroke="none"
                />
              </g>
            )}

            {/* Extra Options: Tassels (hanging from the waistband) */}
            {customization.extras?.includes("Tassels") && (
              <g stroke="#c99a2e" strokeWidth="1.5" fill="#c99a2e">
                <path
                  d={`M ${skirtWaistLeft + 10} ${ySkirtWaist + 3} Q ${skirtWaistLeft - 20} ${ySkirtWaist + 35} ${skirtWaistLeft - 18} ${ySkirtWaist + 65}`}
                  stroke="#c99a2e"
                  fill="none"
                />
                <circle cx={skirtWaistLeft - 18} cy={ySkirtWaist + 65} r="4" />
                <path
                  d={`M ${skirtWaistLeft - 22} ${ySkirtWaist + 65} L ${skirtWaistLeft - 27} ${ySkirtWaist + 82} L ${skirtWaistLeft - 13} ${ySkirtWaist + 82} Z`}
                />
                <path
                  d={`M ${skirtWaistLeft + 10} ${ySkirtWaist + 3} Q ${skirtWaistLeft - 10} ${ySkirtWaist + 45} ${skirtWaistLeft - 5} ${ySkirtWaist + 80}`}
                  stroke="#c99a2e"
                  fill="none"
                />
                <circle cx={skirtWaistLeft - 5} cy={ySkirtWaist + 80} r="4" />
                <path
                  d={`M ${skirtWaistLeft - 9} ${ySkirtWaist + 80} L ${skirtWaistLeft - 14} ${ySkirtWaist + 97} L ${skirtWaistLeft} ${ySkirtWaist + 97} Z`}
                />
              </g>
            )}
          </>
        )}

        {/* VIEW 2: BACK VIEW */}
        {view === "back" && (
          <>
            {/* Sleeves */}
            {sleeveStyle !== "Sleeveless" && (
              <>
                <path
                  d={sleeveLeftPath}
                  fill={`url(#${patternId}-sleeve-left)`}
                  stroke="#513252"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d={sleeveLeftPath}
                  fill="url(#shadingGrad)"
                  stroke="none"
                />
                <path
                  d={sleeveLeftPath}
                  fill="url(#fabricWeave)"
                  stroke="none"
                />
                <path
                  d={sleeveRightPath}
                  fill={`url(#${patternId}-sleeve-right)`}
                  stroke="#513252"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d={sleeveRightPath}
                  fill="url(#shadingGrad)"
                  stroke="none"
                />
                <path
                  d={sleeveRightPath}
                  fill="url(#fabricWeave)"
                  stroke="none"
                />
              </>
            )}

            {sleeveStyle === "Sleeveless" && (
              <>
                <path
                  d={`M ${shoulderLeft} ${yShoulder} Q ${armpitLeft - 4} ${yShoulder + 22} ${armpitLeft} ${yArmpit}`}
                  stroke="#513252"
                  strokeWidth="3.5"
                  fill="none"
                  opacity="0.3"
                />
                <path
                  d={`M ${shoulderRight} ${yShoulder} Q ${armpitRight + 4} ${yShoulder + 22} ${armpitRight} ${yArmpit}`}
                  stroke="#513252"
                  strokeWidth="3.5"
                  fill="none"
                  opacity="0.3"
                />
              </>
            )}

            {/* Choli Blouse Back */}
            <path
              d={backCholiPath}
              fill={`url(#${patternId})`}
              stroke="#513252"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d={backCholiPath} fill="url(#bodyShading)" stroke="none" />
            <path d={backCholiPath} fill="url(#fabricWeave)" stroke="none" />

            {/* Hooks line down the middle of Choli */}
            <line
              x1={xCenter}
              y1={yShoulder + backNeckDepth}
              x2={xCenter}
              y2={yCholiBottom}
              stroke="#513252"
              strokeWidth="1.8"
              strokeDasharray="3,3"
              opacity="0.7"
            />

            {/* Back Dori & Tassels for Lehenga Choli */}
            {(customization.extras?.includes("Tassels") ||
              backNeckDepth > 45) && (
              <g>
                <path
                  d={`M ${shoulderLeft + 18} ${yShoulder + 18} Q ${xCenter} ${yShoulder + 28} ${shoulderRight - 18} ${yShoulder + 18}`}
                  fill="none"
                  stroke="#c99a2e"
                  strokeWidth="2"
                />
                <path
                  d={`M ${xCenter} ${yShoulder + 23} L ${xCenter - 15} ${yShoulder + 75}`}
                  fill="none"
                  stroke="#c99a2e"
                  strokeWidth="1.5"
                />
                <path
                  d={`M ${xCenter} ${yShoulder + 23} L ${xCenter + 15} ${yShoulder + 75}`}
                  fill="none"
                  stroke="#c99a2e"
                  strokeWidth="1.5"
                />
                <g fill="#c99a2e" stroke="#c99a2e">
                  <circle cx={xCenter - 15} cy={yShoulder + 75} r="3" />
                  <path
                    d={`M ${xCenter - 18} ${yShoulder + 75} L ${xCenter - 21} ${yShoulder + 88} L ${xCenter - 11} ${yShoulder + 88} Z`}
                  />
                  <circle cx={xCenter + 15} cy={yShoulder + 75} r="3" />
                  <path
                    d={`M ${xCenter + 12} ${yShoulder + 75} L ${xCenter + 9} ${yShoulder + 88} L ${xCenter + 19} ${yShoulder + 88} Z`}
                  />
                </g>
              </g>
            )}

            {/* Lehenga Skirt Back */}
            <path
              d={lehengaSkirtPath}
              fill={`url(#${patternId})`}
              stroke="#513252"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d={lehengaSkirtPath} fill="url(#bodyShading)" stroke="none" />
            <path d={lehengaSkirtPath} fill="url(#fabricWeave)" stroke="none" />

            {/* Skirt Waistband detail */}
            <path
              d={`M ${skirtWaistLeft} ${ySkirtWaist} Q ${xCenter} ${ySkirtWaist + 5} ${skirtWaistRight}`}
              stroke="#513252"
              strokeWidth="2.5"
              fill="none"
            />

            {/* Skirt panels / Kali lines */}
            <g stroke="#513252" strokeWidth="1.2" fill="none" opacity="0.3">
              <path
                d={`M ${skirtWaistLeft + 25} ${ySkirtWaist + 5} Q ${xCenter - 45} ${ySkirtWaist + 100} ${skirtBottomLeft + 45} ${ySkirtBottom}`}
              />
              <path
                d={`M ${skirtWaistLeft + 55} ${ySkirtWaist + 5} Q ${xCenter - 15} ${ySkirtWaist + 100} ${skirtBottomLeft + 95} ${ySkirtBottom}`}
              />
              <path
                d={`M ${xCenter} ${ySkirtWaist + 5} Q ${xCenter} ${ySkirtWaist + 100} ${xCenter} ${ySkirtBottom}`}
              />
              <path
                d={`M ${skirtWaistRight - 55} ${ySkirtWaist + 5} Q ${xCenter + 15} ${ySkirtWaist + 100} ${skirtBottomRight - 95} ${ySkirtBottom}`}
              />
              <path
                d={`M ${skirtWaistRight - 25} ${ySkirtWaist + 5} Q ${xCenter + 45} ${ySkirtWaist + 100} ${skirtBottomRight - 45} ${ySkirtBottom}`}
              />
            </g>
          </>
        )}

        {/* VIEW 3: SIDE VIEW */}
        {view === "side" && (
          <>
            {/* Single side sleeve */}
            {sleeveStyle !== "Sleeveless" && (
              <>
                <path
                  d={sideSleevePath}
                  fill={`url(#${patternId}-sleeve-left)`}
                  stroke="#513252"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d={sideSleevePath}
                  fill="url(#shadingGrad)"
                  stroke="none"
                />
                <path
                  d={sideSleevePath}
                  fill="url(#fabricWeave)"
                  stroke="none"
                />
              </>
            )}

            {/* Side Choli */}
            <path
              d={sideCholiPath}
              fill={`url(#${patternId})`}
              stroke="#513252"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d={sideCholiPath} fill="url(#bodyShading)" stroke="none" />
            <path d={sideCholiPath} fill="url(#fabricWeave)" stroke="none" />

            {/* Side Lehenga Skirt */}
            <path
              d={sideSkirtPath}
              fill={`url(#${patternId})`}
              stroke="#513252"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d={sideSkirtPath} fill="url(#bodyShading)" stroke="none" />
            <path d={sideSkirtPath} fill="url(#fabricWeave)" stroke="none" />

            {/* Armhole profile stitch outline */}
            <path
              d={`M ${xCenter - 25} ${yShoulder + 5} Q ${xCenter} ${yShoulder + 25} ${xCenter + 25} ${yShoulder + 5} Q ${xCenter} ${yArmpit + 5} ${xCenter - 25} ${yShoulder + 5}`}
              fill="none"
              stroke="#513252"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              opacity="0.4"
            />

            {/* Side seam for Choli */}
            <line
              x1={xCenter}
              y1={yArmpit + 10}
              x2={xCenter}
              y2={yCholiBottom}
              stroke="#513252"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              opacity="0.6"
            />

            {/* Side Waist Hanging Latkan Tassels (Lehenga latkan is traditionally tied on the left side) */}
            {customization.extras?.includes("Tassels") && (
              <g stroke="#c99a2e" strokeWidth="1.5" fill="#c99a2e">
                {/* Draw string hanging from left side waist hem in profile */}
                <path
                  d={`M ${pLeft + 8} ${ySkirtWaist + 4} Q ${pLeft - 22} ${ySkirtWaist + 45} ${pLeft - 18} ${ySkirtWaist + 85}`}
                  stroke="#c99a2e"
                  fill="none"
                />
                <circle cx={pLeft - 18} cy={ySkirtWaist + 85} r="4" />
                <path
                  d={`M ${pLeft - 22} ${ySkirtWaist + 85} L ${pLeft - 27} ${ySkirtWaist + 102} L ${pLeft - 13} ${ySkirtWaist + 102} Z`}
                />

                <path
                  d={`M ${pLeft + 8} ${ySkirtWaist + 4} Q ${pLeft - 10} ${ySkirtWaist + 55} ${pLeft - 5} ${ySkirtWaist + 105}`}
                  stroke="#c99a2e"
                  fill="none"
                />
                <circle cx={pLeft - 5} cy={ySkirtWaist + 105} r="4" />
                <path
                  d={`M ${pLeft - 9} ${ySkirtWaist + 105} L ${pLeft - 14} ${ySkirtWaist + 122} L ${pLeft} ${ySkirtWaist + 122} Z`}
                />
              </g>
            )}
          </>
        )}
      </g>
    </svg>
  );
}
