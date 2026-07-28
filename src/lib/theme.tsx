"use client";

import {
	createContext,
	useContext,
	useEffect,
	useSyncExternalStore,
	type ReactNode,
} from "react";

const STORAGE_KEY = "theme";

type Theme = "light" | "dark";

interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	resolvedTheme: Theme;
}

function getSnapshot(): Theme {
	if (typeof window === "undefined") return "dark";

	try {
		const stored = localStorage.getItem(STORAGE_KEY);

		if (stored === "light" || stored === "dark") {
			return stored;
		}
	} catch {}

	return "dark";
}

function subscribe(callback: () => void) {
	window.addEventListener("storage", callback);
	window.addEventListener("theme-change", callback);

	return () => {
		window.removeEventListener("storage", callback);
		window.removeEventListener("theme-change", callback);
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

export function ThemeProvider({ children }: { children: ReactNode }) {
	const theme = useSyncExternalStore<Theme>(subscribe, getSnapshot, () => "dark");

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
