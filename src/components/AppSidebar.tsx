import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Phone,
  Shield,
  Calendar,
  Users,
  Database,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Circle,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Menu,
  PhoneIncoming,
  PhoneOutgoing,
  Network,
  LucideIcon,
} from "lucide-react";

interface SidebarProps {
  onNavigate: (
    page:
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
      | "bulk-import",
    url?: string,
    title?: string
  ) => void;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
}
interface ProcessStatus {
  id: string;
  name: string;
  status: string;
  icon: LucideIcon;
  url?: string;
  target?: string;
  action?: () => void;
}

export function AppSidebar({
  onNavigate,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const [hovering, setHovering] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Expand sidebar when mouse is near left edge
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (e.clientX < 32 && isCollapsed) {
        setHovering(true);
        setIsCollapsed(false);
      }
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isCollapsed, setIsCollapsed]);

  // Collapse sidebar when a button is clicked
  const handleProcessClick = (process: ProcessStatus) => {
    if (process.url && process.target === "_blank") {
      window.open(process.url, "_blank");
    } else if (process.action) {
      process.action();
    } else if (process.url) {
      onNavigate("external", process.url, process.name);
    }
  };

  // Toggle sidebar manually
  const handleToggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
    setHovering(false);
  };

  const [processes, setProcesses] = useState<ProcessStatus[]>([
    {
      id: "pp-chat",
      name: "PP Chat",
      status: "complete",
      icon: MessageCircle,
      url: "https://www.pepsicopartners.com/pepsico/en/USD/contact/chat",
      target: "_blank",
    },
    {
      id: "twilio-flex",
      name: "Twilio Flex",
      status: "complete",
      icon: Phone,
      url: "https://flex.twilio.com/saffron-gorilla-9342",
      target: "_blank",
    },
    {
      id: "api-validation",
      name: "API Validation",
      status: "complete",
      icon: Shield,
      action: () => onNavigate("api-validation"),
    },
    {
      id: "aws-scheduler",
      name: "AWS Scheduler",
      status: "complete",
      icon: Calendar,
      action: () => onNavigate("aws-scheduler"),
    },
    {
      id: "agent-skills",
      name: "Agent Skill Reset",
      status: "complete",
      icon: Users,
      action: () => console.log("Agent skill reset"),
    },
    {
      id: "bulk-import",
      name: "Bulk Import",
      status: "complete",
      icon: Database,
      action: () => onNavigate("bulk-import"),
    },
    {
      id: "queue-status",
      name: "Queues Status",
      status: "complete",
      icon: Users,
      action: () => onNavigate("queues-status"),
    },
    {
      id: "campaign-status",
      name: "Campaign Status",
      status: "complete",
      icon: RefreshCw,
      action: () => onNavigate("campaign-status"),
    },
    {
      id: "today-records",
      name: "Today's Records",
      status: "complete",
      icon: BarChart3,
      action: () => onNavigate("home"),
    },
    {
      id: "past-records",
      name: "Past Records",
      status: "complete",
      icon: Database,
      action: () => onNavigate("past-records"),
    },
    {
      id: "inbound",
      name: "Inbound Architecture",
      status: "complete",
      icon: PhoneIncoming,
      action: () => onNavigate("inbound"),
    },
    {
      id: "outbound",
      name: "Outbound Architecture",
      status: "complete",
      icon: PhoneOutgoing,
      action: () => onNavigate("outbound"),
    },
    {
      id: "gdf",
      name: "GDF Architecture",
      status: "complete",
      icon: MessageCircle,
      action: () => onNavigate("gdf"),
    },
  ]);

  const getStatusIcon = (process: ProcessStatus) => {
    if (
      process.id === "inbound" ||
      process.id === "outbound" ||
      process.id === "gdf"
    ) {
      return <Network className="w-5 h-5 text-blue-700 dark:text-blue-400" />;
    }
    switch (process.status) {
      case "complete":
        return (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_4px_#32FF6A] dark:text-emerald-300" />
        );
      case "pending":
        return (
          <AlertCircle className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
        );
      case "error":
        return <Circle className="w-3 h-3 text-red-600 dark:text-red-400" />;
      default:
        return <Circle className="w-3 h-3 text-gray-500 dark:text-gray-400" />;
    }
  };

  function toggleProcessStatus(processId: string) {
    setProcesses((prev) =>
      prev.map((p) =>
        p.id === processId
          ? { ...p, status: p.status === "complete" ? "pending" : "complete" }
          : p
      )
    );
  }

  return (
    <div
      ref={sidebarRef}
      className={`relative flex flex-col border-r bg-amber-50 dark:bg-gray-900 overflow-hidden transition-[width] duration-400 ease-in-out ${
        isCollapsed ? "w-14" : "w-56"
      }`}
      style={{ minHeight: "100vh" }}
      onMouseLeave={() => {
        if (hovering) setIsCollapsed(true);
        setHovering(false);
      }}
    >
      {/* Toggle Button (always visible) */}
      <button
        onClick={handleToggleSidebar}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`absolute top-3 z-20 p-1 rounded-full shadow transition-colors ${
          isCollapsed
            ? "left-2 bg-white/80 hover:bg-white"
            : "right-3 bg-gray-200/70 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        }`}
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5 text-blue-600" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        )}
      </button>

      {/* Header */}
      <div className="flex items-center justify-start h-14 px-4 border-b border-amber-100 dark:border-gray-700">
        <h1
          className={`text-lg font-semibold text-black dark:text-gray-200 transition-all duration-300 origin-left ${
            isCollapsed
              ? "opacity-0 -translate-x-4 scale-95 pointer-events-none"
              : "opacity-100 translate-x-0 scale-100"
          }`}
        >
          Processes
        </h1>
      </div>

      {/* Items */}
      <div className="flex-1 p-2 space-y-1">
        {processes.map((process) => {
          const IconComponent = process.icon;
          const showStatus = !isCollapsed;
          return (
            <button
              key={process.id}
              onClick={() => handleProcessClick(process)}
              className="group w-full flex items-center justify-between px-2 py-2 rounded-md hover:bg-rose-200 dark:hover:bg-gray-700 transition-colors"
              tabIndex={0}
            >
              <div className="flex items-center min-w-0">
                <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span
                  className={`ml-2 text-xs font-medium text-black dark:text-gray-200 whitespace-nowrap transition-all duration-300 ${
                    isCollapsed
                      ? "opacity-0 -translate-x-3 w-0 overflow-hidden"
                      : "opacity-100 translate-x-0 w-auto"
                  }`}
                >
                  {process.name}
                </span>
              </div>
              <div
                className={`transition-all duration-300 ${
                  showStatus
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2 pointer-events-none"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleProcessStatus(process.id);
                }}
              >
                {getStatusIcon(process)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
