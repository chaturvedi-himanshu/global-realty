import React from "react";
import PropertyOverview from "./PropertyOverview";
import VideoReview from "./VideoReview";
import ExtraInfo from "./ExtraInfo";
import OverviewSection from "./OverviewSection";
import PriceListSection from "./PriceListSection";
import Features from "./Features";
import Location from "./Location";
import FloorPlan from "./FloorPlan";
import Attachments from "./Attachments";
import VirtualTour from "./VirtualTour";
import LoanCalculator from "./LoanCalculator";
import PropertyNearby from "./PropertyNearby";
import Reviews from "./Reviews";
import Sidebar from "./Sidebar";

const getImageUrl = (img) => {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (typeof img === "object") {
    return (
      img.url || img.src || img.image || img.imageUrl || img.secure_url || ""
    );
  }
  return "";
};

export default function Details1({ property }) {
  const videoUrl = property?.videoUrl || property?.video || "";
  const videoPoster =
    getImageUrl((property?.images || [])[0]) ||
    "/images/section/property-detail.jpg";
  const virtualTourUrl =
    property?.virtualTourUrl || property?.virtualTour || "";
  const hasMap = !!(
    property?.mapEmbedUrl ||
    (property?.latitude && property?.longitude)
  );
  const hasFloor =
    Array.isArray(property?.floorPlans) && property.floorPlans.length > 0;
  const hasAttach =
    Array.isArray(property?.attachments) && property.attachments.length > 0;
  const hasNearby =
    Array.isArray(property?.nearby) && property.nearby.length > 0;
  const hasAmenities =
    Array.isArray(property?.amenities) && property.amenities.length > 0;
  const hasFeatures =
    Array.isArray(property?.features) && property.features.length > 0;
  const hasDescription = Boolean(
    (property?.description || "").replace(/<[^>]*>/g, "").trim(),
  );
  const hasOverviewContent = Boolean(
    (property?.overviewContent || "").replace(/<[^>]*>/g, "").trim(),
  );
  const hasPriceList = Array.isArray(property?.priceList)
    ? property.priceList.some(
        (item) =>
          String(item?.property || "").trim() ||
          String(item?.inventory || "").trim() ||
          String(item?.size || "").trim() ||
          String(item?.price || "").trim(),
      )
    : false;
  const hasDetailFacts = Boolean(
    property?.price ||
    property?.builtUpArea ||
    property?.bedrooms ||
    property?.bathrooms ||
    property?.rooms ||
    property?.yearBuilt ||
    property?.garages ||
    property?.propertyType ||
    property?.propertySubType,
  );
  const hasExtraInfo = hasDescription || hasDetailFacts;
  const hasLoanData = Number(property?.price) > 0;

  return (
    <section className="section-property-detail">
      <div className="tf-container">
        <div className="row">
          <div className="col-xl-8 col-lg-7">
            <div className="wg-property box-overview">
              <PropertyOverview property={property} />
            </div>

            {hasExtraInfo && (
              <div className="wg-property box-property-detail">
                <ExtraInfo property={property} />
              </div>
            )}
            
            {hasOverviewContent && (
              <div className="wg-property box-property-detail">
                <OverviewSection content={property.overviewContent} />
              </div>
            )}

            {hasPriceList && (
              <div className="wg-property box-property-detail">
                <PriceListSection priceList={property.priceList} />
              </div>
            )}

            {(hasAmenities || hasFeatures) && (
              <div className="wg-property box-amenities">
                <Features
                  amenities={property.amenities}
                  features={property.features}
                />
              </div>
            )}

            {hasMap && (
              <div className="wg-property single-property-map">
                <Location property={property} />
              </div>
            )}

            {hasNearby && (
              <div className="wg-property single-property-nearby">
                <PropertyNearby nearby={property.nearby} />
              </div>
            )}

            {hasFloor && (
              <div className="wg-property single-property-floor">
                <FloorPlan floorPlans={property.floorPlans} />
              </div>
            )}

            {hasAttach && (
              <div className="wg-property box-attachments">
                <Attachments attachments={property.attachments} />
              </div>
            )}

            {videoUrl && (
              <div className="wg-property video">
                <VideoReview videoUrl={videoUrl} posterSrc={videoPoster} />
              </div>
            )}

            {virtualTourUrl && (
              <div className="wg-property box-virtual-tour">
                <VirtualTour url={virtualTourUrl} />
              </div>
            )}

            {hasLoanData && (
              <div className="wg-property box-loan">
                <LoanCalculator price={property?.price} />
              </div>
            )}

            <Reviews
              propertyId={property?._id}
              fallbackReviews={property?.reviews || []}
            />
          </div>

          <div className="col-xl-4 col-lg-5">
            <Sidebar property={property} />
          </div>
        </div>
      </div>
    </section>
  );
}
