/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/agents", destination: "/team", permanent: true },
      { source: "/agents-details/:slug*", destination: "/team/:slug*", permanent: true },
      { source: "/blog-list", destination: "/blogs", permanent: true },
      { source: "/blog-grid", destination: "/blogs", permanent: true },
      { source: "/agency-list", destination: "/", permanent: true },
      { source: "/agency-grid", destination: "/", permanent: true },
      { source: "/agency-details/:id*", destination: "/", permanent: true },
      { source: "/project-list", destination: "/", permanent: true },
      { source: "/project-details/:id*", destination: "/", permanent: true },
      { source: "/property-detail-v1/:id", destination: "/property-detail/:id", permanent: true },
      { source: "/property-detail-v2/:id", destination: "/property-detail/:id", permanent: true },
      { source: "/property-detail-v3/:id", destination: "/property-detail/:id", permanent: true },
      { source: "/property-detail-v4/:id", destination: "/property-detail/:id", permanent: true },
      { source: "/property-detail-v5/:id", destination: "/property-detail/:id", permanent: true },
      { source: "/properties/:slug", destination: "/property-detail/:slug", permanent: true },
      { source: "/property-list-right-sidebar", destination: "/properties", permanent: true },
      { source: "/property-list-left-sidebar", destination: "/properties", permanent: true },
      { source: "/property-list-top-search", destination: "/properties", permanent: true },
      { source: "/property-list-full-width", destination: "/properties", permanent: true },
      { source: "/property-grid-full-width", destination: "/properties", permanent: true },
      { source: "/property-gird-right-sidebar", destination: "/properties", permanent: true },
      { source: "/property-gird-left-sidebar", destination: "/properties", permanent: true },
      { source: "/property-gird-top-search", destination: "/properties", permanent: true },
      { source: "/property-filter-popup-right", destination: "/properties", permanent: true },
      { source: "/property-filter-popup-left", destination: "/properties", permanent: true },
      { source: "/property-filter-popup", destination: "/properties", permanent: true },
      { source: "/property-half-top-map", destination: "/properties", permanent: true },
      { source: "/property-half-map-list", destination: "/properties", permanent: true },
      { source: "/property-half-map-grid", destination: "/properties", permanent: true },
    ];
  },
  images: {
    // Allow external property image URLs from admin/data sources
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
    // Keep images unoptimized to avoid runtime host blocking for mixed legacy URLs
    unoptimized: true,
  },
};

export default nextConfig;
