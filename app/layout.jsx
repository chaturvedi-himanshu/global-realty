import "./globals.css";
import "./odometer-theme-fixed.css";
import "../public/main.scss";
import "../styles/utilities.css";
import "../styles/admin.css";
import "../styles/admin-pages.css";
import "../styles/admin-forms.css";
import "../styles/ui.css";
import "../styles/listing.css";
import "../styles/details.css";
import "photoswipe/style.css";
import "rc-slider/assets/index.css";
import { Suspense } from "react";
import ClientLayout from "@/components/common/ClientLayout";
import connectDB from "@/lib/mongoose";
import ScriptSettings from "@/models/ScriptSettings";
import ThemeLoader from "@/components/common/ThemeLoader";
import ScriptInjector from "@/components/common/ScriptInjector";

export const metadata = {};

/**
 * Force the desktop layout on every device.
 * Setting a fixed logical width (800px) makes mobile browsers render the
 * page as if the viewport is 800px wide and scale it down to fit the device
 * screen — the same behaviour as Chrome's "Request desktop site" toggle.
 * Users can still pinch-zoom because we don't lock `initialScale` / `userScalable`.
 */
export const viewport = {
  width: 800,
};

async function getInjectedScripts() {
  try {
    await connectDB();
    const doc = await ScriptSettings.findOne().lean();
    return doc?.scripts || "";
  } catch {
    return "";
  }
}

export default async function RootLayout({ children }) {
  const injectedScripts = await getInjectedScripts();

  return (
    <html lang="en">

      <body className="popup-loader">
        {/* Force-fit the 800px desktop layout onto smaller screens (mimics
            mobile Chrome's "Request desktop site" toggle). Runs synchronously
            before React hydration so there's no flash of mobile layout. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function () {
  function applyDesktopViewport() {
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      document.head.appendChild(meta);
    }
    var deviceWidth = window.screen.width || document.documentElement.clientWidth || 800;
    if (deviceWidth >= 800) {
      meta.setAttribute('content', 'width=800, initial-scale=1');
      return;
    }
    var scale = (deviceWidth / 800).toFixed(4);
    meta.setAttribute(
      'content',
      'width=800, initial-scale=' + scale + ', minimum-scale=' + scale + ', maximum-scale=5'
    );
  }
  applyDesktopViewport();
  window.addEventListener('orientationchange', applyDesktopViewport);
})();`,
          }}
        />
        {/* Admin-managed scripts (Google Analytics, GTM, Meta Pixel, custom) */}
        {injectedScripts && <ScriptInjector scripts={injectedScripts} />}
        <ThemeLoader />
        <Suspense fallback={null}>
          <ClientLayout>{children}</ClientLayout>
        </Suspense>
      </body>
    </html>
  );
}
