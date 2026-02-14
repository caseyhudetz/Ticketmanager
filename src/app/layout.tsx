import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TicketManager — Chat",
  description: "Conversational corporate hospitality and ticket management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-surface-50 text-surface-900 antialiased">
        {children}
      </body>
    </html>
  );
}
