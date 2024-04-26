import { Analytics } from "@vercel/analytics/react";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import type { ReactElement } from "react";
import { Footer } from "~/components/Footer";
import { Header } from "~/components/Header";
import "~/styles/tailwind.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://carbon.us.org"),
  title: "Carbon | ERP for the builders",
  description:
    "Carbon is an open-source ERP to meet your exact manufacturing needs",
};

export default function Layout({ children }: { children: ReactElement }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} overflow-x-hidden`}
      >
        <ThemeProvider attribute="class">
          <Header />
          <main className="container mx-auto px-4 overflow-hidden md:overflow-visible">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
