"use client";

export default function CSVGuide() {
	return (
		<div className="space-y-10">
			<div>
				<h1 className="text-3xl font-bold text-white mb-3">CSV Guide</h1>
				<p className="text-gray-300 leading-relaxed">
					Upload questions as a CSV file. The file must have a header row with
					the exact column names: <code className="text-white">Question</code>,{" "}
					<code className="text-white">Option_A</code>,{" "}
					<code className="text-white">Option_B</code>,{" "}
					<code className="text-white">Option_C</code>,{" "}
					<code className="text-white">Option_D</code>,{" "}
					<code className="text-white">Correct_Answer</code>, and{" "}
					<code className="text-white">Points</code>.
				</p>
			</div>
		</div>
	);
}
