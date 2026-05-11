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
