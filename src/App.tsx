import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthModal from "./components/AuthModal";
import { PrivateRoute } from "./components/PrivateRoute";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import AdminDashboard from "./components/AdminDashboard";

const queryClient = new QueryClient();

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loggedInUserData, setLoggedInUserData] = useState<{ name: string; email: string } | null>(() => {
    const storedUserData = localStorage.getItem("loggedInUserData");
    return storedUserData ? JSON.parse(storedUserData) : null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = (userData: { name: string; email: string }) => {
    setLoggedInUserData(userData);
    localStorage.setItem("loggedInUserData", JSON.stringify(userData));
    navigate("/");
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("loggedInUserData");
    setLoggedInUserData(null);
    navigate("/login");
  };

  if (loading) {
    return <p>Loading application...</p>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route
            path="/login"
            element={
              <AuthModal
                isOpen={true}
                onClose={() => navigate("/")}
                initialMode="login"
                onLoginSuccess={handleLoginSuccess}
              />
            }
          />
          <Route
            path="/*"
            element={
              <PrivateRoute isAuthenticated={!!loggedInUserData}>
                <Index handleLogout={handleLogout} currentUser={loggedInUserData} />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
