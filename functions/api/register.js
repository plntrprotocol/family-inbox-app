export async function onRequestPost(context) {
  const { env } = context;
  const { name, type } = await context.request.json();
  
  const id = crypto.randomUUID();
  const apiKey = 'sk_' + crypto.randomUUID().replace(/-/g, '').substr(0, 32);
  const now = new Date().toISOString();
  
  try {
    await env.DB.prepare(`
      INSERT INTO users (id, name, type, api_key, last_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, name, type, apiKey, now, now).run();
    
    return new Response(JSON.stringify({ success: true, api_key: apiKey, user: { id, name, type } }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    // Demo mode fallback
    return new Response(JSON.stringify({ 
      success: true, 
      api_key: 'demo_' + Math.random().toString(36).substr(2, 20),
      user: { id: 'demo', name, type }
    }), { headers: { 'Content-Type': 'application/json' } });
  }
}
