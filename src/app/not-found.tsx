import { ButtonBack } from "@/presentation/components/ButtonBack";
import { Footer } from "@/presentation/components/Footer";
import { Button } from "@/presentation/components/ui/button";
import { FileSearch } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pagina não encontrada | PBI Dimas",
  description: "Você está perdido no espaço, teleporte para base",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen h-screen flex-col items-center justify-between bg-background px-6 text-center font-body">
      <div className="flex flex-col items-center justify-center h-[95%]">
        <div className="relative mb-8">
          <div className="absolute inset-0 scale-150 bg-primary/10 blur-3xl rounded-full" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-linear-to-br from-primary to-accent shadow-xl">
            <FileSearch className="h-12 w-12 text-primary-foreground" />
          </div>
        </div>

        <h1 className="mb-2 font-display text-6xl font-extrabold tracking-tight text-foreground sm:text-7xl">
          404
        </h1>

        <h2 className="mb-4 text-2xl font-bold text-foreground">
          Insight não encontrado
        </h2>

        <p className="mb-10 max-w-112.5 text-lg text-muted-foreground leading-relaxed">
          Parece que os dados que você está procurando foram movidos para outra
          dimensão ou o link está incorreto.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <ButtonBack />

          <Button
            asChild
            className="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 transition-transform active:scale-95"
          >
            <Link href="/">Ir para o Início</Link>
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Footer />
      </div>
    </main>
  );
}
