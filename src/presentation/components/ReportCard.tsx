"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Clock, Star, StarOff } from "lucide-react";

interface ReportCardData {
  id: string;
  title: string;
  lastUpdated: Date | string;
  isFavorite: boolean;
  embedUrl: string;
  thumbnailColor: string;
}

interface ReportCardProps {
  report: ReportCardData;
  isActive: boolean;
  index: number;
  onSelect: (report: ReportCardData) => void;
  onToggleFavorite: (id: string) => void;
}

const ReportCard = ({
  report,
  isActive,
  index,
  onSelect,
  onToggleFavorite,
}: ReportCardProps) => {
  const formattedDate = report.lastUpdated
    ? new Intl.DateTimeFormat("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }).format(new Date(report.lastUpdated))
    : null;

  return (
    <motion.div
      layout
      layoutId={`report-${report.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        opacity: { duration: 0.25, delay: index * 0.04, ease: "linear" },
      }}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(report)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(report)}
      className={`w-full text-left p-2 rounded-md transition-all duration-200 group relative cursor-pointer  ${
        isActive
          ? "border border-primary/30 shadow-2xl bg-primary/20"
          : "bg-secondary/80 border hover:border-border hover:bg-primary/10"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `hsl(${report.thumbnailColor} / 0.15)` }}
        >
          <BarChart3
            className="w-4 h-4"
            style={{ color: `hsl(${report.thumbnailColor})` }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-xs text-foreground truncate">
                {report.title}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(report.id);
                }}
                className="shrink-0 text-muted-foreground hover:text-accent transition-colors"
              >
                <AnimatePresence mode="wait">
                  {report.isFavorite ? (
                    <motion.span
                      key="filled"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: "linear" }}
                      className="block transition-all hover:scale-150"
                    >
                      <Star className="w-4 h-4 fill-accent text-accent" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="empty"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.15 }}
                      className="block transition-all hover:scale-150"
                    >
                      <StarOff className="w-4 h-4 opacity-35" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {report?.lastUpdated && formattedDate && (
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formattedDate}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ReportCard;
