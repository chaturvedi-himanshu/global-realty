import Cta from "@/components/common/Cta";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import EventsPageContent from "@/components/otherPages/events/EventsPageContent";
import { getPageSeo } from "@/lib/seo";
import connectDB from "@/lib/mongoose";
import SiteEvent from "@/models/SiteEvent";
import SiteEventsConfig from "@/models/SiteEventsConfig";
import React from "react";

export const revalidate = 60;

export async function generateMetadata() {
  const { metadata } = await getPageSeo("events", {
    title: "Events | Global Realty",
    description:
      "Discover photos and videos from Global Realty events, launches, and community highlights.",
  });
  return metadata;
}

/** Public listing only: /events (tabs + media grid). No per-event detail routes. */
async function getEvents() {
  try {
    await connectDB();
    const raw = await SiteEvent.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    return JSON.parse(JSON.stringify(raw || []));
  } catch {
    return [];
  }
}

async function getEventsConfig() {
  try {
    await connectDB();
    const raw = await SiteEventsConfig.findOne({ key: "site-events" }).lean();
    return JSON.parse(JSON.stringify(raw || {}));
  } catch {
    return {};
  }
}

export default async function EventsPage() {
  const events = await getEvents();
  const bannerConfig = await getEventsConfig();

  return (
    <>
      <div id="wrapper" className="counter-scroll">
        <Header1 />
        <div className="main-content header-fixed">
          <EventsPageContent events={events} bannerConfig={bannerConfig} />
        </div>
        <Footer1 />  
      </div>
    </>
  );
}
