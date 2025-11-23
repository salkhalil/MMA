'use client';

import { User } from '@/types';
import { useState } from 'react';

export interface FilterOptions {
  searchText: string;
  selectedViewerIds: number[];
  minYear: number | null;
  maxYear: number | null;
  sortBy: 'year-newest' | 'year-oldest' | 'most-watched' | 'least-watched';
}

interface FilterPanelProps {
  users: User[];
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function FilterPanel({
  users,
  filters,
  onFiltersChange,
  isOpen,
  onToggle,
}: FilterPanelProps) {
  const activeFilterCount = [
    filters.searchText.length > 0,
    filters.selectedViewerIds.length > 0,
    filters.minYear !== null,
    filters.maxYear !== null,
    filters.sortBy !== 'year-newest',
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    onFiltersChange({
      searchText: '',
      selectedViewerIds: [],
      minYear: null,
      maxYear: null,
      sortBy: 'year-newest',
    });
  };

  const handleViewerToggle = (userId: number) => {
    const newSelectedViewerIds = filters.selectedViewerIds.includes(userId)
      ? filters.selectedViewerIds.filter((id) => id !== userId)
      : [...filters.selectedViewerIds, userId];
    onFiltersChange({ ...filters, selectedViewerIds: newSelectedViewerIds });
  };

  return (
    <div className="mb-6">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-200 shadow-sm hover:shadow-md"
        style={{ 
          background: "linear-gradient(to right, var(--background-secondary), var(--card-bg))",
          borderColor: "var(--card-border)"
        }}
      >
        <div className="flex items-center gap-3">
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
            style={{ color: "var(--primary)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Filters & Sorting
          </span>
          {activeFilterCount > 0 && (
            <span className="text-white text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--primary)" }}>
              {activeFilterCount}
            </span>
          )}
        </div>
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {isOpen ? 'Hide' : 'Show'}
        </span>
      </button>

      {/* Filter Panel Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[1000px] opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="rounded-lg border p-6 shadow-sm" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search Text */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Search by Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.searchText}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, searchText: e.target.value })
                  }
                  placeholder="Type to search movies..."
                  className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:border-transparent transition-all"
                  style={{ 
                    borderColor: "var(--card-border)", 
                    backgroundColor: "var(--background-secondary)",
                    color: "var(--text-primary)"
                  }}
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--text-tertiary)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    sortBy: e.target.value as FilterOptions['sortBy'],
                  })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all"
                style={{ 
                  borderColor: "var(--card-border)", 
                  backgroundColor: "var(--background-secondary)",
                  color: "var(--text-primary)"
                }}
              >
                <option value="year-newest">Year (Newest)</option>
                <option value="year-oldest">Year (Oldest)</option>
                <option value="most-watched">Most Watched</option>
                <option value="least-watched">Least Watched</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                disabled={activeFilterCount === 0}
                className="w-full px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                style={{ 
                  backgroundColor: "var(--background-secondary)", 
                  color: "var(--text-primary)"
                }}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Year Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Min Year
              </label>
              <input
                type="number"
                value={filters.minYear ?? ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    minYear: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="e.g., 2020"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all"
                style={{ 
                  borderColor: "var(--card-border)", 
                  backgroundColor: "var(--background-secondary)",
                  color: "var(--text-primary)"
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Max Year
              </label>
              <input
                type="number"
                value={filters.maxYear ?? ''}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    maxYear: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="e.g., 2024"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all"
                style={{ 
                  borderColor: "var(--card-border)", 
                  backgroundColor: "var(--background-secondary)",
                  color: "var(--text-primary)"
                }}
              />
            </div>
          </div>

          {/* Filter by Viewers */}
          {users.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                Filter by Viewers
              </label>
              <div className="flex flex-wrap gap-2">
                {users.map((user) => {
                  const isSelected = filters.selectedViewerIds.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleViewerToggle(user.id)}
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-200"
                      style={
                        isSelected
                          ? { background: "var(--gradient-primary)", color: "white", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }
                          : { backgroundColor: "var(--background-secondary)", color: "var(--text-primary)" }
                      }
                    >
                      {user.name}
                      {isSelected && (
                        <span className="ml-2 text-xs">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {filters.selectedViewerIds.length > 0 && (
                <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  Showing movies seen by {filters.selectedViewerIds.length} selected viewer{filters.selectedViewerIds.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

