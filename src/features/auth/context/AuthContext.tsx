"use client";

import {
	createContext,
	useEffect,
	useState,
	ReactNode,
	useRef,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
	User,
	Session,
	AuthChangeEvent,
	AuthError,
} from "@supabase/supabase-js";

export interface AuthContextType {
	user: User | null;
	loading: boolean;
	initializing: boolean; // New: separate state for initial load
	error: string | null;
	signUp: (email: string, password: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// TEMPORARY: bypass auth while Supabase project is paused.
// Set NEXT_PUBLIC_BYPASS_AUTH=true in .env.local to enable.
// Remove this once Supabase is resumed.
export const BYPASS_AUTH =
	process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

const MOCK_DEV_USER = {
	id: "dev-user-id",
	email: "dev@localhost.test",
	app_metadata: { provider: "email", providers: ["email"] },
	user_metadata: { email: "dev@localhost.test" },
	aud: "authenticated",
	created_at: new Date().toISOString(),
} as unknown as User;

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(false); 
	const [initializing, setInitializing] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const mountedRef = useRef(true);

	useEffect(() => {
		if (BYPASS_AUTH) {
			if (mountedRef.current) {
				setUser(MOCK_DEV_USER);
				setInitializing(false);
			}
			return;
		}
		mountedRef.current = true;

		// Get initial session
		supabase.auth.getUser().then(({ data }) => {
			if (mountedRef.current) {
				setUser(data.user ?? null);
				setInitializing(false); 
			}
		});

		// Listen for auth changes
		const { data: listener } = supabase.auth.onAuthStateChange(
			(event: AuthChangeEvent, session: Session | null) => {
				if (mountedRef.current) {
					setUser(session?.user ?? null);
				}
			},
		);

		return () => {
			mountedRef.current = false;
			listener.subscription.unsubscribe();
		};
	}, []);

	const clearError = () => setError(null);

	const handleAuthError = (err: unknown): string => {
		if (err instanceof Error) {
			return err.message;
		}
		if (typeof err === "object" && err !== null && "message" in err) {
			return String((err as AuthError).message);
		}
		return "An unexpected error occurred";
	};

	const signUp = async (email: string, password: string) => {
		if (BYPASS_AUTH) {
			setUser(MOCK_DEV_USER);
			router.push("/dashboard");
			return;
		}
		setError(null);
		setLoading(true);

		try {
			const { data, error: signUpError } = await supabase.auth.signUp({
				email,
				password,
			});

			if (signUpError) {
				setError(handleAuthError(signUpError));
				throw signUpError;
			}

			if (data.user) {
				setUser(data.user);
				router.push("/dashboard");
			}
		} catch (err) {
			setError(handleAuthError(err));
			throw err;
		} finally {
			if (mountedRef.current) {
				setLoading(false);
			}
		}
	};

	const signIn = async (email: string, password: string) => {
		if (BYPASS_AUTH) {
			setUser(MOCK_DEV_USER);
			router.push("/dashboard");
			return;
		}
		setError(null);
		setLoading(true);

		try {
			const { data, error: signInError } =
				await supabase.auth.signInWithPassword({
					email,
					password,
				});

			if (signInError) {
				setError(handleAuthError(signInError));
				throw signInError;
			}

			if (data.user) {
				setUser(data.user);
				router.push("/dashboard");
			}
		} catch (err) {
			setError(handleAuthError(err));
			throw err;
		} finally {
			if (mountedRef.current) {
				setLoading(false);
			}
		}
	};

	const signOut = async () => {
		if (BYPASS_AUTH) {
			router.push("/auth");
			return;
		}
		setError(null);
		setLoading(true);

		try {
			const { error: signOutError } = await supabase.auth.signOut();

			if (signOutError) {
				setError(handleAuthError(signOutError));
				return;
			}
			router.push("/auth");
		} catch (err) {
			setError(handleAuthError(err));
		} finally {
			if (mountedRef.current) {
				setLoading(false);
			}
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				initializing,
				error,
				signUp,
				signIn,
				signOut,
				clearError,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}


