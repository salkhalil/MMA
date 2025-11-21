# 🎬 Movie Awards App

A Next.js application for tracking movies watched with friends and organizing your own movie awards show! Movies need to be watched by at least 2 people to be eligible for awards.

## Features

- 🔍 **Movie Search**: Search for any movie using The Movie Database (TMDB) API
- 👥 **Friend Tracking**: Track which friends have watched each movie
- ✅ **Award Eligibility**: Automatic validation that movies have been seen by 2+ people
- 📊 **Organized Lists**: Separate views for valid award candidates and movies needing more viewers
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Movie Data**: TMDB API

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Get TMDB API Key

1. Go to [The Movie Database](https://www.themoviedb.org/)
2. Create a free account
3. Go to Settings → API
4. Request an API key (choose "Developer" option)
5. Copy your API key

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
TMDB_API_KEY="your_api_key_here"
```

Replace `your_api_key_here` with your actual TMDB API key.

### 4. Setup Database

The database is already initialized! But if you need to reset it:

```bash
npm run db:push
npm run db:seed
```

### 5. Customize Friends List

Edit `prisma/seed.ts` to add your friends' names, then run:

```bash
npm run db:seed
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Select Your User**: Choose your name from the dropdown at the top
2. **Search for Movies**: Use the search bar to find movies
3. **Add Movies**: Click on a movie and select which friends watched it with you
4. **Track Progress**: See which movies are eligible for awards (2+ viewers)
5. **Add Yourself**: Found a movie someone else added? Click "I've seen this too"

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── movies/
│   │   │   ├── search/     # TMDB search proxy
│   │   │   ├── suggest/    # Add movies & viewers
│   │   │   └── list/       # Get all suggested movies
│   │   └── users/          # Get all friends
│   ├── components/
│   │   ├── MovieCard.tsx
│   │   ├── MovieSearch.tsx
│   │   ├── AddMovieModal.tsx
│   │   ├── SuggestedMoviesList.tsx
│   │   └── UserSelector.tsx
│   └── page.tsx            # Main application page
├── lib/
│   ├── prisma.ts           # Prisma client
│   └── tmdb.ts             # TMDB API helpers
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed friends
└── types/
    └── index.ts            # TypeScript types
```

## Database Schema

- **User**: Friends who can vote (name)
- **Movie**: Movies from TMDB (title, year, poster, etc.)
- **MovieView**: Junction table tracking who watched what

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Update database schema
- `npm run db:seed` - Seed database with friends

## Future Enhancements

- Voting system for award categories
- Award ceremony results page
- Movie filtering and sorting
- Statistics and analytics
- Export results

## License

MIT
