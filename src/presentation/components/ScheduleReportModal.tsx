"use client";

import { ReportProps } from "@/core/domain/entities/report";
import { useScheduleReport } from "@/presentation/hooks/useScheduleReport";
import { cn } from "@/shared/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  CalendarClock,
  Check,
  Clock,
  Loader2,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Switch } from "./ui/switch";

// ─── Constantes ───────────────────────────────────────────────────────────────

const ALL_HOURS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0"),
);

// Dias 01-31 excluindo 07 (conforme enum ClosingDay do backend)
const ALL_DAYS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
  "29",
  "30",
  "31",
];

// ─── Tipagem ──────────────────────────────────────────────────────────────────

interface ScheduleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportProps | null;
  onScheduleChange?: () => void;
}

interface FormState {
  hoursCommon: string[];
  isClosingDays: boolean;
  closingDays: string[];
  hoursClosingDays: string[];
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  hoursCommon: [],
  isClosingDays: false,
  closingDays: [],
  hoursClosingDays: [],
  isActive: true,
};

// ─── Sub-componente: Chip de seleção ──────────────────────────────────────────

function Chip({
  value,
  selected,
  onToggle,
  suffix = "",
}: {
  value: string;
  selected: boolean;
  onToggle: (v: string) => void;
  suffix?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(value)}
      className={cn(
        "min-w-[38px] h-7 px-1.5 rounded-md text-[11px] font-semibold transition-all border select-none",
        selected
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-muted text-muted-foreground border-transparent hover:border-border hover:bg-muted/70",
      )}
    >
      {value}
      {suffix}
    </button>
  );
}

// ─── Sub-componente: Grupo de chips com label ─────────────────────────────────

