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

const SPEC_STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "your",
  "what",
  "show",
  "list",
  "lists",
  "find",
  "want",
  "need",
  "best",
  "near",
  "under",
  "sale",
  "rent",
  "buy",
  "book",
  "bhk",
  "bhks",
  // Generic property-search phrasing — do not AND these with city (e.g. "properties in Noida").
  "property",
  "properties",
  "listing",
  "listings",
  "please",
  "some",
  "any",
  "each",
  "give",
  "tell",
  "about",
  "looking",
  "search",
  "searching",
  "available",
  "browse",
  "open",
  "see",
  "view",
  "global",
  "realty",
  "help",
  "hello",
  "hi",
  "hey",
  "thanks",
  "thank",
  "you",
  "are",
  "can",
  "how",
  "where",
  "when",
  "does",
  "did",
  "has",
  "have",
  "will",
  "would",
  "could",
  "should",
  "there",
  "here",
  "they",
  "them",
  "into",
  "onto",
  "more",
  "most",
  "also",
  "just",
  "only",
  "very",
  "such",
  "like",
  "which",
  "who",
  "whom",
  "whose",
  "contact",
  "call",
  "phone",
  "email",
  "website",
  "site",
]);

/**
 * Match any meaningful word from the user query against `specification`
 * (after stripping city name and BHK phrases).
 * @returns { import("mongoose").FilterQuery<unknown> | null }
 */
export function buildSpecificationWordMatchClause(userQuery, matchedCity) {
  let s = String(userQuery || "").toLowerCase();
  if (matchedCity) {
    s = s.replace(new RegExp(escapeRegExp(matchedCity), "gi"), " ");
  }
  s = s.replace(
    /\d{1,2}\s*[-]?\s*(?:bhk|b\.?\s*h\.?\s*k\.?|bed|bedroom|bedrooms|br)\b/gi,
    " ",
  );
  const raw = s.match(/[a-z0-9]{3,}/gi) || [];
  const words = [...new Set(raw.map((w) => w.toLowerCase()))];
  const filtered = words.filter((w) => !SPEC_STOPWORDS.has(w));
  if (!filtered.length) return null;
  const rx = (w) => ({ $regex: escapeRegExp(w), $options: "i" });
  const clauses = [];
  for (const w of filtered) {
    clauses.push({ specification: rx(w) });
    clauses.push({ tags: rx(w) });
  }
  return { $or: clauses };
}
