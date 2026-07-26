export default function Troubleshooting() {
	const issues = [
		{
			title: "CSV upload errors",
			items: [
				{ error: '"CSV is missing required columns."', fix: "Check that your header row contains all six required column names exactly as shown, including underscores." },
				{ error: '"Row N has missing values."', fix: "One or more cells in that row is empty. Every row needs all six fields." },
				{ error: '"Row N: Correct_Answer must be A, B, C, or D."', fix: "Check the Correct_Answer cell for that row. Lowercase letters and surrounding spaces are accepted, but the value must be A, B, C, or D." },
				{ error: '"No data found in CSV."', fix: "The file has a header row but no data rows, or the file is empty." },
				{ error: '"CSV contains parsing errors."', fix: "The file has a structural problem. Open it in a text editor and check for unmatched quotes or unexpected line breaks." },
			],
		},
		{
			title: "Quiz not found",
			items: [
				{ error: "Quiz shows a not-found error", fix: "The link may be wrong or the quiz may have been deleted by its creator. Ask them to share the link again." },
			],
		},
		{
			title: "Progress not saving",
			items: [
				{ error: "Progress is lost on refresh", fix: "Progress is stored in localStorage. Private browsing mode or browser settings that block site data will prevent saving. Switch to a normal browsing window." },
			],
		},
		{
			title: "Timer did not auto-submit",
			items: [
				{ error: "Time ran out but quiz did not submit", fix: "This can happen if the tab was in the background for a long time. Submit manually using the Submit button." },
			],
		},
	];

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-white mb-3">Troubleshooting</h1>
				<p className="text-gray-300">Common issues and how to fix them.</p>
			</div>
			{issues.map((section) => (
				<div key={section.title} className="space-y-3">
					<h2 className="text-lg font-semibold text-white">{section.title}</h2>
					<div className="space-y-2">
						{section.items.map((item, i) => (
							<div key={i} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
								<p className="font-mono text-sm text-red-400">{item.error}</p>
								<p className="text-sm text-gray-300">{item.fix}</p>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
