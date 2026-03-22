"use client";

import { ReportProps } from "@/core/domain/entities/report";
import { useReportsManagement } from "@/presentation/hooks/useReportsManagement";
import { cn } from "@/shared/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Ban,
  CalendarClock,
  ChevronLeft,
  Clock,
  LayoutTemplate,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ScheduleReportModal from "../components/ScheduleReportModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";

// ─── Componente de visualização de JSON formatado ─────────────────────────────

function JsonViewer({ value }: { value: unknown }) {
  const parsed: Record<string, unknown> =
    typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value);
          } catch {
            return { message: value };
          }
        })()
      : ((value as Record<string, unknown>) ?? {});

  const renderValue = (v: unknown, depth = 0): React.ReactNode => {
    if (v === null) return <span className="text-slate-400">null</span>;
    if (typeof v === "boolean")
      return <span className="text-amber-400">{String(v)}</span>;
    if (typeof v === "number") return <span className="text-sky-400">{v}</span>;
    if (typeof v === "string")
      return <span className="text-emerald-400">"{v}"</span>;

    if (Array.isArray(v)) {
      if (v.length === 0) return <span className="text-slate-300">[]</span>;
      return (
        <span>
          {"["}
          <div className="pl-3 border-l border-slate-600/40 ml-1 my-0.5">
            {v.map((item, i) => (
              <div key={i}>
                {renderValue(item, depth + 1)}
                {i < v.length - 1 && <span className="text-slate-500">,</span>}
              </div>
            ))}
          </div>
          {"]"}
        </span>
      );
    }

    if (typeof v === "object") {
      const entries = Object.entries(v as Record<string, unknown>);
      if (entries.length === 0)
        return <span className="text-slate-300">{"{}"}</span>;
      return (
        <span>
          {"{"}
          <div className="pl-3 border-l border-slate-600/40 ml-1 my-0.5">
            {entries.map(([key, val], i) => (
              <div key={key} className="leading-relaxed">
                <span className="text-violet-400">"{key}"</span>
                <span className="text-slate-400">: </span>
                {renderValue(val, depth + 1)}
                {i < entries.length - 1 && (
                  <span className="text-slate-500">,</span>
                )}
              </div>
            ))}
          </div>
          {"}"}
        </span>
      );
    }

    return <span className="text-slate-300">{String(v)}</span>;
  };

  return (
    <div className="font-mono text-[10px] leading-relaxed bg-slate-900 rounded-md p-3 text-slate-300">
      {renderValue(parsed)}
    </div>
  );
}

