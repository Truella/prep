"use client";

import AIReviewMock from "../AIReviewMock";

export default function AIReviewStepMock() {
  return (
    <div className="w-full max-w-[320px] mx-auto h-[300px] overflow-hidden flex items-center justify-center pointer-events-none">
      <div className="w-[512px] shrink-0 origin-center scale-[0.6]">
        <AIReviewMock scale={0.6} />
      </div>
    </div>
  );
}
