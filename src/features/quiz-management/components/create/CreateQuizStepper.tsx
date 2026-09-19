"use client";

type Step = "details" | "questions";

interface CreateQuizStepperProps {
	activeStep: Step;
	hasQuiz: boolean;
	questionCount: number;
	onStepChange: (step: Step) => void;
}

export default function CreateQuizStepper({
	activeStep,
	hasQuiz,
	questionCount,
	onStepChange,
}: CreateQuizStepperProps) {
	const steps: { id: Step; label: string; desc: string }[] = [
		{ id: "details", label: "1. Details", desc: "Title, visibility & timing" },
		{ id: "questions", label: "2. Questions", desc: hasQuiz ? `${questionCount} question${questionCount !== 1 ? "s" : ""}` : "Add content" },
	];

	return (
		<div className="flex items-center gap-3">
			{steps.map((step, index) => {
				const isActive = activeStep === step.id;
				const isCompleted = hasQuiz && step.id === "details";
				const canNavigate = hasQuiz || step.id === "details";
				return (
					<div key={step.id} className="flex items-center gap-3 flex-1">
						<button
							type="button"
							disabled={!canNavigate}
							onClick={() => canNavigate && onStepChange(step.id)}
							className={`flex-1 flex items-center gap-3 p-3 rounded-xl border text-left transition disabled:cursor-not-allowed ${!canNavigate ? "opacity-60" : ""}`}
							style={{
								backgroundColor: isActive ? "var(--color-surface-raised)" : "var(--color-surface)",
								borderColor: isActive ? "var(--color-accent)" : "var(--color-border)",
							}}
						>
							<span
								className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
								style={{
									backgroundColor: isCompleted ? "var(--color-accent-dim)" : isActive ? "var(--color-accent)" : "var(--color-surface-raised)",
									color: isCompleted ? "var(--color-accent)" : isActive ? "#0A0A0F" : "var(--color-text-secondary)",
									border: `1px solid ${isCompleted ? "var(--color-accent)" : isActive ? "var(--color-accent)" : "var(--color-border)"}`,
								}}
							>
								{isCompleted ? "✓" : index + 1}
							</span>
							<span className="min-w-0">
								<p className="text-sm font-semibold leading-none" style={{ color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}>
									{step.label}
								</p>
								<p className="text-xs mt-1 truncate" style={{ color: "var(--color-text-secondary)" }}>
									{step.desc}
								</p>
							</span>
						</button>
						{index === 0 && (
							<span className="hidden sm:block w-8 h-px shrink-0" style={{ backgroundColor: hasQuiz ? "var(--color-accent)" : "var(--color-border)" }} aria-hidden />
						)}
					</div>
				);
			})}
		</div>
	);
}
