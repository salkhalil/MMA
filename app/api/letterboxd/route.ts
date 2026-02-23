import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Username parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`https://letterboxd.com/${username}/rss/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS reader)',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 403) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
      throw new Error(`Failed to fetch Letterboxd profile: ${response.statusText}`);
    }

    const xml = await response.text();
    const movies: { title: string; posterUrl?: string; letterboxdSlug: string; watchedDate?: string; rating?: string }[] = [];

    const getField = (itemXml: string, field: string): string => {
      const match = itemXml.match(new RegExp(`<${field}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${field}>`, 's'));
      return match ? match[1].trim() : '';
    };

    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let itemMatch;

    while ((itemMatch = itemRegex.exec(xml)) !== null) {
      const itemXml = itemMatch[1];

      const title = getField(itemXml, 'letterboxd:filmTitle');
      const watchedDate = getField(itemXml, 'letterboxd:watchedDate');
      const memberRating = getField(itemXml, 'letterboxd:memberRating');

      // Extract slug from the link URL: https://letterboxd.com/user/film/slug/
      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
      const link = linkMatch ? linkMatch[1].trim() : '';
      const slugMatch = link.match(/\/film\/([^/]+)\//);
      const slug = slugMatch ? slugMatch[1] : '';

      if (!title || !slug) continue;

      movies.push({
        title,
        posterUrl: undefined,
        letterboxdSlug: slug,
        watchedDate: watchedDate || undefined,
        rating: memberRating || undefined
      });
    }

    // Deduplicate based on letterboxdSlug, keeping most recent watch
    const uniqueMovies = Array.from(
      new Map(movies.map(movie => [movie.letterboxdSlug, movie])).values()
    );

    return NextResponse.json({ movies: uniqueMovies });
  } catch (error: unknown) {
    console.error("Error fetching Letterboxd RSS:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies from Letterboxd" },
      { status: 500 }
    );
  }
}
