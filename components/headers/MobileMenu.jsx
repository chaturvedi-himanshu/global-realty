"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";
import useSWR from "@/lib/swr-lite";
import api from "@/lib/axios";

const fetcher = (url) => api.get(url).then((r) => r.data);

const contactFetcher = (url) =>
  fetch(url).then((r) => r.json());

function subtypeQueryMatchesItem(item, param) {
  if (!param) return false;
  const slug = String(item.slug || "").trim();
  if (slug && slug === param) return true;
  return String(item._id) === param;
}

function isPropertiesNavActive(pathname, searchParams, menu) {
  if (pathname !== "/properties") return false;
  const t = searchParams.get("type") || "";
  if (!t) return false;
  const st = searchParams.get("propertySubType") || "";
  return menu.some((type) => {
    if (type.slug !== t) return false;
    if (!st) return true;
    return type.subtypes.some((s) => subtypeQueryMatchesItem(s, st));
  });
}

function isSubtypeItemActive(pathname, searchParams, typeSlug, item) {
  if (pathname !== "/properties") return false;
  if (searchParams.get("type") !== typeSlug) return false;
  const st = searchParams.get("propertySubType") || "";
  if (item.slug === "all") return !st;
  return subtypeQueryMatchesItem(item, st);
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

  const blogActive =
    pathname === "/blogs" ||
    pathname.startsWith("/blog") ||
    pathname.startsWith("/blogs/");

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
              src="/images/logo/logo@2x.png"
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
                        className="menu-item menu-item-has-children-mobile-2"
                      >
                        <a
                          href={`#mobile-ptype-${type._id}`}
                          className="item-menu-mobile collapsed"
                          data-bs-toggle="collapse"
                          aria-expanded="false"
                          aria-controls={`mobile-ptype-${type._id}`}
                        >
                          {type.name}
                        </a>
                        <div
                          id={`mobile-ptype-${type._id}`}
                          className="collapse"
                          data-bs-parent="#dropdown-menu-props"
                        >
                          <ul className="sub-mobile">
                            {type.subtypes.map((item) => (
                              <li
                                key={item._id}
                                className={
                                  isSubtypeItemActive(
                                    pathname,
                                    searchParams,
                                    type.slug,
                                    item,
                                  )
                                    ? "menu-item current-item"
                                    : "menu-item"
                                }
                              >
                                <Link
                                  href={item.href}
                                  className="item-menu-mobile"
                                >
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
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
              className={`menu-item ${
                blogActive ? "current-menu-item" : ""
              }`}
            >
              <Link href="/blogs" className="item-menu-mobile">
                Blog
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
