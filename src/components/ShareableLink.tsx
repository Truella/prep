import React from 'react'
import toast from 'react-hot-toast';
export default function ShareableLink({ shareableLink }: { shareableLink: string }) {
  return (
		<div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
			<h3 className="font-semibold text-green-800 mb-2">
				 Quiz Published Successfully!
			</h3>

			<p className="text-sm text-gray-600 mb-3">
				Share this link with your students:
			</p>

			<div className="flex gap-2">
				<input
					type="text"
					value={shareableLink}
					readOnly
					className="flex-1 px-3 py-2 border rounded bg-white"
					onClick={(e) => e.currentTarget.select()}
				/>

				<button
					onClick={() => {
						navigator.clipboard.writeText(shareableLink);

						toast.success("Link copied!");
					}}
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
				>
					Copy
				</button>
			</div>
		</div>
	);
}
