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
        <StatsCard
          icon="🎬"
          value={totalMovies}
          label={`Total Movies${hasActiveFilters ? ' (filtered)' : ''}`}
          colorClass="text-blue-600 dark:text-blue-400"
          bgClass="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
        />
        {topWatcher && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Top Watcher
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {topWatcher.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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

