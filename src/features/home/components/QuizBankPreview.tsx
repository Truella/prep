"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import FadeUp from "@/shared/components/FadeUp";
import SectionHeading from "@/features/home/components/SectionHeading";

export default function QuizBankPreview() {
	return (
		<section
			className="py-24 px-6"
			style={{
				backgroundColor: "var(--color-amber-surface)",
			}}
		>
			<div className="max-w-6xl mx-auto text-center">
				<FadeUp>
					<SectionHeading accent="amber" className="text-3xl md:text-4xl leading-tight mb-3">
						Don&apos;t have questions yet? Start with someone <em>else&apos;s.</em>
					</SectionHeading>
					<p className="text-sm max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
						Browse quizzes that other Prep users have shared publicly and find something to practice.
					</p>
				</FadeUp>
				<FadeUp delay={0.12} className="mt-8">
					<Link
						href="/quiz-bank"
						className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
						style={{
							backgroundColor: "var(--color-amber-accent)",
							color: "#0A0A0F",
						}}
					>
						Explore Quiz Bank
						<HugeiconsIcon icon={ArrowRight01Icon} size={16} />
					</Link>
				</FadeUp>
			</div>
		</section>
	);
}
