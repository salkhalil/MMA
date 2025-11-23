"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";

interface UserContextType {
  currentUserId: number | null;
  currentUser: User | null;
  users: User[];
  setCurrentUserId: (userId: number | null) => void;
  setUsers: (users: User[]) => void;
  loadingUsers: boolean;
  setLoadingUsers: (loading: boolean) => void;
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

  const currentUser = users.find((u) => u.id === currentUserId) || null;

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

