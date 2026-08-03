import DocsLayout from "@/features/docs/components/DocsLayout";
import GettingStarted from "@/features/docs/components/GettingStarted";
import CSVGuide from "@/features/docs/components/CSVGuide";
import Troubleshooting from "@/features/docs/components/Troubleshooting";
import QuestionTips from "@/features/docs/components/QuestionTips";
import type { Metadata } from "next";

const SECTION_TITLES: Record<string, string> = {
	"getting-started": "Getting Started — PREP Docs",
	"csv-guide": "CSV Guide — PREP Docs",
	troubleshooting: "Troubleshooting — PREP Docs",
	"question-tips": "Question Tips — PREP Docs",
};

const CONTENT: Record<string, React.ComponentType> = {
	"getting-started": GettingStarted,
	"csv-guide": CSVGuide,
	troubleshooting: Troubleshooting,
	"question-tips": QuestionTips,
};

interface PageProps {
	params: Promise<{ section: string }>;
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { section } = await params;
	return {
		title: SECTION_TITLES[section] ?? "PREP Docs",
	};
}

export default async function DocsSection({ params }: PageProps) {
	const { section } = await params;
	const Content = CONTENT[section] ?? GettingStarted;
	return (
		<DocsLayout>
			<Content />
		</DocsLayout>
	);
}
