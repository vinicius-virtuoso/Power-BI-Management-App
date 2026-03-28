"use client";

import { Skeleton } from "./ui/skeleton";

// Skeleton de um card individual — espelha exatamente o layout do ReportCard
function ReportCardSkeleton({ index }: { index: number }) {
  // Opacidade decrescente para dar efeito de fade natural na lista
  const opacity = Math.max(0.3, 1 - index * 0.15);

  return (
    <div
      className="w-full p-2 rounded-md border bg-secondary/80 shadow-none"
      style={{ opacity }}
    >
      <div className="flex items-start gap-3">
        {/* Ícone colorido */}
        <Skeleton className="w-8 h-8 rounded-lg shrink-0" />

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          {/* Título + estrela */}
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="w-4 h-4 rounded-sm shrink-0" />
          </div>

          {/* Data */}
          <div className="flex items-center gap-1 mt-2">
            <Skeleton className="w-3 h-3 rounded-sm" />
            <Skeleton className="h-2.5 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Lista de skeletons — mesma quantidade de cards esperados
export function SidebarReportsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <ReportCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
