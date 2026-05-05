"use client";

import { ReportProps } from "@/core/domain/entities/report";
import { AnimatePresence, motion } from "framer-motion";
import { FileBarChart, Loader2, Star } from "lucide-react";
import type { Report } from "powerbi-client";
import { useCallback, useEffect, useRef, useState } from "react";
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
  onError,
}: any) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { report: data, loadReport } = useReportDetails(reportId);
  const [embedded, setEmbedded] = useState(false);
  const isInitializingPBI = useRef(false);

  useEffect(() => {
    const init = async () => {
      try {
        await loadReport(reportId);
      } catch (e) {
        window.location.href = "/login";
      }
    };
    if (reportId && !data) init();
  }, [reportId, loadReport, data]);

  useEffect(() => {
    const accessToken = data?.token || data?.accessToken;

    if (
      !containerRef.current ||
      !data?.embedUrl ||
      !accessToken ||
      embedded ||
      isInitializingPBI.current
    )
      return;

    let powerbiInstance: any;

    const initEmbed = async () => {
      try {
        isInitializingPBI.current = true;
        const pbi = await import("powerbi-client");
        const powerbi = new pbi.service.Service(
          pbi.factories.hpmFactory,
          pbi.factories.wpmpFactory,
          pbi.factories.routerFactory,
        );
        powerbiInstance = powerbi;

        const config = {
          type: "report",
          tokenType: pbi.models.TokenType.Embed,
          accessToken,
          embedUrl: data.embedUrl,
          uniqueId: data.externalId || data.id,
          permissions: pbi.models.Permissions.All,
          viewMode: pbi.models.ViewMode.View,
          settings: {
            filterPaneEnabled: false,
            navContentPaneEnabled: true,
            layoutType: pbi.models.LayoutType.Custom,
            customLayout: {
              displayOption: pbi.models.DisplayOption.FitToPage,
            },
            panes: {
              filters: {
                visible: false,
              },
              pageNavigation: {
                visible: true,
              },
            },
            bars: {
              statusBar: {
                visible: false,
              },
            },
          },
        };

        const embed = powerbi.embed(containerRef.current!, config);
        embed.on("rendered", () => onRendered());
        embed.on("error", (event: any) => {
          console.error("Power BI embed error:", event?.detail || event);
          onError?.();
        });
        onEmbedReady(reportId, embed);
        setEmbedded(true);
      } catch (error) {
        console.error("Power BI initialization error:", error);
        onError?.();
      } finally {
        isInitializingPBI.current = false;
      }
    };

    initEmbed();

    return () => {
      // Quando o usuário troca de relatório, o React desmonta este componente
      // e o código abaixo limpa o container do Power BI.
      if (powerbiInstance && containerRef.current) {
        powerbiInstance.reset(containerRef.current);
      }
      isInitializingPBI.current = false;
    };
  }, [data, reportId]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full overflow-hidden"
    />
  );
};

const ReportViewer = ({ report, isFavorite }: ReportViewerProps) => {
  const { isLoading: isApiLoading } = useReportDetails(report?.id);
  const [isRendering, setIsRendering] = useState(false);
  const [showTitle, setShowTitle] = useState(true);

  // Ref para guardar a instância atual do embed
  const embedRef = useRef<Report | null>(null);

  const handleEmbedReady = useCallback((reportId: string, embed: any) => {
    embedRef.current = embed;
  }, []);

  const handleRendered = useCallback(() => {
    setIsRendering(false);
  }, []);

  const handleEmbedError = useCallback(() => {
    setIsRendering(false);
  }, []);

  // Toda vez que o report mudar, resetamos o estado de renderização
  useEffect(() => {
    if (report?.id) {
      setIsRendering(true);
      setShowTitle(true);
    }
    const timer = setTimeout(() => {
      setShowTitle(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [report?.id]);

  if (!report) {
    return (
      <div className="pt-18 flex-1 flex items-center justify-center bg-muted/20 m-4 rounded-xl border-2 border-dashed text-center overflow-hidden">
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
    <div className="flex-1 flex flex-col h-full overflow-hidden pt-18 sm:pt-0">
      <AnimatePresence>
        {showTitle && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 44, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex items-center justify-between px-4 border-b bg-card shrink-0 overflow-hidden  backdrop-blur-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold truncate max-w-[400px]">
                {report.name}
              </h2>
              {isFavorite && (
                <Star className="w-3.5 h-3.5 fill-accent text-accent" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 relative overflow-hidden bg-background">
        <AnimatePresence>
          {showLoader && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background"
            >
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                Carregando...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Renderiza apenas o relatório ativo. O key={report.id} garante que o 
            componente seja destruído e recriado do zero ao trocar de relatório. */}
        <ReportEmbed
          key={report.id}
          reportId={report.id}
          isVisible={true}
          onEmbedReady={handleEmbedReady}
          onRendered={handleRendered}
          onError={handleEmbedError}
        />
      </div>
    </div>
  );
};

export default ReportViewer;
