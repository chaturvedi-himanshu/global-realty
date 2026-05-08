"use client";
import React, { useState } from "react";
import Image from "next/image";
import useSWR, { mutate } from "@/lib/swr-lite";
import toast from "react-hot-toast";
import api from "@/lib/axios";


const normalizeReview = (r = {}, idx = 0) => ({
  _id: r._id || `local-${idx}-${r.name || "guest"}`,
  name: r.name || "Guest User",
  rating: Number(r.rating) > 0 ? Number(r.rating) : 5,
  comment: r.comment || r.review || "",
  createdAt: r.createdAt || new Date().toISOString(),
  avatar: r.avatar || "/images/avatar/avatar-1.jpg",
});

export default function Reviews({ propertyId, fallbackReviews = [] }) {
  const { data } = useSWR(
    propertyId ? `/reviews?propertyId=${propertyId}` : null);

  const apiReviews = (data?.data || []).map((r, i) => normalizeReview(r, i));
  const localReviews = (fallbackReviews || [])
    .filter((r) => r?.isApproved !== false)
    .map((r, i) => normalizeReview(r, i + 1000));

  const mergedMap = new Map();
  [...apiReviews, ...localReviews].forEach((r) => {
    const key = r._id || `${r.name}-${r.comment}`;
    if (!mergedMap.has(key)) mergedMap.set(key, r);
  });

  const reviews = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const visibleReviews = reviews.slice(0, 5);

  const [form, setForm] = useState({ name: "", email: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.comment) {
      toast.error("Please fill all fields");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/reviews", { ...form, propertyId });
      toast.success("Review submitted! It will appear after approval.");
      setForm({ name: "", email: "", rating: 5, comment: "" });
      mutate(`/reviews?propertyId=${propertyId}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!visibleReviews.length) return null;

  return (
    <div className="wg-property mb-0 box-comment">
      <div className="wrap-comment">
        <h4 className="title">Guest Reviews</h4>
        <ul className="comment-list">
          {visibleReviews.map((review) => (
            <li key={review._id}>
              <div className="comment-item">
                <div className="image-wrap" style={{ position: "relative", display: "inline-block" }}>
                  <Image
                    alt={review.name}
                    src={review.avatar}
                    width={120}
                    height={120}
                    unoptimized
                  />
                </div>
                <div className="content">
                  <div className="user">
                    <div className="author">
                      <h6 className="name">{review.name}</h6>
                      <div className="time">{new Date(review.createdAt).toLocaleDateString("en-IN")}</div>
                    </div>
                    <div className="ratings">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <i
                          key={s}
                          className="icon-star"
                          style={{ opacity: s <= review.rating ? 1 : 0.25 }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="comment">
                    <p>{review.comment}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {reviews.length > 5 && (
          <a href="#" className="tf-btn style-border fw-7 pd-1" onClick={(e) => e.preventDefault()}>
            <span>
              Showing 5 of {reviews.length} reviews <i className="icon-arrow-right-2 fw-4" />
            </span>
          </a>
        )}
      </div>

      {/* <div className="box-send">
        <div className="heading-box">
          <h4 className="title fw-7">Add Review</h4>
          <p>Your email address will not be published</p>
        </div>
        <form className="form-add-review" onSubmit={handleSubmit}>
          <div className="cols">
            <fieldset className="name">
              <label className="text-1 fw-6" htmlFor="review-name">
                Name
              </label>
              <input
                type="text"
                className="tf-input style-2"
                placeholder="Your Name*"
                id="review-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </fieldset>
            <fieldset className="email">
              <label className="text-1 fw-6" htmlFor="review-email">
                Email
              </label>
              <input
                type="email"
                className="tf-input style-2"
                placeholder="Your Email*"
                id="review-email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </fieldset>
          </div>
          <fieldset className="message">
            <label className="text-1 fw-6" htmlFor="review-message">
              Review
            </label>
            <textarea
              id="review-message"
              className="tf-input"
              rows={4}
              placeholder="Your review"
              value={form.comment}
              onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
              required
            />
          </fieldset>
          <button className="tf-btn bg-color-primary pd-24 fw-7" type="submit" disabled={submitting}>
            {submitting ? "Posting..." : "Post Comment"} <i className="icon-arrow-right-2 fw-4" />
          </button>
        </form>
      </div> */}
    </div>
  );
}
