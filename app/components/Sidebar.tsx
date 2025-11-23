"use client";

import { useState } from "react";
import UserSelector from "./UserSelector";
import FilterPanel, { FilterOptions } from "./FilterPanel";
import { User } from "@/types";

interface SidebarProps {
  users: User[];
  currentUserId: number | null;
  onUserChange: (userId: number) => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}

export default function Sidebar({
  users,
  currentUserId,
  onUserChange,
  filters,
  onFiltersChange,
  className = "",
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-full w-80 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${className}`}
        style={{ height: "100vh" }}
      >
        <div className="p-6 space-y-8">
          {/* User Selector */}
          {users.length > 0 && currentUserId && (
            <div className="space-y-2">
              <UserSelector
                users={users}
                currentUserId={currentUserId}
                onUserChange={onUserChange}
              />
            </div>
          )}

          {/* Filter Panel */}
          <div className="space-y-2">
            <FilterPanel
              users={users}
              filters={filters}
              onFiltersChange={onFiltersChange}
              isOpen={isFilterOpen}
              onToggle={() => setIsFilterOpen(!isFilterOpen)}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
