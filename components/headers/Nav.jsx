"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";
import useSWR from "@/lib/swr-lite";
import api from "@/lib/axios";

const fetcher = (url) => api.get(url).then((r) => r.data);

function isPropertiesNavActive(pathname, searchParams, menu) {
  if (pathname !== "/properties") return false;
  const t = searchParams.get("type") || "";
  if (!t) return false;
  return menu.some((type) => type.slug === t);
}

/** Highlight the property-type row when that type is in the URL. */
function isTypeRowActive(pathname, searchParams, typeSlug) {
  if (pathname !== "/properties") return false;
  return searchParams.get("type") === typeSlug;
}

export default function Nav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data, isLoading } = useSWR("/website/nav-menu", fetcher);
  const payload = data?.data;
  const propertiesMenu = payload?.propertiesMenu || [];

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
    <>
      <li className={pathname === "/" ? "current-menu" : ""}>
        <Link href="/">Home</Link>
      </li>

      <li className={pathname === "/about" ? "current-menu" : ""}>
        <Link href="/about">About</Link>
      </li>
      <li
        className={`has-child style-2 ${propsMenuActive ? "current-menu" : ""}`}
      >
        <a href="#">Projects</a>
        <ul className="submenu">
          {isLoading ? (
            <li>
              <span className="text-1">Loading…</span>
            </li>
          ) : propertiesMenu.length === 0 ? (
            <li>
              <Link href="/properties">All Projects</Link>
            </li>
          ) : (
            propertiesMenu.map((type) => (
              <li
                key={type._id}
                className={
                  isTypeRowActive(pathname, searchParams, type.slug)
                    ? "current-item"
                    : ""
                }
              >
                <Link
                  href={
                    type.href ||
                    `/properties?type=${encodeURIComponent(type.slug)}`
                  }
                >
                  {type.name}
                </Link>
              </li>
            ))
          )}
        </ul>
      </li>

      <li
        className={`has-child style-2 ${mediaActive ? "current-menu" : ""}`}
      >
        <a href="#">Media</a>
        <ul className="submenu">
          <li className={blogsActive ? "current-item" : ""}>
            <Link href="/blogs">Blogs</Link>
          </li>
          <li className={newsActive ? "current-item" : ""}>
            <Link href="/news">News</Link>
          </li>
        </ul>
      </li>

      <li className={galleryActive ? "current-menu" : ""}>
        <Link href="/events">Gallery</Link>
      </li>

      <li className={pathname === "/contact" ? "current-menu" : ""}>
        <Link href="/contact">Contact</Link>
      </li>
    </>
  );
}
