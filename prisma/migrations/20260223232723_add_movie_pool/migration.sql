-- CreateEnum
CREATE TYPE "MoviePool" AS ENUM ('NEW_RELEASE', 'CLASSIC');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "pool" "MoviePool" NOT NULL DEFAULT 'NEW_RELEASE';

-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "pool" "MoviePool" NOT NULL DEFAULT 'CLASSIC';

-- Backfill: mark 2025+ movies as NEW_RELEASE
UPDATE "Movie" SET pool = 'NEW_RELEASE' WHERE year >= 2025;
