"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

interface QuizTimerProps {
	timeLimitSeconds: number;
	onExpire: () => void;
}

export default function QuizTimer({
	timeLimitSeconds,
	onExpire,
}: QuizTimerProps) {
	const [secondsRemaining, setSecondsRemaining] = useState(timeLimitSeconds);
	const warnedRef = useRef(false);
	const expiredRef = useRef(false);
	const onExpireRef = useRef(onExpire);

	useEffect(() => {
		onExpireRef.current = onExpire;
	}, [onExpire]);

	useEffect(() => {
		const interval = setInterval(() => {
			setSecondsRemaining((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					if (!expiredRef.current) {
						expiredRef.current = true;
						onExpireRef.current();
					}
					return 0;
				}
				if (prev === 61 && !warnedRef.current) {
					warnedRef.current = true;
					toast("1 minute remaining!", { icon: "⏱" });
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const ratio = secondsRemaining / timeLimitSeconds;
	const colorClass =
		ratio > 0.5
			? "text-green-400"
			: ratio > 0.2
				? "text-yellow-400"
				: "text-red-400";

	const minutes = Math.floor(secondsRemaining / 60);
	const seconds = secondsRemaining % 60;
	const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

	return (
		<div className={`font-mono text-lg font-bold tabular-nums ${colorClass}`}>
			{display}
		</div>
	);
}
