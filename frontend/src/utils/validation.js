export const MEASUREMENT_RANGES = {
  Inches: {
    bust: { min: 15, max: 80 },
    chestRound: { min: 15, max: 80 },
    underBust: { min: 12, max: 70 },
    waist: { min: 12, max: 75 },
    hip: { min: 15, max: 85 },
    shoulder: { min: 6, max: 25 },
    sleeveLength: { min: 1, max: 40 },
    armHole: { min: 4, max: 30 },
    armRound: { min: 4, max: 30 },
    neckDepth: { min: 1, max: 15 },
    blouseLength: { min: 8, max: 25 },
    dressLength: { min: 10, max: 80 },
    sleeveOpening: { min: 3, max: 20 },
  },
  CM: {
    bust: { min: 38, max: 200 },
    chestRound: { min: 38, max: 200 },
    underBust: { min: 30, max: 180 },
    waist: { min: 30, max: 190 },
    hip: { min: 38, max: 215 },
    shoulder: { min: 15, max: 65 },
    sleeveLength: { min: 2.5, max: 100 },
    armHole: { min: 10, max: 75 },
    armRound: { min: 10, max: 75 },
    neckDepth: { min: 2.5, max: 38 },
    blouseLength: { min: 20, max: 65 },
    dressLength: { min: 25, max: 200 },
    sleeveOpening: { min: 7.5, max: 50 },
  }
};

/**
 * Validates a measurement field value based on key and unit.
 * @param {string} key - The measurement key (e.g. "bust", "waist").
 * @param {string|number} valueStr - The input value.
 * @param {string} unit - "Inches" or "CM".
 * @returns {string|null} - Error message, or null if valid.
 */
export function validateMeasurement(key, valueStr, unit) {
  if (valueStr === undefined || valueStr === null || String(valueStr).trim() === "") {
    return "Required";
  }
  
  const value = Number(valueStr);
  if (isNaN(value) || value <= 0) {
    return "Enter a valid positive number";
  }

  const activeUnit = unit === "CM" ? "CM" : "Inches";
  const ranges = MEASUREMENT_RANGES[activeUnit];
  const range = ranges[key];
  
  if (range) {
    if (value < range.min || value > range.max) {
      return `Must be between ${range.min} and ${range.max} ${activeUnit}`;
    }
  }

  return null;
}
