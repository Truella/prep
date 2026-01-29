import React from 'react'
import type { Question } from '../lib/types';
export default function QuizPreview({questions}: {questions: Question[]}) {
  return (
		<div className="mt-4 space-y-2">
			<h3 className="font-semibold text-gray-800">Questions Preview</h3>
			{questions.map((q, idx) => (
				<div key={idx} className="p-2 border rounded">
					<p>
						<strong>Q{idx + 1}:</strong> {q.text}
					</p>
					<ul className="list-disc list-inside">
						{q.options.map((o, i) => (
							<li key={i}>{o}</li>
						))}
					</ul>
					<p className="text-green-600 font-medium">Answer: {q.answer}</p>
				</div>
			))}
		</div>
	);
}
