/**
 * Inserts 520+ ChatbotQA documents (real-estate themed Q&A) into MongoDB.
 * Uses same schema as models/ChatbotQA.js (collection: chatbotqas).
 *
 * Usage:
 *   node scripts/seed-chatbot-qa-bulk-500.js           # append (skip if --no-append logic)
 *   node scripts/seed-chatbot-qa-bulk-500.js --replace   # delete all ChatbotQA then insert
 *
 * Env: MONGODB_URI in .env.local (or .env)
 */
require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in .env.local or .env");
  process.exit(1);
}

const REPLACE = process.argv.includes("--replace");

const chatbotQASchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    keywords: { type: [String], default: [] },
    isQuickReply: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const ChatbotQA =
  mongoose.models.ChatbotQA ||
  mongoose.model("ChatbotQA", chatbotQASchema);

const CITIES = [
  "Noida",
  "Greater Noida",
  "Gurugram",
  "Delhi",
  "Ghaziabad",
  "Faridabad",
  "Lucknow",
  "Jaipur",
  "Indore",
  "Pune",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
];

const MICRO = [
  "Sector 150",
  "Sector 137",
  "Expressway",
  "YEIDA",
  "Sports City",
  "Tech Park",
  "Airport corridor",
  "Metro-linked belt",
];

const TYPES = [
  "2 BHK apartment",
  "3 BHK apartment",
  "4 BHK luxury flat",
  "duplex penthouse",
  "builder floor",
  "villa",
  "plot",
  "studio apartment",
  "serviced apartment",
  "commercial shop",
  "office space",
];

