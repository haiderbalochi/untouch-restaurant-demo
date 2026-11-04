import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { EyebrowHero } from "@/components/layout/page-hero";
import { ContactForm } from "@/components/contact/contact-form";
import { SettingsAwareDetails } from "@/components/contact/settings-details";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Call, write or visit UNTOUCH in Karachi. Private dining, catering and order support — we answer every message.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <EyebrowHero
        eyebrow="Say hello"
        title={
          <>
            Come in,
            <br />
            <span className="italic text-cream/45">or write first.</span>
          </>
        }
        description="Questions about a dish, a large order or the room itself — there is a person at the other end of every message."
        meta="Response within a working day"
      />

      <section className="container-x grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <h2 className="font-display text-[1.8rem] text-cream/90">Send a message</h2>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>

        <div className="space-y-4">
          <SettingsAwareDetails />
          <div className="rounded-2xl border border-cream/10 bg-cream/[0.02] p-6">
            <p className="eyebrow text-cream/30">Good to know</p>
            <ul className="mt-4 space-y-3 text-[0.84rem] text-cream/45">
              <li>Delivery across Karachi, 35–45 minutes on average.</li>
              <li>Private dining for 8–24 guests, booked in advance.</li>
              <li>Allergen information available on request.</li>
              <li>Catering enquiries answered within one working day.</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
