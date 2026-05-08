"use client";
import useSWR from "@/lib/swr-lite";
import api from "@/lib/axios";

const fetcher = (url) => api.get(url).then((r) => r.data);

export function useHeroSlides() {
  return useSWR("/cms/hero", fetcher);
}

export function useAboutSection() {
  return useSWR("/cms/about", fetcher);
}

export function useTestimonials(all = false) {
  return useSWR(`/cms/testimonials${all ? "?all=true" : ""}`, fetcher);
}

export function useFAQs(category) {
  const url = category ? `/cms/faqs?category=${category}` : "/cms/faqs";
  return useSWR(url, fetcher);
}

export function useBanners(position) {
  const url = position ? `/cms/banners?position=${position}` : "/cms/banners";
  return useSWR(url, fetcher);
}

export function useContactInfo() {
  return useSWR("/cms/contact-info", fetcher);
}

export function useSiteConfig() {
  return useSWR("/site-config", fetcher);
}
