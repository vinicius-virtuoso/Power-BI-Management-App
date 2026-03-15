import { SidebarProvider } from "@/presentation/components/ui/sidebar";
import { DashboardScreen } from "@/presentation/screens/DashboardScreen";
import { cookies } from "next/headers";

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
