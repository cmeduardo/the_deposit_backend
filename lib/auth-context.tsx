"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authApi, type Usuario } from "./api";

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVendedor: boolean;
  isCliente: boolean;
  login: (correo: string, contrasena: string) => Promise<void>;
  registro: (nombre: string, correo: string, contrasena: string) => Promise<void>;
  logout: () => void;
  actualizarPerfil: (data: Partial<Usuario>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async (storedToken: string) => {
    try {
      const user = await authApi.perfil(storedToken);
      setUsuario(user);
      setToken(storedToken);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUsuario(null);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      loadUser(storedToken).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [loadUser]);

  const login = async (correo: string, contrasena: string) => {
    const response = await authApi.login(correo, contrasena);
    localStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setUsuario(response.usuario);
  };

  const registro = async (nombre: string, correo: string, contrasena: string) => {
    const response = await authApi.registro(nombre, correo, contrasena);
    localStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setUsuario(response.usuario);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUsuario(null);
  };

  const actualizarPerfil = async (data: Partial<Usuario>) => {
    if (!token) throw new Error("No autenticado");
    const response = await authApi.actualizarPerfil(token, data);
    setUsuario(response.usuario);
  };

  const value: AuthContextType = {
    usuario,
    token,
    isLoading,
    isAuthenticated: !!usuario,
    isAdmin: usuario?.rol === "ADMINISTRADOR",
    isVendedor: usuario?.rol === "VENDEDOR",
    isCliente: usuario?.rol === "CLIENTE",
    login,
    registro,
    logout,
    actualizarPerfil,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
