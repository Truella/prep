interface QuizProgressProps {
	current: number;
	total: number;
	progress: number;
}

export default function QuizProgress({
	current,
	total,
	progress,
}: QuizProgressProps) {
	return (
		<div className="mb-6">
			<div className="flex justify-between items-center mb-2">
				<span className="text-sm text-gray-400">
					Question {current} of {total}
				</span>
				<span className="text-sm text-gray-400">{Math.round(progress)}%</span>
			</div>
			<div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
				<div
					className="h-full bg-white transition-all duration-300"
					style={{ width: `${progress}%` }}
				/>
			</div>
		</div>
	);
}
