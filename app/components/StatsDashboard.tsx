import { Movie } from '@/types';
import { FilterOptions } from './FilterPanel';
import StatsCard from './StatsCard';

interface StatsDashboardProps {
  movies: Movie[];
  filters?: FilterOptions;
  currentUserId?: number;
}

export default function StatsDashboard({ movies, filters, currentUserId }: StatsDashboardProps) {
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

  // Calculate user-specific stats
  const userSeenCount = currentUserId ? filteredMovies.filter((movie) => 
    movie.movieViews?.some((view) => view.userId === currentUserId && view.hasSeen)
  ).length : 0;
  
  const userUnseenCount = currentUserId ? totalMovies - userSeenCount : 0;
  const completionRate = totalMovies > 0 && currentUserId ? Math.round((userSeenCount / totalMovies) * 100) : 0;

  // Calculate top watcher
  const viewerCounts = new Map<string, { name: string; count: number }>();
  filteredMovies.forEach((movie) => {
    movie.movieViews?.forEach((view) => {
      if (view.hasSeen && view.user) {
        const current = viewerCounts.get(view.user.name) || { name: view.user.name, count: 0 };
        viewerCounts.set(view.user.name, { name: view.user.name, count: current.count + 1 });
      }
    });
  });

  const topWatcher = Array.from(viewerCounts.values()).sort((a, b) => b.count - a.count)[0];

  // Find most popular movie (most people have seen it)
  const movieSeenCounts = filteredMovies.map((movie) => ({
    title: movie.title,
    count: movie.movieViews?.filter((view) => view.hasSeen).length || 0,
  })).sort((a, b) => b.count - a.count)[0];

  const hasActiveFilters = filters && (
    filters.searchText.trim().length > 0 ||
    filters.selectedViewerIds.length > 0 ||
    filters.minYear !== null ||
    filters.maxYear !== null
  );

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          className="rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border" 
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

        {currentUserId && (
          <div 
            className="rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border" 
            style={{ 
              background: userUnseenCount > 0 ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
              borderColor: "var(--card-border)"
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                  {userUnseenCount > 0 ? "To Watch" : "All Caught Up!"}
                </p>
                <p className="text-3xl font-bold text-white">{userUnseenCount}</p>
                <p className="text-xs mt-1" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                  {completionRate}% complete
                </p>
              </div>
              <div className="text-4xl opacity-80">{userUnseenCount > 0 ? "📋" : "✅"}</div>
            </div>
          </div>
        )}

        {topWatcher && (
          <div 
            className="rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border" 
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
                <p className="text-2xl font-bold text-white truncate max-w-[120px]">
                  {topWatcher.name}
                </p>
                <p className="text-xs mt-1" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                  {topWatcher.count} movie{topWatcher.count !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-4xl opacity-80">👑</div>
            </div>
          </div>
        )}

        {movieSeenCounts && movieSeenCounts.count > 0 && (
          <div 
            className="rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border" 
            style={{ 
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              borderColor: "var(--card-border)"
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-1" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                  Most Watched
                </p>
                <p className="text-lg font-bold text-white truncate" title={movieSeenCounts.title}>
                  {movieSeenCounts.title}
                </p>
                <p className="text-xs mt-1" style={{ color: "rgba(255, 255, 255, 0.8)" }}>
                  {movieSeenCounts.count} viewer{movieSeenCounts.count !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-4xl opacity-80 ml-2">🔥</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