const TOPICS = [
  {
    q: (c, m, t, i) => `What is the typical price range for a ${t} in ${c}?`,
    a: (c, m, t, i) =>
      `In **${c}**, ${t} inventory varies by micro-market (${m}). As a broad guide, ask our team for a fresh shortlist with current asking rates and comparable sales for corridor **#${i}** — we refresh numbers weekly.`,
    kw: (c, t) => [c.toLowerCase(), "price", "budget", t.split(" ")[0]],
  },
  {
    q: (c, m, t, i) => `Is ${m} in ${c} good for long-term investment?`,
    a: (c, m, t, i) =>
      `**${m}** in ${c} is often evaluated on connectivity, supply pipeline, and end-user depth. For holding period goals, we map risk vs reward and show you comparable absorption data before you decide (ref **#${i}**).`,
    kw: (c, m) => ["investment", c.toLowerCase(), m.toLowerCase().split(" ")[0]],
  },
  {
    q: (c, m, t, i) => `How do I verify RERA for a project near ${m}, ${c}?`,
    a: (c, m, t, i) =>
      `Check the state RERA portal for registration status and download the project QR details. On our listings, RERA numbers appear when provided by the developer — cross-check file **#${i}** on the official portal before token.`,
    kw: () => ["rera", "registration", "compliance"],
  },
  {
    q: (c, m, t, i) => `Can I book a site visit for a ${t} in ${c}?`,
    a: (c, m, t, i) =>
      `Yes. Share preferred slots and we coordinate with the sales desk. Mention **${m}** and unit type ${t} so routing is faster (request id **#${i}**).`,
    kw: (c, t) => ["site visit", "booking", c.toLowerCase(), t.split(" ")[0]],
  },
  {
    q: (c, m, t, i) => `What documents should I carry for home loan discussion in ${c}?`,
    a: (c, m, t, i) =>
      `Typically KYC, income proofs, bank statements, employment/business papers, and property papers (allotment/agreement). Banks may ask for extra items — we share a checklist per lender for ${c} (pack **#${i}**).`,
    kw: () => ["loan", "documents", "bank", "home loan"],
  },
  {
    q: (c, m, t, i) => `Are resale ${t} options available in ${c}?`,
    a: (c, m, t, i) =>
      `Resale stock moves quickly. We scan verified listings and title hygiene before shortlisting ${t} around **${m}** (batch **#${i}**).`,
    kw: (c, t) => ["resale", "secondary", c.toLowerCase()],
  },
  {
    q: (c, m, t, i) => `What is the difference between carpet and super area for ${t}?`,
    a: (c, m, t, i) =>
      `**Carpet** is usable inside walls; **super built-up** includes walls, common share, and amenities allocation. Always compare using the same basis when pricing ${t} (guide **#${i}**).`,
    kw: () => ["carpet area", "super area", "sqft"],
  },
  {
    q: (c, m, t, i) => `How much stamp duty applies when buying in ${c}?`,
    a: (c, m, t, i) =>
      `Stamp duty and registration depend on state rules, gender/category benefits, and circle rates. Confirm with your sub-registrar workflow for ${c} — we only share general orientation, not legal advice (note **#${i}**).`,
    kw: (c) => ["stamp duty", "registration", c.toLowerCase()],
  },
  {
    q: (c, m, t, i) => `Is a ${t} near ${m} suitable for rental yield?`,
    a: (c, m, t, i) =>
      `Yield depends on tenant profile, furnishing, and maintenance outflows. We can share indicative rent ranges for comparable ${t} stock near **${m}** in ${c} (study **#${i}**).`,
    kw: () => ["rent", "yield", "investment"],
  },
  {
    q: (c, m, t, i) => `What are common payment plans for under-construction ${t} in ${c}?`,
    a: (c, m, t, i) =>
      `Developers may offer construction-linked, down-payment heavy, or flexi plans. Read milestone dates and penalty clauses carefully before signing (plan ref **#${i}**).`,
    kw: () => ["payment plan", "clp", "construction"],
  },
  {
    q: (c, m, t, i) => `How do I compare two ${t} projects in ${c}?`,
    a: (c, m, t, i) =>
      `Use a simple matrix: location minutes, density, specifications, completion track record, price basis, and hidden charges. We help you normalize specs apples-to-apples (compare **#${i}**).`,
    kw: () => ["compare", "shortlist", "project"],
  },
  {
    q: (c, m, t, i) => `What is OC and why does it matter for ${t} in ${c}?`,
    a: (c, m, t, i) =>
      `**Occupancy Certificate** indicates civic compliance for habitation. For ${c} purchases, verify OC status with project documents and municipal records (topic **#${i}**).`,
    kw: () => ["oc", "possession", "completion"],
  },
  {
    q: (c, m, t, i) => `Can NRIs buy a ${t} in ${c}?`,
    a: (c, m, t, i) =>
      `NRIs can buy residential property subject to FEMA norms and repatriation rules. Use banking channels for remittance and keep KYC aligned (NRI brief **#${i}**).`,
    kw: () => ["nri", "fema", "purchase"],
  },
  {
    q: (c, m, t, i) => `What should I check in builder reputation before ${t} in ${c}?`,
    a: (c, m, t, i) =>
      `Track delivery history, litigation news, quality of past phases, and customer service responsiveness. We highlight red flags early (diligence **#${i}**).`,
    kw: () => ["builder", "developer", "trust"],
  },
  {
    q: (c, m, t, i) => `How long does registration take after full payment in ${c}?`,
    a: (c, m, t, i) =>
      `Timelines vary by registrar load and document readiness. Keep originals aligned and schedule token slot early (timeline **#${i}**).`,
    kw: () => ["registration", "timeline", "possession"],
  },
  {
    q: (c, m, t, i) => `Are corner units available for ${t} near ${m}?`,
    a: (c, m, t, i) =>
      `Corner inventory is limited. If you want extra light and ventilation, tell us early so we filter tower stacks near **${m}** (corner hunt **#${i}**).`,
    kw: (c, m) => ["corner", "unit", m.toLowerCase().split(" ")[0]],
  },
  {
    q: (c, m, t, i) => `What is a sale deed and when is it executed in ${c}?`,
    a: (c, m, t, i) =>
      `A **sale deed** transfers ownership and is registered with stamp duty paid. Execution timing follows your agreement milestones (deed primer **#${i}**).`,
    kw: () => ["sale deed", "legal", "agreement"],
  },
  {
    q: (c, m, t, i) => `How do I negotiate price for a ${t} in ${c}?`,
    a: (c, m, t, i) =>
      `Bring comps, payment flexibility, and closing speed as leverage. We help frame offers without burning bridges (negotiation **#${i}**).`,
    kw: () => ["negotiate", "offer", "discount"],
  },
  {
    q: (c, m, t, i) => `What amenities matter most for ${t} buyers in ${c}?`,
    a: (c, m, t, i) =>
      `Parking depth, power backup, lifts-to-apartment ratio, clubhouse quality, and security layers usually top the list for ${t} buyers (amenity **#${i}**).`,
    kw: () => ["amenities", "clubhouse", "parking"],
  },
  {
    q: (c, m, t, i) => `Is metro connectivity important for ${t} near ${m}?`,
    a: (c, m, t, i) =>
      `Metro improves commute resilience and rental liquidity for many pockets. We map walk minutes and interchange time for **${m}** (transit **#${i}**).`,
    kw: () => ["metro", "connectivity", "commute"],
  },
  {
    q: (c, m, t, i) => `What is a loading factor in ${t} pricing in ${c}?`,
    a: (c, m, t, i) =>
      `Loading converts carpet to saleable area by adding common walls and shared spaces. Always ask for the basis used in the quote (loading explainer **#${i}**).`,
    kw: () => ["loading", "area", "super built"],
  },
  {
    q: (c, m, t, i) => `How do I check title for a ${t} resale in ${c}?`,
    a: (c, m, t, i) =>
      `Chain of title, encumbrance certificate, mutation, and seller KYC are starting points. Engage a qualified lawyer for verification (title basics **#${i}**).`,
    kw: () => ["title", "resale", "encumbrance"],
  },
  {
    q: (c, m, t, i) => `What is BSP and EDC in ${c} builder quotes?`,
    a: (c, m, t, i) =>
      `**BSP** is basic sale price; **EDC/IDC** cover external development charges. Read the cost sheet footnotes for GST and PLC (charges **#${i}**).`,
    kw: () => ["bsp", "edc", "charges"],
  },
  {
    q: (c, m, t, i) => `Can I get a virtual tour before visiting ${t} in ${c}?`,
    a: (c, m, t, i) =>
      `Many projects offer walkthroughs or Matterport links. We can share what is available for shortlisted towers (virtual **#${i}**).`,
    kw: () => ["virtual tour", "video", "walkthrough"],
  },
  {
    q: (c, m, t, i) => `What insurance should I consider after buying ${t} in ${c}?`,
    a: (c, m, t, i) =>
      `Structure and contents policies differ. Discuss coverage with a licensed insurer aligned to your loan and society rules (insurance **#${i}**).`,
    kw: () => ["insurance", "home", "cover"],
  },
  {
    q: (c, m, t, i) => `How do maintenance charges work for ${t} in ${c}?`,
    a: (c, m, t, i) =>
      `CAM charges depend on common amenities and society bylaws. Ask for last 4 quarters invoices and escalation policy (maintenance **#${i}**).`,
    kw: () => ["maintenance", "cam", "society"],
  },
  {
    q: (c, m, t, i) => `What is a preferential location charge (PLC) for ${t}?`,
    a: (c, m, t, i) =>
      `PLC is a premium for better floor, view, or corner. Confirm if GST applies and whether it is capitalized in your loan (PLC **#${i}**).`,
    kw: () => ["plc", "premium", "floor"],
  },
];

