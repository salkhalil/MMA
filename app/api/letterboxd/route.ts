import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

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
    const response = await fetch(`https://letterboxd.com/${username}/diary/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
        if (response.status === 404) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }
      throw new Error(`Failed to fetch Letterboxd profile: ${response.statusText}`);
    }

    const html = await response.text();
    const cleanTitle = (title: string) => {
      return title.replace(/\s+\(\d{4}\)$/, '').trim();
    };

    const $ = cheerio.load(html);
    const movies: { title: string; year?: number; posterUrl?: string; letterboxdSlug: string; watchedDate?: string; rating?: string }[] = [];

    let currentMonth = "";
    let currentYear = "";

    $('.diary-entry-row').each((_, element) => {
      const $row = $(element);
      
      // Extract date info (handle sticky headers)
      const $monthDate = $row.find('.col-monthdate');
      if ($monthDate.text().trim()) {
        currentMonth = $monthDate.find('.month').text().trim();
        currentYear = $monthDate.find('.year').text().trim();
      }
      const day = $row.find('.col-daydate .daydate').text().trim();
      
      // Construct full date if possible
      let watchedDate: string | undefined;
      if (currentYear && currentMonth && day) {
        watchedDate = `${day} ${currentMonth} ${currentYear}`;
      }

      // Extract film info from the LazyPoster component data attributes
      const $posterDiv = $row.find('.react-component[data-component-class="LazyPoster"]');
      const rawTitle = $posterDiv.attr('data-item-name') || "";
      const title = cleanTitle(rawTitle);
      const slug = $posterDiv.attr('data-item-slug');
      // Try to get a poster URL if available, though often it's a placeholder in the diary view
      // The data-poster-url attribute usually points to a page, not an image. 
      // We might need to rely on TMDB for posters as established.
      
      // Extract rating
      const ratingClass = $row.find('.rating').attr('class') || "";
      const ratingMatch = ratingClass.match(/rated-(\d+)/);
      const rating = ratingMatch ? (parseInt(ratingMatch[1]) / 2).toString() : undefined;

      if (title && slug) {
        movies.push({
          title,
          posterUrl: undefined, // Let frontend fetch from TMDB
          letterboxdSlug: slug,
          watchedDate,
          rating
        });
      }
    });

    return NextResponse.json({ movies });
  } catch (error: unknown) {
    console.error("Error scraping Letterboxd:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies from Letterboxd" },
      { status: 500 }
    );
  }
}
