import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthModal from "./components/AuthModal";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: '', email: '' });

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser({ name: '', email: '' });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!isAuthenticated ? (
          <AuthModal
            isOpen={true}
            onClose={() => {}}
            initialMode="login"
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <Routes>
            <Route
              path="/*"
              element={<Index handleLogout={handleLogout} currentUser={currentUser} />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
