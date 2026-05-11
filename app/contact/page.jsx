import ContactMainSection from "@/components/contact/ContactMainSection";
import ContactBranches from "@/components/contact/ContactBranches";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import connectDB from "@/lib/mongoose";
import ContactInfo from "@/models/ContactInfo";
import { getPageSeo } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata() {
  const { metadata } = await getPageSeo("contact", {
    title: "Contact | Global Realty",
    description: "Get in touch with Global Realty for property inquiries and support.",
  });
  return metadata;
}

async function getContactData() {
  try {
    await connectDB();
    const info = await ContactInfo.findOne().lean();
    return info ? JSON.parse(JSON.stringify(info)) : {};
  } catch {
    return {};
  }
}

export default async function ContactPage() {
  const contactInfo = await getContactData();

  return (
    <div id="wrapper">
      <Header1 />
      <main className="main-content">
        <ContactMainSection contactInfo={contactInfo} />
        {(contactInfo.branchOffices || []).length > 0 && (
          <ContactBranches offices={contactInfo.branchOffices} />
        )}
      </main>
      <Footer1 />
    </div>
  );
}
