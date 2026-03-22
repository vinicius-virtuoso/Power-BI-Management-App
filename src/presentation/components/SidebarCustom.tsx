"use client";

import { useUserMeStore } from "@/core/store/users/userMeStore";
import { cn } from "@/shared/utils";
import { BarChart3, Search } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { ReportData } from "../screens/DashboardScreen";
import { NavUser } from "./NavUser";
import ReportCard from "./ReportCard";
import { SidebarReportsSkeleton } from "./SidebarReportsSkeleton";
import { Input } from "./ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "./ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface SidebarCustomProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  isCollapsed: boolean;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  isLoadingReports: boolean;
  filteredReports: ReportData[];
  toggleFavorite: (id: string) => void;
}

export function SidebarCustom({
  selectedId,
  onSelect,
  isCollapsed,
  filteredReports,
  search,
  setSearch,
  isLoadingReports,
  toggleFavorite,
}: SidebarCustomProps) {
  const { user } = useUserMeStore();

  return (
    <Sidebar
      collapsible="icon"
      className="bg-card shadow-sm border-r border-border"
    >
      {/* HEADER */}
      <SidebarHeader className="h-11 border-b border-border flex flex-row items-center justify-center px-3 overflow-hidden">
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

      {/* BUSCA */}
      <div
        className={cn(
          "px-4 pt-4 transition-all duration-300",
          isCollapsed
            ? "opacity-0 h-0 pointer-events-none overflow-hidden"
            : "opacity-100 h-auto pb-2 border-b",
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

      {/* CONTEÚDO */}
      <SidebarContent className="no-scrollbar group-data-[collapsible=icon]:overflow-y-auto">
        <div className="px-3 py-2 space-y-1.5 mt-2">
          {isLoadingReports ? (
            // Skeleton só aparece na visão expandida — na collapsed não faz sentido
            isCollapsed ? null : (
              <SidebarReportsSkeleton count={6} />
            )
          ) : isCollapsed ? (
            /* VISÃO ICON (COLLAPSED) */
            filteredReports.map((report) => (
              <Tooltip key={report.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onSelect(report.id)}
                    className={cn(
                      "w-full p-2 flex items-center justify-center transition-all",
                      selectedId === report.id
                        ? "bg-primary/10"
                        : "hover:bg-secondary",
                      isCollapsed === true ? "rounded-xs" : "rounded-xl",
                    )}
                    title={report.title}
                  >
                    <div
                      className="w-4 h-4 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `hsl(${report.thumbnailColor} / 0.15)`,
                      }}
                    >
                      <BarChart3
                        className="w-4 h-4"
                        style={{ color: `hsl(${report.thumbnailColor})` }}
                      />
                    </div>

                    <TooltipContent side="right" className="text-sm">
                      <p>{report.title}</p>
                    </TooltipContent>
                  </button>
                </TooltipTrigger>
              </Tooltip>
            ))
          ) : (
            /* VISÃO EXPANDIDA (CARDS) */
            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-left-2 duration-500">
              {filteredReports.map((report, index) => (
                <ReportCard
                  key={report.id}
                  index={index}
                  report={report}
                  isActive={selectedId === report.id}
                  onSelect={(r: any) => onSelect(r.id)}
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

      {/* FOOTER */}
      <SidebarFooter className="border-t border-border p-3 flex justify-center items-center w-full">
        {user && <NavUser isCollapsed={isCollapsed} />}
      </SidebarFooter>
    </Sidebar>
  );
}
