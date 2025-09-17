import { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  ChevronDown,
  ExternalLink,
  User,
  Network,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { ActivePage } from "./Dashboard";

interface CustomDropdownProps {
  title: string;
  children: React.ReactNode;
}

function CustomDropdown({ title, children }: CustomDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button className="rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 h-8 hover:border-cyan-500">
              <span className="text-sm font-medium text-black dark:text-gray-200">
                {title}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform duration-300 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 bg-amber-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-600 shadow-md"
          align="end"
        >
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const UnderDevelopmentModal: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-card p-6 rounded-lg shadow-lg text-center max-w-sm mx-auto">
        <h3 className="text-xl font-bold text-white mb-4">
          Feature Under Development
        </h3>
        <p className="text-gray-300 mb-6">
          This feature is currently under development and will be available
          soon.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

interface NavbarProps {
  setIsSidebarCollapsed: (
    value: boolean | ((prev: boolean) => boolean)
  ) => void;
  handleLogout: () => void;
  handleNavigate: (page: ActivePage, url?: string, title?: string) => void;
}

export function Navbar({ setIsSidebarCollapsed, handleLogout, handleNavigate }: NavbarProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [pocOpen, setPocOpen] = useState(false);
  const [showUnderDevelopmentModal, setShowUnderDevelopmentModal] =
    useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    if (!isDarkMode) {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const quickLinks = [
    {
      name: "AWS Home Page",
      url: "https://us-east-1.console.aws.amazon.com/console/home?region=us-east-1#",
    },
    {
      name: "ServiceNow Home",
      url: "https://pepsico.service-now.com/now/nav/ui/home",
    },
    {
      name: "Current Incidents",
      url: "https://pepsico.service-now.com/now/nav/ui/classic/params/target/incident_list.do",
    },
    {
      name: "GDF Home Page",
      url: "https://conversational-agents.cloud.google.com/projects",
    },
    {
      name: "Genesys Queues",
      url: "https://apps.usw2.pure.cloud/directory/#/admin/admin/organization/_queuesV2",
    },
    {
      name: "KB Articles SharePoint",
      url: "https://cognizantonline.sharepoint.com/:f:/r/sites/PepsiCoGenesysmigrationCognizant/Shared%20Documents/General/KB%20articles/KB%20Articles%202025",
    },
    {
      name: "Genesys Cloud",
      url: "https://apps.usw2.pure.cloud/directory/#/admin/welcomeV2",
    },
    {
      name: "Genesys Support",
      url: "https://genesys.my.site.com/customercare",
    },
    {
      name: "Genesys Resource Center",
      url: "https://help.mypurecloud.com/",
    },
    {
      name: "PureInsights Status",
      url: "https://status.mypureinsights.com/?subscription_confirmed=true#",
    },
  ];

  const pocData = [
    { name: "Naveen Kumar, Pantamvari", month: "July" },
    { name: "Belthangadi, Bhavya", month: "August" },
    { name: "K, Sreenivasulu", month: "September" },
    { name: "Santhosh, Agnello", month: "October" },
    { name: "KK", month: "November" },
    { name: "P, Saranya", month: "December" },
  ];

  const monthMap = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };

  const currentMonthName = new Date().toLocaleString("en-US", {
    month: "long",
  });
  const currentPOCIndex = pocData.findIndex(
    (p) => p.month === currentMonthName
  );
  const currentPOC = pocData[currentPOCIndex] || pocData[0];
  const upcomingPOCs =
    currentPOCIndex >= 0
      ? pocData
          .slice(currentPOCIndex + 1)
          .concat(pocData.slice(0, currentPOCIndex))
      : pocData.slice(1);

  return (
    <>
      <nav className="h-14 bg-amber-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
        {/* Left Section: Sidebar Trigger and Logo */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />
          <button
            onClick={() => handleNavigate("home")}
            className="rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            aria-label="Go to Home Page"
          >
            <div
              className="flex items-center gap-2 px-2 py-1 rounded-lg h-8 hover:border-cyan-500 border border-gray-200 dark:border-gray-600"
              style={{
                background: "linear-gradient(90deg, #2563eb 0%, #1e293b 100%)",
              }}
            >
              <div
                className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center border-2 border-white shadow"
                style={{
                  background:
                    "linear-gradient(135deg, #2563eb 0%, #0f172a 100%)",
                }}
              >
                <img
                  src="/Genesys_Cloud_Logo.png"
                  alt="HCD Logo"
                  className="w-7 h-7 object-cover rounded-full"
                />
              </div>
              <span className="text-xl font-bold text-white drop-shadow-neon">
                GMD
              </span>
              <span className="text-sm text-gray-100 hidden sm:block font-semibold">
                Genesys Monitoring Dashboard
              </span>
            </div>
          </button>
        </div>

        {/* Right Section: Navigation Links and Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Home Link */}
          <a
            href="/"
            className="rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center gap-2 px-2 py-1 bg-amber-50 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 h-8 hover:border-cyan-500">
              <span className="text-sm font-medium text-black dark:text-gray-200">
                Home
              </span>
            </div>
          </a>
          {/* Architect Dropdown */}
          <CustomDropdown title="Architecture">
            <DropdownMenuItem asChild>
              <button
                onClick={() => handleNavigate("inbound")}
                className="flex items-center justify-between w-full px-1 py-1 text-sm text-black dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-gray-700 cursor-pointer rounded-md"
              >
                Inbound Architecture
                <Network className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button
                onClick={() => handleNavigate("outbound")}
                className="flex items-center justify-between w-full px-1 py-1 text-sm text-black dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-gray-700 cursor-pointer rounded-md"
              >
                Outbound Architecture
                <Network className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button
                onClick={() => handleNavigate("gdf")}
                className="flex items-center justify-between w-full px-1 py-1 text-sm text-black dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-gray-700 cursor-pointer rounded-md"
              >
                GDF Architecture
                <Network className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              </button>
            </DropdownMenuItem>
          </CustomDropdown>

          {/* Quick Links Dropdown */}
          <CustomDropdown title="Quick Links">
            {quickLinks.map((link, index) => (
              <DropdownMenuItem key={index} asChild>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full px-2 py-1 text-sm text-black dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  {link.name}
                  <ExternalLink className="w-3 h-3 text-blue-700 dark:text-blue-400" />
                </a>
              </DropdownMenuItem>
            ))}
          </CustomDropdown>

          {/* POC Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setPocOpen(true)}
            onMouseLeave={() => setPocOpen(false)}
          >
            <DropdownMenu open={pocOpen} onOpenChange={setPocOpen}>
              <DropdownMenuTrigger asChild>
                <button className="rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-2 px-2 py-1 bg-amber-50 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-400 h-8 hover:border-cyan-500">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-black dark:text-gray-200">
                      POC
                    </span>
                    <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 bg-amber-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-600 shadow-md"
                align="end"
              >
                <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-600">
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">
                    Current POC
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-black dark:text-gray-200">
                      {currentPOC.name}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {currentPOC.month} 2025
                    </span>
                  </div>
                </div>
                <div className="px-2 py-2">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                    Upcoming POCs
                  </p>
                  <div className="space-y-1">
                    {upcomingPOCs.map((poc) => (
                      <div
                        key={poc.name + poc.month}
                        className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-400 last:border-b-0"
                      >
                        <span className="text-sm text-black dark:text-gray-200">
                          {poc.name}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {poc.month}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            <div className="p-2 bg-amber-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 h-8 flex items-center hover:border-cyan-500">
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-yellow-500 dark:text-yellow-300" />
              ) : (
                <Moon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </div>
          </button>
          {/* Profile Section */}
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full w-9 h-9 flex items-center justify-center bg-amber-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                  <User className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-40 bg-amber-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-600 shadow-md"
                align="end"
              >
                <DropdownMenuItem asChild>
                  <button
                    onClick={() => handleNavigate("profile")}
                    className="flex items-center justify-between px-4 py-1 text-sm text-black dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-gray-700 cursor-pointer rounded-md w-auto"
                  >
                    Profile
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center justify-between px-4 py-1 text-sm text-black dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-gray-700 cursor-pointer rounded-md w-auto"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
      {showUnderDevelopmentModal && (
        <UnderDevelopmentModal
          onClose={() => setShowUnderDevelopmentModal(false)}
        />
      )}
    </>
  );
}