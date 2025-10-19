"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Admin = {
  username: string;
  email?: string;
  token?: string;
};

type AuthContextType = {
  admin: Admin | null;
  token: string | null;
  isLoggedIn: boolean;
  setAdmin: (admin: Admin | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedAdmin = localStorage.getItem("admin");

    if (storedToken) setToken(storedToken);
    if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setAdmin(null);
    setToken(null);
    window.location.href = "/auth/login";
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isLoggedIn: !!token, // ✅ added this
        setAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
