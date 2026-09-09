import ExternalNav from "@/shared/navigation/ExternalNav";
import Hero from "@/features/home/components/Hero";
import Problem from "@/features/home/components/Problem";
import HowItWorks from "@/features/home/components/HowItWorks";
import CBTExperienceSection from "@/features/home/components/CBTExperienceSection";
import AIReviewSection from "@/features/home/components/AIReviewSection";
import QuizSharing from "@/features/home/components/QuizSharing";
import QuizBankPreview from "@/features/home/components/QuizBankPreview";
import FAQSection from "@/features/home/components/FAQSection";
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
			<Problem />
			<HowItWorks />
			<CBTExperienceSection />
			<AIReviewSection />
			<QuizSharing />
			<QuizBankPreview />
			<FAQSection />
			<CTASection />
			<Footer />
		</div>
	);
}
