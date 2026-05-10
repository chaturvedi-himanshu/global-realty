import React from "react";
import Image from "next/image";
export default function Cta() {
  return (
    <section className="section-CTA">
      <div className="tf-container">
        <div className="row">
          <div className="col-12">
            <div className="content-inner">
              <Image
                alt=""
                src="/images/section/cta.webp"
                width={300}
                height={512}
              />
              <div className="content">
                <h4 className="text_white mb-8">
                  Find a Local Real Estate Agent Today
                </h4>
                <p className="text_white text-1">
                  If you’re looking to buy a project. We’ll help you find the best one.
                </p>
              </div>
              <button
                type="button"
                className="tf-btn style-2 fw-6"
                data-bs-toggle="modal"
                data-bs-target="#modalInquiry"
              >
                Find your location agent
                <i className="icon-MagnifyingGlass fw-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
