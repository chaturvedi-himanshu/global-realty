"use client";

import { useState, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import toast from "react-hot-toast";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/lib/firebase";

const MAX_PDF_MB = 8;
const COVER_MIN = 20;
const COVER_MAX = 5000;
const NAME_MAX = 100;

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

function validateForm(values, file) {
  const err = {};
  const name = values.fullName.trim();
  if (!name) err.fullName = "Enter your full name.";
  else if (name.length < 2) err.fullName = "Name must be at least 2 characters.";
  else if (name.length > NAME_MAX) err.fullName = `Name must be under ${NAME_MAX} characters.`;
  else if (!/^[\p{L}\s'.-]+$/u.test(name))
    err.fullName = "Use letters, spaces, and common punctuation only.";

  const email = values.email.trim();
  if (email && !EMAIL_RE.test(email)) err.email = "Enter a valid email address.";

  const digits = values.phone.replace(/\D/g, "");
  if (!digits) err.phone = "Enter your phone number.";
  else if (digits.length !== 10) err.phone = "Phone must be exactly 10 digits.";

  const li = values.linkedinUrl.trim();
  if (li) {
    try {
      const u = new URL(li.startsWith("http") ? li : `https://${li}`);
      if (!["http:", "https:"].includes(u.protocol)) err.linkedinUrl = "Enter a valid URL.";
    } catch {
      err.linkedinUrl = "Enter a valid URL.";
    }
  }

  const letter = values.coverLetter.trim();
  if (!letter) err.coverLetter = "Add a cover letter.";
  else if (letter.length < COVER_MIN)
    err.coverLetter = `Cover letter must be at least ${COVER_MIN} characters.`;
  else if (letter.length > COVER_MAX)
    err.coverLetter = `Cover letter must be under ${COVER_MAX} characters.`;

  if (!file) err.file = "Upload your resume as a PDF.";
  else if (file.type !== "application/pdf") err.file = "Resume must be a PDF file.";
  else if (file.size > MAX_PDF_MB * 1024 * 1024)
    err.file = `PDF must be under ${MAX_PDF_MB} MB.`;

  return err;
}

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="job-apply-field__error" role="alert">
      {message}
    </p>
  );
}

export default function JobApplyModal({ open, onClose, job }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [errors, setErrors] = useState({});

  const reset = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setLinkedinUrl("");
    setCoverLetter("");
    setFile(null);
    setErrors({});
    setUploadPct(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const values = useMemo(
    () => ({ fullName, email, phone, linkedinUrl, coverLetter }),
    [fullName, email, phone, linkedinUrl, coverLetter],
  );

  const onPhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(raw);
    if (errors.phone) setErrors((s) => ({ ...s, phone: undefined }));
  };

  const uploadResumeToFirebase = (pdfFile) =>
    new Promise((resolve, reject) => {
      const safeName = pdfFile.name.replace(/\s+/g, "-");
      const objectPath = `job-applications/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
      const storageRef = ref(storage, objectPath);
      const task = uploadBytesResumable(storageRef, pdfFile, {
        contentType: "application/pdf",
      });
      task.on(
        "state_changed",
        (snap) => {
          const p = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          setUploadPct(p);
        },
        reject,
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            resolve(url);
          } catch (e) {
            reject(e);
          }
        },
      );
    });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!job) return;

    const nextErrors = validateForm(values, file);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const first = Object.values(nextErrors)[0];
      toast.error(first);
      return;
    }

    setSubmitting(true);
    setUploadPct(0);
    try {
      const resumeUrl = await uploadResumeToFirebase(file);

      const res = await fetch("/api/job-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.replace(/\D/g, ""),
          linkedinUrl: linkedinUrl.trim(),
          jobPostingId: job._id,
          jobTitle: job.title || "",
          department: job.department || "",
          location: job.location || "",
          salaryLabel: job.salaryLabel || "",
          coverLetter: coverLetter.trim(),
          resumeUrl,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Could not submit application");

      toast.success("Application submitted. We’ll be in touch soon.");
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
      setUploadPct(0);
    }
  };

  if (!job) return null;

  return (
    <Modal isOpen={open} onClose={handleClose} title="Apply for this role" size="lg">
      <form className="job-apply-form job-apply-form--polish" onSubmit={onSubmit} noValidate>
        <p className="job-apply-jobline text-2 mb-20">
          <strong>{job.title}</strong>
          {job.location ? ` · ${job.location}` : ""}
        </p>
        <div className="job-apply-grid mb-20">
          <div className="job-apply-field">
            <label className="job-apply-label" htmlFor="ja-name">
              Full name <span className="job-apply-req">*</span>
            </label>
            <input
              id="ja-name"
              className="job-apply-input"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((s) => ({ ...s, fullName: undefined }));
              }}
              autoComplete="name"
              maxLength={NAME_MAX}
              placeholder="Jane Doe"
            />
            <FieldError message={errors.fullName} />
          </div>
          <div className="job-apply-field">
            <label className="job-apply-label" htmlFor="ja-email">
              Email
            </label>
            <input
              id="ja-email"
              type="email"
              className="job-apply-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((s) => ({ ...s, email: undefined }));
              }}
              autoComplete="email"
              placeholder="you@example.com"
            />
            <FieldError message={errors.email} />
          </div>
          <div className="job-apply-field">
            <label className="job-apply-label" htmlFor="ja-phone">
              Phone <span className="job-apply-req">*</span>
            </label>
            <input
              id="ja-phone"
              type="tel"
              inputMode="numeric"
              className="job-apply-input"
              value={phone}
              onChange={onPhoneChange}
              autoComplete="tel"
              placeholder="10-digit number"
              maxLength={10}
            />
            <FieldError message={errors.phone} />
          </div>
          <div className="job-apply-field">
            <label className="job-apply-label" htmlFor="ja-li">LinkedIn</label>
            <input
              id="ja-li"
              type="url"
              className="job-apply-input"
              placeholder="https://linkedin.com/in/…"
              value={linkedinUrl}
              onChange={(e) => {
                setLinkedinUrl(e.target.value);
                if (errors.linkedinUrl) setErrors((s) => ({ ...s, linkedinUrl: undefined }));
              }}
            />
            <FieldError message={errors.linkedinUrl} />
          </div>
          <div className="job-apply-field job-apply-field--full">
            <label className="job-apply-label" htmlFor="ja-cover">
              Cover letter <span className="job-apply-req">*</span>
            </label>
            <textarea
              id="ja-cover"
              className="job-apply-textarea"
              rows={5}
              value={coverLetter}
              onChange={(e) => {
                setCoverLetter(e.target.value);
                if (errors.coverLetter) setErrors((s) => ({ ...s, coverLetter: undefined }));
              }}
              placeholder={`Why you’re a great fit (min. ${COVER_MIN} characters)…`}
              maxLength={COVER_MAX}
            />
            <p className="job-apply-hint">
              {coverLetter.trim().length}/{COVER_MAX} · minimum {COVER_MIN} characters
            </p>
            <FieldError message={errors.coverLetter} />
          </div>
          <div className="job-apply-field job-apply-field--full">
            <span className="job-apply-label d-block">
              Resume (PDF) <span className="job-apply-req">*</span>
            </span>
            <label className="job-apply-file">
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="job-apply-file__native"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  if (errors.file) setErrors((s) => ({ ...s, file: undefined }));
                }}
              />
              <span className="job-apply-file__ui">
                <span className="job-apply-file__btn">Choose PDF</span>
                <span className="job-apply-file__name">
                  {file ? file.name : "No file selected"}
                </span>
              </span>
            </label>
            <p className="job-apply-hint mb-0">PDF only · max {MAX_PDF_MB} MB</p>
            <FieldError message={errors.file} />
          </div>
        </div>
        {submitting && uploadPct > 0 && uploadPct < 100 ? (
          <p className="job-apply-hint mb-16">Uploading resume… {uploadPct}%</p>
        ) : null}
        <div className="d-flex gap-3 justify-content-end flex-wrap pt-8 job-apply-actions">
          <button
            type="button"
            className="tf-btn style-border pd-10"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="tf-btn bg-color-primary fw-7 pd-16" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit application"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
