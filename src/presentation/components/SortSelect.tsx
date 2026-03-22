"use client";

import { ArrowDownUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

// ─── Tipagem genérica ─────────────────────────────────────────────────────────

export interface SortOption<T extends string> {
  value: T;
  label: string;
}

interface SortSelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SortOption<T>[];
  placeholder?: string;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function SortSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder = "Ordenar por",
}: SortSelectProps<T>) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as T)}>
      <SelectTrigger className="h-10 w-48 gap-2 bg-card border shadow-sm text-sm">
        <ArrowDownUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-sm">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Opções: Usuários ─────────────────────────────────────────────────────────

export type UserSortKey =
  | "name_asc"
  | "name_desc"
  | "status_active"
  | "status_inactive"
  | "role_admin"
  | "role_user"
  | "created_newest"
  | "created_oldest";

export const USER_SORT_OPTIONS: SortOption<UserSortKey>[] = [
  { value: "name_asc", label: "Nome (A → Z)" },
  { value: "name_desc", label: "Nome (Z → A)" },
  { value: "status_active", label: "Ativos primeiro" },
  { value: "status_inactive", label: "Inativos primeiro" },
  { value: "role_admin", label: "Admin primeiro" },
  { value: "role_user", label: "Padrão primeiro" },
  { value: "created_newest", label: "Membro mais novo" },
  { value: "created_oldest", label: "Membro mais antigo" },
];

// ─── Opções: Relatórios ───────────────────────────────────────────────────────

export type ReportSortKey =
  | "name_asc"
  | "name_desc"
  | "status_active"
  | "status_inactive"
  | "updated_newest"
  | "updated_oldest"
  | "errors_first"
  | "scheduled_first";

export const REPORT_SORT_OPTIONS: SortOption<ReportSortKey>[] = [
  { value: "name_asc", label: "Nome (A → Z)" },
  { value: "name_desc", label: "Nome (Z → A)" },
  { value: "status_active", label: "Ativos primeiro" },
  { value: "status_inactive", label: "Inativos primeiro" },
  { value: "updated_newest", label: "Atualização mais recente" },
  { value: "updated_oldest", label: "Atualização mais antiga" },
  { value: "errors_first", label: "Com erros primeiro" },
  { value: "scheduled_first", label: "Com agendamento primeiro" },
];
