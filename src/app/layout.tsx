import "@/styles/globals.css";
import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "sonner";
import { AuthObserver } from "./(protected)/AuthObserver";
export const metadata: Metadata = {
  title: "RepoGPT",
  description: "Analyse your repositories easily.",
  icons: [{ rel: "icon", url: "/logo.png" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <AuthObserver>
        <html lang="en" className={geist.variable}>
          <body>
            <TRPCReactProvider>{children}</TRPCReactProvider>
            <Toaster richColors />
          </body>
        </html>
      </AuthObserver>
    </ClerkProvider>
  );
}
