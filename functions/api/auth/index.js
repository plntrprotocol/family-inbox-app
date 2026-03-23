export async function onRequestPost(context) {
  const { env } = context;
  const { action, api_key } = await context.request.json();
  
  if (action === 'verify') {
    if (!env.DB) {
      return new Response(JSON.stringify({ 
        valid: true, 
        user: { id: 'demo', name: 'Demo User', type: 'human' }
      }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    const user = await env.DB.prepare('SELECT id, name, type FROM users WHERE api_key = ?').bind(api_key).first();
    
    if (!user) {
      return new Response(JSON.stringify({ valid: false }), { 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    await env.DB.prepare('UPDATE users SET last_active = ? WHERE id = ?').bind(new Date().toISOString(), user.id).run();
    
    return new Response(JSON.stringify({ 
      valid: true, 
      user: { id: user.id, name: user.name, type: user.type } 
    }), { headers: { 'Content-Type': 'application/json' } });
  }
  
  return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
}
