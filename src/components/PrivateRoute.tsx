import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, isAuthenticated }) => {
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setFirebaseUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;
  return (firebaseUser || isAuthenticated) ? <>{children}</> : <Navigate to="/login" />;
};
