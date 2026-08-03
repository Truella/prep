import ExternalNav from "@/shared/navigation/ExternalNav";
import Hero from "@/features/home/components/Hero";
import HowItWorks from "@/features/home/components/HowItWorks";
import TakeAQuizStrip from "@/features/home/components/TakeAQuizStrip";
import Features from "@/features/home/components/Features";
import QuizBankPreview from "@/features/home/components/QuizBankPreview";
import WhoItsFor from "@/features/home/components/WhoItsFor";
import CTASection from "@/features/home/components/CTASection";
import Footer from "@/features/home/components/Footer";

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <ExternalNav />
      <Hero />
      <HowItWorks />
      <TakeAQuizStrip />
      <Features />
      <QuizBankPreview />
      <WhoItsFor />
      <CTASection />
      <Footer />
    </div>
  );
}
