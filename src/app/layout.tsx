import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";
import { Header } from "~/components/site-header";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Toaster } from "~/components/ui/sonner";
import { TRPCReactProvider } from "~/trpc/react";
import Syncer from "./sync-database";

const APP_NAME = "Shift Wellbeing";
const APP_DEFAULT_TITLE = "Shift Wellbeing";
const APP_TITLE_TEMPLATE = "%s - Shift Wellbeing";
const APP_DESCRIPTION = "A simple tool for logging and managing work shifts.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} dark bg-background`}>
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
