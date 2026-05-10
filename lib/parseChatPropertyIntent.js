/**
 * Heuristic parsing of free-text property searches for the chatbot
 * (e.g. "2bhk in noida", "3 bedroom flats gurgaon", "rent in sector 62").
 */

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * @param {string} message
 * @param {string[]} cityNames — names from active listings (longest-first matching recommended)
 * @returns {string | null} matched canonical city label or null
 */
export function matchCityInMessage(message, cityNames) {
  const msg = ` ${String(message || "").toLowerCase().replace(/\s+/g, " ")} `;
  const sorted = [...cityNames].sort((a, b) => b.length - a.length);
  for (const city of sorted) {
    const n = String(city || "").trim();
    if (n.length < 2) continue;
    const re = new RegExp(
      `(^|[^a-z0-9])${escapeRegExp(n.toLowerCase())}($|[^a-z0-9])`,
      "i",
    );
    if (re.test(msg)) return city;
  }
  return null;
}

/**
 * @param {string} text
 * @returns {{ bedrooms: number | null, listingType: 'sale' | 'rent' | null }}
 */
export function parseBedroomsAndListingType(text) {
  const lower = String(text || "").toLowerCase();

  let bedrooms = null;
  const bhk = lower.match(
    /\b(\d{1,2})\s*[-]?\s*(?:bhk|b\.?\s*h\.?\s*k\.?|bhks?)\b/i,
  );
  if (bhk) {
    const n = parseInt(bhk[1], 10);
    if (n >= 0 && n <= 20) bedrooms = n;
  }
  if (bedrooms === null) {
    const bedWord = lower.match(
      /\b(\d{1,2})\s*(?:bed|bedroom|bedrooms)\b/i,
    );
    if (bedWord) {
      const n = parseInt(bedWord[1], 10);
      if (n >= 0 && n <= 20) bedrooms = n;
    }
  }
  if (bedrooms === null) {
    const brShort = lower.match(/\b(\d{1,2})\s*br\b/i);
    if (brShort) {
      const n = parseInt(brShort[1], 10);
      if (n >= 0 && n <= 20) bedrooms = n;
    }
  }

  let listingType = null;
  if (/\b(rent|rental|lease|leasing|pg\b|paying guest)\b/.test(lower)) {
    listingType = "rent";
  } else if (
    /\b(sale|buy|purchase|sell|book|invest)\b/.test(lower)
  ) {
    listingType = "sale";
  }

  return { bedrooms, listingType };
}
