"use client";

import { ReportProps } from "@/core/domain/entities/report";
import { useReportsStore } from "@/core/store/reports/reportsStore";
import { useUsersMeStore } from "@/core/store/users/userMeStore";
import { cn } from "@/lib/utils";
import { BarChart3, Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NavUser } from "./NavUser";
import ReportCard from "./ReportCard";
import { Input } from "./ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar";

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

function apiToReport(r: ReportProps, favoriteId: string | null): ReportData {
  return {
    id: r.id,
    title: r.name,
    lastUpdated: r.lastUpdate ?? "",
    isFavorite: r.id === favoriteId,
    embedUrl: r.embedUrl,
    thumbnailColor: nameToColor(r.name),
  };
}

export function SidebarCustom() {
  const { user } = useUsersMeStore();
  const { reportsList, isLoadingReports, clearReports } = useReportsStore();

  // 1. Usamos o estado nativo do shadcn em vez de useState manual
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const [search, setSearch] = useState("");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);

  useEffect(() => {
    setFavoriteId(localStorage.getItem("favorite_report_id"));
  }, []);

  const reportsAll = useMemo(() => {
    const list = Array.isArray(reportsList)
      ? reportsList
      : (reportsList?.reports ?? []);
    return list.map((r: ReportProps) => apiToReport(r, favoriteId));
  }, [reportsList, favoriteId]);

  useEffect(() => {
    if (reportsList.reports.length === 0 || selectedReportId) return;
    const fav = reportsList.reports.find((r) => r.id === favoriteId);
    setSelectedReportId(fav?.id ?? reportsList.reports[0]?.id ?? null);
  }, [reportsList, selectedReportId, favoriteId]);

  const filteredReports = useMemo(() => {
    return reportsAll
      .filter((r) => r.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) {
          return Number(b.isFavorite) - Number(a.isFavorite);
        }

        const dateA = new Date(a.lastUpdated).getTime();
        const dateB = new Date(b.lastUpdated).getTime();

        return dateB - dateA;
      });
  }, [reportsAll, search]);

  const toggleFavorite = (id: string) => {
    const newFavId = favoriteId === id ? null : id;
    setFavoriteId(newFavId);
    if (newFavId) localStorage.setItem("favorite_report_id", newFavId);
    else localStorage.removeItem("favorite_report_id");
  };

  return (
    <Sidebar
      collapsible="icon"
      className="bg-card shadow-sm border-r border-border"
    >
      {/* HEADER: Título e Botão de Colapsar */}
      <SidebarHeader className="h-11 border-border flex flex-row items-center px-3 overflow-hidden justify-center">
        {!isCollapsed && (
          <div className="flex gap-3 items-center flex-1">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span
              className={cn(
                "font-display font-bold text-foreground text-sm truncate transition-all duration-300",
                isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto",
              )}
            >
              Relatórios
            </span>
          </div>
        )}
        <SidebarTrigger />
      </SidebarHeader>

      {!isCollapsed && (
        <div
          className={cn(
            "p-4 transition-all duration-300 border-b",
            isCollapsed
              ? "opacity-0 h-0 pointer-events-none overflow-hidden"
              : "opacity-100 h-auto",
          )}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground text-xs" />
            <Input
              placeholder="Buscar relatórios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-7 bg-secondary/50 border-border text-xs rounded-sm"
            />
          </div>
        </div>
      )}
      <SidebarContent className="scroll-auto group-data-[collapsible=icon]:overflow-auto">
        <div className="px-3 py-2 space-y-1.5 mt-2">
          {isLoadingReports ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : isCollapsed ? (
            filteredReports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReportId(report.id)}
                className={`w-full p-2.5 rounded-xl flex items-center justify-center transition-colors ${
                  selectedReportId === report.id
                    ? "bg-primary/10"
                    : "hover:bg-secondary"
                }`}
                title={report.title}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: `hsl(${report.thumbnailColor} / 0.15)`,
                  }}
                >
                  <BarChart3
                    className="w-4 h-4"
                    style={{ color: `hsl(${report.thumbnailColor})` }}
                  />
                </div>
              </button>
            ))
          ) : (
            /* VISÃO EXPANDIDA (CARDS) */
            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-left-2 duration-500">
              {filteredReports.map((report, index) => (
                <ReportCard
                  key={report.id}
                  index={index}
                  report={report}
                  isActive={selectedReportId === report.id}
                  onSelect={(r: any) => setSelectedReportId(r.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
              {filteredReports.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  Nenhum relatório
                </div>
              )}
            </div>
          )}
        </div>
      </SidebarContent>

      {/* FOOTER: Perfil do Usuário */}
      <SidebarFooter className="border-t border-border p-3 flex justify-center items-center w-full">
        {user && <NavUser user={user} isCollapsed={isCollapsed} />}
      </SidebarFooter>
    </Sidebar>
  );
}
