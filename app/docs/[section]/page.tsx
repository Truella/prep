import DocsLayout from "../../../src/components/docs/DocsLayout";
import GettingStarted from "../../../src/components/docs/GettingStarted";
import CSVGuide from "../../../src/components/docs/CSVGuide";
import Troubleshooting from "../../../src/components/docs/Troubleshooting";
import QuestionTips from "../../../src/components/docs/QuestionTips";
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

export async function generateMetadata({
	params,
}: {
	params: { section: string };
}): Promise<Metadata> {
	return {
		title: SECTION_TITLES[params.section] ?? "PREP Docs",
	};
}

export default function DocsSection({
	params,
}: {
	params: { section: string };
}) {
	const Content = CONTENT[params.section] ?? GettingStarted;
	return (
		<DocsLayout>
			<Content />
		</DocsLayout>
	);
}
