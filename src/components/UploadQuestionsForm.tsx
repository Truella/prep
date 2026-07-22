interface UploadQuestionsFormProps {
	onFileChange: (file: File) => void;
	onSubmit: () => void;
	disabled: boolean;
	isUploading: boolean;
	questionCount: number;
}

export default function UploadQuestionsForm({
	onFileChange,
	onSubmit,
	disabled,
	isUploading,
	questionCount,
}: UploadQuestionsFormProps) {
	return (
		<form className="space-y-4">
			<div>
				<label className="block text-sm font-medium text-gray-300 mb-2">
					Upload Questions (CSV)
				</label>
				<div className="relative">
					<input
						type="file"
						accept=".csv"
						onChange={(e) => {
							const file = e.target.files?.[0];
							if (file) onFileChange(file);
						}}
						disabled={disabled}
						className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white file:text-black file:font-medium hover:file:bg-gray-100 file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition"
					/>
				</div>
				<p className="mt-2 text-xs text-gray-400">
					Format: Question, Option_A, Option_B, Option_C, Option_D,
					Correct_Answer, Points
				</p>
			</div>

			<button
				onClick={onSubmit}
				disabled={disabled || questionCount === 0 || isUploading}
				type="button"
				className="w-full px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
			>
				{isUploading ? "Publishing..." : "Publish Quiz"}
			</button>
		</form>
	);
}
