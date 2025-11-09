import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Transition } from "framer-motion";
import { X, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "./AuthModal.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: "login" | "signup";
  onLoginSuccess: (userData: { name: string; email: string }) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<"login">("login"); // force login only
  // Remove effect that changed mode
  // useEffect(() => { setMode(initialMode); }, [initialMode]);
  const [currentSubTextIndex, setCurrentSubTextIndex] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleGoogleSignIn = async () => {
    alert(
      "For enhanced security, Google and Microsoft authentication options are unavailable. Kindly reach out to your administrator or supervisor for login details."
    );
  };

  const handleMicrosoftSignIn = async () => {
    alert(
      "For enhanced security, Google and Microsoft authentication options are disabled. Kindly reach out to your administrator or supervisor for login details."
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted.");
    console.log("formData:", formData);
    try {
      if (mode === "login") {
        console.log("Login mode detected.");

        const emailNormalized = formData.email.trim().toLowerCase();
        const passwordNormalized = formData.password.trim().toLowerCase();

        const isEmailValid = emailNormalized.endsWith("@cognizant.com");
        const isPasswordValid = passwordNormalized === "ctsgmd";

        console.log("isEmailValid:", isEmailValid);
        console.log("isPasswordValid:", isPasswordValid);

        if (isEmailValid && isPasswordValid) {
          console.log("Authentication successful.");
          onLoginSuccess({
            name: "Cognizant User", // Placeholder name
            email: formData.email,
          });
        } else {
          console.log("Authentication failed.");
          alert(
            "Authentication failed. Please check your email and password and try again."
          );
        }
      } else {
        console.log("Signup mode detected. Not supported.");
        alert("Sign up is not supported with this authentication method.");
      }
    } catch (error: unknown) {
      console.error("Authentication error:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred.");
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const subTextVariants = {
    enter: { opacity: 0, y: 20 },
    center: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" } as Transition,
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.5, ease: "easeIn" } as Transition,
    },
  };

  const subTexts = [
    `Real-time insights for Genesys Cloud.
Monitor agent performance and queue status.
Track campaign progress and dialer records.
Ensure seamless customer interactions.`,
    `Optimizing Genesys Cloud operations through smart automation, seamless workflows, and intelligent control to maximize efficiency and scalability.`,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubTextIndex((prevIndex) => (prevIndex + 1) % subTexts.length);
    }, 7000); // Change text every 7 seconds
    return () => clearInterval(interval);
  }, [subTexts.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="auth-modal-backdrop"
        >
          <motion.div
            className="auth-container"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Left Section: Text and Animation */}
            <motion.div className="auth-left-section glassmorphism-panel">
              <motion.h1 className="auth-title">
                Genesys Monitoring Dashboard
              </motion.h1>
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentSubTextIndex}
                  className="auth-sub-text"
                  variants={subTextVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  {subTexts[currentSubTextIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            {/* Right Section: Login/Signup Form */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="auth-right-section glassmorphism-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-200">
                  {mode === "login" ? "Welcome Back" : "Join Us"}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Signup fields removed since signup disabled */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 auth-input"
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 auth-input"
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3"
                >
                  Login
                </Button>
              </form>

              {/* Removed the Sign Up toggle section */}
              {/* <div className="mt-6 text-center"> ... </div> */}

              <div className="mt-5 pt-5 border-t border-gray-700 flex flex-col space-y-3">
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center px-3 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700"
                >
                  <div className="google-icon-frame">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
                      alt="Google"
                      style={{ width: "20px", height: "20px" }}
                    />
                  </div>
                  Sign in with Google
                </button>
                <button
                  onClick={handleMicrosoftSignIn}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700"
                >
                  <img
                    src="https://www.logo.wine/a/logo/Microsoft_Store/Microsoft_Store-Logo.wine.svg"
                    alt="Microsoft"
                    className="h-6 w-6 mr-2"
                  />
                  Sign in with Microsoft
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
