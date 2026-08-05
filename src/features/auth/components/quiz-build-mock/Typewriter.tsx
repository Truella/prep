"use client";

import { useEffect, useState } from "react";
import { TYPING_RATE_MS } from "../../constants/quizBuildMock";

export default function Typewriter({ text }: { text: string }) {
  const [length, setLength] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLength((current) => {
        if (current >= text.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, TYPING_RATE_MS);
    return () => window.clearInterval(timer);
  }, [text]);

  return <>{text.slice(0, length)}</>;
}
