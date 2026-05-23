/**
 * Lightweight pub/sub bridge between any "Download" trigger on the property
 * details page and the singleton {@link BrochureDownloadModal}.
 *
 * Components call `requestGatedDownload({ ... })` to ask the modal to capture
 * a lead before the underlying file is opened. The modal listens for the same
 * event and handles validation + inquiry submit + actual download.
 */

export const GATED_DOWNLOAD_EVENT = "app:gated-download";

/**
 * @typedef {Object} GatedDownloadDetail
 * @property {string} url Absolute or relative URL to download.
 * @property {string} [attachmentName] Human-readable name shown in the modal & CRM.
 * @property {string} [fileName] Suggested filename for the saved file.
 * @property {string} [propertyId]
 * @property {string} [propertyTitle]
 * @property {string} [projectName]
 * @property {string} [pageName] Defaults to current URL on the client.
 * @property {string} [source] Tag describing where the click came from
 *                             (e.g. "attachments", "sidebar-brochure").
 */

/**
 * Dispatch a gated-download request. Safe to call during render — no-ops on the
 * server. The modal opens, captures the lead, and only then triggers download.
 *
 * @param {GatedDownloadDetail} detail
 */
export function requestGatedDownload(detail) {
  if (typeof window === "undefined") return;
  const url = String(detail?.url || "").trim();
  if (!url) return;
  const enriched = {
    ...detail,
    url,
    pageName:
      String(detail?.pageName || "").trim() ||
      (typeof window.location !== "undefined" ? window.location.href : ""),
  };
  window.dispatchEvent(
    new CustomEvent(GATED_DOWNLOAD_EVENT, { detail: enriched }),
  );
}
