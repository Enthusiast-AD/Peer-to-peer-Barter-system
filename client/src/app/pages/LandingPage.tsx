import { Navbar } from "../components/Navbar";
import { HeroSection } from "../components/HeroSection";
import { BentoFeatures } from "../components/BentoFeatures";
import { SmartMatching } from "../components/SmartMatching";
import { HowItWorks } from "../components/HowItWorks";
import { CTASection } from "../components/CTASection";
import { Footer } from "../components/Footer";
import { SEO } from "../components/SEO";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans selection:bg-white/20">
      <SEO
        title="Free Student Skill Exchange Platform"
        description="Teach skills you know, earn credits, and learn new skills from real experts. Peersy is the free peer-to-peer skill barter platform for students."
        path="/"
        type="website"
      />
      <Navbar />
      <HeroSection />
      <BentoFeatures />
      <HowItWorks />
      <SmartMatching />
      <CTASection />
      <Footer />
    </div>
  );
}
