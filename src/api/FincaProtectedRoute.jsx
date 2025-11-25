import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function FincaProtectedRoute({ children }) {
  const { isLoggedIn, selectedFinca } = useAuth();

  // No logueado → login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Logueado pero sin finca → home
  if (!selectedFinca) {
    return <Navigate to="/" replace />;
  }

  return children;
}