function ChipGroup({
  label,
  icon: Icon,
  items,
  selected,
  onToggle,
  suffix,
  cols = "grid-cols-8",
}: {
  label: string;
  icon: React.ElementType;
  items: string[];
  selected: string[];
  onToggle: (v: string) => void;
  suffix?: string;
  cols?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <Icon className="w-3.5 h-3.5 text-primary" />
          {label}
        </div>
        <span className="text-[10px] text-muted-foreground">
          {selected.length} selecionado{selected.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className={cn("grid gap-1", cols)}>
        {items.map((item) => (
          <Chip
            key={item}
            value={item}
            suffix={suffix}
            selected={selected.includes(item)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ScheduleReportModal({
  isOpen,
  onClose,
  report,
  onScheduleChange,
}: ScheduleReportModalProps) {
  const {
    schedule,
    isLoading,
    isSaving,
    isDeleting,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  } = useScheduleReport(report?.id ?? null, isOpen);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const isEditMode = !!schedule;

  // Popula o formulário quando o agendamento é carregado
  useEffect(() => {
    if (schedule) {
      setForm({
        hoursCommon: schedule.hoursCommon,
        isClosingDays: schedule.isClosingDays,
        closingDays: schedule.closingDays,
        hoursClosingDays: schedule.hoursClosingDays,
        isActive: schedule.isActive,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [schedule]);

  // Limpa ao fechar
  useEffect(() => {
    if (!isOpen) {
      setForm(EMPTY_FORM);
      setIsDeleteAlertOpen(false);
    }
  }, [isOpen]);

  // ─── Helpers de toggle ────────────────────────────────────────────────────────

  const toggleItem =
    (key: "hoursCommon" | "closingDays" | "hoursClosingDays") =>
    (value: string) => {
      setForm((prev) => ({
        ...prev,
        [key]: prev[key].includes(value)
          ? prev[key].filter((v) => v !== value)
          : [...prev[key], value].sort(),
      }));
    };

  // ─── Validação básica ────────────────────────────────────────────────────────

  const isValid =
    form.hoursCommon.length > 0 &&
    (!form.isClosingDays ||
      (form.closingDays.length > 0 && form.hoursClosingDays.length > 0));

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = () => {
    if (!report || !isValid) return;

    // Aguarda o refresh do mapa antes de fechar o modal
    const onSuccess = async () => {
      await onScheduleChange?.();
      onClose();
    };

    if (isEditMode && schedule) {
      updateSchedule(
        schedule.id,
        {
          hoursCommon: form.hoursCommon,
          isClosingDays: form.isClosingDays,
          closingDays: form.closingDays,
          hoursClosingDays: form.hoursClosingDays,
          isActive: form.isActive,
        },
        onSuccess,
      );
    } else {
      createSchedule(
        {
          reportId: report.id,
          hoursCommon: form.hoursCommon,
          isClosingDays: form.isClosingDays,
          closingDays: form.closingDays,
          hoursClosingDays: form.hoursClosingDays,
        },
        onSuccess,
      );
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden rounded-xl sm:max-w-md">
          {/* ── Header ── */}
          <div className="px-6 pt-5 pb-4 border-b bg-linear-to-b from-muted/60 to-transparent">
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CalendarClock className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-sm font-semibold leading-tight">
                    {isEditMode ? "Editar Agendamento" : "Criar Agendamento"}
                  </DialogTitle>
                  {report && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {report.name}
                    </p>
                  )}
                </div>
                {isEditMode && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] h-5 shrink-0 gap-1 mr-10",
                      form.isActive
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200",
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        form.isActive
                          ? "bg-green-500 animate-pulse"
                          : "bg-red-500",
                      )}
                    />
                    {form.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                )}
              </div>
            </DialogHeader>

            {/* Toggle de status — apenas no modo edição */}
            {isEditMode && (
              <div className="mt-4 flex items-center justify-between bg-background border rounded-lg px-4 py-2.5">
                <div>
                  <p className="text-xs font-medium">Agendamento ativo</p>
                  <p className="text-[11px] text-muted-foreground">
                    Desativar pausa as atualizações automáticas
                  </p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((p) => ({ ...p, isActive: v }))
                  }
                />
              </div>
            )}
          </div>

          {/* ── Corpo ── */}
          <ScrollArea className="h-[340px]">
            <div className="px-6 py-4 space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-xs">Carregando agendamento...</p>
                </div>
              ) : (
                <>
                  {/* Horários comuns */}
                  <ChipGroup
                    label="Horários de atualização (dias comuns)"
                    icon={Clock}
                    items={ALL_HOURS}
                    selected={form.hoursCommon}
                    onToggle={toggleItem("hoursCommon")}
                    suffix="h"
                    cols="grid-cols-8"
                  />

                  {/* Toggle: dias de fechamento */}
                  <div className="flex items-center justify-between bg-muted/40 border rounded-lg px-4 py-3">
                    <div>
                      <p className="text-xs font-medium">Dias de fechamento</p>
                      <p className="text-[11px] text-muted-foreground">
                        Configura horários específicos para dias de fechamento
                        do mês
                      </p>
                    </div>
                    <Switch
                      checked={form.isClosingDays}
                      onCheckedChange={(v) =>
                        setForm((p) => ({ ...p, isClosingDays: v }))
                      }
                    />
                  </div>

                  {/* Seção de dias de fechamento — visível apenas quando ativo */}
                  <AnimatePresence initial={false}>
                    {form.isClosingDays && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6 overflow-hidden"
                      >
                        <ChipGroup
                          label="Dias de fechamento do mês"
                          icon={Calendar}
                          items={ALL_DAYS}
                          selected={form.closingDays}
                          onToggle={toggleItem("closingDays")}
                          cols="grid-cols-8"
                        />

                        <ChipGroup
                          label="Horários nos dias de fechamento"
                          icon={Clock}
                          items={ALL_HOURS}
                          selected={form.hoursClosingDays}
                          onToggle={toggleItem("hoursClosingDays")}
                          suffix="h"
                          cols="grid-cols-8"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </ScrollArea>

          {/* ── Footer ── */}
          <div className="border-t px-5 py-3.5 bg-muted/30 flex items-center justify-between gap-3">
            {/* Botão de remover agendamento — apenas em edição */}
            {isEditMode ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5"
                onClick={() => setIsDeleteAlertOpen(true)}
                disabled={isDeleting || isSaving}
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Remover agendamento
              </Button>
            ) : (
              <span className="text-[11px] text-muted-foreground">
                {isValid
                  ? "Pronto para salvar."
                  : "Selecione ao menos um horário."}
              </span>
            )}

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSaving || isDeleting}
                className="h-8 text-xs"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleSubmit}
                disabled={!isValid || isSaving || isLoading}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    {isEditMode ? "Salvar alterações" : "Criar agendamento"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Alert de confirmação de exclusão ── */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              O agendamento de{" "}
              <span className="font-bold text-foreground">{report?.name}</span>{" "}
              será removido. As atualizações automáticas serão interrompidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (schedule) {
                  deleteSchedule(schedule.id, async () => {
                    await onScheduleChange?.();
                    onClose();
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmar remoção
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
