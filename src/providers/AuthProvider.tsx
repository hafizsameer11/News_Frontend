"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { User } from "@/types/user.types";
import { tokenStorage } from "@/lib/helpers/storage";
import { authApi } from "@/lib/api/modules/auth.api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize with function to avoid hydration mismatch
  // On server, always null, on client, check localStorage
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(() => {
    // Only access localStorage on client side
    if (typeof window !== "undefined") {
      return tokenStorage.get();
    }
    return null;
  });

  useEffect(() => {
    // Load token from storage on mount (in case it changed)
    const storedToken = tokenStorage.get();
    let shouldUpdateToken = false;
    if (storedToken && storedToken !== token) {
      shouldUpdateToken = true;
    }

    // If we have a token but no user, fetch user profile
    if (storedToken && !user) {
      authApi
        .getMe()
        .then((response) => {
          if (response.data) {
            setUser(response.data);
          }
        })
        .catch((error) => {
          // Token might be invalid, clear it
          console.error("Failed to fetch user profile:", error);
          tokenStorage.remove();
          setToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => {
        setIsLoading(false);
      }, 0);
    }

    // Update token after other state updates - use setTimeout to defer
    if (shouldUpdateToken) {
      setTimeout(() => {
        setToken(storedToken);
      }, 0);
    }
  }, [token, user]);

  const login = (newToken: string, newUser: User) => {
    tokenStorage.set(newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    tokenStorage.remove();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

