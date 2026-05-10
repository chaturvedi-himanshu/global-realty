/**
 * INR (and basic other) price display aligned with property detail overview:
 * Crores / Lakhs for large INR amounts, otherwise grouped rupees.
 */
export function formatPropertyPriceCrLac(
  price,
  priceType = "fixed",
  currency = "INR",
) {
  if (priceType === "on-request") return "Price on Request";
  const amount = Number(price);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  const sym = { INR: "₹", USD: "$", AED: "د.إ" }[currency] || "₹";
  if (currency === "INR") {
    if (amount >= 10000000) {
      return `${sym}${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `${sym}${(amount / 100000).toFixed(2)} Lac`;
    }
  }
  return `${sym}${amount.toLocaleString("en-IN")}`;
}
