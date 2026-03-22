import { TooltipProvider } from "@/presentation/components/ui/tooltip";
import { cn } from "@/shared/utils";
import { AnimatePresence } from "framer-motion";
import { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.svg",
  },
};

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className={cn("font-sans", geist.variable)}>
      <body>
        <TooltipProvider>
          <AnimatePresence mode="wait">
            <main className="overflow-hidden">{children}</main>
          </AnimatePresence>
        </TooltipProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
