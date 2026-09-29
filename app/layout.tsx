import type { Metadata } from "next";
import "./globals.css";
import AppShell from "../components/AppShell";


export const metadata: Metadata = {
  title: "TempMail | Private Temporary Email",
  description: "Create a private temporary email inbox in seconds. Keep spam and one-time messages out of your personal inbox.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-haffer text-neutral-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
