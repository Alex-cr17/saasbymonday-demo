import { HeroSection } from "@/components/marketing/HeroSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Public marketing landing composed from isolated sections */}
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
    </main>
  );
}