"use client";
import Image from "next/image";
import SplitTextAnimation from "@/components/common/SplitTextAnimation";
import BrandSlider from "@/components/common/BrandSlider";
export default function Partners({ partnerLogos = [] }) {
  return (
    <section className="section-work-together ">
      <div className="wg-partner  tf-spacing-1">
        <div className="tf-container">
          <div className="row">
            <div className="col-12">
              <div className="heading-section  text-center mb-48">
                <h2 className="title split-text effect-right">
                  <SplitTextAnimation text="Let’s Work Together" />
                </h2>
                <p
                  className="text-1 wow animate__fadeInUp animate__animated"
                  data-wow-duration="1.5s"
                >
                  We focus on sales—helping owners list premium homes and reach
                  serious buyers, from first viewing to closing.
                </p>
              </div>
              <BrandSlider logos={partnerLogos} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
