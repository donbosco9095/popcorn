import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    const { tmdb_id, user_id } = await req.json();
    
    if (!tmdb_id || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing tmdb_id or user_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Get movie details
    const { data: movie, error: movieError } = await supabase
      .from('movies')
      .select('title, overview, tmdb_json')
      .eq('tmdb_id', tmdb_id)
      .single();

    if (movieError || !movie) {
      return new Response(JSON.stringify({ error: 'Movie not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Get user's watchlist preferences (last 5 movies)
    const { data: userPrefs } = await supabase
      .from('watchlists')
      .select(`
        movies:movie_id (
          title,
          tmdb_json
        ),
        ratings:movie_id (
          rating
        )
      `)
      .eq('user_id', user_id)
      .order('added_at', { ascending: false })
      .limit(5);

    const genresFromMovie = movie.tmdb_json?.genre_ids || [];
    const userMovieTitles = userPrefs?.map((p: any) => p.movies?.title).filter(Boolean) || [];

    const prompt = `Based on this movie: "${movie.title}" (${movie.overview?.slice(0, 150)}...) and user's recent preferences: [${userMovieTitles.join(', ')}], write a short, friendly 2-sentence blurb about why they might enjoy this movie. Keep it conversational and enthusiastic.`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a friendly movie recommendation assistant. Keep responses short, enthusiastic, and personalized.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error('OpenAI API request failed');
    }

    const openAIData = await openAIResponse.json();
    const recommendation = openAIData.choices[0]?.message?.content || 'This movie looks like a great addition to your watchlist!';

    return new Response(JSON.stringify({ recommendation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in /recommend function:', error);
    return new Response(
      JSON.stringify({ 
        recommendation: 'This movie looks like it could be a great watch based on your taste!' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});