"use client";

import { ApiAuthRepository } from "@/core/data/repositories/auth/ApiAuthRepository";
import { ApiReportsRepository } from "@/core/data/repositories/reports/ApiReportsRepository";
import { GetAllReportsUseCase } from "@/core/domain/use-cases/GetAllReportsUseCase";
import { GetProfileUseCase } from "@/core/domain/use-cases/GetProfileUseCase";
import { useAuthStore } from "@/core/store/auth/authStore";
import { useReportsStore } from "@/core/store/reports/reportsStore";
import { useUsersMeStore } from "@/core/store/users/userMeStore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarCustom } from "../components/SidebarCustom";

export function DashboardScreen() {
  const { setAuthenticated } = useAuthStore();
  const { setUser, clearUser } = useUsersMeStore();
  const { setReports, clearReports } = useReportsStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const authRepo = new ApiAuthRepository();
        const reportsRepo = new ApiReportsRepository();

        const getProfileUseCase = new GetProfileUseCase(authRepo);
        const getAllReportsUseCase = new GetAllReportsUseCase(reportsRepo);

        const [userData, reportData] = await Promise.all([
          getProfileUseCase.execute(),
          getAllReportsUseCase.execute(),
        ]);

        setUser(userData);
        setReports(reportData);
        setAuthenticated(true);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        clearUser();
        clearReports();
        setAuthenticated(false);
        router.push("/login");
      } finally {
        setIsLoaded(true);
      }
    };

    loadDashboardData();
  }, []);

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="flex gap-4 h-full">
      <div className="flex h-full w-auto">
        <SidebarCustom />
      </div>

      <div className="flex flex-1 shadow-md rounded-md p-2 w-full">
        Report Viewer
      </div>
    </section>
  );
}
