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
	const deadlineRef = useRef(0);
	const [secondsRemaining, setSecondsRemaining] = useState(timeLimitSeconds);
	const warnedRef = useRef(false);
	const expiredRef = useRef(false);
	const onExpireRef = useRef(onExpire);

	useEffect(() => {
		onExpireRef.current = onExpire;
	}, [onExpire]);

	useEffect(() => {
		deadlineRef.current = Date.now() + timeLimitSeconds * 1000;
	}, [timeLimitSeconds]);

	useEffect(() => {
		const interval = setInterval(() => {
			const remaining = Math.ceil(
				(deadlineRef.current - Date.now()) / 1000,
			);
			if (remaining <= 0) {
				setSecondsRemaining(0);
				return;
			}
			if (remaining <= 60 && !warnedRef.current) {
				warnedRef.current = true;
				toast("1 minute remaining!", { icon: "⏱" });
			}
			setSecondsRemaining(remaining);
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		if (secondsRemaining > 0 || expiredRef.current) return;
		expiredRef.current = true;
		onExpireRef.current();
	}, [secondsRemaining]);

	const colorClass = "text-text-primary";

	const minutes = Math.floor(secondsRemaining / 60);
	const seconds = secondsRemaining % 60;
	const display = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

	return (
		<div className={`font-mono text-lg font-bold tabular-nums ${colorClass}`}>
			{display}
		</div>
	);
}
