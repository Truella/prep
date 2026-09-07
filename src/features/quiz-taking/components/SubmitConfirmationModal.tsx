interface SubmitConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	totalQuestions: number;
	answeredCount: number;
	unansweredCount: number;
	isAutoSubmit?: boolean;
}

export default function SubmitConfirmationModal({
	isOpen,
	onClose,
	onConfirm,
	totalQuestions,
	answeredCount,
	unansweredCount,
	isAutoSubmit,
}: SubmitConfirmationModalProps) {
	if (!isOpen) return null;

	const allAnswered = unansweredCount === 0;

	if (isAutoSubmit) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
				<div className="relative bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
					<h3 className="text-xl font-bold text-text-primary mb-2">Time&apos;s up!</h3>
					<p className="text-text-secondary mb-6">
						Your quiz has been submitted.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/80 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl">
				{/* Icon */}
				<div
					className="mx-auto w-16 h-16 rounded-2xl bg-surface-raised flex items-center justify-center mb-4"
				>
					{allAnswered ? (
						<svg
							className="w-8 h-8 text-text-primary"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					) : (
						<svg
							className="w-8 h-8 text-text-secondary"
							viewBox="0 0 24 24"
							fill="none"
						>
							<path
								d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					)}
				</div>

				{/* Title & Message */}
				<h3 className="text-xl font-bold text-text-primary text-center mb-2">
					{allAnswered ? "Submit Quiz?" : "Incomplete Quiz"}
				</h3>

				<p className="text-text-secondary text-center mb-6">
					{allAnswered ? (
						<>
							You&apos;ve answered all{" "}
							<span className="text-text-primary font-semibold">{totalQuestions}</span>{" "}
							questions. Ready to submit?
						</>
					) : (
						<>
							You&apos;ve answered{" "}
							<span className="text-text-primary font-semibold">{answeredCount}</span>{" "}
							out of{" "}
							<span className="text-text-primary font-semibold">{totalQuestions}</span>{" "}
							questions.
							<br />
							<span className="text-text-primary font-medium">
								{unansweredCount} question{unansweredCount !== 1 ? "s" : ""}{" "}
								remaining.
							</span>
							<br />
							Are you sure you want to submit?
						</>
					)}
				</p>

				{/* Actions */}
				<div className="flex gap-3">
					<button
						onClick={onClose}
						className="flex-1 px-6 py-3 rounded-xl border border-border text-text-primary hover:bg-surface-raised transition-all font-medium"
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className="flex-1 px-6 py-3 rounded-xl bg-text-primary text-bg font-semibold hover:opacity-90 transition-all"
					>
						{allAnswered ? "Submit" : "Submit Anyway"}
					</button>
				</div>
			</div>
		</div>
	);
}
