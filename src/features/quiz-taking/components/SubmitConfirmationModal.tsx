"use client";

import { useEffect, useRef } from "react";

interface SubmitConfirmationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	totalQuestions: number;
	answeredCount: number;
	unansweredCount: number;
	isAutoSubmit?: boolean;
}

export default function SubmitConfirmationModal({
	isOpen,
	onClose,
	onConfirm,
	totalQuestions,
	answeredCount,
	unansweredCount,
	isAutoSubmit,
}: SubmitConfirmationModalProps) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLElement | null>(null);
	const allAnswered = unansweredCount === 0;

	useEffect(() => {
		if (!isOpen) return;
		triggerRef.current = document.activeElement as HTMLElement | null;
		const frame = requestAnimationFrame(() => {
			const el = dialogRef.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
			el?.focus();
		});
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
				return;
			}
			if (e.key === "Tab" && dialogRef.current) {
				const focusable = Array.from(
					dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
				).filter((el) => el.offsetParent !== null);
				if (focusable.length === 0) {
					e.preventDefault();
					return;
				}
				const first = focusable[0];
				const last = focusable[focusable.length - 1];
				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		};
		document.addEventListener("keydown", onKeyDown);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		// Mark background inert where supported
		const root = document.getElementById("__next") as HTMLElement | null;
		const hadInert = root?.hasAttribute("inert");
		root?.setAttribute("inert", "");
		return () => {
			cancelAnimationFrame(frame);
			document.removeEventListener("keydown", onKeyDown);
			document.body.style.overflow = prevOverflow;
			if (root && !hadInert) root.removeAttribute("inert");
			triggerRef.current?.focus();
			triggerRef.current = null;
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	if (isAutoSubmit) {
		return (
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div aria-hidden="true" className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
				<div
					ref={dialogRef}
					role="dialog"
					aria-modal="true"
					aria-labelledby="submit-dialog-title"
					tabIndex={-1}
					className="relative bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl text-center outline-none"
				>
					<h3 id="submit-dialog-title" className="text-xl font-bold text-text-primary mb-2">Time&apos;s up!</h3>
					<p className="text-text-secondary mb-6">Your quiz has been submitted.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop — presentational */}
			<div aria-hidden="true" className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

			{/* Modal */}
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="submit-dialog-title"
				tabIndex={-1}
				className="relative bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl outline-none"
			>
				{/* Icon */}
				<div className="mx-auto w-16 h-16 rounded-2xl bg-surface-raised flex items-center justify-center mb-4">
					{allAnswered ? (
						<svg className="w-8 h-8 text-text-primary" viewBox="0 0 24 24" fill="none">
							<path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					) : (
						<svg className="w-8 h-8 text-text-secondary" viewBox="0 0 24 24" fill="none">
							<path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					)}
				</div>

				{/* Title & Message */}
				<h3 id="submit-dialog-title" className="text-xl font-bold text-text-primary text-center mb-2">
					{allAnswered ? "Submit Quiz?" : "Incomplete Quiz"}
				</h3>

				<p className="text-text-secondary text-center mb-6">
					{allAnswered ? (
						<>
							You&apos;ve answered all <span className="text-text-primary font-semibold">{totalQuestions}</span> questions. Ready to submit?
						</>
					) : (
						<>
							You&apos;ve answered <span className="text-text-primary font-semibold">{answeredCount}</span> out of <span className="text-text-primary font-semibold">{totalQuestions}</span> questions.
							<br />
							<span className="text-text-primary font-medium">{unansweredCount} question{unansweredCount !== 1 ? "s" : ""} remaining.</span>
							<br />
							Are you sure you want to submit?
						</>
					)}
				</p>

				{/* Actions */}
				<div className="flex gap-3">
					<button onClick={onClose} className="flex-1 px-6 py-3 rounded-xl border border-border text-text-primary hover:bg-surface-raised transition-all font-medium">
						Cancel
					</button>
					<button onClick={onConfirm} className="flex-1 px-6 py-3 rounded-xl bg-text-primary text-bg font-semibold hover:opacity-90 transition-all">
						{allAnswered ? "Submit" : "Submit Anyway"}
					</button>
				</div>
			</div>
		</div>
	);
}
