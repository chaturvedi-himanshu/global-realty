"use client";
import React from "react";
import Image from "next/image";
import SplitTextAnimation from "@/components/common/SplitTextAnimation";

const FALLBACK_IMAGES = [
  "/images/section/location-9.jpg",
  "/images/section/location-16.jpg",
  "/images/section/location-17.jpg",
  "/images/section/location-18.jpg",
  "/images/section/location-19.jpg",
  "/images/section/location-9.jpg",
  "/images/section/location-16.jpg",
];

export default function Cities({ cities = [] }) {
  if (!cities.length) return null;

  return (
    <section className="section-neighborhoods" style={{ paddingTop: "104px" }}>
      <div className="tf-container">
        <div className="col-12">
          <div className="heading-section text-center mb-48">
            <h2 className="title split-text effect-right">
              <SplitTextAnimation text="Explore The Neighborhoods" />
            </h2>
            <p className="text-1 split-text split-lines-transform">
              Find your dream apartment with our listing
            </p>
          </div>
          <div className="wrap-neighborhoods">
            {cities.map((city, index) => (
              <div
                key={city._id || index}
                className={`box-location hover-img item-${index + 1}`}
              >
                <div
                  className="image-wrap"
                  style={{ height: 260, overflow: "hidden" }}
                >
                  <a
                    href={`/properties?city=${encodeURIComponent(city.cityName)}`}
                    className="h-full w-full"
                  >
                    {city.image || FALLBACK_IMAGES[index] ? (
                      <Image
                        className="lazyload"
                        alt={city.cityName}
                        src={city.image || FALLBACK_IMAGES[index]}
                        width={400}
                        height={300}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        unoptimized
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "#e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#9ca3af",
                          fontSize: "2rem",
                        }}
                      >
                        🏙
                      </div>
                    )}
                  </a>
                </div>
                <div className="content">
                  <h6 className="text_white">{city.cityName}</h6>
                  <a
                    href={`/properties?city=${encodeURIComponent(city.cityName)}`}
                    className="text-1 tf-btn style-border pd-23 neighborhoods-cta-btn"
                  >
                    {city.propertyCount} Projects{" "}
                    <i className="icon-arrow-right neighborhoods-cta-btn__arrow" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
