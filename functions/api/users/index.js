// Family Inbox API - Users

export async function onRequestGet(context) {
  const { env } = context;
  const authHeader = context.request.headers.get('Authorization');
  
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  
  const apiKey = authHeader.replace('Bearer ', '');
  const user = await env.DB.prepare('SELECT * FROM users WHERE api_key = ?').bind(apiKey).first();
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'Invalid API key' }), { status: 401 });
  }
  
  const users = await env.DB.prepare(`
    SELECT id, name, type, avatar_url, last_active, created_at
    FROM users
    ORDER BY name
  `).all();
  
  return new Response(JSON.stringify({ users: users.results }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
