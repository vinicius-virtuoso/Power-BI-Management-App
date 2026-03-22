import ReportsManagementScreen from "@/presentation/screens/ReportsManagementScreen";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gerenciar Relatórios | PBI Dimas",
  description: "Gerencie os relatórios.",
  robots: { index: false },
};

export default function Page() {
  return (
    <div className="max-h-screen">
      <ReportsManagementScreen />
    </div>
  );
}
