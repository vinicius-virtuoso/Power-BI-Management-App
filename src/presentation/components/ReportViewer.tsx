"use client";

import { ReportProps } from "@/core/domain/entities/report";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  FileBarChart,
  Loader2,
  RefreshCw,
  Star,
} from "lucide-react";
import type { Embed, Report, service } from "powerbi-client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useReportDetails } from "../hooks/useReportDetails";

interface ReportViewerProps {
  report: ReportProps | null;
  isFavorite?: boolean;
}

const STORAGE_KEY = "pbi_report_states";

const ReportEmbed = ({
  reportId,
  isVisible,
  onEmbedReady,
  onSyncStatus,
}: {
  reportId: string;
  isVisible: boolean;
  onEmbedReady: (reportId: string, pbiEmbed: Embed) => void;
  onSyncStatus: (status: "saving" | "restored" | "idle") => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { report: data, loadReport } = useReportDetails();
  const [embedded, setEmbedded] = useState(false);
  const pbiServiceRef = useRef<service.Service | null>(null);

  useEffect(() => {
    loadReport(reportId);
  }, [reportId, loadReport]);

  useEffect(() => {
    if (!containerRef.current || !data?.embedUrl || embedded) return;

    const initEmbed = async () => {
      const pbi = await import("powerbi-client");
      const powerbi = new pbi.service.Service(
        pbi.factories.hpmFactory,
        pbi.factories.wpmpFactory,
        pbi.factories.routerFactory,
      );
      pbiServiceRef.current = powerbi;

      const config = {
        type: "report",
        tokenType: pbi.models.TokenType.Embed,
        accessToken: data.token,
        embedUrl: data.embedUrl,
        id: data.externalId || data.id,
        settings: {
          navContentPaneEnabled: true,
          filterPaneEnabled: false,
          background: pbi.models.BackgroundType.Default,
          statusbar: true,
          layoutType: pbi.models.LayoutType.Custom,
          customLayout: {
            displayOption: pbi.models.DisplayOption.FitToWidth,
          },
        },
      };

      const embed = powerbi.embed(containerRef.current!, config) as Report;

      // --- PERSISTÊNCIA: APLICAÇÃO (LOAD) ---
      const applyPersistentState = async () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;
        const savedState = JSON.parse(stored)[reportId];
        if (!savedState) return;

        let attempts = 0;
        const interval = setInterval(async () => {
          try {
            await embed.bookmarksManager.applyState(savedState);
            onSyncStatus("restored");
            clearInterval(interval);
          } catch (e) {
            attempts++;
            if (attempts > 10) clearInterval(interval);
          }
        }, 1000);
      };

      // --- PERSISTÊNCIA: CAPTURA (SAVE) ---
      const saveCurrentState = async () => {
        try {
          const bookmark = await embed.bookmarksManager.capture();
          if (bookmark?.state) {
            const current = JSON.parse(
              localStorage.getItem(STORAGE_KEY) || "{}",
            );
            current[reportId] = bookmark.state;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
            onSyncStatus("saving"); // Notifica salvamento
          }
        } catch (err) {
          console.error("Erro ao salvar estado:", err);
        }
      };

      embed.on("loaded", applyPersistentState);
      embed.on("rendered", applyPersistentState);

      // Salva sempre que houver mudança ou interação
      embed.on("pageChanged", saveCurrentState);
      embed.on("dataSelected", saveCurrentState);

      onEmbedReady(reportId, embed);
      setEmbedded(true);
    };

    initEmbed();
  }, [data, embedded, reportId, onEmbedReady, onSyncStatus]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 transition-opacity duration-500 bg-background h-full w-full",
        isVisible
          ? "opacity-100 z-10 visible"
          : "opacity-0 z-0 invisible pointer-events-none",
      )}
    />
  );
};

const ReportViewer = ({ report, isFavorite }: ReportViewerProps) => {
  const { isLoading } = useReportDetails();
  const [visitedIds, setVisitedIds] = useState<string[]>([]);
  const embedsRef = useRef<Map<string, any>>(new Map());
  const [reloading, setReloading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"saving" | "restored" | "idle">(
    "idle",
  );

  useEffect(() => {
    if (syncStatus !== "idle") {
      const timer = setTimeout(() => setSyncStatus("idle"), 3000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  useLayoutEffect(() => {
    if (report?.id && !visitedIds.includes(report.id)) {
      setVisitedIds((prev) => [...prev, report.id!]);
    }
  }, [report?.id]);

  const handleEmbedReady = (reportId: string, embed: any) => {
    embedsRef.current.set(reportId, embed);
  };

  const handleSyncStatus = useCallback(
    (status: "saving" | "restored" | "idle") => {
      setSyncStatus(status);
    },
    [],
  );

  const handleReload = async () => {
    if (!report?.id) return;
    const embed = embedsRef.current.get(report.id) as Report;
    if (!embed) return;
    setReloading(true);
    try {
      await embed.reload();
    } catch (err) {
      console.error("Erro no reload:", err);
    } finally {
      setReloading(false);
    }
  };

  if (!report) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20 m-4 rounded-xl border-2 border-dashed text-center">
        <div>
          <FileBarChart className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhum relatório selecionado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 h-12 border-b bg-card">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold truncate max-w-[400px]">
            {report.name}
          </h2>
          {isFavorite && (
            <Star className="w-3.5 h-3.5 fill-accent text-accent" />
          )}
          <AnimatePresence>
            {syncStatus !== "idle" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 ml-4 px-2 py-0.5 rounded bg-green-500/10 text-green-600 text-[10px] font-medium"
              >
                <CheckCircle2 className="w-3 h-3" />
                {syncStatus === "restored"
                  ? "Vista restaurada"
                  : "Filtros salvos"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={handleReload}
          disabled={reloading}
          className="p-2 hover:bg-secondary rounded-full"
        >
          <RefreshCw
            className={cn(
              "w-4 h-4 text-muted-foreground",
              reloading && "animate-spin",
            )}
          />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden bg-background">
        <AnimatePresence>
          {isLoading && (
            <motion.div
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
            >
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
        {visitedIds.map((id) => (
          <ReportEmbed
            key={id}
            reportId={id}
            isVisible={id === report.id}
            onEmbedReady={handleEmbedReady}
            onSyncStatus={handleSyncStatus}
          />
        ))}
      </div>
    </div>
  );
};

export default ReportViewer;
