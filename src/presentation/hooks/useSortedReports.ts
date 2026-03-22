import { ReportProps } from "@/core/domain/entities/report";
import { ScheduleReportProps } from "@/core/domain/entities/schedule";
import { ReportSortKey } from "@/presentation/components/SortSelect";
import { useMemo, useState } from "react";

export function useSortedReports(
  reports: ReportProps[],
  scheduleMap: Record<string, ScheduleReportProps>,
) {
  const [sortKey, setSortKey] = useState<ReportSortKey>("name_asc");

  const sorted = useMemo(() => {
    const list = [...reports];

    switch (sortKey) {
      case "name_asc":
        return list.sort((a, b) =>
          (a.name ?? "").localeCompare(b.name ?? "", "pt-BR"),
        );

      case "name_desc":
        return list.sort((a, b) =>
          (b.name ?? "").localeCompare(a.name ?? "", "pt-BR"),
        );

      case "status_active":
        return list.sort((a, b) => Number(b.isActive) - Number(a.isActive));

      case "status_inactive":
        return list.sort((a, b) => Number(a.isActive) - Number(b.isActive));

      case "updated_newest":
        return list.sort((a, b) => {
          const aTime = a.lastUpdate ? new Date(a.lastUpdate).getTime() : 0;
          const bTime = b.lastUpdate ? new Date(b.lastUpdate).getTime() : 0;
          return bTime - aTime;
        });

      case "updated_oldest":
        return list.sort((a, b) => {
          const aTime = a.lastUpdate ? new Date(a.lastUpdate).getTime() : 0;
          const bTime = b.lastUpdate ? new Date(b.lastUpdate).getTime() : 0;
          return aTime - bTime;
        });

      case "errors_first":
        return list.sort((a, b) => {
          const aHas = a.errors != null ? 1 : 0;
          const bHas = b.errors != null ? 1 : 0;
          return bHas - aHas;
        });

      case "scheduled_first":
        return list.sort((a, b) => {
          const aHas = scheduleMap[a.id] != null ? 1 : 0;
          const bHas = scheduleMap[b.id] != null ? 1 : 0;
          return bHas - aHas;
        });

      default:
        return list;
    }
  }, [reports, sortKey, scheduleMap]);

  return { sorted, sortKey, setSortKey };
}
