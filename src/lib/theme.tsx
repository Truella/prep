"use client";

import {
	createContext,
	useContext,
	useEffect,
	useSyncExternalStore,
	type ReactNode,
} from "react";

const STORAGE_KEY = "theme";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	resolvedTheme: Theme;
}

function getSystemTheme(): Theme {
	if (typeof window === "undefined") return "dark";
	return window.matchMedia("(prefers-color-scheme: light)").matches
		? "light"
		: "dark";
}

function getSnapshot(defaultTheme: Theme = "dark"): Theme {
	if (typeof window === "undefined") return defaultTheme;

	try {
		const stored = localStorage.getItem(STORAGE_KEY);

		if (stored === "light" || stored === "dark") {
			return stored;
		}
	} catch {}

	return getSystemTheme();
}

function subscribe(callback: () => void) {
	window.addEventListener("storage", callback);
	window.addEventListener("theme-change", callback);

	const mql = window.matchMedia("(prefers-color-scheme: light)");
	const onOSChange = () => callback();
	mql.addEventListener("change", onOSChange);

	return () => {
		window.removeEventListener("storage", callback);
		window.removeEventListener("theme-change", callback);
		mql.removeEventListener("change", onOSChange);
	};
}

function applyTheme(theme: Theme) {
	document.documentElement.classList.remove("light", "dark");
	document.documentElement.classList.add(theme);
}

function persistTheme(theme: Theme) {
	try {
		localStorage.setItem(STORAGE_KEY, theme);
	} catch {}
}

const ThemeContext = createContext<ThemeContextValue>({
	theme: "dark",
	setTheme: () => {},
	resolvedTheme: "dark",
});

export function useTheme() {
	return useContext(ThemeContext);
}

interface ThemeProviderProps {
	children: ReactNode;
	defaultTheme?: Theme;
}

export function ThemeProvider({
	children,
	defaultTheme = "dark",
}: ThemeProviderProps) {
	const snapshot = () => getSnapshot(defaultTheme);
	const theme = useSyncExternalStore<Theme>(subscribe, snapshot, () => defaultTheme);

	useEffect(() => {
		applyTheme(theme);
	}, [theme]);

	const setTheme = (t: Theme) => {
		applyTheme(t);
		persistTheme(t);
		window.dispatchEvent(new Event("theme-change"));
	};

	return (
		<ThemeContext.Provider
			value={{
				theme,
				setTheme,
				resolvedTheme: theme,
			}}
		>
			{children}
		</ThemeContext.Provider>
	);
}
