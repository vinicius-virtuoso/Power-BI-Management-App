import { SidebarProvider } from "@/presentation/components/ui/sidebar";
import { DashboardScreen } from "@/presentation/screens/DashboardScreen";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <main className="p-4 h-screen max-h-screen">
      <SidebarProvider defaultOpen={defaultOpen}>
        <DashboardScreen />
      </SidebarProvider>
    </main>
  );
}