function buildDocs(count) {
  const now = Date.now();
  const docs = [];
  let order = 1000;
  for (let i = 0; i < count; i++) {
    const c = CITIES[i % CITIES.length];
    const m = MICRO[i % MICRO.length];
    const t = TYPES[i % TYPES.length];
    const topic = TOPICS[i % TOPICS.length];
    const q = topic.q(c, m, t, i + 1);
    const a = topic.a(c, m, t, i + 1);
    const kw = topic.kw(c, m, t, i);
    const uniq = [...new Set([...kw, `faq${i}`, `batch${Math.floor(i / 50)}`])].filter(Boolean);
    docs.push({
      question: q,
      answer: a,
      keywords: uniq.slice(0, 8),
      isQuickReply: i < 8,
      order: order++,
      createdAt: new Date(now + i),
      updatedAt: new Date(now + i),
    });
  }
  return docs;
}

const TARGET = 520;
const BATCH = 100;

async function run() {
  await mongoose.connect(MONGODB_URI);
  if (REPLACE) {
    const r = await ChatbotQA.deleteMany({});
    console.log(`Removed ${r.deletedCount} existing ChatbotQA documents (--replace).`);
  }
  const docs = buildDocs(TARGET);
  let inserted = 0;
  for (let i = 0; i < docs.length; i += BATCH) {
    const chunk = docs.slice(i, i + BATCH);
    const res = await ChatbotQA.insertMany(chunk, { ordered: false });
    inserted += res.length;
    console.log(`Inserted ${inserted} / ${docs.length}…`);
  }
  const total = await ChatbotQA.countDocuments();
  console.log(`Done. ChatbotQA count in DB: ${total}`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (e) => {
  console.error(e);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
