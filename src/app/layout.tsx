import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/presentation/components/ui/tooltip";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

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
          <main>{children}</main>
          <Toaster position="top-right" richColors closeButton />
        </TooltipProvider>
      </body>
    </html>
  );
}
