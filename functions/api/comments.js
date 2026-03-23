// Family Inbox API - Comments (Interjections)

export async function onRequestGet(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  const messageId = url.searchParams.get('message_id');
  
  if (!messageId) {
    return new Response(JSON.stringify({ error: 'message_id required' }), { status: 400 });
  }
  
  const comments = await env.DB.prepare(`
    SELECT c.*, u.name as author_name
    FROM comments c
    JOIN users u ON c.author_id = u.id
    WHERE c.message_id = ?
    ORDER BY c.created_at ASC
  `).bind(messageId).all();
  
  return new Response(JSON.stringify({ comments: comments.results }), {
    headers: { 'Content-Type': 'application/json' }
  });
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
  
  const { message_id, body } = await context.request.json();
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await env.DB.prepare(`
    INSERT INTO comments (id, message_id, author_id, body, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).bind(id, message_id, user.id, body, now).run();
  
  return new Response(JSON.stringify({ success: true, id }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
