"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Admin = {
  id?: number;
  username: string;
  name?: string;
  email?: string;
  role?: string;       // 'admin' | 'superadmin'
  adminToken?: string; // raw DB token (for instance API calls)
  token?: string;      // JWT (for dashboard/payment/superadmin calls)
};

type AuthContextType = {
  admin: Admin | null;
  token: string | null;      // JWT
  isLoggedIn: boolean;
  isSuperAdmin: boolean;
  setAdmin: (admin: Admin | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdminState] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedAdmin = localStorage.getItem("admin");
    if (storedToken) setToken(storedToken);
    if (storedAdmin) {
      try { setAdminState(JSON.parse(storedAdmin)); } catch {}
    }
  }, []);

  const setAdmin = (a: Admin | null) => {
    setAdminState(a);
    if (a) {
      localStorage.setItem("admin", JSON.stringify(a));
    } else {
      localStorage.removeItem("admin");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setAdminState(null);
    setToken(null);
    window.location.href = "/auth/login";
  };

  return (
    <AuthContext.Provider value={{
      admin,
      token,
      isLoggedIn:   !!token,
      isSuperAdmin: admin?.role === "superadmin",
      setAdmin,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
