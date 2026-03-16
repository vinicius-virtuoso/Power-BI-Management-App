"use client";

import { ReportProps } from "@/core/domain/entities/report";
import { cn } from "@/shared/utils";
import { AnimatePresence, motion } from "framer-motion";
import { FileBarChart, Loader2, Star } from "lucide-react";
import type { Embed, Report } from "powerbi-client";
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

const ReportEmbed = ({
  reportId,
  isVisible,
  onEmbedReady,
  onRendered,
}: {
  reportId: string;
  isVisible: boolean;
  onEmbedReady: (reportId: string, pbiEmbed: Embed) => void;
  onRendered: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // AJUSTE: Passamos o reportId para o hook saber qual dado pegar da Store Global
  const { report: data, loadReport } = useReportDetails(reportId);

  const [embedded, setEmbedded] = useState(false);
  const embedInstance = useRef<Report | null>(null);

  const hasRequested = useRef(false);
  const isInitializingPBI = useRef(false);

  // Carrega da API apenas se necessário
  useEffect(() => {
    if (!hasRequested.current && !data) {
      hasRequested.current = true;
      loadReport(reportId);
    }
  }, [reportId, loadReport, data]);

  // Inicializa o Power BI
  useEffect(() => {
    // IMPORTANTE: Agora o 'data' virá da store global, permitindo passar daqui
    if (
      !containerRef.current ||
      !data?.embedUrl ||
      embedded ||
      isInitializingPBI.current
    )
      return;

    const initEmbed = async () => {
      isInitializingPBI.current = true;

      const pbi = await import("powerbi-client");
      const powerbi = new pbi.service.Service(
        pbi.factories.hpmFactory,
        pbi.factories.wpmpFactory,
        pbi.factories.routerFactory,
      );

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
            displayOption: pbi.models.DisplayOption.FitToPage,
          },
        },
      };

      const embed = powerbi.embed(containerRef.current!, config) as Report;
      embedInstance.current = embed;

      embed.on("rendered", () => onRendered());

      onEmbedReady(reportId, embed);
      setEmbedded(true);
    };

    initEmbed();

    return () => {
      if (embedInstance.current) {
        embedInstance.current.off("rendered");
      }
    };
  }, [data, embedded, reportId, onEmbedReady, onRendered]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 bg-background h-full w-full transition-opacity duration-500",
        isVisible ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none",
      )}
    />
  );
};

const ReportViewer = ({ report, isFavorite }: ReportViewerProps) => {
  // AJUSTE: O loader principal também observa a Store Global
  const { isLoading: isApiLoading } = useReportDetails(report?.id);
  const [isRendering, setIsRendering] = useState(false);
  const [visitedIds, setVisitedIds] = useState<string[]>([]);
  const embedsRef = useRef<Map<string, Report>>(new Map());

  useEffect(() => {
    if (!report?.id) return;
    setIsRendering(!visitedIds.includes(report.id));
  }, [report?.id, visitedIds]);

  useLayoutEffect(() => {
    if (report?.id) {
      setVisitedIds((prev) =>
        prev.includes(report.id!) ? prev : [...prev, report.id!],
      );
    }
  }, [report?.id]);

  const handleEmbedReady = useCallback((reportId: string, embed: any) => {
    embedsRef.current.set(reportId, embed);
  }, []);

  const handleRendered = useCallback(() => {
    setIsRendering(false);
  }, []);

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

  const showLoader = isApiLoading || isRendering;

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
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden bg-background">
        <AnimatePresence>
          {showLoader && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background"
            >
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                Carregando...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {visitedIds.map((id) => (
          <ReportEmbed
            key={id}
            reportId={id}
            isVisible={id === report.id}
            onEmbedReady={handleEmbedReady}
            onRendered={handleRendered}
          />
        ))}
      </div>
    </div>
  );
};

export default ReportViewer;
