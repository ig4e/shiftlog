import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { Header } from "~/components/site-header";
import { Toaster } from "~/components/ui/sonner";
import { ScrollArea } from "~/components/ui/scroll-area";
import Syncer from "./sync-database";

export const metadata: Metadata = {
  title: "Shift Wellbeing",
  description: "A simple tool for logging and managing work shifts.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} dark bg-background`}>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="container">
        <Header />
        <ScrollArea className="mb-6 h-[calc(100dvh_-_88px)] rounded-xl">
          <div className="m-b-6">
            <TRPCReactProvider>
              {children}
              <Syncer />
            </TRPCReactProvider>
          </div>
        </ScrollArea>
        <Toaster />
      </body>
    </html>
  );
}