export default function ReportsManagementScreen() {
  const router = useRouter();
  const {
    filtered,
    scheduleMap,
    isLoading,
    isSyncing,
    isUpdating,
    isRefreshingId,
    searchTerm,
    setSearchTerm,
    refreshSchedules,
    syncReports,
    toggleReportActive,
    deleteReport,
    refreshDataset,
  } = useReportsManagement();

  const [selectedReport, setSelectedReport] = useState<ReportProps | null>(
    null,
  );
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleOpenSchedule = (report: ReportProps) => {
    setSelectedReport(report);
    setIsScheduleModalOpen(true);
  };

  const handleOpenDelete = (report: ReportProps) => {
    setSelectedReport(report);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedReport) return;
    await deleteReport(selectedReport.id);
    setIsDeleteAlertOpen(false);
    setSelectedReport(null);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.section
          className="p-4 max-w-7xl mx-auto grid grid-rows-[auto_1fr] gap-4 h-full overflow-hidden max-h-screen"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* ── Cabeçalho ── */}
          <div className="flex flex-col gap-4 shrink-0">
            <div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-primary -ml-2 mb-2"
                onClick={() => router.push("/dashboard")}
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar para os Relatórios
              </Button>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    Gerenciamento de Relatórios
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Sincronize, ative e configure agendamentos do Power BI.
                  </p>
                </div>
                <Button
                  onClick={syncReports}
                  disabled={isSyncing}
                  size="default"
                  className="gap-2 shadow-md"
                >
                  {isSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {isSyncing ? "Sincronizando..." : "Sincronizar"}
                </Button>
              </div>
            </div>

            {/* Busca */}
            <div className="flex items-center gap-3 bg-card px-4 rounded-md border shadow-sm focus-within:ring-2 focus-within:ring-primary/80 transition-all h-10">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar relatório..."
                className="border-none shadow-none focus-visible:ring-0 bg-transparent h-full text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* ── Tabela ── */}
          <div className="rounded-md border bg-card shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-muted/90 backdrop-blur-sm border-b text-muted-foreground sticky top-0 z-10">
                  <tr className="text-[10px] uppercase tracking-wider font-bold">
                    <th className="p-4">Relatório</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 hidden md:table-cell">
                      Última atualização
                    </th>
                    <th className="p-4 hidden lg:table-cell">Agendamento</th>
                    <th className="p-4 hidden lg:table-cell">Erros</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <p className="text-xs">Carregando relatórios...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="h-64 text-center text-muted-foreground"
                      >
                        Nenhum relatório encontrado.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((report) => {
                      const isBeingUpdated = isUpdating === report.id;
                      const isBeingRefreshed = isRefreshingId(report.id);

                      return (
                        <tr
                          key={report.id}
                          className="transition-colors hover:bg-muted/20"
                        >
                          {/* Nome */}
                          <td className="p-4">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-3 cursor-default">
                                  <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <LayoutTemplate className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold truncate max-w-[220px]">
                                      {report.name}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                                      {report.datasetId}
                                    </p>
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="text-xs max-w-72"
                              >
                                {report.name}
                              </TooltipContent>
                            </Tooltip>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <Badge
                              variant="outline"
                              className={cn(
                                "gap-1.5 h-6 px-2 font-medium shadow-none text-[10px]",
                                report.isActive
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-red-50 text-red-700 border-red-200",
                              )}
                            >
                              <span
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  report.isActive
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-red-500",
                                )}
                              />
                              {report.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                          </td>

                          {/* Última atualização */}
                          <td className="p-4 hidden md:table-cell text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 shrink-0" />
                              {report.lastUpdate
                                ? formatDistanceToNow(
                                    new Date(report.lastUpdate),
                                    { addSuffix: true, locale: ptBR },
                                  )
                                : "Nunca atualizado"}
                            </div>
                          </td>

                          {/* Agendamento */}
                          <td className="p-4 hidden lg:table-cell">
                            {(() => {
                              const schedule = scheduleMap[report.id];
                              if (!schedule) {
                                return (
                                  <span className="text-[11px] text-muted-foreground">
                                    —
                                  </span>
                                );
                              }
                              return (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="w-fit">
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "gap-1.5 h-6 px-2 font-medium shadow-none text-[10px] cursor-default",
                                          schedule.isActive
                                            ? "bg-blue-50 text-blue-700 border-blue-200"
                                            : "bg-muted text-muted-foreground border-border",
                                        )}
                                      >
                                        <CalendarClock className="w-3 h-3" />
                                        {schedule.isActive
                                          ? "Agendado"
                                          : "Pausado"}
                                      </Badge>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    className="text-xs space-y-1 max-w-56 flex flex-col"
                                  >
                                    <p className="font-semibold text-accent-foreground">
                                      Horários comuns
                                    </p>
                                    <p>
                                      {schedule.hoursCommon.length > 0
                                        ? schedule.hoursCommon
                                            .map((h) => `${h}h`)
                                            .join(", ")
                                        : "—"}
                                    </p>
                                    {schedule.isClosingDays && (
                                      <>
                                        <p className="font-semibold text-accent-foreground pt-1">
                                          Dias de fechamento
                                        </p>
                                        <p>{schedule.closingDays.join(", ")}</p>
                                        <p className="font-semibold text-accent-foreground pt-1">
                                          Horários de fechamento
                                        </p>
                                        <p>
                                          {schedule.hoursClosingDays
                                            .map((h) => `${h}h`)
                                            .join(", ")}
                                        </p>
                                      </>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })()}
                          </td>

                          {/* Erros */}
                          <td className="p-4 hidden lg:table-cell">
                            {report.errors ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1.5 text-red-600 cursor-default w-fit">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-medium">
                                      Com erros
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="p-0 w-80 border-slate-700 bg-slate-900"
                                >
                                  <ScrollArea className="max-h-56 rounded-md">
                                    <div className="p-1">
                                      <JsonViewer value={report.errors} />
                                    </div>
                                  </ScrollArea>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>

                          {/* Ações */}
                          <td className="p-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 border hover:bg-background"
                                  disabled={isBeingUpdated || isBeingRefreshed}
                                >
                                  {isBeingUpdated || isBeingRefreshed ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                  ) : (
                                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuLabel className="text-[9px] font-bold text-muted-foreground uppercase">
                                  Opções
                                </DropdownMenuLabel>

                                {/* Refresh manual */}
                                <DropdownMenuItem
                                  onClick={() => refreshDataset(report.id)}
                                >
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Atualizar dataset
                                </DropdownMenuItem>

                                {/* Agendamento */}
                                <DropdownMenuItem
                                  onClick={() => handleOpenSchedule(report)}
                                >
                                  <CalendarClock className="w-4 h-4 mr-2" />
                                  Configurar agendamento
                                </DropdownMenuItem>

                                {/* Ativar / Desativar */}
                                <DropdownMenuItem
                                  onClick={() => toggleReportActive(report)}
                                  className={
                                    report.isActive
                                      ? "text-orange-600"
                                      : "text-green-600"
                                  }
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  {report.isActive
                                    ? "Desativar relatório"
                                    : "Ativar relatório"}
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* Deletar */}
                                <DropdownMenuItem
                                  className="text-red-600 focus:bg-destructive focus:text-accent-foreground"
                                  onClick={() => handleOpenDelete(report)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remover permanentemente
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Modais ── */}
          <ScheduleReportModal
            isOpen={isScheduleModalOpen}
            onClose={() => {
              setIsScheduleModalOpen(false);
              setSelectedReport(null);
            }}
            report={selectedReport}
            onScheduleChange={refreshSchedules}
          />

          <AlertDialog
            open={isDeleteAlertOpen}
            onOpenChange={setIsDeleteAlertOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover relatório?</AlertDialogTitle>
                <AlertDialogDescription>
                  Deseja remover permanentemente{" "}
                  <span className="font-bold text-foreground">
                    {selectedReport?.name}
                  </span>
                  ? Todos os vínculos de usuários e agendamentos serão perdidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedReport(null)}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Confirmar remoção
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.section>
      </AnimatePresence>
    </>
  );
}
