import React, { Suspense } from "react";
import Nav from "./Nav";
import Link from "next/link";
import DashboardNav from "./DashboardNav";
import connectDB from "@/lib/mongoose";
import ContactInfo from "@/models/ContactInfo";

async function getContactInfo() {
  try {
    await connectDB();
    const info = await ContactInfo.findOne().lean().select("phones emails");
    return info || {};
  } catch {
    return {};
  }
}

export default async function Header1({ parentClass = "header" }) {
  const contact = await getContactInfo();
  const phone = String(contact?.phones?.[0] || "").trim();
  const telHref = phone ? `tel:${phone.replace(/\s/g, "")}` : "";

  return (
    <header id="header-main" className={parentClass}>
      <div className="header-inner">
        <div className="tf-container xl">
          <div className="row">
            <div className="col-12">
              <div className="header-inner-wrap">
                <div className="header-logo">
                  <Link href={`/`} className="site-logo">
                    <img
                      className="logo_header"
                      alt=""
                      data-light="/images/logo/logo.png"
                      data-dark="/images/logo/logo.png"
                      src="/images/logo/logo.png"
                    />
                  </Link>
                </div>
                <div className="header-right">
                  <div className="nav-links-touch-wrap">
                    <nav className="main-menu">
                      <ul className="navigation ">
                        <Suspense fallback={null}>
                          <Nav />
                        </Suspense>
                      </ul>
                    </nav>
                    <div className="btn-add">
                      {phone ? (
                        <a
                          href={telHref}
                          className="tf-btn style-border pd-23"
                        >
                          {phone}
                        </a>
                      ) : (
                        <button
                          className="tf-btn style-border pd-23"
                          data-bs-toggle="modal"
                          data-bs-target="#modalInquiry"
                        >
                          Get in Touch
                        </button>
                      )}
                    </div>
                  </div>
                  <div
                    className="mobile-button"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#menu-mobile"
                    aria-controls="menu-mobile"
                  >
                    <i className="icon-menu" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
