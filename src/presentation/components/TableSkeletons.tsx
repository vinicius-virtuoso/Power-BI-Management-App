"use client";

import { Skeleton } from "./ui/skeleton";

// ─── Utilitário ───────────────────────────────────────────────────────────────

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// ─── Skeleton: Tabela de Usuários ─────────────────────────────────────────────

export function UsersTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <tbody className="divide-y divide-border w-full">
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b w-full">
          {/* Usuário */}
          <td className="p-4">
            <div className="flex items-center gap-3 w-full">
              <Skeleton className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
          </td>
          {/* Nível */}
          <td className="p-4">
            <Skeleton className="h-6 w-16 rounded-full" />
          </td>
          {/* Status */}
          <td className="p-4">
            <Skeleton className="h-6 w-14 rounded-full" />
          </td>
          {/* Membro desde */}
          <td className="p-4 hidden md:table-cell">
            <Skeleton className="h-3.5 w-20" />
          </td>
          {/* Último acesso */}
          <td className="p-4 hidden lg:table-cell">
            <Skeleton className="h-3.5 w-28" />
          </td>
          {/* Ações */}
          <td className="p-4 text-right">
            <Skeleton className="h-8 w-8 rounded-md ml-auto" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

// ─── Skeleton: Tabela de Relatórios ───────────────────────────────────────────

export function ReportsTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <tbody className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b">
          {/* Relatório */}
          <td className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-md shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
          </td>
          {/* Status */}
          <td className="p-4">
            <Skeleton className="h-6 w-14 rounded-full" />
          </td>
          {/* Última atualização */}
          <td className="p-4 hidden md:table-cell">
            <Skeleton className="h-3.5 w-28" />
          </td>
          {/* Agendamento */}
          <td className="p-4 hidden lg:table-cell">
            <Skeleton className="h-6 w-20 rounded-full" />
          </td>
          {/* Erros */}
          <td className="p-4 hidden lg:table-cell">
            <Skeleton className="h-3.5 w-8" />
          </td>
          {/* Ações */}
          <td className="p-4 text-right">
            <Skeleton className="h-8 w-8 rounded-md ml-auto" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

// ─── Skeleton: Dashboard ──────────────────────────────────────────────────────

export function DashboardSidebarSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="flex flex-col gap-2 p-3">
      {/* Barra de pesquisa */}
      <Skeleton className="h-9 w-full rounded-lg mb-2" />

      {/* Cards de relatório */}
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg border bg-card"
        >
          <Skeleton
            className="w-10 h-10 rounded-md shrink-0"
            style={{ opacity: 1 - i * 0.12 }}
          />
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <Skeleton
              className="h-3.5 w-3/4"
              style={{ opacity: 1 - i * 0.12 }}
            />
            <Skeleton className="h-3 w-1/2" style={{ opacity: 1 - i * 0.12 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardViewerSkeleton() {
  return (
    <div className="flex flex-col w-full h-full p-4 gap-4">
      {/* Header do viewer */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3.5 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      {/* Área principal do iframe */}
      <Skeleton className="flex-1 w-full rounded-lg" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex gap-2 h-full w-full">
      {/* Sidebar */}
      <div className="w-72 shrink-0 border-r bg-sidebar h-full overflow-hidden">
        <div className="p-4 border-b">
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-3.5 w-20" />
        </div>
        <DashboardSidebarSkeleton />
      </div>

      {/* Viewer */}
      <div className="flex flex-1 border bg-card overflow-hidden rounded-lg">
        <DashboardViewerSkeleton />
      </div>
    </div>
  );
}
