const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DEFAULT_MIN_MESSAGE = 10;
const MIN_NAME_LEN = 2;
const MIN_PHONE_DIGITS = 8;

/** Digits only, capped (e.g. 10-digit mobile). */
export function sanitizePhoneDigits(value, maxDigits = 10) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, maxDigits);
}

/** No leading spaces/tabs; no double spaces in a row. */
export function sanitizeSingleLineText(value) {
  return String(value || "")
    .replace(/^[ \t]+/, "")
    .replace(/[ \t]{2,}/g, " ");
}

/** Strip all spaces (email). */
export function sanitizeEmailInput(value) {
  return String(value || "").replace(/\s/g, "");
}

/** No leading space/tab; collapse repeated spaces/tabs (newlines kept). */
export function sanitizeMessageText(value) {
  return String(value || "")
    .replace(/^[ \t]+/, "")
    .replace(/[ \t]{2,}/g, " ");
}

export function countPhoneDigits(phone) {
  return String(phone || "").replace(/\D/g, "").length;
}

/**
 * @param {{ name?: string; email?: string; phone?: string; interest?: string; message?: string }} fields
 * @param {{ requirePhone?: boolean; phoneMinDigits?: number; phoneMaxDigits?: number; requireInterest?: boolean; minInterest?: number; minMessage?: number; requireMessage?: boolean }} [opts]
 */
export function validateInquiryForm(fields, opts = {}) {
  const requirePhone = opts.requirePhone === true;
  const requireInterest = opts.requireInterest === true;
  const requireMessage = opts.requireMessage !== false;
  const minInterest = opts.minInterest ?? 3;
  const minMessage = opts.minMessage ?? DEFAULT_MIN_MESSAGE;
  const phoneMinDigits = opts.phoneMinDigits ?? MIN_PHONE_DIGITS;
  const phoneMaxDigits = opts.phoneMaxDigits ?? null;
  /** @type {Record<string, string>} */
  const errors = {};

  const name = (fields.name || "").trim();
  if (!name) errors.name = "Please enter your name.";
  else if (name.length < MIN_NAME_LEN) {
    errors.name = `Please enter at least ${MIN_NAME_LEN} characters for your name.`;
  }

  const email = (fields.email || "").trim();
  if (!email) errors.email = "Please enter your email.";
  else if (!EMAIL_RE.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  const digits = countPhoneDigits(fields.phone);
  if (phoneMaxDigits != null && digits > phoneMaxDigits) {
    errors.phone = `Phone number must be at most ${phoneMaxDigits} digits.`;
  } else if (requirePhone) {
    if (digits < phoneMinDigits) {
      if (phoneMinDigits === 10 && phoneMaxDigits === 10) {
        errors.phone = "Please enter a 10-digit mobile number.";
      } else {
        errors.phone = `Please enter a valid phone number (at least ${phoneMinDigits} digits).`;
      }
    }
  } else if (digits > 0 && digits < MIN_PHONE_DIGITS) {
    errors.phone = "Phone number looks too short.";
  }

  const interest = (fields.interest || "").trim();
  if (requireInterest) {
    if (!interest) {
      errors.interest = "Please tell us what you're interested in.";
    } else if (interest.length < minInterest) {
      errors.interest = `Please enter at least ${minInterest} characters.`;
    }
  } else if (interest.length > 0 && interest.length < minInterest) {
    errors.interest = `Enter at least ${minInterest} characters or leave this blank.`;
  }

  const message = (fields.message || "").trim();
  if (requireMessage) {
    if (!message) errors.message = "Please enter a message.";
    else if (message.length < minMessage) {
      errors.message = `Please write at least ${minMessage} characters in your message.`;
    }
  } else if (message.length > 0 && minMessage > 0 && message.length < minMessage) {
    errors.message = `Please write at least ${minMessage} characters in your message.`;
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  };
}

const ERROR_ORDER = ["name", "email", "phone", "interest", "message"];

export function firstErrorMessage(errors) {
  for (const k of ERROR_ORDER) {
    if (errors[k]) return errors[k];
  }
  const vals = Object.values(errors);
  return vals[0] || "";
}
