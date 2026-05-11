import BrandSlider from "@/components/common/BrandSlider";
import React from "react";
import SplitTextAnimation from "./SplitTextAnimation";

export default function Brands({
  parentClass = "section-work-together style-2 tf-spacing-1",
}) {
  return (
    <section className={parentClass}>
      <div className="wg-partner">
        <div className="tf-container">
          <div className="row">
            <div className="col-12 wrap-partners">
              <div className="heading-section text-center mb-48">
                <h2 className="title split-text effect-right">
                  <SplitTextAnimation text="Our Partners" />
                </h2>
                <p className="text-1 split-text effect-right">
                  <SplitTextAnimation
                    text="We partner with leading reputed developers who are experienced, committed, reliable and ethical."
                  />
                </p>
              </div>
              <BrandSlider parentClass="infiniteslide wrap-partners" />
              <BrandSlider parentClass="infiniteslide wrap-partners partner-slider-reverse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
