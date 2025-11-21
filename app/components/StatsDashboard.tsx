import { Movie } from '@/types';
import { FilterOptions } from './FilterPanel';
import StatsCard from './StatsCard';

interface StatsDashboardProps {
  movies: Movie[];
  filters?: FilterOptions;
}

export default function StatsDashboard({ movies, filters }: StatsDashboardProps) {
  // Apply filters to calculate stats
  let filteredMovies = [...movies];

  if (filters) {
    // Filter by search text
    if (filters.searchText.trim()) {
      const searchLower = filters.searchText.toLowerCase();
      filteredMovies = filteredMovies.filter((movie) =>
        movie.title.toLowerCase().includes(searchLower)
      );
    }

    // Filter by selected viewers
    if (filters.selectedViewerIds.length > 0) {
      filteredMovies = filteredMovies.filter((movie) =>
        movie.viewers?.some((viewer) =>
          filters.selectedViewerIds.includes(viewer.id)
        )
      );
    }

    // Filter by year range
    if (filters.minYear !== null) {
      filteredMovies = filteredMovies.filter(
        (movie) => movie.year !== null && movie.year >= filters.minYear!
      );
    }
    if (filters.maxYear !== null) {
      filteredMovies = filteredMovies.filter(
        (movie) => movie.year !== null && movie.year <= filters.maxYear!
      );
    }
  }

  const totalMovies = filteredMovies.length;

  // Calculate top watcher
  const viewerCounts = new Map<string, { name: string; count: number }>();
  filteredMovies.forEach((movie) => {
    movie.viewers?.forEach((viewer) => {
      const current = viewerCounts.get(viewer.name) || { name: viewer.name, count: 0 };
      viewerCounts.set(viewer.name, { name: viewer.name, count: current.count + 1 });
    });
  });

  const topWatcher = Array.from(viewerCounts.values()).sort((a, b) => b.count - a.count)[0];

  const hasActiveFilters = filters && (
    filters.searchText.trim().length > 0 ||
    filters.selectedViewerIds.length > 0 ||
    filters.minYear !== null ||
    filters.maxYear !== null
  );

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div 
          className="rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border" 
          style={{ 
            background: "var(--gradient-secondary)",
            borderColor: "var(--card-border)"
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                {`Total Movies${hasActiveFilters ? ' (filtered)' : ''}`}
              </p>
              <p className="text-3xl font-bold text-white">{totalMovies}</p>
            </div>
            <div className="text-4xl opacity-80">🎬</div>
          </div>
        </div>
        {topWatcher && (
          <div 
            className="rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border" 
            style={{ 
              background: "var(--gradient-primary)",
              borderColor: "var(--card-border)"
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                  Top Watcher
                </p>
                <p className="text-2xl font-bold text-white">
                  {topWatcher.name}
                </p>
                <p className="text-sm mt-1" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                  {topWatcher.count} movie{topWatcher.count !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-4xl opacity-80">👑</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

