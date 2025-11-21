# Quick Setup Guide

Follow these steps to get your Movie Awards app running:

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Get Your TMDB API Key

1. Visit [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Create a free account (it's quick!)
3. Once logged in, go to your account settings
4. Click on "API" in the left sidebar
5. Click "Request an API Key"
6. Choose "Developer" option
7. Fill out the simple form (you can use any URL for the website field)
8. Copy your API Key (v3 auth)

## Step 3: Create .env File

Create a file named `.env` in the root directory with:

```env
DATABASE_URL="file:./dev.db"
TMDB_API_KEY="paste_your_api_key_here"
```

**Important**: Replace `paste_your_api_key_here` with your actual TMDB API key from Step 2.

## Step 4: Customize Your Friends List

Edit `prisma/seed.ts` and replace the example names with your friends' names:

```typescript
const friends = [
  'Your Name',
  'Friend 1',
  'Friend 2',
  // Add 3-10 friends total
]
```

## Step 5: Initialize Database

```bash
npm run db:push
npm run db:seed
```

This creates the database and adds your friends to it.

## Step 6: Start the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## You're Ready! 🎉

1. Select your name from the dropdown
2. Search for movies you've watched
3. Click on a movie to add it
4. Select which friends watched it with you
5. Movies with 2+ viewers are eligible for awards!

---

**Troubleshooting**:
- If you get an error about TMDB_API_KEY, make sure your `.env` file exists and has the correct API key
- If the database isn't working, try deleting `prisma/dev.db` and running steps 4-5 again
- Make sure you're using Node.js 18 or higher



