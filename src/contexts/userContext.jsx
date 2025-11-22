"use client"; // Only needed in /app directory, can be removed for /pages

import { useRouter } from "next/router";
import React, { createContext, useState, useEffect, useContext } from "react";

const UserAuthContext = createContext();

export function UserAuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage (client-side only)
  useEffect(() => {
    const savedUser =
      typeof window !== "undefined" && localStorage.getItem("user");
    const savedToken =
      typeof window !== "undefined" && localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  // Example login
  const login = async (userData, token) => {
    // Here, replace with your API call
    setUser(userData);
    setToken(token);
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  // logout
  const logout = () => {
    // Set flag to prevent error toasts during logout
    if (typeof window !== "undefined") {
      localStorage.setItem("isLoggingOut", "true");
    }
    
    setUser(null);
    setToken(null);
    
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      // Use replace instead of push to avoid adding to history
      router.replace("/");
      // Clear the flag after a short delay
      setTimeout(() => {
        localStorage.removeItem("isLoggingOut");
      }, 1000);
    }
  };

  const isAuthenticated = () => {
    return !!token;
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        token,
        isAuthenticated,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

// Custom hook for using auth context
export const useAuth = () => useContext(UserAuthContext);
