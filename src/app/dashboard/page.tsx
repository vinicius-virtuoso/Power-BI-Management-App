import { SidebarProvider } from "@/presentation/components/ui/sidebar";
import { DashboardScreen } from "@/presentation/screens/DashboardScreen";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Dashboard | PBI Dimas",
  description: "Veja os relatórios disponíveis para você.",
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <main className="h-screen max-h-screen w-full">
        <DashboardScreen />
      </main>
    </SidebarProvider>
  );
}
