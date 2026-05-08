"use client";
import React from "react";
import Image from "next/image";
import SplitTextAnimation from "@/components/common/SplitTextAnimation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

function StarRating({ rating = 5 }) {
  return (
    <div className="ratings">
      {Array.from({ length: 5 }).map((_, i) => (
        <i key={i} className="icon-star" />
      ))}
    </div>
  );
}

export default function Testimonials({ testimonials: dbTestimonials = [] }) {
  const items = dbTestimonials.filter((t) => t?.message || t?.review || t?.content);
  if (!items.length) return null;

  const renderCard = (item) => (
    <div className="wg-testimonial style-2">
      <StarRating rating={item.rating} />
      <p className="text-1 description">
        {item.message || item.review || item.content}
      </p>
      <div className="author">
        <div className="avatar">
          <Image
            alt={item.name || ""}
            src={item.avatar || "/images/avatar/avt-png5.png"}
            width={120}
            height={120}
            unoptimized
          />
        </div>
        <div className="content">
          <h6 className="name">
            <a href="#">{item.name}</a>
          </h6>
          <p className="text-2">
            {item.role || item.designation || item.company || ""}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="section-testimonials style-1 tf-spacing-1">
      <div className="tf-container">
        <div className="row">
          <div className="col-12">
            <div className="heading-section text-center mb-48">
              <h2 className="title split-text effect-right">
                <SplitTextAnimation text="Clients Testimonials" />
              </h2>
              <p className="text-1 split-text split-lines-transform">
                Thousands of luxury home enthusiasts just like you visit our
                website.
              </p>
            </div>
            <div>
            <Swiper
              modules={[Autoplay, Pagination]}
              className="swiper style-pagination sw-layout"
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                768: { slidesPerView: 2, spaceBetween: 24 },
              }}
              autoplay={{ delay: 4500, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              loop={items.length > 2}
            >
              {items.map((item) => (
                <SwiperSlide key={item._id || item.id}>
                  {renderCard(item)}
                </SwiperSlide>
              ))}
            </Swiper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
