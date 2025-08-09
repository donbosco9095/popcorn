import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    const url = new URL(req.url);
    const movieId = url.searchParams.get('id');
    
    console.log('Trailer function called for movie ID:', movieId);
    
    if (!movieId) {
      console.error('No movie ID provided');
      return new Response(JSON.stringify({ error: 'Movie ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!TMDB_API_KEY) {
      console.error('TMDB_API_KEY not configured');
      return new Response(JSON.stringify({ 
        error: 'TMDB API key not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Auto-detect TMDb API version
    const isV4 = TMDB_API_KEY.startsWith('ey');
    const authHeaders = isV4 
      ? { Authorization: `Bearer ${TMDB_API_KEY}` }
      : {};

    const tmdbUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos${!isV4 ? `?api_key=${TMDB_API_KEY}` : ''}`;
    
    console.log('Calling TMDb API:', tmdbUrl);

    const response = await fetch(tmdbUrl, { headers: authHeaders });
    
    console.log('TMDb API response status:', response.status);
    
    if (!response.ok) {
      console.error('TMDb API error:', response.status, response.statusText);
      return new Response(JSON.stringify({ 
        error: `TMDB API error: ${response.status} ${response.statusText}` 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const data = await response.json();
    console.log('TMDb API response data:', JSON.stringify(data, null, 2));
    
    // Find the first YouTube trailer
    const trailer = data.results?.find(
      (v: any) => v.site === 'YouTube' && v.type === 'Trailer'
    );
    
    console.log('Found trailer:', trailer);
    
    if (!trailer) {
      console.log('No YouTube trailer found');
      return new Response(JSON.stringify({ 
        error: 'No trailer found',
        videoKey: null 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Returning trailer key:', trailer.key);
    return new Response(JSON.stringify({ videoKey: trailer.key }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in trailer function:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch trailer',
      videoKey: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});