export default function QuestionTips() {
	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-white mb-3">Tips for Good Questions</h1>
				<p className="text-gray-300 leading-relaxed">
					Well-written questions make quizzes more effective. Here are some tips.
				</p>
			</div>
			<div className="space-y-4">
				{[
					{
						title: "Keep questions unambiguous",
						text: "Each question should have exactly one correct answer. Avoid wording that could be interpreted multiple ways.",
					},
					{
						title: "Avoid double negatives",
						text: 'Phrasing like "Which is NOT incorrect?" is confusing. State things positively whenever possible.',
					},
					{
						title: "Make distractors plausible",
						text: "Wrong answers should look correct to someone who only partially understands the topic. This makes the quiz a better measure of knowledge.",
					},
					{
						title: "Vary difficulty",
						text: "Mix easy, medium, and hard questions to keep the quiz engaging and to differentiate between levels of understanding.",
					},
					{
						title: "Use points to weight harder questions",
						text: "Assign higher point values to more challenging questions so the score reflects depth of knowledge.",
					},
				].map((tip) => (
					<div key={tip.title} className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4">
						<h3 className="text-white font-medium mb-1">{tip.title}</h3>
						<p className="text-gray-400 text-sm">{tip.text}</p>
					</div>
				))}
			</div>
		</div>
	);
}
