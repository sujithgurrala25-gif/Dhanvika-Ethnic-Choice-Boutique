import React from "react";

export default function KurtiPreview({
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
  const rawDressLength = Number(measurements.dressLength) || 40;
  const rawNeckDepth = Number(measurements.neckDepth) || 6;

  const bust = rawBust * scale;
  const waist = rawWaist * scale;
  const hip = rawHip * scale;
  const shoulder = rawShoulder * scale;
  const sleeveLength = rawSleeve * scale;
  const dressLength = rawDressLength * scale;
  const neckDepth = rawNeckDepth * scale;

  // Apply fitting allowance
  let allowance = 0;
  if (customization.fittingStyle === "Tight Fit") allowance = 0;
  else if (customization.fittingStyle === "Loose Fit") allowance = 4;
  else allowance = 2; // Regular Fit default

  const adjBust = bust + allowance;
  const adjWaist = waist + allowance;
  const adjHip = hip + allowance;

  // Coordinates
  const xCenter = 200;
  const yShoulder = 100;

  // Horizontal scaling factors
  const shoulderWidth = Math.min(160, Math.max(100, shoulder * 10));
  const halfShoulder = shoulderWidth / 2;

  const bustWidth = Math.min(200, Math.max(120, adjBust * 4.4));
  const halfBust = bustWidth / 2;

  const waistWidth = Math.min(180, Math.max(105, adjWaist * 4.0));
  const halfWaist = waistWidth / 2;

  const hipWidth = Math.min(210, Math.max(125, adjHip * 4.3));
  const halfHip = hipWidth / 2;

  const bottomWidth = halfHip * 1.15; // Slightly flared A-line hem

  // Heights
  const lengthHeight = Math.min(290, Math.max(180, dressLength * 7.2));
  const yBottom = yShoulder + lengthHeight;
  const yArmpit = yShoulder + 52;
  const yWaist = yShoulder + lengthHeight * 0.35;
  const yHip = yShoulder + lengthHeight * 0.62;

  // Key coordinate points (Front/Back)
  const shoulderLeft = xCenter - halfShoulder;
  const shoulderRight = xCenter + halfShoulder;
  const armpitLeft = xCenter - halfBust;
  const armpitRight = xCenter + halfBust;
  const waistLeft = xCenter - halfWaist;
  const waistRight = xCenter + halfWaist;
  const hipLeft = xCenter - halfHip;
  const hipRight = xCenter + halfHip;
  const bottomLeft = xCenter - bottomWidth;
  const bottomRight = xCenter + bottomWidth;

  // Neck Configuration
  const neckStyle = customization.neckStyle || "Boat Neck";
  let halfNeckWidth = halfShoulder * 0.65;
  let hNeck = Math.min(100, Math.max(35, neckDepth * 9));

  if (neckStyle === "Boat Neck") {
    halfNeckWidth = halfShoulder * 0.8;
    hNeck = 20;
  } else if (neckStyle === "Collar Neck") {
    halfNeckWidth = halfShoulder * 0.5;
    hNeck = 16;
  } else if (neckStyle === "V Neck") {
    halfNeckWidth = halfShoulder * 0.6;
    hNeck = Math.min(90, Math.max(40, neckDepth * 9));
  } else if (neckStyle === "Deep Neck") {
    halfNeckWidth = halfShoulder * 0.7;
    hNeck = Math.min(115, Math.max(55, neckDepth * 11));
  }

  const neckLeft = xCenter - halfNeckWidth;
  const neckRight = xCenter + halfNeckWidth;

  const sleeveStyle = customization.sleeveStyle || "Short Sleeve";
  const patternId = `fabricPattern-kurti`;

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
    Q ${armpitRight + 4} ${yShoulder + 25} ${armpitRight} ${yArmpit}
    Q ${waistRight + 2} ${yWaist} ${waistRight} ${yWaist}
    Q ${hipRight + 5} ${yHip} ${hipRight} ${yHip}
    L ${bottomRight} ${yBottom}
    Q ${xCenter} ${yBottom + 8} ${bottomLeft} ${yBottom}
    L ${hipLeft} ${yHip}
    Q ${hipLeft - 5} ${yHip} ${waistLeft} ${yWaist}
    Q ${waistLeft - 2} ${yWaist} ${armpitLeft} ${yArmpit}
    Q ${armpitLeft - 4} ${yShoulder + 25} ${shoulderLeft} ${yShoulder}
    Z
  `;

  // 2. BACK VIEW PATHS
  // Simpler high neckline at the back
  let backNeckDepth = 18;
  if (neckStyle === "Collar Neck") backNeckDepth = 12;

  const backNeckPath = `Q ${xCenter} ${yShoulder + backNeckDepth} ${neckRight} ${yShoulder}`;

  const backBodyPath = `
    M ${neckLeft} ${yShoulder}
    ${backNeckPath}
    L ${shoulderRight} ${yShoulder}
    Q ${armpitRight + 4} ${yShoulder + 25} ${armpitRight} ${yArmpit}
    Q ${waistRight + 2} ${yWaist} ${waistRight} ${yWaist}
    Q ${hipRight + 5} ${yHip} ${hipRight} ${yHip}
    L ${bottomRight} ${yBottom}
    Q ${xCenter} ${yBottom + 8} ${bottomLeft} ${yBottom}
    L ${hipLeft} ${yHip}
    Q ${hipLeft - 5} ${yHip} ${waistLeft} ${yWaist}
    Q ${waistLeft - 2} ${yWaist} ${armpitLeft} ${yArmpit}
    Q ${armpitLeft - 4} ${yShoulder + 25} ${shoulderLeft} ${yShoulder}
    Z
  `;

  // 3. SIDE VIEW PATHS (Profile View)
  const profileWidth = 105;
  const pLeft = xCenter - profileWidth / 2; // front side
  const pRight = xCenter + profileWidth / 2; // back side
  const pBustBulge = pLeft - 20;

  // Front panel of Kurti (split at hip for slit)
  const sideFrontBodyPath = `
    M ${xCenter - 10} ${yShoulder}
    C ${pBustBulge - 6} ${yArmpit + 40} ${pBustBulge} ${yWaist} ${xCenter - 30} ${yHip}
    L ${pLeft + 5} ${yBottom}
    L ${xCenter} ${yBottom}
    L ${xCenter} ${yHip}
    Q ${xCenter - 10} ${yWaist} ${xCenter - 8} ${yArmpit}
    L ${xCenter - 22} ${yShoulder + 15}
    Z
  `;

  // Back panel of Kurti (split at hip for slit)
  const sideBackBodyPath = `
    M ${xCenter} ${yShoulder}
    L ${xCenter + 12} ${yShoulder + 2}
    Q ${pRight} ${yArmpit} ${pRight - 8} ${yWaist}
    L ${pRight - 6} ${yHip}
    L ${pRight - 2} ${yBottom}
    L ${xCenter} ${yBottom}
    L ${xCenter} ${yHip}
    Q ${xCenter + 8} ${yWaist} ${xCenter + 6} ${yArmpit}
    Z
  `;

  // Sleeves paths
  let sleeveLeftPath = "";
  let sleeveRightPath = "";
  let slLen = 60; // default short sleeve

  if (sleeveStyle !== "Sleeveless") {
    if (sleeveStyle === "Elbow Sleeve") {
      slLen = Math.min(130, Math.max(75, sleeveLength * 9));
    } else if (sleeveStyle === "Puff Sleeve") {
      slLen = 50;
    } else {
      slLen = Math.min(75, Math.max(35, sleeveLength * 7));
    }

    if (sleeveStyle === "Puff Sleeve") {
      sleeveLeftPath = `
        M ${shoulderLeft} ${yShoulder}
        C ${shoulderLeft - 40} ${yShoulder - 15} ${shoulderLeft - 50} ${yShoulder + 25} ${shoulderLeft - 25} ${yShoulder + slLen}
        L ${armpitLeft} ${yArmpit}
        Q ${armpitLeft - 4} ${yShoulder + 25} ${shoulderLeft} ${yShoulder}
        Z
      `;
      sleeveRightPath = `
        M ${shoulderRight} ${yShoulder}
        C ${shoulderRight + 40} ${yShoulder - 15} ${shoulderRight + 50} ${yShoulder + 25} ${shoulderRight + 25} ${yShoulder + slLen}
        L ${armpitRight} ${yArmpit}
        Q ${armpitRight + 4} ${yShoulder + 25} ${shoulderRight} ${yShoulder}
        Z
      `;
    } else {
      sleeveLeftPath = `
        M ${shoulderLeft} ${yShoulder}
        L ${shoulderLeft - slLen * 0.65} ${yShoulder + slLen * 0.65}
        L ${armpitLeft - slLen * 0.15} ${yArmpit + slLen * 0.2}
        L ${armpitLeft} ${yArmpit}
        Q ${armpitLeft - 4} ${yShoulder + 25} ${shoulderLeft} ${yShoulder}
        Z
      `;
      sleeveRightPath = `
        M ${shoulderRight} ${yShoulder}
        L ${shoulderRight + slLen * 0.65} ${yShoulder + slLen * 0.65}
        L ${armpitRight + slLen * 0.15} ${yArmpit + slLen * 0.2}
        L ${armpitRight} ${yArmpit}
        Q ${armpitRight + 4} ${yShoulder + 25} ${shoulderRight} ${yShoulder}
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
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="50%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.16" />
        </linearGradient>
      </defs>

      {/* Sketch Mannequin Dummy Background */}
      <g stroke="#e2d6db" strokeWidth="1.5" fill="none" strokeDasharray="4,4">
        {view !== "side" ? (
          <>
            <path d="M 180 70 Q 200 50 220 70" />
            <path d="M 200 70 L 200 40" />
            <ellipse cx="200" cy="35" rx="16" ry="11" />
            <path d="M 140 100 C 130 180 120 280 145 370 C 165 430 235 430 255 370 C 280 280 270 180 260 100" />
            <line
              x1="200"
              y1="70"
              x2="200"
              y2="445"
              stroke="#dbccd2"
              strokeWidth="2"
            />
          </>
        ) : (
          <>
            <ellipse cx="200" cy="35" rx="12" ry="11" />
            <line
              x1="200"
              y1="46"
              x2="200"
              y2="445"
              stroke="#dbccd2"
              strokeWidth="2"
            />
            <path
              d="M 200 70 Q 185 80 182 100 C 170 160 150 250 175 370 Q 200 380 225 370 C 240 250 220 160 215 100 Z"
              opacity="0.6"
            />
          </>
        )}
        {/* Floor Stand */}
        <line
          x1="200"
          y1="445"
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

      {/* Main Kurti Group */}
      <g filter="url(#sketchShadow)">
        {/* VIEW 1: FRONT VIEW */}
        {view === "front" && (
          <>
            {/* Sleeves */}
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

            {sleeveStyle === "Sleeveless" && (
              <>
                <path
                  d={`M ${shoulderLeft} ${yShoulder} Q ${armpitLeft - 4} ${yShoulder + 25} ${armpitLeft} ${yArmpit}`}
                  stroke="#513252"
                  strokeWidth="3.5"
                  fill="none"
                  opacity="0.3"
                />
                <path
                  d={`M ${shoulderRight} ${yShoulder} Q ${armpitRight + 4} ${yShoulder + 25} ${armpitRight} ${yArmpit}`}
                  stroke="#513252"
                  strokeWidth="3.5"
                  fill="none"
                  opacity="0.3"
                />
              </>
            )}

            {/* Kurti Body */}
            <path
              d={frontBodyPath}
              fill={`url(#${patternId})`}
              stroke="#513252"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d={frontBodyPath} fill="url(#shadingGrad)" stroke="none" />

            {/* Embroidery Accent */}
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

            {/* Collar Neck */}
            {neckStyle === "Collar Neck" && (
              <g stroke="#513252" strokeWidth="2" fill="none">
                <path
                  d={`M ${neckLeft} ${yShoulder} L ${xCenter - 4} ${yShoulder + 18} L ${xCenter} ${yShoulder + 16}`}
                  fill={`url(#${patternId})`}
                />
                <path
                  d={`M ${neckRight} ${yShoulder} L ${xCenter + 4} ${yShoulder + 18} L ${xCenter} ${yShoulder + 16}`}
                  fill={`url(#${patternId})`}
                />
              </g>
            )}

            {/* Side Slits Lines */}
            <path
              d={`M ${hipLeft} ${yHip} L ${bottomLeft} ${yBottom}`}
              stroke="#3d213e"
              strokeWidth="1.2"
              opacity="0.4"
            />
            <path
              d={`M ${hipRight} ${yHip} L ${bottomRight} ${yBottom}`}
              stroke="#3d213e"
              strokeWidth="1.2"
              opacity="0.4"
            />
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
                  d={`M ${shoulderLeft} ${yShoulder} Q ${armpitLeft - 4} ${yShoulder + 25} ${armpitLeft} ${yArmpit}`}
                  stroke="#513252"
                  strokeWidth="3.5"
                  fill="none"
                  opacity="0.3"
                />
                <path
                  d={`M ${shoulderRight} ${yShoulder} Q ${armpitRight + 4} ${yShoulder + 25} ${armpitRight} ${yArmpit}`}
                  stroke="#513252"
                  strokeWidth="3.5"
                  fill="none"
                  opacity="0.3"
                />
              </>
            )}

            {/* Kurti Body */}
            <path
              d={backBodyPath}
              fill={`url(#${patternId})`}
              stroke="#513252"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d={backBodyPath} fill="url(#shadingGrad)" stroke="none" />

            {/* Back zipper/hook seam line */}
            <line
              x1={xCenter}
              y1={yShoulder + backNeckDepth}
              x2={xCenter}
              y2={yWaist + 20}
              stroke="#513252"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              opacity="0.6"
            />

            {/* Side Slits Lines */}
            <path
              d={`M ${hipLeft} ${yHip} L ${bottomLeft} ${yBottom}`}
              stroke="#3d213e"
              strokeWidth="1.2"
              opacity="0.4"
            />
            <path
              d={`M ${hipRight} ${yHip} L ${bottomRight} ${yBottom}`}
              stroke="#3d213e"
              strokeWidth="1.2"
              opacity="0.4"
            />
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

            {/* Side Body (Front & Back panels with a side slit opening starting at hip) */}
            <path
              d={sideFrontBodyPath}
              fill={`url(#${patternId})`}
              stroke="#513252"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d={sideFrontBodyPath}
              fill="url(#shadingGrad)"
              stroke="none"
            />

            <path
              d={sideBackBodyPath}
              fill={`url(#${patternId})`}
              stroke="#513252"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d={sideBackBodyPath} fill="url(#shadingGrad)" stroke="none" />

            {/* Armhole profile stitch outline */}
            <path
              d={`M ${xCenter - 25} ${yShoulder + 5} Q ${xCenter} ${yShoulder + 25} ${xCenter + 25} ${yShoulder + 5} Q ${xCenter} ${yArmpit + 5} ${xCenter - 25} ${yShoulder + 5}`}
              fill="none"
              stroke="#513252"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              opacity="0.4"
            />

            {/* Side seam (up to hip slit start) */}
            <line
              x1={xCenter}
              y1={yArmpit + 10}
              x2={xCenter}
              y2={yHip}
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
