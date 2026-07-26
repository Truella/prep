import ExternalNav from "../src/components/ExternalNav";
import Hero from "../src/components/home/Hero";
import HowItWorks from "../src/components/home/HowItWorks";
import Features from "../src/components/home/Features";
import QuizBankPreview from "../src/components/home/QuizBankPreview";
import WhoItsFor from "../src/components/home/WhoItsFor";
import CTASection from "../src/components/home/CTASection";
import Footer from "../src/components/home/Footer";

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <ExternalNav />
      <Hero />
      <HowItWorks />
      <Features />
      <QuizBankPreview />
      <WhoItsFor />
      <CTASection />
      <Footer />
    </div>
  );
}