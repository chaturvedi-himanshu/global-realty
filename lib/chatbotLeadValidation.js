/** Shared chatbot lead validation (client + can mirror server rules). */

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmail(s) {
  const t = String(s || "").trim();
  if (!t || t.length > 254) return false;
  return EMAIL_RE.test(t);
}

export function normalizePhoneDigits(s) {
  return String(s || "").replace(/\D/g, "");
}

/** Exactly 10 digits (e.g. Indian mobile without country code). */
export function isValidPhone10(s) {
  const d = normalizePhoneDigits(s);
  return d.length === 10;
}

/**
 * Normalize to at most 10 digits for Indian mobile entry:
 * longer input (e.g. pasted +91…) keeps the last 10 digits; shorter is unchanged (capped at 10).
 */
export function toIndianMobile10Digits(raw) {
  const d = normalizePhoneDigits(String(raw ?? ""));
  if (d.length > 10) return d.slice(-10);
  return d.slice(0, 10);
}

/** Indian mobile: 10 digits, starting with 6–9. */
export function isValidIndianMobile(s) {
  const d = toIndianMobile10Digits(s);
  return d.length === 10 && /^[6-9]\d{9}$/.test(d);
}

export function assertLeadPayload(body) {
  const name = String(body?.name ?? "").trim();
  const emailRaw = String(body?.email ?? "").trim();
  const email = emailRaw.toLowerCase();
  const interestedIn = String(body?.interestedIn ?? "").trim();
  const phoneDigits = toIndianMobile10Digits(body?.phone);
  const query = body?.query != null ? String(body.query) : "";
  const source = body?.source === "admin" ? "admin" : "website";

  if (!name) {
    return { ok: false, error: "Name is required", status: 400 };
  }
  if (emailRaw && !isValidEmail(emailRaw)) {
    return { ok: false, error: "Enter a valid email address", status: 400 };
  }
  if (!interestedIn) {
    return { ok: false, error: "What you are interested in is required", status: 400 };
  }
  if (!isValidIndianMobile(body?.phone)) {
    return {
      ok: false,
      error: "Valid mobile number is required",
      status: 400,
    };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      interestedIn,
      phone: phoneDigits,
      query,
      source,
    },
  };
}
