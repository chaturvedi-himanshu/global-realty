"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";
import useSWR from "@/lib/swr-lite";
import api from "@/lib/axios";

const fetcher = (url) => api.get(url).then((r) => r.data);

const contactFetcher = (url) => fetch(url).then((r) => r.json());

function isPropertiesNavActive(pathname, searchParams, menu) {
  if (pathname !== "/properties") return false;
  const t = searchParams.get("type") || "";
  if (!t) return false;
  return menu.some((type) => type.slug === t);
}

export default function MobileMenu() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data, isLoading } = useSWR("/website/nav-menu", fetcher);
  const { data: contactJson } = useSWR(
    "/api/website/contact-info",
    contactFetcher,
  );
  const payload = data?.data;
  const propertiesMenu = payload?.propertiesMenu || [];
  const phone = String(contactJson?.data?.phones?.[0] || "").trim();
  const telHref = phone ? `tel:${phone.replace(/\s/g, "")}` : "";

  const propsMenuActive =
    !isLoading && isPropertiesNavActive(pathname, searchParams, propertiesMenu);

  const blogsActive =
    pathname === "/blogs" ||
    pathname === "/blog" ||
    pathname.startsWith("/blogs/") ||
    pathname.startsWith("/blog/");
  const newsActive = pathname === "/news" || pathname.startsWith("/news/");
  const mediaActive = blogsActive || newsActive;
  const galleryActive =
    pathname === "/events" || pathname.startsWith("/events/");

  return (
    <div
      className="offcanvas offcanvas-start mobile-nav-wrap"
      tabIndex={-1}
      id="menu-mobile"
      aria-labelledby="menu-mobile"
    >
      <div className="offcanvas-header top-nav-mobile">
        <div className="offcanvas-title">
          <Link href="/">
            <Image
              alt=""
              src="/images/logo/logo.png"
              width={272}
              height={84}
            />
          </Link>
        </div>
        <div data-bs-dismiss="offcanvas" aria-label="Close">
          <i className="icon-close" />
        </div>
      </div>
      <div className="offcanvas-body inner-mobile-nav">
        <div className="mb-body">
          <ul id="menu-mobile-menu">
            <li
              className={`menu-item ${
                pathname === "/" ? "current-menu-item" : ""
              }`}
            >
              <Link href="/" className="item-menu-mobile">
                Home
              </Link>
            </li>

            <li
              className={`menu-item menu-item-has-children-mobile ${
                propsMenuActive ? "current-menu-item" : ""
              }`}
            >
              <a
                href="#dropdown-menu-props"
                className="item-menu-mobile collapsed"
                data-bs-toggle="collapse"
                aria-expanded="false"
                aria-controls="dropdown-menu-props"
              >
                Properties
              </a>
              <div
                id="dropdown-menu-props"
                className="collapse"
                data-bs-parent="#menu-mobile-menu"
              >
                <ul className="sub-mobile">
                  {isLoading ? (
                    <li className="menu-item">
                      <span className="item-menu-mobile">Loading…</span>
                    </li>
                  ) : propertiesMenu.length === 0 ? (
                    <li className="menu-item">
                      <Link href="/properties" className="item-menu-mobile">
                        All properties
                      </Link>
                    </li>
                  ) : (
                    propertiesMenu.map((type) => (
                      <li
                        key={type._id}
                        className={
                          searchParams.get("type") === type.slug
                            ? "menu-item current-item"
                            : "menu-item"
                        }
                      >
                        <Link
                          href={
                            type.href ||
                            `/properties?type=${encodeURIComponent(type.slug)}`
                          }
                          className="item-menu-mobile"
                        >
                          {type.name}
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </li>

            <li
              className={`menu-item ${
                pathname === "/about" ? "current-menu-item" : ""
              }`}
            >
              <Link href="/about" className="item-menu-mobile">
                About
              </Link>
            </li>
            <li
              className={`menu-item menu-item-has-children-mobile ${
                mediaActive ? "current-menu-item" : ""
              }`}
            >
              <a
                href="#dropdown-menu-media"
                className="item-menu-mobile collapsed"
                data-bs-toggle="collapse"
                aria-expanded="false"
                aria-controls="dropdown-menu-media"
              >
                Media
              </a>
              <div
                id="dropdown-menu-media"
                className="collapse"
                data-bs-parent="#menu-mobile-menu"
              >
                <ul className="sub-mobile">
                  <li
                    className={
                      blogsActive ? "menu-item current-item" : "menu-item"
                    }
                  >
                    <Link href="/blogs" className="item-menu-mobile">
                      Blogs
                    </Link>
                  </li>
                  <li
                    className={
                      newsActive ? "menu-item current-item" : "menu-item"
                    }
                  >
                    <Link href="/news" className="item-menu-mobile">
                      News
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
            <li
              className={`menu-item ${
                galleryActive ? "current-menu-item" : ""
              }`}
            >
              <Link href="/events" className="item-menu-mobile">
                Gallery
              </Link>
            </li>

            <li
              className={`menu-item ${
                pathname === "/contact" ? "current-item" : ""
              }`}
            >
              <Link href="/contact" className="item-menu-mobile">
                Contact
              </Link>
            </li>
          </ul>
          <div className="support">
            <a href="/contact" className="text-need">
              Need help?
            </a>
            <ul className="mb-info">
              <li>
                {phone ? (
                  <a href={telHref}>{phone}</a>
                ) : (
                  <Link href="/contact">Get in touch</Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
