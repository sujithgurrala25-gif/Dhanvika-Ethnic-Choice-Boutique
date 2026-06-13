import React from "react";

export default function BlousePreview({
  fabricImage,
  customization = {},
  measurements = {},
  unit = "Inches",
  view = "front",
}) {
  // Normalize measurements to Inches
  const isCM = String(unit).toLowerCase() === "cm";
  const scale = isCM ? 1 / 2.54 : 1;

  const rawBust = Number(measurements.chestRound || measurements.bust) || 36;
  const rawWaist = Number(measurements.underBust || measurements.waist) || 30;
  const rawShoulder = Number(measurements.shoulder) || 14;
  const rawSleeve = Number(measurements.sleeveLength) || 8;
  const rawBlouseLength = Number(measurements.blouseLength) || 15;
  const rawNeckDepth = Number(measurements.neckDepth) || 6;

  const bust = rawBust * scale;
  const waist = rawWaist * scale;
  const shoulder = rawShoulder * scale;
  const sleeveLength = rawSleeve * scale;
  const blouseLength = rawBlouseLength * scale;
  const neckDepth = rawNeckDepth * scale;

  // Apply fitting allowance
  let allowance = 0;
  if (customization.fittingStyle === "Tight Fit") allowance = 0;
  else if (customization.fittingStyle === "Loose Fit") allowance = 4;
  else allowance = 2; // Regular Fit default

  const adjBust = bust + allowance;
  const adjWaist = waist + allowance;

  // Dimensions & Coordinates
  const xCenter = 200;
  const yShoulder = 140;

  // Horizontal scaling factors to keep SVG proportional and bounded
  const shoulderWidth = Math.min(170, Math.max(110, shoulder * 11));
  const halfShoulder = shoulderWidth / 2;

  const bustWidth = Math.min(210, Math.max(130, adjBust * 4.6));
  const halfBust = bustWidth / 2;

  const waistWidth = Math.min(190, Math.max(110, adjWaist * 4.4));
  const halfWaist = waistWidth / 2;

  // Heights
  const lengthHeight = Math.min(180, Math.max(110, blouseLength * 10));
  const yBottom = yShoulder + lengthHeight;
  const yArmpit = yShoulder + 55;

  // Key coordinate points
  const shoulderLeft = xCenter - halfShoulder;
  const shoulderRight = xCenter + halfShoulder;
  const armpitLeft = xCenter - halfBust;
  const armpitRight = xCenter + halfBust;
  const bottomLeft = xCenter - halfWaist;
  const bottomRight = xCenter + halfWaist;

  // Neck Calculations
  const neckStyle = customization.neckStyle || "Boat Neck";
  let halfNeckWidth = halfShoulder * 0.7;
  let hNeck = Math.min(110, Math.max(40, neckDepth * 10));

  if (neckStyle === "Boat Neck") {
    halfNeckWidth = halfShoulder * 0.85;
    hNeck = 22;
  } else if (neckStyle === "Collar Neck") {
    halfNeckWidth = halfShoulder * 0.55;
    hNeck = 18;
  } else if (neckStyle === "V Neck") {
    halfNeckWidth = halfShoulder * 0.65;
    hNeck = Math.min(100, Math.max(45, neckDepth * 10));
  } else if (neckStyle === "Deep Neck") {
    halfNeckWidth = halfShoulder * 0.75;
    hNeck = Math.min(125, Math.max(65, neckDepth * 12));
  }

  const neckLeft = xCenter - halfNeckWidth;
  const neckRight = xCenter + halfNeckWidth;

  const sleeveStyle = customization.sleeveStyle || "Short Sleeve";
  const patternId = `fabricPattern-blouse`;

  // 1. FRONT VIEW PATHS
  let frontNeckPath = "";
  if (neckStyle === "V Neck") {
    frontNeckPath = `L ${xCenter} ${yShoulder + hNeck} L ${neckRight} ${yShoulder}`;
  } else {
    frontNeckPath = `Q ${xCenter} ${yShoulder + hNeck} ${neckRight} ${yShoulder}`;
  }

  const frontBodyPath = `
    M ${neckLeft} ${yShoulder}
    ${frontNeckPath}
    L ${shoulderRight} ${yShoulder}
    Q ${armpitRight + 5} ${yShoulder + 25} ${armpitRight} ${yArmpit}
    L ${bottomRight} ${yBottom}
    Q ${xCenter} ${yBottom + 8} ${bottomLeft} ${yBottom}
    L ${armpitLeft} ${yArmpit}
    Q ${armpitLeft - 5} ${yShoulder + 25} ${shoulderLeft} ${yShoulder}
    Z
  `;

  // 2. BACK VIEW PATHS
  // Back neck is typically deep round, collar wrapping, or has hook openings
  let backNeckDepth = 25; // Boat/Collar back neck
  if (neckStyle === "Deep Neck" || neckStyle === "V Neck") {
    backNeckDepth = Math.max(70, hNeck - 10); // Sexy back neck
  }

  let backNeckPath = "";
  if (neckStyle === "V Neck") {
    backNeckPath = `L ${xCenter} ${yShoulder + backNeckDepth} L ${neckRight} ${yShoulder}`;
  } else {
    backNeckPath = `Q ${xCenter} ${yShoulder + backNeckDepth} ${neckRight} ${yShoulder}`;
  }

  const backBodyPath = `
    M ${neckLeft} ${yShoulder}
    ${backNeckPath}
    L ${shoulderRight} ${yShoulder}
    Q ${armpitRight + 5} ${yShoulder + 25} ${armpitRight} ${yArmpit}
    L ${bottomRight} ${yBottom}
    Q ${xCenter} ${yBottom + 8} ${bottomLeft} ${yBottom}
    L ${armpitLeft} ${yArmpit}
    Q ${armpitLeft - 5} ${yShoulder + 25} ${shoulderLeft} ${yShoulder}
    Z
  `;

  // 3. SIDE VIEW PATHS (Profile View)
  const profileWidth = 100;
  const pLeft = xCenter - profileWidth / 2;
  const pRight = xCenter + profileWidth / 2;
  const pBustBulge = pLeft - 22; // Front bust projection

  // Profile Bodice Path (Front bust curve on left, flatter back curve on right)
  const sideBodyPath = `
    M ${xCenter - 10} ${yShoulder}
    L ${xCenter + 12} ${yShoulder + 2}
    Q ${pRight} ${yArmpit} ${pRight - 8} ${yBottom}
    L ${pLeft + 8} ${yBottom}
    C ${pBustBulge - 5} ${yArmpit + 45} ${pBustBulge} ${yArmpit - 5} ${xCenter - 25} ${yShoulder + 20}
    Z
  `;

  // Sleeves Paths (Front/Back)
  let sleeveLeftPath = "";
  let sleeveRightPath = "";
  let slLen = 50; // default short

  if (sleeveStyle !== "Sleeveless") {
    if (sleeveStyle === "Elbow Sleeve") {
      slLen = Math.min(140, Math.max(80, sleeveLength * 10));
    } else if (sleeveStyle === "Puff Sleeve") {
      slLen = 45;
    } else {
      slLen = Math.min(80, Math.max(35, sleeveLength * 7.5));
    }

    if (sleeveStyle === "Puff Sleeve") {
      sleeveLeftPath = `
        M ${shoulderLeft} ${yShoulder}
        C ${shoulderLeft - 45} ${yShoulder - 15} ${shoulderLeft - 55} ${yShoulder + 25} ${shoulderLeft - 30} ${yShoulder + slLen}
        L ${armpitLeft} ${yArmpit}
        Q ${armpitLeft - 5} ${yShoulder + 25} ${shoulderLeft} ${yShoulder}
        Z
      `;
      sleeveRightPath = `
        M ${shoulderRight} ${yShoulder}
        C ${shoulderRight + 45} ${yShoulder - 15} ${shoulderRight + 55} ${yShoulder + 25} ${shoulderRight + 30} ${yShoulder + slLen}
        L ${armpitRight} ${yArmpit}
        Q ${armpitRight + 5} ${yShoulder + 25} ${shoulderRight} ${yShoulder}
        Z
      `;
    } else {
      sleeveLeftPath = `
        M ${shoulderLeft} ${yShoulder}
        L ${shoulderLeft - slLen * 0.6} ${yShoulder + slLen * 0.6}
        L ${armpitLeft - slLen * 0.1} ${yArmpit + slLen * 0.2}
        L ${armpitLeft} ${yArmpit}
        Q ${armpitLeft - 5} ${yShoulder + 25} ${shoulderLeft} ${yShoulder}
        Z
      `;
      sleeveRightPath = `
        M ${shoulderRight} ${yShoulder}
        L ${shoulderRight + slLen * 0.6} ${yShoulder + slLen * 0.6}
        L ${armpitRight + slLen * 0.1} ${yArmpit + slLen * 0.2}
        L ${armpitRight} ${yArmpit}
        Q ${armpitRight + 5} ${yShoulder + 25} ${shoulderRight} ${yShoulder}
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
        C ${xCenter - 48} ${yShoulder - 20} ${xCenter + 48} ${yShoulder - 20} ${xCenter + 22} ${yShoulder + 2}
        C ${xCenter + 35} ${yShoulder + 30} ${xCenter + 15} ${yShoulder + slLen} ${xCenter} ${yShoulder + slLen}
        C ${xCenter - 15} ${yShoulder + slLen} ${xCenter - 35} ${yShoulder + 30} ${xCenter - 22} ${yShoulder + 2}
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
        <pattern
          id={patternId}
          patternUnits="userSpaceOnUse"
          width="120"
          height="120"
        >
          <image
            href={fabricImage}
            x="0"
            y="0"
            width="120"
            height="120"
            preserveAspectRatio="xMidYMid slice"
          />
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
        <linearGradient id="shadingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Sketch Mannequin Dummy Background */}
      <g stroke="#e2d6db" strokeWidth="1.5" fill="none" strokeDasharray="4,4">
        {view !== "side" ? (
          <>
            <path d="M 180 100 Q 200 80 220 100" />
            <path d="M 200 100 L 200 70" />
            <ellipse cx="200" cy="65" rx="18" ry="12" />
            <path d="M 140 140 C 130 200 120 280 150 360 C 170 410 230 410 250 360 C 280 280 270 200 260 140" />
            <line
              x1="200"
              y1="100"
              x2="200"
              y2="430"
              stroke="#dbccd2"
              strokeWidth="2"
            />
            <path d="M 150 360 Q 200 375 250 360" />
          </>
        ) : (
          <>
            {/* Side mannequin profile */}
            <ellipse cx="200" cy="65" rx="12" ry="12" />
            <line
              x1="200"
              y1="77"
              x2="200"
              y2="430"
              stroke="#dbccd2"
              strokeWidth="2"
            />
            <path d="M 200 100 Q 185 110 182 140 C 170 200 150 280 175 360 Q 200 370 225 360 C 240 280 220 200 215 140 Z" />
          </>
        )}
        {/* Floor Stand */}
        <line
          x1="200"
          y1="430"
          x2="200"
          y2="475"
          stroke="#c0a6b2"
          strokeWidth="3.5"
          strokeDasharray="none"
        />
        <path
          d="M 160 475 L 240 475 M 180 475 L 200 455 L 220 475"
          stroke="#c0a6b2"
          strokeWidth="3"
          strokeDasharray="none"
        />
      </g>

      {/* Main Blouse Group */}
      <g filter="url(#sketchShadow)">
        {/* VIEW 1: FRONT VIEW */}
        {view === "front" && (
          <>
            {/* Sleeves (behind body) */}
            {sleeveStyle !== "Sleeveless" && (
              <>
                <path
                  d={sleeveLeftPath}
                  fill={`url(#${patternId})`}
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
                  d={sleeveRightPath}
                  fill={`url(#${patternId})`}
                  stroke="#513252"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d={sleeveRightPath}
                  fill="url(#shadingGrad)"
                  stroke="none"
                />
              </>
            )}

            {/* Sleeveless armhole finishing trim */}
            {sleeveStyle === "Sleeveless" && (
              <>
                <path
                  d={`M ${shoulderLeft} ${yShoulder} Q ${armpitLeft - 5} ${yShoulder + 25} ${armpitLeft} ${yArmpit}`}
                  stroke="#513252"
                  strokeWidth="3.5"
                  fill="none"
                  opacity="0.3"
                />
                <path
                  d={`M ${shoulderRight} ${yShoulder} Q ${armpitRight + 5} ${yShoulder + 25} ${armpitRight} ${yArmpit}`}
                  stroke="#513252"
                  strokeWidth="3.5"
                  fill="none"
                  opacity="0.3"
                />
              </>
            )}

            {/* Blouse Body */}
            <path
              d={frontBodyPath}
              fill={`url(#${patternId})`}
              stroke="#513252"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d={frontBodyPath} fill="url(#shadingGrad)" stroke="none" />

            {/* Extras: Embroidery Accent */}
            {customization.extras?.includes("Embroidery") && (
              <path
                d={`M ${neckLeft} ${yShoulder} ${frontNeckPath}`}
                fill="none"
                stroke="#c99a2e"
                strokeWidth="3.5"
                strokeDasharray="2,3"
                opacity="0.85"
              />
            )}

            {/* Collar Neck lapels */}
            {neckStyle === "Collar Neck" && (
              <g stroke="#513252" strokeWidth="2" fill="none">
                <path
                  d={`M ${neckLeft} ${yShoulder} L ${xCenter - 5} ${yShoulder + 20} L ${xCenter} ${yShoulder + 18}`}
                  fill={`url(#${patternId})`}
                />
                <path
                  d={`M ${neckRight} ${yShoulder} L ${xCenter + 5} ${yShoulder + 20} L ${xCenter} ${yShoulder + 18}`}
                  fill={`url(#${patternId})`}
                />
              </g>
            )}

            {/* Front darts details */}
            <path
              d={`M ${bottomLeft + 30} ${yBottom} L ${bottomLeft + 35} ${yBottom - 35}`}
              stroke="#513252"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              opacity="0.5"
            />
            <path
              d={`M ${bottomRight - 30} ${yBottom} L ${bottomRight - 35} ${yBottom - 35}`}
              stroke="#513252"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              opacity="0.5"
            />
          </>
        )}

        {/* VIEW 2: BACK VIEW */}
        {view === "back" && (
          <>
            {/* Sleeves (back view, behind body) */}
            {sleeveStyle !== "Sleeveless" && (
              <>
                {/* Mirroring sleeves for back view */}
                <path
                  d={sleeveLeftPath}
                  fill={`url(#${patternId})`}
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
                  d={sleeveRightPath}
                  fill={`url(#${patternId})`}
                  stroke="#513252"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d={sleeveRightPath}
                  fill="url(#shadingGrad)"
                  stroke="none"
                />
              </>
            )}

            {sleeveStyle === "Sleeveless" && (
              <>
                <path
                  d={`M ${shoulderLeft} ${yShoulder} Q ${armpitLeft - 5} ${yShoulder + 25} ${armpitLeft} ${yArmpit}`}
                  stroke="#513252"
                  strokeWidth="3.5"
                  fill="none"
                  opacity="0.3"
                />
                <path
                  d={`M ${shoulderRight} ${yShoulder} Q ${armpitRight + 5} ${yShoulder + 25} ${armpitRight} ${yArmpit}`}
                  stroke="#513252"
                  strokeWidth="3.5"
                  fill="none"
                  opacity="0.3"
                />
              </>
            )}

            {/* Blouse Body */}
            <path
              d={backBodyPath}
              fill={`url(#${patternId})`}
              stroke="#513252"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d={backBodyPath} fill="url(#shadingGrad)" stroke="none" />

            {/* Back Hook-and-Eye Center Seam */}
            <line
              x1={xCenter}
              y1={yShoulder + backNeckDepth}
              x2={xCenter}
              y2={yBottom}
              stroke="#513252"
              strokeWidth="1.8"
              strokeDasharray="4,4"
              opacity="0.8"
            />

            {/* Darts */}
            <path
              d={`M ${bottomLeft + 25} ${yBottom} L ${bottomLeft + 25} ${yBottom - 40}`}
              stroke="#513252"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              opacity="0.5"
            />
            <path
              d={`M ${bottomRight - 25} ${yBottom} L ${bottomRight - 25} ${yBottom - 40}`}
              stroke="#513252"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              opacity="0.5"
            />

            {/* Back Tie String (Dori) & Hanging Tassels (Classic Boutique Blouse back feature!) */}
            {(customization.extras?.includes("Tassels") ||
              backNeckDepth > 50) && (
              <g>
                {/* Dori horizontal curved string */}
                <path
                  d={`M ${shoulderLeft + 20} ${yShoulder + 20} Q ${xCenter} ${yShoulder + 32} ${shoulderRight - 20} ${yShoulder + 20}`}
                  fill="none"
                  stroke="#c99a2e"
                  strokeWidth="2"
                />

                {/* Hanging strings */}
                <path
                  d={`M ${xCenter - 10} ${yShoulder + 26} Q ${xCenter - 22} ${yShoulder + 65} ${xCenter - 26} ${yShoulder + 90}`}
                  fill="none"
                  stroke="#c99a2e"
                  strokeWidth="1.5"
                />
                <path
                  d={`M ${xCenter + 10} ${yShoulder + 26} Q ${xCenter + 22} ${yShoulder + 65} ${xCenter + 26} ${yShoulder + 90}`}
                  fill="none"
                  stroke="#c99a2e"
                  strokeWidth="1.5"
                />

                {/* Tassels */}
                <g fill="#c99a2e" stroke="#c99a2e">
                  {/* Left Tassel */}
                  <circle cx={xCenter - 26} cy={yShoulder + 90} r="3.5" />
                  <path
                    d={`M ${xCenter - 30} ${yShoulder + 90} L ${xCenter - 34} ${yShoulder + 105} L ${xCenter - 22} ${yShoulder + 105} Z`}
                  />
                  {/* Right Tassel */}
                  <circle cx={xCenter + 26} cy={yShoulder + 90} r="3.5" />
                  <path
                    d={`M ${xCenter + 22} ${yShoulder + 90} L ${xCenter + 18} ${yShoulder + 105} L ${xCenter + 30} ${yShoulder + 105} Z`}
                  />
                </g>
              </g>
            )}
          </>
        )}

        {/* VIEW 3: SIDE VIEW */}
        {view === "side" && (
          <>
            {/* Single side-centered sleeve (behind body if sleeveless/regular) */}
            {sleeveStyle !== "Sleeveless" && (
              <>
                <path
                  d={sideSleevePath}
                  fill={`url(#${patternId})`}
                  stroke="#513252"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d={sideSleevePath}
                  fill="url(#shadingGrad)"
                  stroke="none"
                />
              </>
            )}

            {/* Side Body */}
            <path
              d={sideBodyPath}
              fill={`url(#${patternId})`}
              stroke="#513252"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d={sideBodyPath} fill="url(#shadingGrad)" stroke="none" />

            {/* Armhole profile stitch outline */}
            <path
              d={`M ${xCenter - 25} ${yShoulder + 5} Q ${xCenter} ${yShoulder + 25} ${xCenter + 25} ${yShoulder + 5} Q ${xCenter} ${yArmpit + 5} ${xCenter - 25} ${yShoulder + 5}`}
              fill="none"
              stroke="#513252"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              opacity="0.4"
            />

            {/* Side stitching seam line */}
            <line
              x1={xCenter}
              y1={yArmpit + 10}
              x2={xCenter}
              y2={yBottom}
              stroke="#513252"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              opacity="0.6"
            />
          </>
        )}
      </g>
    </svg>
  );
}
