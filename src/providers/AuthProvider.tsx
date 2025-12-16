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
  // Initialize loading based on whether we have a token (if token exists, we might need to fetch user)
  const [token, setToken] = useState<string | null>(() => {
    // Only access localStorage on client side
    if (typeof window !== "undefined") {
      return tokenStorage.get();
    }
    return null;
  });
  // Only set loading to true if we have a token (need to fetch user), otherwise false immediately
  const [isLoading, setIsLoading] = useState(() => {
    // If we have a token, we'll need to fetch user, so start loading
    // If no token, no need to load, set to false immediately
    if (typeof window !== "undefined") {
      const storedToken = tokenStorage.get();
      return !!storedToken; // Only loading if we have a token to verify
    }
    return false; // Server-side: no loading needed
  });

  useEffect(() => {
    // Only fetch user profile if we have a token but no user
    if (token && !user) {
      // Fetch user profile asynchronously (don't block UI)
      // Use requestIdleCallback or setTimeout to ensure router is ready first
      const fetchUser = () => {
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
            setUser(null);
          })
          .finally(() => {
            setIsLoading(false);
          });
      };

      // Use requestIdleCallback if available, otherwise setTimeout
      // This ensures the router and other critical initialization happens first
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        requestIdleCallback(fetchUser, { timeout: 100 });
      } else {
        setTimeout(fetchUser, 0);
      }
    } else {
      // No token or we have both token and user - set loading to false asynchronously
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [token, user]); // Run when token or user changes

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

