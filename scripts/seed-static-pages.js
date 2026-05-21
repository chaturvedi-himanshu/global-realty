/**
 * Seeds the `staticpages` collection with the standard legal pages
 * (Disclaimer, Privacy Policy).
 *
 * Usage (from proty-nextjs):
 *   node scripts/seed-static-pages.js
 *   - or -
 *   npm run seed:static-pages
 *
 * Requires MONGODB_URI in .env.local
 *
 * Re-run safe: existing docs with the same slug are updated in place
 * (upsert). Author-side edits in the admin panel are preserved across
 * re-runs only for fields not overwritten by this script.
 */
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=80";

const DISCLAIMER_CONTENT = `
<p>The information provided on this website is intended for general informational purposes only and should not be construed as legal, financial, or professional advice. While Global Realty makes every reasonable effort to ensure that the information displayed - including property details, pricing, availability, location, and amenities - is accurate and up to date, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information for any particular purpose.</p>

<h2>Property Information</h2>
<p>All visuals, floor plans, specifications, and renderings shown on this website are indicative and may vary from the actual project on the ground. Final specifications, layouts, and dimensions are subject to approvals from the relevant authorities and the discretion of the developer. Prospective buyers are advised to verify all project-related information directly with the developer or seller and to obtain independent legal and financial advice before making a purchase decision.</p>

<h2>No Offer or Guarantee</h2>
<p>The content presented on this site does not constitute an offer or guarantee of any kind. Nothing on this website should be interpreted as a solicitation or invitation to purchase, sell, or invest in any property or financial product. Any reliance you place on such information is strictly at your own risk.</p>

<h2>Third-Party Content</h2>
<p>Our website may include links, references, or content from third-party sources. Global Realty is not responsible for the accuracy, reliability, or content of any external sites linked from this website. Inclusion of any third-party link does not imply endorsement.</p>

<h2>Changes to This Disclaimer</h2>
<p>We reserve the right to modify, update, or remove the content on this website at any time without prior notice. The latest version of this disclaimer will always be available on this page.</p>

<h2>Contact</h2>
<p>If you have any questions regarding this disclaimer, please reach out to our team via the <a href="/contact">Contact</a> page.</p>
`.trim();

const PRIVACY_CONTENT = `
<p>At Global Realty, we are committed to protecting the personal information you share with us. This Privacy Policy explains what data we collect, how we use it, the safeguards we put in place, and the choices you have. By using this website you agree to the practices described below.</p>

<h2>Information We Collect</h2>
<ul>
  <li><strong>Personal details</strong> you provide voluntarily - such as your name, email address, phone number, and property preferences - when you fill out an inquiry, request a callback, schedule a site visit, or book a meeting.</li>
  <li><strong>Technical information</strong> automatically collected through cookies and analytics tools - such as your device type, browser, IP address, pages visited, and time spent on the site - to help us improve user experience.</li>
  <li><strong>Communication records</strong> such as call notes, emails, or chat conversations between you and our advisory team.</li>
</ul>

<h2>How We Use Your Information</h2>
<ul>
  <li>To respond to your inquiries and provide property recommendations that match your requirements.</li>
  <li>To schedule and coordinate site visits, meetings, and follow-ups with our advisory team.</li>
  <li>To send relevant updates about properties, pricing, market insights, and offers - only when you have opted in.</li>
  <li>To improve our website, services, and customer experience based on usage analytics.</li>
  <li>To comply with applicable legal, regulatory, and contractual obligations.</li>
</ul>

<h2>How We Protect Your Data</h2>
<p>We employ industry-standard administrative, technical, and physical safeguards to protect your information against unauthorised access, disclosure, alteration, or destruction. Access to your data is restricted to authorised personnel who need it to perform their role.</p>

<h2>Sharing of Information</h2>
<p>We do not sell or rent your personal information. We may share it only with:</p>
<ul>
  <li><strong>Verified developers and sellers</strong> for the specific properties you have shown interest in.</li>
  <li><strong>Service providers</strong> who help us operate the website, CRM, analytics, hosting, or communication tools - bound by confidentiality.</li>
  <li><strong>Legal and regulatory authorities</strong>, where required by law.</li>
</ul>

<h2>Cookies</h2>
<p>Our website uses cookies and similar technologies to remember your preferences and analyse traffic. You can disable cookies in your browser settings, though some features of the site may not work as intended.</p>

<h2>Your Choices &amp; Rights</h2>
<ul>
  <li>You can request access to, correction of, or deletion of the personal data we hold about you.</li>
  <li>You can opt out of marketing communications at any time by clicking the unsubscribe link in our emails or contacting us directly.</li>
  <li>You can withdraw consent for any non-essential processing at any time.</li>
</ul>

<h2>Children's Privacy</h2>
<p>Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children.</p>

<h2>Updates to This Policy</h2>
<p>We may update this Privacy Policy from time to time. The latest version will always be available on this page along with the effective date.</p>

<h2>Contact Us</h2>
<p>For any privacy-related questions or requests, please reach out via the <a href="/contact">Contact</a> page and our team will respond promptly.</p>
`.trim();

const PAGES = [
  {
    title: "Disclaimer",
    slug: "disclaimer",
    breadcrumbLabel: "Disclaimer",
    bannerHeading: "Disclaimer",
    bannerSubheading:
      "Important information about the content, visuals, and listings on this website.",
    bannerImage: DEFAULT_BANNER,
    bannerOverlayColor: "rgba(15, 23, 42, 0.55)",
    content: DISCLAIMER_CONTENT,
    metaTitle: "Disclaimer | Global Realty",
    metaDescription:
      "Read the disclaimer for Global Realty - usage of property information, visuals, and third-party content on this website.",
    status: "published",
    order: 90,
  },
  {
    title: "Privacy Policy",
    slug: "privacy-policy",
    breadcrumbLabel: "Privacy Policy",
    bannerHeading: "Privacy Policy",
    bannerSubheading:
      "How we collect, use, and safeguard the information you share with us.",
    bannerImage: DEFAULT_BANNER,
    bannerOverlayColor: "rgba(15, 23, 42, 0.55)",
    content: PRIVACY_CONTENT,
    metaTitle: "Privacy Policy | Global Realty",
    metaDescription:
      "Learn how Global Realty collects, uses, and protects your personal information when you use this website.",
    status: "published",
    order: 91,
  },
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const col = db.collection("staticpages");
  const now = new Date();

  for (const p of PAGES) {
    const res = await col.updateOne(
      { slug: p.slug },
      {
        $set: { ...p, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
    const action = res.upsertedCount ? "Inserted" : "Updated";
    console.log(`✓ ${action} /${p.slug}`);
  }

  console.log(`\nSeeded ${PAGES.length} static page(s).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
