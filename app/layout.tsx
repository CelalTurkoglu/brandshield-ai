import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrandShield — Review operations for growing businesses",
  description: "Bring review signals into one calm workspace, recover customers and turn the fix into proof.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
