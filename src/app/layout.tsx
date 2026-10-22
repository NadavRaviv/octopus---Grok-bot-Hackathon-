import type { Metadata } from "next";
import { Noto_Sans, Nunito } from "next/font/google";
import { JourneyBar } from "@/components/journey-bar";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const body = Noto_Sans({ variable: "--font-body", subsets: ["latin"] });
const display = Nunito({ variable: "--font-display", subsets: ["latin"], weight: ["700", "800", "900"] });

export const metadata: Metadata = {
  title: "Octopus · grow your community with mini tribes",
  description:
    "Upload your CRM, let members share their 8 social skills, and Grok matches them into mini tribes that invite the next wave.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <JourneyBar />
        {children}
        <Toaster theme="dark" position="top-center" richColors />
      </body>
    </html>
  );
}
