"use client";
import useSWR from "@/lib/swr-lite";
import api from "@/lib/axios";

const fetcher = (url) => api.get(url).then((r) => r.data);

export function useProperties(params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined))
  ).toString();
  const url = `/properties${query ? `?${query}` : ""}`;
  return useSWR(url, fetcher);
}

export function useProperty(id) {
  return useSWR(id ? `/properties/${id}` : null, fetcher);
}

export function usePropertyTypes() {
  return useSWR("/property-types", fetcher);
}

export function usePropertySubTypes(typeId) {
  return useSWR(
    typeId ? `/property-subtypes?propertyType=${typeId}` : "/property-subtypes",
    fetcher
  );
}

export function useAmenities() {
  return useSWR("/amenities", fetcher);
}
