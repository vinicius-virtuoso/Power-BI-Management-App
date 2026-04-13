"use client";

import { useUserMeStore } from "@/core/store/users/userMeStore";
import { BarChart3, Menu, Search } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { ReportData } from "../screens/DashboardScreen";
import { NavUser } from "./NavUser";
import ReportCard from "./ReportCard";
import { SidebarReportsSkeleton } from "./SidebarReportsSkeleton";
import { Input } from "./ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

interface MobileMenuProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  isLoadingReports: boolean;
  filteredReports: ReportData[];
  toggleFavorite: (id: string) => void;
}

export function MobileMenu({
  selectedId,
  onSelect,
  search,
  setSearch,
  isLoadingReports,
  filteredReports,
  toggleFavorite,
}: MobileMenuProps) {
  const { user } = useUserMeStore();
  const [isOpen, setIsOpen] = useState(false);

  // Fecha o menu automaticamente ao selecionar um relatório
  const handleSelect = (id: string) => {
    onSelect(id);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="h-10 w-10 flex items-center justify-center bg-card border shadow-sm rounded-md hover:bg-secondary transition-colors">
          <Menu className="w-5 h-5 text-foreground" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[300px] sm:w-[350px] p-0 flex flex-col bg-card"
      >
        {/* HEADER */}
        <SheetHeader className="h-14 border-b border-border flex flex-row items-center px-4 m-0 space-y-0">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0 mr-3">
            <BarChart3 className="w-4 h-4 text-primary-foreground" />
          </div>
          <SheetTitle className="font-display font-bold text-foreground text-base">
            Relatórios
          </SheetTitle>
        </SheetHeader>

        {/* BUSCA */}
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar relatórios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-secondary/50 border-border text-sm rounded-md w-full"
            />
          </div>
        </div>

        {/* CONTEÚDO (LISTA DE RELATÓRIOS) */}
        <div className="flex-1 overflow-y-auto px-2 pb-2 pt-0 space-y-2 no-scrollbar">
          {isLoadingReports ? (
            <SidebarReportsSkeleton count={5} />
          ) : (
            <div className="flex flex-col gap-2">
              {filteredReports.map((report, index) => (
                <ReportCard
                  key={report.id}
                  index={index}
                  report={report}
                  isActive={selectedId === report.id}
                  onSelect={(r: any) => handleSelect(r.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
              {filteredReports.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum relatório encontrado.
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER (USUÁRIO) */}
        <div className="border-t border-border p-4 w-full bg-card">
          {user && <NavUser isCollapsed={false} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
