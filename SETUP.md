# Setup Guide

See the [README](README.md) for full local dev and CI/CD instructions.

## TMDB API Key

1. Create a free account at [themoviedb.org](https://www.themoviedb.org/signup)
2. Go to account settings → API → Request an API Key → Developer
3. Copy the **v3 auth** key

## Friends List

Edit `prisma/seed.ts` and update the `friends` array with your group's names before running `make db/setup`.

## Customising Categories

Award categories live in `prisma/seed.ts`. Edit them before seeding, or re-run `make db/reset` to wipe and re-seed with updated categories.
