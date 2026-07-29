import Link from "next/link";

interface UploadQuestionsFormProps {
	onFileChange: (file: File) => void;
	disabled: boolean;
}

export default function UploadQuestionsForm({
	onFileChange,
	disabled,
}: UploadQuestionsFormProps) {
	return (
		<form className="space-y-4">
			<div>
				<label className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
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
						className="w-full px-4 py-3 rounded-xl border file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-medium file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition file:bg-(--color-text-primary) file:text-(--color-bg) hover:file:opacity-90"
						style={{
							backgroundColor: "var(--color-surface)",
							borderColor: "var(--color-border)",
							color: "var(--color-text-primary)",
						}}
					/>
				</div>
				<p className="mt-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
					Format: Question, Option_A, Option_B, Option_C, Option_D, Correct_Answer, Points.{" "}
					<Link href="/docs/csv-guide" className="underline transition" style={{ color: "var(--color-text-primary)" }}>
						Need help?
					</Link>
				</p>
			</div>
		</form>
	);
}
