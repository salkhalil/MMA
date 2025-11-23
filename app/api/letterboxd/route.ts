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
    const response = await fetch(`https://letterboxd.com/${username}/films/`);
    
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
    const $ = cheerio.load(html);
    const movies: { title: string; year?: number; posterUrl?: string; letterboxdSlug: string }[] = [];

    const cleanTitle = (title: string) => {
      return title.replace(/\s+\(\d{4}\)$/, '').trim();
    };

    $('.poster-container').each((_, element) => {
      const $element = $(element);
      const $img = $element.find('img');
      const $div = $element.find('div.film-poster');
      
      const rawTitle = $img.attr('alt') || "";
      const title = cleanTitle(rawTitle);
      const posterUrl = $img.attr('src');
      const slug = $div.attr('data-film-slug');
      
      if (title && slug) {
        movies.push({
          title,
          posterUrl,
          letterboxdSlug: slug
        });
      }
    });

    // Fallback for React-based LazyPoster components
    if (movies.length === 0) {
      $('div.react-component[data-component-class="LazyPoster"]').each((_, element) => {
        const $element = $(element);
        const rawTitle = $element.attr('data-item-name') || "";
        const title = cleanTitle(rawTitle);
        const slug = $element.attr('data-item-slug');
        // The poster URL in data-poster-url is often a page, not an image.
        // We'll try to find an image inside, or use a placeholder.
        // The img src is usually a placeholder (empty-poster).
        // We'll leave posterUrl undefined and let the UI handle it, 
        // or we could try to construct it if we knew the pattern.
        
        if (title && slug) {
          movies.push({
            title,
            posterUrl: undefined, // No reliable poster URL in static HTML for lazy components
            letterboxdSlug: slug
          });
        }
      });
    }

    return NextResponse.json({ movies });
  } catch (error: unknown) {
    console.error("Error scraping Letterboxd:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies from Letterboxd" },
      { status: 500 }
    );
  }
}
