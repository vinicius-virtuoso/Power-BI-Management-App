"use client";

import { ReportProps } from "@/core/domain/entities/report";
import { useAuthStore } from "@/core/store/auth/authStore";
import { useReportsStore } from "@/core/store/reports/reportsStore";
import { useUserMeStore } from "@/core/store/users/userMeStore";
import { AnimatePresence, motion } from "framer-motion";
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

export function DashboardScreen() {
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const { setAuthenticated, logout } = useAuthStore();
  const { fetchUserMe, user } = useUserMeStore();
  const { reportsList, isLoadingReports, fetchReports } = useReportsStore();

  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // --- MEMOS ---

  const reportsAll = useMemo(() => {
    const list = Array.isArray(reportsList?.reports) ? reportsList.reports : [];
    return list.map((r: ReportProps) => apiToReport(r, favoriteId));
  }, [reportsList, favoriteId]);

  const filteredReports = useMemo(() => {
    const normalize = (str: string) =>
      str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    const q = normalize(search);
    return [...reportsAll]
      .filter((r) => normalize(r.title ?? "").includes(q))
      .sort((a, b) => {
        if (a.isFavorite !== b.isFavorite)
          return Number(b.isFavorite) - Number(a.isFavorite);
        return (
          new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        );
      });
  }, [reportsAll, search]);

  const currentReport = useMemo(() => {
    return reportsList?.reports?.find((r) => r.id === selectedReportId) ?? null;
  }, [reportsList, selectedReportId]);

  // --- EFEITOS ---

  // 1. Carrega Perfil do Usuário
  useEffect(() => {
    const initUser = async () => {
      try {
        const fav = localStorage.getItem("favorite_report_id");
        setFavoriteId(fav);
        await fetchUserMe();
      } catch (error: any) {
        // Se der erro 401 ou qualquer erro de auth no carregamento inicial
        logout(); // Limpa as stores

        // FORÇA O REDIRECIONAMENTO
        router.push("/login");
        // Ou window.location.href = "/login";
      }
    };
    initUser();
  }, [fetchUserMe, logout, router]);

  // 2. Carrega Relatórios baseados no ID do usuário
  useEffect(() => {
    try {
      if (user?.id) {
        fetchReports(user.id);
      }
    } catch (error: any) {
      logout();
      router.push("/login");
    } finally {
      setIsLoaded(true);
    }
  }, [user?.id, fetchReports, setAuthenticated, router, logout]);

  // 3. Gerenciamento de Seleção Inicial (Favorito ou Primeiro)
  useEffect(() => {
    if (isLoaded && reportsAll.length > 0 && !selectedReportId) {
      const favorite = reportsAll.find((r) => r.id === favoriteId);
      setSelectedReportId(favorite ? favorite.id : filteredReports[0]?.id);
    }
  }, [isLoaded, reportsAll, filteredReports, favoriteId, selectedReportId]);

  // --- HANDLERS ---

  const toggleFavorite = (id: string) => {
    const newFavId = favoriteId === id ? null : id;
    setFavoriteId(newFavId);
    if (newFavId) {
      localStorage.setItem("favorite_report_id", newFavId);
    } else {
      localStorage.removeItem("favorite_report_id");
    }
  };

  return (
    <AnimatePresence mode="wait">
      <div className="h-screen w-full bg-background overflow-hidden">
        {!isLoaded ? (
          <motion.div
            key="dashboard-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-primary w-10 h-10" />
              <span className="text-xs text-muted-foreground uppercase tracking-tighter">
                Carregando Dashboard...
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.section
            key="dashboard-content"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex gap-2 h-full w-full"
          >
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

            <div className="flex flex-1 shadow-md w-full h-full overflow-hidden border bg-card -mr-6">
              <ReportViewer
                report={currentReport}
                isFavorite={currentReport?.id === favoriteId}
              />
            </div>
          </motion.section>
        )}
      </div>
    </AnimatePresence>
  );
}
