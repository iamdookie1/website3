export const config = { runtime: 'edge' };

export default async function handler(req) {
  const OLLAMA = process.env.OLLAMA_URL; // set in Vercel dashboard

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const url  = new URL(req.url);
  const path = url.searchParams.get('path') || '/v1/chat/completions';

  try {
    const upstream = await fetch(`${OLLAMA}${path}`, {
      method:  req.method,
      headers: { 'Content-Type': 'application/json' },
      body:    req.method !== 'GET' ? req.body : undefined,
      // @ts-ignore — needed for streaming
      duplex: 'half',
    });

    return new Response(upstream.body, {
      status:  upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
