export async function onRequestGet(context) {
  const { env } = context;
  
  const authHeader = context.request.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ messages: [], demo: true }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  
  try {
    const apiKey = authHeader.replace('Bearer ', '');
    const user = await env.DB.prepare('SELECT * FROM users WHERE api_key = ?').bind(apiKey).first();
    
    if (!user) {
      return new Response(JSON.stringify({ messages: [], demo: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const messages = await env.DB.prepare(`
      SELECT m.*, s.name as sender_name, r.name as recipient_name
      FROM messages m
      LEFT JOIN users s ON m.sender_id = s.id
      LEFT JOIN users r ON m.recipient_id = r.id
      WHERE m.sender_id = ? OR m.recipient_id = ? OR m.is_broadcast = 1
      ORDER BY m.created_at DESC
    `).bind(user.id, user.id).all();
    
    return new Response(JSON.stringify({ messages: messages.results }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ messages: [], error: e.message }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPost(context) {
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
  
  const body = await context.request.json();
  
  if (body.is_broadcast && user.type !== 'human') {
    return new Response(JSON.stringify({ error: 'Only humans can broadcast' }), { status: 403 });
  }
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await env.DB.prepare(`
    INSERT INTO messages (id, sender_id, recipient_id, body, is_broadcast, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, user.id, body.recipient_id || null, body.body, body.is_broadcast ? 1 : 0, now).run();
  
  return new Response(JSON.stringify({ success: true, id }), {
    headers: { "Content-Type": "application/json" }
  });
}
