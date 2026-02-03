import { Calendar02Icon, Copy01Icon, EyeIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "react-router-dom";

interface QuizCardProps {
	quiz: {
		id: string;
		title: string;
		description: string;
		created_at: string;
	};
	onCopyLink: (id: string) => void;
}

export default function QuizCard({ quiz, onCopyLink }: QuizCardProps) {
	return (
		<div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
			{/* Header */}
			<div className="mb-4">
				<h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white transition">
					{quiz.title}
				</h3>
				<p className="text-gray-400 text-sm line-clamp-2">
					{quiz.description || "No description provided"}
				</p>
			</div>

			{/* Meta */}
			<div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
				<HugeiconsIcon icon={Calendar02Icon} />
				<span>{new Date(quiz.created_at).toLocaleDateString()}</span>
			</div>

			{/* Actions */}
			<div className="flex gap-2">
				<button
					onClick={() => onCopyLink(quiz.id)}
					className="flex-1 px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition flex items-center justify-center gap-2 text-sm font-medium"
				>
					<HugeiconsIcon icon={Copy01Icon} />
					Copy Link
				</button>
				<Link
					to={`/quiz/${quiz.id}`}
					className="flex-1 px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-100 transition flex items-center justify-center gap-2 text-sm font-medium"
				>
					{" "}
					<HugeiconsIcon icon={EyeIcon} />
					View
				</Link>
			</div>
		</div>
	);
}
