import { useState, useEffect, useCallback } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { HomePage } from "@/components/HomePage";
import { APIValidation } from "@/components/APIValidation";
import { PastRecords } from "@/components/PastRecords";
import { Navbar } from "@/components/Navbar";
import { AWSScheduler } from "@/components/AWSScheduler";
import Inbound from "@/components/Inbound";
import Outbound from "@/components/Outbound";
import GDF from "@/components/GDF";
import { CampaignStatus } from "@/components/CampaignStatus";
import { QueuesStatus } from "@/components/QueuesStatus";
import { BulkImport } from "@/components/BulkImport";
import { fetchCampaignData, CampaignItem, CampaignStats } from "@/lib/fetchCampaignData";
import { useLocation, useNavigate } from "react-router-dom";

interface AWSSchedulerItem {
  id: string;
  name: string;
  status: "ENABLED" | "DISABLED";
}

interface SchedulerStats {
  total: number;
  enabled: number;
  disabled: number;
  percentEnabled: number;
}

type ActivePage =
  | "home"
  | "api-validation"
  | "past-records"
  | "aws-scheduler"
  | "inbound"
  | "outbound"
  | "gdf"
  | "external"
  | "campaign-status"
  | "queues-status"
  | "bulk-import";

interface DashboardState {
  activePage: ActivePage;
  externalUrl?: string;
  pageTitle?: string;
}

export const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    activePage: "aws-scheduler",
  });
  const [schedulerData, setSchedulerData] = useState<AWSSchedulerItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [schedulerStats, setSchedulerStats] = useState<SchedulerStats>({
    total: 0,
    enabled: 0,
    disabled: 0,
    percentEnabled: 0,
  });

  const [campaignData, setCampaignData] = useState<CampaignItem[]>([]);
  const [isCampaignLoading, setIsCampaignLoading] = useState<boolean>(true);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [campaignStats, setCampaignStats] = useState<CampaignStats>({
    total: 0,
    on: 0,
    off: 0,
    percentOn: 0,
  });

  const [queueData, setQueueData] = useState<QueueItem[]>([]);
  const [isQueueLoading, setIsQueueLoading] = useState<boolean>(true);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStats>({
    total: 0,
    active: 0,
    inactive: 0,
    percentActive: 0,
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.replace("/", "");
    const validPages: ActivePage[] = [
      "home",
      "api-validation",
      "past-records",
      "aws-scheduler",
      "inbound",
      "outbound",
      "gdf",
      "external",
      "campaign-status",
      "queues-status",
      "bulk-import",
    ];
    const newPage = validPages.includes(path as ActivePage)
      ? (path as ActivePage)
      : "home";
    setDashboardState((prev) => ({ ...prev, activePage: newPage }));
  }, [location.pathname]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/proxy/aws-scheduler");
      if (!res.ok) throw new Error("Failed to fetch AWS Scheduler data.");
      const data = await res.json();
      setSchedulerData(data.schedulerData || []);
      setSchedulerStats(
        data.schedulerStats || {
          total: 0,
          enabled: 0,
          disabled: 0,
          percentEnabled: 0,
        }
      );
    } catch (err: unknown) {
      setError((err as Error)?.message || "Error fetching AWS Scheduler data");
      setSchedulerData([]);
      setSchedulerStats({
        total: 0,
        enabled: 0,
        disabled: 0,
        percentEnabled: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchCampaignData = useCallback(async () => {
    setIsCampaignLoading(true);
    setCampaignError(null);
    try {
      const res = await fetch("/proxy/campaign-status");
      if (!res.ok) throw new Error("Failed to fetch Campaign Status data.");
      const data = await res.json();
      setCampaignData(data.campaignData || []);
      setCampaignStats(
        data.campaignStats || {
          total: 0,
          on: 0,
          off: 0,
          percentOn: 0,
        }
      );
    } catch (err: unknown) {
      setCampaignError((err as Error)?.message || "Error fetching Campaign Status data");
      setCampaignData([]);
      setCampaignStats({
        total: 0,
        on: 0,
        off: 0,
        percentOn: 0,
      });
    } finally {
      setIsCampaignLoading(false);
    }
  }, []);

  const fetchQueuesData = useCallback(async () => {
    setIsQueueLoading(true);
    setQueueError(null);
    try {
      const { queues: fetchedQueues, stats: fetchedStats } = await fetchQueueData();
      setQueueData(fetchedQueues);
      setQueueStats(fetchedStats);
    } catch (err: unknown) {
      setQueueError((err as Error)?.message || "Error fetching Queue Status data");
      setQueueData([]);
      setQueueStats({
        total: 0,
        active: 0,
        inactive: 0,
        percentActive: 0,
      });
    } finally {
      setIsQueueLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dashboardState.activePage === "aws-scheduler") {
      fetchData();
    } else if (dashboardState.activePage === "campaign-status") {
      fetchCampaignData();
    } else if (dashboardState.activePage === "queues-status") {
      fetchQueuesData();
    }
  }, [dashboardState.activePage, fetchData, fetchCampaignData, fetchQueuesData]);

  const handleNavigate = (page: ActivePage, url?: string, title?: string) => {
    if (page === "external") {
      setDashboardState({
        activePage: page,
        externalUrl: url,
        pageTitle: title,
      });
    } else {
      setDashboardState({
        activePage: page,
        externalUrl: url,
        pageTitle: title,
      });
      navigate(page === 'home' ? '/' : `/${page}`);
    }
  };

  const renderContent = () => {
    switch (dashboardState.activePage) {
      case "home":
        return <HomePage />;
      case "api-validation":
        return <APIValidation />;
      case "past-records":
        return <PastRecords />;
      case "aws-scheduler":
        return (
          <AWSScheduler
            schedulerData={schedulerData}
            schedulerStats={schedulerStats}
            isLoading={isLoading}
            error={error}
          />
        );
      case "inbound":
        return <Inbound />;
      case "outbound":
        return <Outbound />;
      case "gdf":
        return <GDF />;
      case "campaign-status":
        return (
          <CampaignStatus
            campaignData={campaignData}
            campaignStats={campaignStats}
            isLoading={isCampaignLoading}
            error={campaignError}
            onRetry={fetchCampaignData}
          />
        );
      case "queues-status":
        return (
          <QueuesStatus
            queueData={queueData}
            queueStats={queueStats}
            isLoading={isQueueLoading}
            error={queueError}
            onRetry={fetchQueuesData}
          />
        );
      case "bulk-import":
        return (
          <BulkImport
            queueData={queueData}
            queueStats={queueStats}
            isLoading={isQueueLoading}
            error={queueError}
            onRetry={fetchQueuesData}
          />
        );
      case "external":
        return dashboardState.externalUrl ? (
          <iframe
            src={dashboardState.externalUrl}
            className="w-full h-full border-0 rounded-none"
            title={dashboardState.pageTitle || "External Content"}
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        ) : (
          <div className="text-sm text-red-500 p-2 bg-red-100 dark:bg-red-900/30 rounded-md">
            Invalid or missing external URL
          </div>
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <SidebarProvider>
      <div
        className="flex w-full h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#2563eb] overflow-x-hidden text-white"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <AppSidebar
          onNavigate={handleNavigate}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Navbar setIsSidebarCollapsed={setIsSidebarCollapsed} />
          <main
            className={
              dashboardState.activePage === "external"
                ? "flex-1 h-full w-full overflow-hidden m-0 p-0 bg-transparent rounded-none"
                : "flex-1 h-full w-full px-2 py-2 sm:px-6 sm:py-4 bg-white/5 rounded-tl-2xl overflow-hidden"
            }
          >
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
