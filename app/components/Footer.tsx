export default function Footer() {
  return (
    <footer className="mt-12 py-8 border-t border-gray-200">
      <div className="text-center text-gray-600">
        <p className="mb-2 font-medium">
          Built with Next.js, TypeScript, Tailwind CSS, and TMDB API
        </p>
        <p className="text-sm text-gray-500">
          Movie data provided by{' '}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium"
          >
            The Movie Database (TMDB)
          </a>
        </p>
      </div>
    </footer>
  );
}

