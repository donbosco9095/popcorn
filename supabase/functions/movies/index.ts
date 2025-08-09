import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY')!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    const url = new URL(req.url);
    const q = url.searchParams.get('q');
    const id = url.searchParams.get('id');
    const details = url.searchParams.get('details');
    const page = parseInt(url.searchParams.get('page') || '1');
    const withGenres = url.searchParams.get('with_genres');
    const primaryReleaseYear = url.searchParams.get('primary_release_year');
    const voteAverageGte = url.searchParams.get('vote_average.gte');
    const withOriginalLanguage = url.searchParams.get('with_original_language');

    // Auto-detect TMDb API version
    const isV4 = TMDB_API_KEY?.startsWith('ey');
    const authHeaders = isV4 
      ? { Authorization: `Bearer ${TMDB_API_KEY}` }
      : {};

    // Handle movie details request
    if (id) {
      console.log('Fetching movie details for ID:', id);

      // Check cache first
      const { data: cachedMovie } = await supabase
        .from('movies')
        .select('*')
        .eq('tmdb_id', parseInt(id))
        .single();

      if (cachedMovie && cachedMovie.cached_at > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        // Return cached data if less than 24 hours old
        return new Response(JSON.stringify({ movie: cachedMovie.tmdb_json }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Fetch fresh data from TMDb
      const appendToResponse = details === 'true' 
        ? 'credits,videos,recommendations,release_dates' 
        : 'credits,videos,release_dates';
      
      const detailUrl = `https://api.themoviedb.org/3/movie/${encodeURIComponent(id)}?append_to_response=${appendToResponse}${!isV4 ? `&api_key=${TMDB_API_KEY}` : ''}`;
      
      const detailRes = await fetch(detailUrl, { headers: authHeaders });
      
      if (!detailRes.ok) {
        throw new Error(`TMDb detail failed: ${detailRes.statusText}`);
      }
      
      const detailJson = await detailRes.json();

      // Process cast data
      if (detailJson.credits && detailJson.credits.cast) {
        detailJson.cast = detailJson.credits.cast.slice(0, 10).map((actor: any) => ({
          id: actor.id,
          name: actor.name,
          character: actor.character,
          profile_path: actor.profile_path,
          order: actor.order
        }));
      }

      // Upsert into movies cache
      const movieRow = {
        tmdb_id: detailJson.id,
        title: detailJson.title,
        overview: detailJson.overview || '',
        poster_path: detailJson.poster_path || '',
        backdrop_path: detailJson.backdrop_path || '',
        genres: detailJson.genres?.map((g: any) => g.name) || [],
        release_date: detailJson.release_date || null,
        runtime: detailJson.runtime || null,
        vote_average: detailJson.vote_average || 0,
        vote_count: detailJson.vote_count || 0,
        tmdb_json: detailJson,
        cached_at: new Date().toISOString()
      };

      await supabase.from('movies').upsert(movieRow, { onConflict: 'tmdb_id' });

      return new Response(JSON.stringify({ movie: detailJson }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle search request
    if (!q) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Making TMDb API search request for query:', q, 'page:', page);

    // Use discover endpoint when we have filters, search endpoint otherwise
    const hasFilters = withGenres || primaryReleaseYear || voteAverageGte || withOriginalLanguage;
    
    let apiUrl: string;
    
    if (hasFilters) {
      // Use discover endpoint for filtered searches with keyword search
      apiUrl = `https://api.themoviedb.org/3/discover/movie?page=${page}&include_adult=false`;
      
      // Add filters to discover endpoint
      if (withGenres) {
        apiUrl += `&with_genres=${withGenres}`;
      }
      if (primaryReleaseYear) {
        apiUrl += `&primary_release_year=${primaryReleaseYear}`;
      }
      if (voteAverageGte) {
        apiUrl += `&vote_average.gte=${voteAverageGte}`;
      }
      if (withOriginalLanguage) {
        apiUrl += `&with_original_language=${withOriginalLanguage}`;
      }
      
      // Add keyword search to discover
      apiUrl += `&with_keywords=${encodeURIComponent(q)}`;
    } else {
      // Use search endpoint for simple text searches
      apiUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(q)}&page=${page}&include_adult=false`;
    }
    
    if (!isV4) {
      apiUrl += `&api_key=${TMDB_API_KEY}`;
    }

    // Add primary_release_year to search endpoint if no other filters
    if (!hasFilters && primaryReleaseYear) {
      apiUrl += `&primary_release_year=${primaryReleaseYear}`;
    }

    const searchRes = await fetch(apiUrl, { headers: authHeaders });
    
    if (!searchRes.ok) {
      throw new Error(`TMDb search failed: ${searchRes.statusText}`);
    }
    
    const searchJson = await searchRes.json();
    let results = searchJson.results || [];

    // If discover endpoint didn't return good results with keywords, fallback to search + client filtering
    if (hasFilters && results.length === 0) {
      console.log('Discover with keywords returned no results, falling back to search + client filtering');
      
      const fallbackUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(q)}&page=${page}&include_adult=false${!isV4 ? `&api_key=${TMDB_API_KEY}` : ''}`;
      const fallbackRes = await fetch(fallbackUrl, { headers: authHeaders });
      
      if (fallbackRes.ok) {
        const fallbackJson = await fallbackRes.json();
        results = fallbackJson.results || [];
        
        // Apply client-side filtering
        if (withGenres) {
          const genreIds = withGenres.split(',').map(id => parseInt(id.trim()));
          results = results.filter((movie: any) => {
            const movieGenres = movie.genre_ids || [];
            return genreIds.some(genreId => movieGenres.includes(genreId));
          });
        }

        if (primaryReleaseYear) {
          results = results.filter((movie: any) => {
            if (!movie.release_date) return false;
            const movieYear = new Date(movie.release_date).getFullYear();
            return movieYear === parseInt(primaryReleaseYear);
          });
        }

        if (voteAverageGte) {
          const minRating = parseFloat(voteAverageGte);
          results = results.filter((movie: any) => (movie.vote_average || 0) >= minRating);
        }

        if (withOriginalLanguage) {
          results = results.filter((movie: any) => movie.original_language === withOriginalLanguage);
        }
      }
    }

    // Upsert search results into movies cache
    const toUpsert = results.slice(0, 20).map((m: any) => ({
      tmdb_id: m.id,
      title: m.title || '',
      overview: m.overview || '',
      poster_path: m.poster_path || '',
      backdrop_path: m.backdrop_path || '',
      genres: [], // Will be populated when fetching details
      release_date: m.release_date || null,
      runtime: null, // Not available in search results
      vote_average: m.vote_average || 0,
      vote_count: m.vote_count || 0,
      tmdb_json: m,
      cached_at: new Date().toISOString()
    }));

    if (toUpsert.length > 0) {
      const { error } = await supabase.from('movies').upsert(toUpsert, { onConflict: 'tmdb_id' });
      if (error) {
        console.error('Upsert error:', error);
      }
    }

    console.log('TMDb API search response received, results count:', results.length);

    return new Response(JSON.stringify({
      results,
      total_pages: searchJson.total_pages || 1,
      total_results: results.length,
      page: searchJson.page || 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in /movies function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});