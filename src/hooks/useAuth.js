import { useContext } from "react";
import { AuthContext } from "../api/AuthContext";

export function useAuth() {
  return useContext(AuthContext);
}
