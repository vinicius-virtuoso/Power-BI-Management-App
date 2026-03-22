"use client";

import { UserProps } from "@/core/domain/entities/user";
import { useShareReports } from "@/presentation/hooks/useShareReports";
import { cn } from "@/shared/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart2,
  Check,
  FileText,
  Loader2,
  Search,
  Share2,
  Shield,
  X,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Switch } from "./ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

// ─── Tipagem ──────────────────────────────────────────────────────────────────

interface ShareReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProps | null;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function ShareReportsModal({
  isOpen,
  onClose,
  user,
}: ShareReportsModalProps) {
  const {
    isLoading,
    isSaving,
    searchTerm,
    setSearchTerm,
    selectedIds,
    allReports,
    filtered,
    hasChanges,
    changedCount,
    toggleReport,
    saveChanges,
  } = useShareReports(user, isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden rounded-xl sm:max-w-lg">
        {/* ── Header ── */}
        <div className="p-2 pt-10 border-b bg-linear-to-b from-muted/60 to-transparent">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <DialogTitle className="text-sm font-semibold leading-tight">
                  Compartilhar Relatórios
                </DialogTitle>
                {user && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    Gerenciando acesso de{" "}
                    <span className="font-medium text-foreground">
                      {user.name}
                    </span>
                  </p>
                )}
              </div>

              {!isLoading && allReports.length > 0 && (
                <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0">
                  <Shield className="w-3 h-3" />
                  {selectedIds.size} / {allReports.length}
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Busca — fora do DialogHeader para herdar o background corretamente */}
          <div className="mt-4 flex items-center gap-2 bg-background border rounded-lg px-3 h-9 focus-within:ring-2 focus-within:ring-primary/40 transition-all">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <Input
              placeholder="Buscar relatório..."
              className="border-none shadow-none focus-visible:ring-0 bg-transparent h-full text-xs p-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Lista ── */}
        <ScrollArea className="h-[360px]">
          <div className="px-4 py-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs">Carregando relatórios...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground">
                <FileText className="w-8 h-8 opacity-25" />
                <p className="text-xs">Nenhum relatório encontrado.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                <ul className="space-y-1.5">
                  {filtered.map((report, i) => {
                    const hasAccess = selectedIds.has(report.id);
                    const wasChanged =
                      !selectedIds.has(report.id) !== !hasAccess;

                    return (
                      <motion.li
                        key={report.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.12, delay: i * 0.025 }}
                      >
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              onClick={() => toggleReport(report.id)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer select-none transition-all",
                                hasAccess
                                  ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                                  : "bg-card border-border hover:bg-muted/40",
                                wasChanged &&
                                  "ring-1 ring-offset-1 ring-amber-400/60",
                              )}
                            >
                              {/* Ícone */}
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors",
                                  hasAccess
                                    ? "bg-primary/15 text-primary"
                                    : "bg-muted text-muted-foreground",
                                )}
                              >
                                <BarChart2 className="w-4 h-4" />
                              </div>

                              {/* Nome + badge de alteração */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium truncate leading-tight max-w-50">
                                    {report.name}
                                  </p>
                                  {wasChanged && (
                                    <Badge
                                      variant="outline"
                                      className="text-[9px] h-4 px-1.5 bg-amber-50 border-amber-300 text-amber-700 shrink-0"
                                    >
                                      alterado
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Switch */}
                              <Switch
                                checked={hasAccess}
                                onCheckedChange={() => toggleReport(report.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="shrink-0"
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="left"
                            className="text-xs max-w-64"
                          >
                            {report.name}
                          </TooltipContent>
                        </Tooltip>
                      </motion.li>
                    );
                  })}
                </ul>
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>

        {/* ── Footer ── */}
        <div className="border-t px-5 py-3.5 bg-muted/30 flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            {isLoading ? (
              "Carregando..."
            ) : hasChanges ? (
              <span className="text-amber-600 font-medium">
                {changedCount} alteraç{changedCount > 1 ? "ões" : "ão"} pendente
                {changedCount > 1 ? "s" : ""}
              </span>
            ) : (
              "Sem alterações pendentes."
            )}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSaving}
              className="h-8 text-xs"
            >
              {hasChanges ? "Cancelar" : "Fechar"}
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => saveChanges(onClose)}
              disabled={!hasChanges || isSaving || isLoading}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
