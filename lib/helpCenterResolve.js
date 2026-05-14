import {
  DEFAULT_HELP_CENTER_CONTENT,
  HELP_CENTER_CARD_COUNT,
} from "./helpCenterDefaults";

const ICONS = new Set(["house", "wallet", "key", "agent"]);

function normCard(raw, fallback) {
  const c = raw && typeof raw === "object" ? raw : {};
  const f = fallback && typeof fallback === "object" ? fallback : {};
  const icon = ICONS.has(c.icon) ? c.icon : ICONS.has(f.icon) ? f.icon : "house";
  return {
    title: String(c.title ?? f.title ?? "").trim(),
    description: String(c.description ?? f.description ?? "").trim(),
    buttonLabel: String(c.buttonLabel ?? f.buttonLabel ?? "").trim(),
    buttonHref: String(c.buttonHref ?? f.buttonHref ?? "/").trim() || "/",
    icon,
  };
}

/** Legacy CMS stored three tabs × three cards; flatten into up to four cards for migration. */
function cardsFromLegacyTabs(tabs) {
  const out = [];
  if (!Array.isArray(tabs)) return out;
  for (const tab of tabs) {
    const row = tab && typeof tab === "object" ? tab.cards : null;
    if (!Array.isArray(row)) continue;
    for (const c of row) {
      out.push(c);
      if (out.length >= HELP_CENTER_CARD_COUNT) return out;
    }
  }
  return out;
}

/** Merge DB document with defaults so partial or empty CMS never breaks the layout. */
export function resolveHelpCenterContent(db) {
  const d = DEFAULT_HELP_CENTER_CONTENT;
  if (!db || typeof db !== "object") {
    return JSON.parse(JSON.stringify(d));
  }
  let rawCards = [];
  if (Array.isArray(db.cards) && db.cards.length) {
    rawCards = db.cards;
  } else if (Array.isArray(db.tabs) && db.tabs.length) {
    rawCards = cardsFromLegacyTabs(db.tabs);
  }
  const cards = [];
  for (let i = 0; i < HELP_CENTER_CARD_COUNT; i++) {
    cards.push(normCard(rawCards[i], d.cards[i]));
  }
  return {
    heading: String(db.heading ?? d.heading).trim() || d.heading,
    subheading: String(db.subheading ?? d.subheading).trim() || d.subheading,
    cards,
    footerLine: String(db.footerLine ?? d.footerLine).trim() || d.footerLine,
    footerCtaLabel:
      String(db.footerCtaLabel ?? d.footerCtaLabel).trim() || d.footerCtaLabel,
    footerCtaHref:
      String(db.footerCtaHref ?? d.footerCtaHref).trim() || d.footerCtaHref,
  };
}
