import type { Metadata } from "next";
import { DM_Serif_Display, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "../src/lib/theme";
import { AuthProvider } from "../src/context/AuthContext";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "../src/components/ErrorBoundary";
import ReactQueryProvider from "../src/components/ReactQueryProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PREP — CBT & MCQ Exam Practice",
    template: "%s — PREP",
  },
  description:
    "Build and share CBT practice tests. Upload your questions, set a timer, and get AI feedback on your weak areas.",
  openGraph: {
    type: "website",
    siteName: "PREP",
    title: "PREP — CBT & MCQ Exam Practice",
    description:
      "Build and share CBT practice tests. Upload your questions, set a timer, and get AI feedback on your weak areas.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${dmSerifDisplay.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var theme = localStorage.getItem("theme");
                  if (theme !== "light" && theme !== "dark") {
                    theme = window.matchMedia("(prefers-color-scheme: light)").matches
                      ? "light"
                      : "dark";
                  }
                  document.documentElement.classList.add(theme);
                } catch (e) {
                  document.documentElement.classList.add("dark");
                }
              })();
            `,
          }}
        />
        <ThemeProvider defaultTheme="system">
          <ReactQueryProvider>
            <AuthProvider>
              <ErrorBoundary>{children}</ErrorBoundary>
              <Toaster position="top-right" reverseOrder={false} />
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}