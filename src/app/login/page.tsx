import { LoginScreen } from "@/presentation/screens/LoginScreen";
import { Metadata } from "next";

// SEO e metadados ficam aqui, pois são específicos do Next.js
export const metadata: Metadata = {
  title: "Login | Meu App Incrível",
  description: "Faça login para acessar sua conta.",
};

export default function LoginPage() {
  return (
    <main>
      <LoginScreen />
    </main>
  );
}
