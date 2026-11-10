import "./globals.css";
import React from "react";
import { LanguageProvider } from "../lib/i18n/LanguageContext";
import { AuthProvider } from "../lib/auth/AuthContext";
import { ThemeProvider } from "../lib/theme/ThemeContext";
import { AppShell } from "../components/layout/AppShell";
import { BRAND } from "../lib/brand";

export const metadata = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased transition-colors duration-150">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AppShell>{children}</AppShell>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
