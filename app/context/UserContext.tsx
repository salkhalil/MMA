"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { User } from "@/types";

interface UserContextType {
  currentUserId: number | null;
  currentUser: User | null;
  users: User[];
  setCurrentUserId: (userId: number | null) => void;
  setUsers: (users: User[]) => void;
  loadingUsers: boolean;
  setLoadingUsers: (loading: boolean) => void;
  isAdmin: boolean;
  sessionExpired: boolean;
  verifyAndSetUser: (userId: number, password: string) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserIdState] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Set mounted flag after first render (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load user from localStorage on mount (client-side only)
  useEffect(() => {
    if (!mounted) return;
    
    const savedUserId = localStorage.getItem("currentUserId");
    if (savedUserId) {
      setCurrentUserIdState(parseInt(savedUserId));
    }
  }, [mounted]);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        setUsers(data);
      } catch (error: unknown) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Save user to localStorage when it changes
  const setCurrentUserId = (userId: number | null) => {
    setCurrentUserIdState(userId);
    if (userId !== null) {
      localStorage.setItem("currentUserId", userId.toString());
    } else {
      localStorage.removeItem("currentUserId");
    }
  };

  const [sessionExpired, setSessionExpired] = useState(false);

  const currentUser = users.find((u) => u.id === currentUserId) || null;
  const isAdmin = currentUser?.role === "ADMIN";

  // Check session validity on window focus
  const checkSession = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await fetch("/api/auth/check");
      if (res.status === 401) setSessionExpired(true);
    } catch { /* ignore network errors */ }
  }, [currentUserId]);

  useEffect(() => {
    checkSession();
    window.addEventListener("focus", checkSession);
    return () => window.removeEventListener("focus", checkSession);
  }, [checkSession]);

  const verifyAndSetUser = async (userId: number, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/verify-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });
      if (!res.ok) return false;
      setCurrentUserId(userId);
      setSessionExpired(false);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUserId,
        currentUser,
        users,
        setCurrentUserId,
        setUsers,
        loadingUsers,
        setLoadingUsers,
        isAdmin,
        sessionExpired,
        verifyAndSetUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

