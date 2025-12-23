import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "./globals.css";
import { TicketProvider } from "@/Components/TicketStore";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bus Ticketing System",
  description: "A bus ticketing system with Next.js and Mantine",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) 
{
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/*<MantineProvider>{children}</MantineProvider>
        <TicketProvider>{children}</TicketProvider> children rendered only one time */} 
        <MantineProvider>
          <TicketProvider> {/* TicketProvider wraps the entire app to provide ticket context */}
            {children}
          </TicketProvider>
        </MantineProvider>

      </body>
    </html>
  );
}
