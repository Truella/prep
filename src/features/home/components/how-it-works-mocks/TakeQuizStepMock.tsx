"use client";

import CBTExperienceMock from "../CBTExperienceMock";

export default function TakeQuizStepMock() {
  return (
    <div className="w-full max-w-[320px] mx-auto h-[300px] overflow-hidden flex items-center justify-center pointer-events-none">
      <div className="w-[420px] shrink-0 origin-center scale-[0.66]">
        <CBTExperienceMock />
      </div>
    </div>
  );
}
