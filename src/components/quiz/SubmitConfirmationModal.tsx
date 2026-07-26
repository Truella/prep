interface SubmitConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	totalQuestions: number;
	answeredCount: number;
	unansweredCount: number;
}

export default function SubmitConfirmationModal({
	isOpen,
	onClose,
	onConfirm,
	totalQuestions,
	answeredCount,
	unansweredCount,
}: SubmitConfirmationModalProps) {
	if (!isOpen) return null;

	const allAnswered = unansweredCount === 0;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/80 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
				{/* Icon */}
				<div
					className={`mx-auto w-16 h-16 rounded-2xl ${
						allAnswered ? "bg-blue-500/20" : "bg-yellow-500/20"
					} flex items-center justify-center mb-4`}
				>
					{allAnswered ? (
						<svg
							className="w-8 h-8 text-blue-400"
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
							className="w-8 h-8 text-yellow-400"
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
				<h3 className="text-xl font-bold text-white text-center mb-2">
					{allAnswered ? "Submit Quiz?" : "Incomplete Quiz"}
				</h3>

				<p className="text-gray-400 text-center mb-6">
					{allAnswered ? (
						<>
							You&apos;ve answered all{" "}
							<span className="text-white font-semibold">{totalQuestions}</span>{" "}
							questions. Ready to submit?
						</>
					) : (
						<>
							You&apos;ve answered{" "}
							<span className="text-white font-semibold">{answeredCount}</span>{" "}
							out of{" "}
							<span className="text-white font-semibold">{totalQuestions}</span>{" "}
							questions.
							<br />
							<span className="text-yellow-400 font-medium">
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
						className="flex-1 px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all font-medium"
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className="flex-1 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-all"
					>
						{allAnswered ? "Submit" : "Submit Anyway"}
					</button>
				</div>
			</div>
		</div>
	);
}
