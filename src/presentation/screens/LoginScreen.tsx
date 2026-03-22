import { LoginForm } from "../components/LoginForm";

export function LoginScreen() {
  return (
    <div className="flex min-h-screen bg-background font-body">
      <section className="hidden lg:flex lg:w-[55%] relative overflow-hidden items-center justify-center bg-linear-to-br from-primary/10 via-accent/5 to-primary/5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />

        <div className="relative z-10 max-w-lg p-16 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <div className="w-2 h-2 bg-accent rounded-full shadow-[0_0_8px_var(--color-accent)]" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              Plataforma de BI
            </span>
          </div>

          <h2 className="text-5xl font-display font-extrabold text-foreground leading-[1.1] tracking-tight">
            Seus dados,{" "}
            <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              suas decisões.
            </span>
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-100">
            Acesse painéis interativos do Power BI e transforme dados em
            insights poderosos para o seu negócio.
          </p>
        </div>
      </section>

      <section className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-card">
        <div className="w-full max-w-100 space-y-8">
          <LoginForm />
        </div>
      </section>
    </div>
  );
}
