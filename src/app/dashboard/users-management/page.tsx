import UsersManagementScreen from "@/presentation/screens/UsersManagementScreen";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gerenciar Usuários | PBI Dimas",
  description: "Gerencie os usuários.",
  robots: { index: false },
};

export default async function UsersManagementPage() {
  return (
    <main className="h-screen max-h-screen w-full">
      <UsersManagementScreen />
    </main>
  );
}
