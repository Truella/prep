import {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase"; // keep your existing supabase instance
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signUp: (email: string, password: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		supabase.auth.getUser().then(({ data }) => {
			setUser(data.user ?? null);
			setLoading(false);
		});

		const { data: listener } = supabase.auth.onAuthStateChange(
			(_event: string, session: Session | null) => {
				setUser(session?.user ?? null);
			}
		);

		return () => listener.subscription.unsubscribe();
	}, []);

	const signUp = async (email: string, password: string) => {
		setLoading(true);
		try {
			const { data, error } = await supabase.auth.signUp({ email, password });
			if (error) throw error;
			if (data.user) {
				setUser(data.user);
				navigate("/dashboard");
			}
		} finally {
			setLoading(false);
		}
	};

	const signIn = async (email: string, password: string) => {
		setLoading(true);
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (error) throw error;

			if (data.user) {
				setUser(data.user);
				navigate("/dashboard");
			}
		} finally {
			setLoading(false);
		}
	};

	const signOut = async () => {
		await supabase.auth.signOut();
		setUser(null);
		navigate("/login");
	};

	return (
		<AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within an AuthProvider");
	return context;
};
