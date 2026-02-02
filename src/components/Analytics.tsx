import { useAnalyticsStats } from "../hooks/useStats";
import {
	HelpCircleIcon,
	TaskEdit01Icon,
	UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import StatCard from "./StatCard";
import { HugeiconsIcon } from "@hugeicons/react";

export default function Analytics() {
	const { stats, loading } = useAnalyticsStats();

	if (loading) return <p>Loading...</p>;

	return (
		<div className="space-y-3">
			<StatCard
				icon={<HugeiconsIcon icon={TaskEdit01Icon} />}
				label="Total Quizzes"
				value={stats.totalQuizzes}
				linkTo="/dashboard/my-quizzes"
			/>
			<StatCard
				icon={<HugeiconsIcon icon={HelpCircleIcon} />}
				label="Total Questions"
				value={stats.totalQuestions}
				linkTo="/dashboard/create"
			/>
			<StatCard
				icon={<HugeiconsIcon icon={UserMultiple02Icon} />}
				label="Total Attempts"
				value={stats.totalAttempts}
				linkTo="/dashboard"
			/>
		</div>
	);
}
