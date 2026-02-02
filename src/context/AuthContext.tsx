import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
	useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
	User,
	Session,
	AuthChangeEvent,
	AuthError,
} from "@supabase/supabase-js";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	error: string | null;
	signUp: (email: string, password: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const mountedRef = useRef(true);

	useEffect(() => {
		mountedRef.current = true;

		// Get initial session
		supabase.auth.getUser().then(({ data }) => {
			if (mountedRef.current) {
				setUser(data.user ?? null);
				setLoading(false);
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
		setError(null);
		setLoading(true);

		try {
			const { data, error: signUpError } = await supabase.auth.signUp({
				email,
				password,
			});

			if (signUpError) {
				setError(handleAuthError(signUpError));
				return;
			}

			if (data.user) {
				setUser(data.user);
				navigate("/dashboard");
			}
		} catch (err) {
			setError(handleAuthError(err));
		} finally {
			if (mountedRef.current) {
				setLoading(false);
			}
		}
	};

	const signIn = async (email: string, password: string) => {
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
				return;
			}

			if (data.user) {
				setUser(data.user);
				navigate("/dashboard");
			}
		} catch (err) {
			setError(handleAuthError(err));
		} finally {
			if (mountedRef.current) {
				setLoading(false);
			}
		}
	};

	const signOut = async () => {
		setError(null);
		setLoading(true);

		try {
			const { error: signOutError } = await supabase.auth.signOut();

			if (signOutError) {
				setError(handleAuthError(signOutError));
				return;
			}
			navigate("/auth");
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
			value={{ user, loading, error, signUp, signIn, signOut, clearError }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
