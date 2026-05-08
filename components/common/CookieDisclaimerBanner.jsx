"use client";

import { useEffect, useState } from "react";
import styles from "./CookieDisclaimerBanner.module.css";

const COOKIE_NAME = "home_disclaimer_accepted";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getCookie(name) {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
}

function setCookie(name, value, maxAge) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export default function CookieDisclaimerBanner({ content }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = getCookie(COOKIE_NAME) === "true";
    setVisible(!accepted && Boolean(content?.isActive));
  }, [content?.isActive]);

  if (!content || !content.isActive || !visible) return null;

  const paragraphs = Array.isArray(content.paragraphs)
    ? content.paragraphs.filter((p) => String(p || "").trim())
    : [];

  return (
    <div className={styles.cookieBarWrap}>
      <div className={styles.cookieBar}>
        <h4 className={styles.cookieTitle}>{content.title || "Your Privacy Matters"}</h4>

        <div className={styles.cookieBody}>
          {paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className={styles.cookieActions}>
          <button
            type="button"
            onClick={() => {
              setCookie(COOKIE_NAME, "true", COOKIE_MAX_AGE);
              setVisible(false);
            }}
            className={`${styles.cookieBtn} ${styles.cookieBtnAccept}`}
          >
            {content.acceptText || "Accept"}
          </button>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className={`${styles.cookieBtn} ${styles.cookieBtnClose}`}
          >
            {content.closeText || "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
