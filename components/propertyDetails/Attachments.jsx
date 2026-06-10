"use client";

import React from "react";
import Image from "next/image";
import { requestGatedDownload } from "@/lib/gatedDownload";

const iconByType = (type = "") => {
  const t = type.toLowerCase();
  if (t.includes("pdf")) return "/images/items/download-1.png";
  if (
    t.includes("doc") ||
    t.includes("xls") ||
    t.includes("ppt") ||
    t.includes("txt")
  )
    return "/images/items/download-2.png";
  return "/images/items/download-1.png";
};

function buildFileName(att, fallback) {
  const url = String(att?.url || "");
  const fromUrl = url.split(/[?#]/)[0].split("/").pop() || "";
  return String(att?.fileName || att?.name || fromUrl || fallback || "Attachment").trim();
}

export default function Attachments({ attachments = [], property }) {
  const docs = attachments.filter((a) => a?.url);
  if (!docs.length) return null;

  const handleClick = (att, idx) => (e) => {
    e.preventDefault();
    const attachmentName = String(att?.name || `Attachment ${idx + 1}`).trim();
    requestGatedDownload({
      url: att.url,
      attachmentName,
      fileName: buildFileName(att, attachmentName),
      propertyId: property?._id ? String(property._id) : "",
      propertyTitle: property?.title || "",
      projectName: property?.title || "",
      source: "attachments",
    });
  };

  return (
    <>
      <div className="row">
        {docs.map((att, i) => (
          <div className="col-sm-6" key={`${att.url}-${i}`}>
            <a
              href={att.url}
              onClick={handleClick(att, i)}
              className="attachments-item"
              aria-haspopup="dialog"
            >
              <div className="box-icon w-60">
                <Image
                  alt="file"
                  src={iconByType(att.fileType)}
                  width={80}
                  height={80}
                />
              </div>
              <span>{att.name || `Attachment ${i + 1}`}</span>
              <i className="icon icon-DownloadSimple" />
            </a>
          </div>
        ))}
      </div>
    </>
  );
}
