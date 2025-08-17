import { useState, useEffect } from "react";
import {
  Shield,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";

export function APIValidation() {
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [token, setToken] = useState<string | null>(null);
  const [tokenJson, setTokenJson] = useState<any>(null);
  const [copyStatus, setCopyStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showTokenCopyToast, setShowTokenCopyToast] = useState<boolean>(false);
  const [showLinkCopyToast, setShowLinkCopyToast] = useState<boolean>(false);
  const [toastPosition, setToastPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [showJson, setShowJson] = useState<boolean>(false);

  const apiEndpoints = [
    {
      name: "Get_Token",
      url: "https://apps.usw2.pure.cloud/directory/#/admin/integrations/actions/custom_-_59f20d6d-1744-4dc4-8094-fdb093f2a234/summary",
      status: "success",
    },
    {
      name: "Sales_GetCustomerbyCOF",
      url: "https://apps.usw2.pure.cloud/directory/#/admin/integrations/actions/custom_-_59f20d6d-1744-4dc4-8094-fdb093f2a234/summary",
      status: "success",
    },
  ];

  const fetchToken = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/proxy/token");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTokenJson(data);
      if (!data.access_token && !data.error) {
        throw new Error("No access_token in response");
      }
      setToken(data.error ? null : data.access_token);
      setHistory((prev) => [
        ...prev,
        data.error ? "Token fetch failed" : "Token fetched",
      ]);
      setCurrentIndex((prev) => prev + 1);
    } catch (error: any) {
      setError(error.message || "Failed to fetch token");
      setToken(null);
      setTokenJson(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAPITest = (endpoint: (typeof apiEndpoints)[0]) => {
    if (endpoint.name === "Get_Token") {
      fetchToken();
    } else {
      setHistory((prev) => [...prev, endpoint.url]);
      setCurrentIndex((prev) => prev + 1);
      window.open(endpoint.url, "_blank");
    }
  };

  const handleCopyToken = (e: React.MouseEvent) => {
    if (token) {
      navigator.clipboard
        .writeText(token)
        .then(() => {
          setShowTokenCopyToast(true);
          setCopyStatus("Copied!");
          setToastPosition({
            top:
              (e.target as HTMLElement).getBoundingClientRect().top +
              window.scrollY -
              40,
            left:
              (e.target as HTMLElement).getBoundingClientRect().left +
              window.scrollX +
              20,
          });
          setTimeout(() => {
            setShowTokenCopyToast(false);
            setCopyStatus("");
            setToastPosition(null);
          }, 2000);
        })
        .catch((err) => console.error("Copy failed:", err));
    }
  };

  const handleCopyJson = (e: React.MouseEvent) => {
    if (tokenJson) {
      navigator.clipboard
        .writeText(JSON.stringify(tokenJson, null, 2))
        .then(() => {
          setShowTokenCopyToast(true);
          setCopyStatus("JSON Copied!");
          setToastPosition({
            top:
              (e.target as HTMLElement).getBoundingClientRect().top +
              window.scrollY -
              40,
            left:
              (e.target as HTMLElement).getBoundingClientRect().left +
              window.scrollX +
              20,
          });
          setTimeout(() => {
            setShowTokenCopyToast(false);
            setCopyStatus("");
            setToastPosition(null);
          }, 2000);
        })
        .catch((err) => console.error("Copy failed:", err));
    }
  };

  const handleCopyLink = (url: string, e: React.MouseEvent) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setShowLinkCopyToast(true);
        setToastPosition({
          top:
            (e.target as HTMLElement).getBoundingClientRect().top +
            window.scrollY -
            40,
          left:
            (e.target as HTMLElement).getBoundingClientRect().left +
            window.scrollX +
            20,
        });
        setTimeout(() => {
          setShowLinkCopyToast(false);
          setToastPosition(null);
        }, 2000);
      })
      .catch((err) => console.error("Copy failed:", err));
  };

  useEffect(() => {
    // For debugging
    // console.log("Token updated in state:", token);
  }, [token]);

  return (
    <div
      className="min-h-screen p-4 font-sans"
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #2563eb 100%)",
      }}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="glassmorphism p-5 rounded-xl shadow-xl border border-cyan-500/20 flex items-center gap-4 mb-2">
          <Shield className="w-10 h-10 text-cyan-400 animate-pulse-slow" />
          <div>
            <h1 className="text-2xl font-bold font-sans tracking-tight">
              API Validation Center
            </h1>
            <p className="text-gray-300 text-base">
              Securely test and validate API endpoints for Genesys Cloud
              integrations
            </p>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apiEndpoints.map((endpoint, index) => (
            <div
              key={index}
              className="glassmorphism p-4 rounded-xl shadow-xl border border-cyan-500/20 hover:bg-cyan-900/10 transition-all duration-300"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold font-sans">
                    {endpoint.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {endpoint.status === "success" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400 animate-pulse" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-400 animate-pulse" />
                    )}
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  {endpoint.name === "Get_Token" &&
                    "Retrieve authentication token for API access"}
                  {endpoint.name === "Sales_GetCustomerbyCOF" &&
                    "Retrieve customer information for sales operations"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAPITest(endpoint)}
                    className="flex-1 flex items-center justify-center gap-2 px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-sm min-w-[90px] max-w-[120px]"
                    disabled={isLoading && endpoint.name === "Get_Token"}
                  >
                    <span>
                      {isLoading && endpoint.name === "Get_Token"
                        ? "Loading..."
                        : "Test API"}
                    </span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  {endpoint.name === "Get_Token" && (
                    <button
                      onClick={handleCopyToken}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg min-w-[40px] max-w-[80px]"
                      title="Copy Token"
                      disabled={!token}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                  {endpoint.name === "Sales_GetCustomerbyCOF" && (
                    <button
                      onClick={(e) => handleCopyLink(endpoint.url, e)}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg min-w-[40px] max-w-[80px]"
                      title="Copy Link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {endpoint.name === "Get_Token" && (
                  <div className="mt-2 p-3 bg-gray-800 rounded-xl border border-cyan-500/20 overflow-auto max-h-40 flex flex-col gap-2">
                    {error ? (
                      <span className="text-xs text-red-400 font-mono">
                        {error}
                      </span>
                    ) : token ? (
                      <span className="text-xs text-white font-mono break-words whitespace-pre-wrap">
                        {token}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 font-mono">
                        No token fetched yet
                      </span>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleCopyToken}
                        className="flex items-center gap-1 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-xs"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Token
                      </button>
                      <button
                        onClick={() => setShowJson((prev) => !prev)}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-xs"
                      >
                        {showJson ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        See JSON
                      </button>
                      {showJson && (
                        <button
                          onClick={handleCopyJson}
                          className="flex items-center gap-1 px-3 py-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg text-xs"
                        >
                          <Copy className="w-4 h-4" />
                          Copy JSON
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {endpoint.name === "Get_Token" && showJson && tokenJson && (
                  <div className="mt-2 p-3 bg-gray-900 rounded-xl border border-cyan-500/20 overflow-auto max-h-52">
                    <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap break-words">
                      {JSON.stringify(tokenJson, null, 2)}
                    </pre>
                  </div>
                )}
                <div className="text-xs text-gray-500 uppercase tracking-wide mt-2">
                  Status: <span className="text-green-400">Active</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Test Results */}
        <div className="glassmorphism p-4 rounded-xl shadow-xl border border-cyan-500/20">
          <h3 className="text-lg font-semibold font-sans mb-2">
            Recent API Tests
          </h3>
          {history.length === 0 ? (
            <p className="text-gray-400 text-center py-2 text-sm">
              No API tests performed yet. Click on any endpoint above to begin
              testing.
            </p>
          ) : (
            <div className="space-y-2">
              {history.slice(-5).map((url, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-cyan-900/20 rounded-lg shadow-md hover:bg-cyan-900/30 transition-all duration-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-white flex-1 truncate font-mono">
                    {url}
                  </span>
                  <span className="text-xs text-white font-bold">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toasts */}
        {showTokenCopyToast && toastPosition && (
          <div
            className="fixed bg-green-600 text-white px-3 py-1 rounded-md shadow-lg animate-fade-in-out z-50"
            style={{
              top: `${toastPosition.top}px`,
              left: `${toastPosition.left}px`,
            }}
          >
            {copyStatus || "Token copied!"}
          </div>
        )}
        {showLinkCopyToast && toastPosition && (
          <div
            className="fixed bg-green-600 text-white px-3 py-1 rounded-md shadow-lg animate-fade-in-out z-50"
            style={{
              top: `${toastPosition.top}px`,
              left: `${toastPosition.left}px`,
            }}
          >
            Link copied!
          </div>
        )}
      </div>
    </div>
  );
}

// CSS for fade animation and glassmorphism
const styles = `
  @keyframes fade-in-out {
    0% { opacity: 0; transform: translateY(10px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(10px); }
  }
  .animate-fade-in-out {
    animation: fade-in-out 2s ease-in-out forwards;
  }
  .glassmorphism {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 16px;
  }
  .animate-pulse-slow {
    animation: pulse 2.5s ease-in-out infinite;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);
