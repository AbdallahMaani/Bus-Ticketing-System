import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Notifications } from '@mantine/notifications';
import { SessionProvider } from "next-auth/react";
import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
//import { TicketProvider } from "@/Components/TicketStore";

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
        <SessionProvider>
          <MantineProvider>
            <Notifications />
            {/*<TicketProvider> /* TicketProvider wraps the entire app to provide ticket context */}
              {children}
            {/*</TicketProvider>}*/}
          </MantineProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
