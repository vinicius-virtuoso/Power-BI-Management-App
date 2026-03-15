"use client";

import { ApiAuthRepository } from "@/core/data/repositories/auth/ApiAuthRepository";
import { ApiReportsRepository } from "@/core/data/repositories/reports/ApiReportsRepository";
import { ReportProps } from "@/core/domain/entities/report";
import { GetAllReportsUseCase } from "@/core/domain/use-cases/GetAllReportsUseCase";
import { GetProfileUseCase } from "@/core/domain/use-cases/GetProfileUseCase";
import { useAuthStore } from "@/core/store/auth/authStore";
import { useReportsStore } from "@/core/store/reports/reportsStore";
import { useUsersMeStore } from "@/core/store/users/userMeStore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ReportViewer from "../components/ReportViewer";
import { SidebarCustom } from "../components/SidebarCustom";
import { useSidebar } from "../components/ui/sidebar";

export type ReportData = {
  id: string;
  title: string;
  lastUpdated: Date | string;
  isFavorite: boolean;
  embedUrl: string;
  thumbnailColor: string;
};

export function DashboardScreen() {
  const { setAuthenticated } = useAuthStore();
  const { setUser, clearUser } = useUsersMeStore();
  const { reportsList, setReports, clearReports, isLoadingReports } =
    useReportsStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [search, setSearch] = useState("");
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const currentReport = useMemo(() => {
    return reportsList?.reports?.find((r) => r.id === selectedReportId) ?? null;
  }, [reportsList, selectedReportId]);

  function nameToColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++)
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return `${hue} 60% 50%`;
  }

  function apiToReport(r: ReportProps, favId: string | null): ReportData {
    return {
      id: r.id,
      title: r.name,
      lastUpdated: r.lastUpdate ?? "",
      isFavorite: r.id === favId,
      embedUrl: r.embedUrl,
      thumbnailColor: nameToColor(r.name),
    };
  }

  const reportsAll = useMemo(() => {
    const list = Array.isArray(reportsList?.reports) ? reportsList.reports : [];
    return list.map((r: ReportProps) => apiToReport(r, favoriteId));
  }, [reportsList, favoriteId]);

  const filteredReports = useMemo(() => {
    return [...reportsAll]
      .filter((r) => r.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (a.isFavorite !== b.isFavorite)
          return Number(b.isFavorite) - Number(a.isFavorite);
        return (
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
      });
  }, [reportsAll, search]);

  useEffect(() => {
    const fav = localStorage.getItem("favorite_report_id");
    setFavoriteId(fav);

    const loadDashboardData = async () => {
      try {
        const authRepo = new ApiAuthRepository();
        const reportsRepo = new ApiReportsRepository();
        const [userData, reportData] = await Promise.all([
          new GetProfileUseCase(authRepo).execute(),
          new GetAllReportsUseCase(reportsRepo).execute(),
        ]);
        setUser(userData);
        setReports(reportData);
        setAuthenticated(true);
      } catch (error) {
        setAuthenticated(false);
        router.push("/login");
      } finally {
        setIsLoaded(true);
      }
    };
    loadDashboardData();
  }, []);

  // Seleção automática após carregar a lista
  useEffect(() => {
    if (reportsAll.length > 0 && !selectedReportId) {
      const storedFavId = localStorage.getItem("favorite_report_id");
      const favorite = reportsAll.find((r) => r.id === storedFavId);
      setSelectedReportId(favorite ? favorite.id : filteredReports[0]?.id);
    }
  }, [reportsAll, filteredReports, selectedReportId]);

  const toggleFavorite = (id: string) => {
    const newFavId = favoriteId === id ? null : id;
    setFavoriteId(newFavId);
    if (newFavId) localStorage.setItem("favorite_report_id", newFavId);
    else localStorage.removeItem("favorite_report_id");
  };

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="flex gap-2 h-full w-full">
      <SidebarCustom
        selectedId={selectedReportId}
        onSelect={(id) => setSelectedReportId(id)}
        filteredReports={filteredReports}
        isCollapsed={isCollapsed}
        isLoadingReports={isLoadingReports}
        search={search}
        setSearch={setSearch}
        toggleFavorite={toggleFavorite}
      />
      <div className="flex flex-1 shadow-md rounded-md w-full h-full">
        <ReportViewer
          report={currentReport}
          isFavorite={currentReport?.id === favoriteId}
        />
      </div>
    </section>
  );
}
