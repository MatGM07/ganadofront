import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiGet } from "../api/api";

export default function FincaProtectedRoute({ children }) {
  const { isLoggedIn, selectedFinca, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    async function validate() {
      if (!isLoggedIn || !selectedFinca) {
        setLoading(false);
        setIsAllowed(false);
        return;
      }

      try {
        const finca = await apiGet(`/api/inventory/fincas/${selectedFinca.id}`);

        // ✅ Soporta ambas estructuras (local y Azure)
        const isMember = 
          // Si tiene miembros como array de objetos (local)
          finca.miembros?.some((m) => m.usuarioId === user.id) ||
          // Si tiene usuarioMiembroIds como array de strings (Azure)
          finca.usuarioMiembroIds?.includes(user.id) ||
          false;

        console.log("[FINCA ROUTE] Verificación de acceso:");
        console.log("- User ID:", user.id);
        console.log("- Miembros (objeto):", finca.miembros);
        console.log("- Miembros (IDs):", finca.usuarioMiembroIds);
        console.log("- Es miembro:", isMember);

        setIsAllowed(isMember);
      } catch (err) {
        console.error("Error validando finca:", err);
        setIsAllowed(false);
      } finally {
        setLoading(false);
      }
    }

    validate();
  }, [isLoggedIn, selectedFinca, user]);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div>Cargando acceso a finca...</div>;
  }

  if (!selectedFinca) {
    return <Navigate to="/" replace />;
  }

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return children;
}