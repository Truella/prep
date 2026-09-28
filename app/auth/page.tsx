import { Suspense } from "react";
import AuthView from "@/features/auth/components/AuthView";

export const dynamic = "force-dynamic";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-bg" />}>
      <AuthView />
    </Suspense>
  );
}
