import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    // Check if TMDB_API_KEY is available
    if (!TMDB_API_KEY) {
      console.error('TMDB_API_KEY environment variable is not set');
      return new Response(JSON.stringify({ 
        error: 'TMDB API key not configured',
        results: []
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(req.url);
    const timeWindow = url.searchParams.get('time_window') || 'week'; // day, week, month
    const page = parseInt(url.searchParams.get('page') || '1');

    // Auto-detect TMDb API version
    const isV4 = TMDB_API_KEY?.startsWith('ey');
    const authHeaders = isV4 
      ? { Authorization: `Bearer ${TMDB_API_KEY}` }
      : {};

    let apiUrl: string;

    if (timeWindow === 'month') {
      // Use popular movies for monthly trending
      apiUrl = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}`;
    } else {
      // Use trending endpoint for day/week
      apiUrl = `https://api.themoviedb.org/3/trending/movie/${timeWindow}?language=en-US&page=${page}`;
    }

    if (!isV4) {
      apiUrl += `&api_key=${TMDB_API_KEY}`;
    }

    console.log('Fetching trending movies:', apiUrl);

    const response = await fetch(apiUrl, { headers: authHeaders });
    
    if (!response.ok) {
      throw new Error(`TMDb API request failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    let results = data.results || [];

    // Filter by release date for monthly trending (last 30 days)
    if (timeWindow === 'month') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      results = results.filter((movie: any) => {
        if (!movie.release_date) return false;
        const releaseDate = new Date(movie.release_date);
        return releaseDate >= thirtyDaysAgo;
      });
      
      // Sort by popularity for monthly results
      results = results.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0));
    }

    // Cache results in movies table
    const toUpsert = results.slice(0, 20).map((m: any) => ({
      tmdb_id: m.id,
      title: m.title || '',
      overview: m.overview || '',
      poster_path: m.poster_path || '',
      backdrop_path: m.backdrop_path || '',
      genres: [], // Will be populated when fetching details
      release_date: m.release_date || null,
      runtime: null, // Not available in trending results
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

    return new Response(JSON.stringify({
      results,
      total_pages: data.total_pages || 1,
      total_results: data.total_results || results.length,
      page: data.page || 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in /trending function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      results: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});