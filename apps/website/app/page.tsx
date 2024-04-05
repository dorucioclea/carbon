"use client";

import Calendar from "@/components/calendar";
import CtaSection from "@/components/cta";
import FAQ from "@/components/faq-component";
import FeaturesSection from "@/components/features";
import Footer from "@/components/footer";
import HeroSection from "@/components/hero";

export default function Home() {
  return (
    <div className="w-screen">
      <HeroSection />
      <FeaturesSection />
      <FAQ />
      <Calendar />
      <CtaSection />
      <Footer />
    </div>
  );
}
