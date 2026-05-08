"use client";

import { useState } from "react";
import useSWR from "@/lib/swr-lite";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import MapComponent from "@/components/common/MapComponent";
import {
  firstErrorMessage,
  validateInquiryForm,
} from "@/lib/inquiryFormValidation";

const fetcher = (url) => api.get(url).then((r) => r.data);

function clearKey(setter, key) {
  setter((prev) => {
    if (!prev[key]) return prev;
    const next = { ...prev };
    delete next[key];
    return next;
  });
}

export default function Contact() {
  const { data } = useSWR("/cms/contact-info", fetcher);
  const contactInfo = data?.data;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { ok, errors } = validateInquiryForm(
      { name, email, phone, message },
      { minMessage: 10 }
    );
    if (!ok) {
      setFieldErrors(errors);
      const msg = firstErrorMessage(errors);
      if (msg) toast.error(msg);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await api.post("/inquiries", {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        interest: interest.trim(),
        message: message.trim(),
        pageName: "contact",
      });
      toast.success("Message sent! We'll get back to you soon.");
      setSubmitted(true);
    } catch {
      // toast from axios interceptor
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-top-map style-2 section-contact-map">
      <div className="wrap-map">
        <div
          id="map"
          className="row-height"
          data-map-zoom={16}
          data-map-scroll="true"
        >
          {contactInfo?.mapEmbedUrl ? (
            <iframe
              src={contactInfo.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, display: "block" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Our Location"
            />
          ) : (
            <MapComponent />
          )}
        </div>
      </div>
      <div className="box">
        <div className="tf-container">
          <div className="row">
            <div className="col-12">
              {submitted ? (
                <div className="form-contact">
                  <div className="heading-section">
                    <h2 className="title">Thank you</h2>
                    <p className="text-1">
                      Your message has been received. We&apos;ll get back to you
                      shortly.
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  id="contactform"
                  onSubmit={handleSubmit}
                  className="form-contact"
                  noValidate
                >
                  <div className="heading-section">
                    <h2 className="title">We Would Love to Hear From You</h2>
                    <p className="text-1">
                      We&apos;ll get to know you to understand your goals and
                      explain the process so you know what to expect.
                    </p>
                  </div>
                  <div className="cols">
                    <fieldset>
                      <label htmlFor="name">Name:</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Your name"
                        name="name"
                        id="name"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          clearKey(setFieldErrors, "name");
                        }}
                        aria-invalid={!!fieldErrors.name}
                        autoComplete="name"
                      />
                      {fieldErrors.name ? (
                        <span className="form-field-error">{fieldErrors.name}</span>
                      ) : null}
                    </fieldset>
                    <fieldset>
                      <label htmlFor="email-contact">Email:</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        name="email"
                        id="email-contact"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          clearKey(setFieldErrors, "email");
                        }}
                        aria-invalid={!!fieldErrors.email}
                        autoComplete="email"
                      />
                      {fieldErrors.email ? (
                        <span className="form-field-error">{fieldErrors.email}</span>
                      ) : null}
                    </fieldset>
                  </div>
                  <div className="cols">
                    <fieldset className="phone">
                      <label htmlFor="phone">Phone number:</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="Your phone number"
                        name="phone"
                        id="phone"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          clearKey(setFieldErrors, "phone");
                        }}
                        aria-invalid={!!fieldErrors.phone}
                        autoComplete="tel"
                      />
                      {fieldErrors.phone ? (
                        <span className="form-field-error">{fieldErrors.phone}</span>
                      ) : null}
                    </fieldset>
                    <fieldset className="select">
                      <label htmlFor="interest">
                        What are you interested in?
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="interest"
                        name="interest"
                        placeholder="e.g. buying, renting, investment…"
                        value={interest}
                        onChange={(e) => setInterest(e.target.value)}
                        autoComplete="off"
                      />
                    </fieldset>
                  </div>
                  <fieldset>
                    <label htmlFor="message">Your Message:</label>
                    <textarea
                      name="message"
                      cols={30}
                      rows={10}
                      placeholder="Message"
                      id="message"
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        clearKey(setFieldErrors, "message");
                      }}
                      aria-invalid={!!fieldErrors.message}
                    />
                    {fieldErrors.message ? (
                      <span className="form-field-error">{fieldErrors.message}</span>
                    ) : null}
                  </fieldset>
                  <div className="send-wrap">
                    <button
                      className="tf-btn bg-color-primary fw-7 pd-8"
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? "Sending…" : "Contact our experts"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
