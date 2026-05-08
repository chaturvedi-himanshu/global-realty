"use client";
import useSWR from "@/lib/swr-lite";
import api from "@/lib/axios";

const fetcher = (url) => api.get(url).then((r) => r.data);

export function useBlogs(params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined))
  ).toString();
  const url = `/blogs${query ? `?${query}` : ""}`;
  return useSWR(url, fetcher);
}

export function useBlog(id) {
  return useSWR(id ? `/blogs/${id}` : null, fetcher);
}

export function useBlogCategories() {
  return useSWR("/blog-categories", fetcher);
}
