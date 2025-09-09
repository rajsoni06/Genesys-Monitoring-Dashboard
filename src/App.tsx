import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GDF from "./components/GDF";
import { CampaignStatus } from "./components/CampaignStatus";
import { QueuesStatus } from "./components/QueuesStatus";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
            <Route
              path="/"
              element={<Index />}
            />
            <Route
              path="/home"
              element={<Index />}
            />
            <Route
              path="/aws-scheduler"
              element={<Index />}
            />
            <Route path="/inbound" element={<Index />} />
            <Route path="/outbound" element={<Index />} />
            <Route
              path="/api-validation"
              element={<Index />}
            />
            <Route
              path="/past-records"
              element={<Index />}
            />
            <Route path="/gdf" element={<Index />} />
            <Route
              path="/campaign-status"
              element={<Index />}
            />
            <Route
              path="/queues-status"
              element={<Index />}
            />
            <Route
              path="/bulk-import"
              element={<Index />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
