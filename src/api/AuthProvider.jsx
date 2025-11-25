import { useState } from "react";
import { AuthContext } from "./AuthContext";

export default function AuthProvider({ children }) {
  
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 🔥 Nueva propiedad: finca seleccionada
  const [selectedFinca, setSelectedFinca] = useState(() => {
    const savedFinca = localStorage.getItem("selectedFinca");
    return savedFinca ? JSON.parse(savedFinca) : null;
  });

  const login = (tokenValue, userData) => {
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(tokenValue);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("selectedFinca");

    setToken(null);
    setUser(null);
    setSelectedFinca(null);
  };

  // 🔥 Método para guardar la finca seleccionada
  const selectFinca = (finca) => {
    localStorage.setItem("selectedFinca", JSON.stringify(finca));
    setSelectedFinca(finca);
  };

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider 
      value={{ 
        token, 
        user, 
        selectedFinca,      // 🔥 se expone al contexto
        selectFinca,        // 🔥 método para actualizar
        login, 
        logout, 
        isLoggedIn 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}