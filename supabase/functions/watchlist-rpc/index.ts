import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { user_id, tmdb_id, category = 'want-to-watch', rating = null } = body;
      
      if (!user_id || !tmdb_id) {
        return new Response(JSON.stringify({ error: 'Missing user_id or tmdb_id' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Ensure movie exists in movies table
      const { data: movieRow } = await supabase
        .from('movies')
        .select('id, tmdb_id')
        .eq('tmdb_id', tmdb_id)
        .maybeSingle();

      if (!movieRow) {
        return new Response(JSON.stringify({ error: 'Movie not cached' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const movie_id = movieRow.id;

      // Check if already exists (idempotent)
      const { data: existing } = await supabase
        .from('watchlist')
        .select('id, category, user_rating')
        .eq('user_id', user_id)
        .eq('movie_id', movie_id)
        .maybeSingle();

      if (existing) {
        // Update existing entry
        const { data: updated, error: updateError } = await supabase
          .from('watchlist')
          .update({ 
            category, 
            user_rating: rating,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ 
          success: true, 
          updated: true, 
          data: updated 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Insert new entry
      const { data, error } = await supabase
        .from('watchlist')
        .insert([{ 
          user_id, 
          movie_id, 
          category, 
          user_rating: rating 
        }])
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ 
        success: true, 
        created: true, 
        data 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle other methods
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in /watchlist-rpc function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});