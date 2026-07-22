interface CreateQuizFormProps {
	title: string;
	description: string;
	onTitleChange: (v: string) => void;
	onDescriptionChange: (v: string) => void;
	onSubmit: () => void;
	disabled: boolean;
	isLoading: boolean;
}

export default function CreateQuizForm({
	title,
	description,
	onTitleChange,
	onDescriptionChange,
	onSubmit,
	disabled,
	isLoading,
}: CreateQuizFormProps) {
	return (
		<form className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-gray-300 mb-2">
					Quiz Title
				</label>
				<input
					type="text"
					placeholder="Enter quiz title"
					value={title}
					onChange={(e) => onTitleChange(e.target.value)}
					disabled={disabled}
					className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
				/>
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-300 mb-2">
					Description
				</label>
				<textarea
					placeholder="Enter quiz description"
					value={description}
					onChange={(e) => onDescriptionChange(e.target.value)}
					disabled={disabled}
					rows={3}
					className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed resize-none"
				/>
			</div>

			<button
				onClick={onSubmit}
				disabled={disabled || isLoading}
				type="button"
				className="w-full px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
			>
				{isLoading ? "Creating..." : "Create Quiz"}
			</button>
		</form>
	);
}
