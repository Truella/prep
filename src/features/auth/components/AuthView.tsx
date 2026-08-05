"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AuthForm from "./AuthForm";
import AuthMediaPanel from "./AuthMediaPanel";
import ExternalNav from "@/shared/navigation/ExternalNav";

export default function AuthView() {
  const { user, loading, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !initializing && user) {
      router.push("/dashboard");
    }
  }, [user, loading, initializing, router]);

  return (
    <div className="min-h-dvh bg-bg">
      <ExternalNav />

      <main className="flex min-h-dvh items-center justify-center bg-bg px-6  lg:grid lg:h-dvh lg:min-h-0 lg:grid-cols-[45%_55%] lg:items-stretch lg:px-0">
        <div className="hidden min-h-0 lg:block">
          <AuthMediaPanel />
        </div>
        <div className="flex min-h-0 items-center justify-center bg-bg lg:px-10 xl:px-16">
          <div className="w-full max-w-md">
            <AuthForm />
          </div>
        </div>
      </main>
    </div>
  );
}
