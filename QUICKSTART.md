# 🚀 Quick Start

Get your Movie Awards app running in 5 minutes!

## Prerequisites

- Node.js 18 or higher
- A TMDB API key (free - get it at [themoviedb.org](https://www.themoviedb.org/settings/api))

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Create .env file with your TMDB API key
echo 'DATABASE_URL="file:./dev.db"' > .env
echo 'TMDB_API_KEY="your_api_key_here"' >> .env

# 3. (Optional) Edit friends list
# Edit prisma/seed.ts to add your friends' names

# 4. Setup database
DATABASE_URL="file:./dev.db" npm run db:push
DATABASE_URL="file:./dev.db" npm run db:seed

# 5. Start the app
npm run dev
```

## Get TMDB API Key

1. Sign up at [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Go to Settings → API
3. Request an API Key (Developer option)
4. Copy your API Key and add it to `.env`

## Usage

1. Open [http://localhost:3000](http://localhost:3000)
2. Select your name from the dropdown
3. Search for movies and add them
4. Select which friends watched each movie
5. Movies with 2+ viewers become eligible for awards!

## Customization

**Add Your Friends**: Edit `prisma/seed.ts` and replace with actual names:

```typescript
const friends = [
  'Alice',
  'Bob',
  'Charlie',
  // Add 3-10 friends
]
```

Then run: `npm run db:seed`

---

For detailed documentation, see [README.md](./README.md) or [SETUP.md](./SETUP.md)



