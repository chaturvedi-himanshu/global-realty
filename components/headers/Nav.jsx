"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import React from "react";
import useSWR from "@/lib/swr-lite";
import api from "@/lib/axios";

const fetcher = (url) => api.get(url).then((r) => r.data);

function subtypeQueryMatchesItem(item, param) {
  if (!param) return false;
  const slug = String(item.slug || "").trim();
  if (slug && slug === param) return true;
  return String(item._id) === param;
}

function isPropertiesNavActive(pathname, searchParams, menu) {
  if (pathname !== "/properties") return false;
  const t = searchParams.get("type") || "";
  const st = searchParams.get("propertySubType") || "";
  if (!t) return false;
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

  const blogActive =
    pathname === "/blogs" ||
    pathname.startsWith("/blog") ||
    pathname.startsWith("/blogs/");

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
        <a href="#">Properties</a>
        <ul className="submenu">
          {isLoading ? (
            <li>
              <span className="text-1">Loading…</span>
            </li>
          ) : propertiesMenu.length === 0 ? (
            <li>
              <Link href="/properties">All properties</Link>
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
                <a href="#">{type.name}</a>
                <ul className="submenu2">
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
                          ? "current-item"
                          : ""
                      }
                    >
                      <Link href={item.href}>{item.name}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))
          )}
        </ul>
      </li>

      <li className={blogActive ? "current-menu" : ""}>
        <Link href="/blogs">Blog</Link>
      </li>

      <li className={pathname === "/contact" ? "current-menu" : ""}>
        <Link href="/contact">Contact</Link>
      </li>
    </>
  );
}
