"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest } from "../api/apiClient";

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  locale: string;
  isEmailVerified?: boolean;
}

export interface OrgSummary {
  id: string;
  name: string;
  slug: string;
  tier: string;
  autonomyMode: string;
  role: string;
}

interface AuthContextType {
  user: UserSummary | null;
  activeOrg: OrgSummary | null;
  organizations: OrgSummary[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (name: string, email: string, pass: string, orgName?: string, locale?: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<any>;
  resendVerification: (email: string) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, newPassword: string) => Promise<any>;
  switchOrg: (orgId: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  activeOrg: null,
  organizations: [],
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  loginWithGoogle: async () => {},
  register: async () => {},
  verifyEmail: async () => {},
  resendVerification: async () => {},
  forgotPassword: async () => {},
  resetPassword: async () => {},
  switchOrg: async () => {},
  logout: () => {},
  refreshUserData: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [activeOrg, setActiveOrg] = useState<OrgSummary | null>(null);
  const [organizations, setOrganizations] = useState<OrgSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthPayload = async (res: any) => {
    if (res.accessToken) {
      localStorage.setItem("omniagent_token", res.accessToken);
    }
    if (res.refreshToken) {
      localStorage.setItem("omniagent_refresh_token", res.refreshToken);
    }
    if (res.activeOrganization) {
      localStorage.setItem("omniagent_active_org", res.activeOrganization.id);
      setActiveOrg(res.activeOrganization);
    }
    if (res.user) {
      setUser(res.user);
    }

    try {
      const orgs = await apiRequest<OrgSummary[]>("/organizations");
      setOrganizations(orgs);
    } catch {
      // ignore
    }
  };

  const initAuth = async () => {
    const token = localStorage.getItem("omniagent_token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await apiRequest<UserSummary>("/auth/me");
      setUser(userData);

      const orgs = await apiRequest<OrgSummary[]>("/organizations");
      setOrganizations(orgs);

      const savedOrgId = localStorage.getItem("omniagent_active_org");
      const matched = orgs.find((o) => o.id === savedOrgId) || orgs[0];
      if (matched) {
        setActiveOrg(matched);
      }
    } catch (e) {
      console.error("Auth initialization failed:", e);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await handleAuthPayload(res);
  };

  const loginWithGoogle = async (idToken: string) => {
    const locale = localStorage.getItem("omniagent_lang") || "uzl";
    const res = await apiRequest<any>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken, locale }),
    });
    await handleAuthPayload(res);
  };

  const register = async (fullName: string, email: string, password: string, organizationName?: string, locale?: string) => {
    const preferredLocale = locale || localStorage.getItem("omniagent_lang") || "uzl";
    const res = await apiRequest<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password, organizationName, locale: preferredLocale }),
    });
    await handleAuthPayload(res);
  };

  const verifyEmail = async (token: string) => {
    const res = await apiRequest<any>("/auth/email/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    if (user) {
      setUser({ ...user, isEmailVerified: true });
    }
    return res;
  };

  const resendVerification = async (email: string) => {
    return await apiRequest<any>("/auth/email/resend", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  };

  const forgotPassword = async (email: string) => {
    return await apiRequest<any>("/auth/password/forgot", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  };

  const resetPassword = async (token: string, newPassword: string) => {
    return await apiRequest<any>("/auth/password/reset", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  };

  const switchOrg = async (orgId: string) => {
    const res = await apiRequest<any>("/organizations/switch", {
      method: "POST",
      body: JSON.stringify({ organizationId: orgId }),
    });
    await handleAuthPayload(res);
  };

  const logout = () => {
    const refreshToken = localStorage.getItem("omniagent_refresh_token");
    if (refreshToken) {
      apiRequest("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    localStorage.removeItem("omniagent_token");
    localStorage.removeItem("omniagent_refresh_token");
    localStorage.removeItem("omniagent_active_org");
    setUser(null);
    setActiveOrg(null);
    setOrganizations([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeOrg,
        organizations,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        register,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        switchOrg,
        logout,
        refreshUserData: initAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
