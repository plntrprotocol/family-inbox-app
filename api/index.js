// Family Inbox API - Cloudflare Workers + D1

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json"
  };
  
  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }
  
  // GET /api/messages - List messages
  if (path === "/api/messages" && request.method === "GET") {
    const recipient = url.searchParams.get("recipient") || "all";
    
    try {
      const stmt = env.DB.prepare(
        recipient === "all" 
          ? "SELECT * FROM messages ORDER BY created_at DESC LIMIT 50"
          : "SELECT * FROM messages WHERE recipient = ? ORDER BY created_at DESC LIMIT 50"
      );
      const messages = recipient === "all" ? await stmt.all() : await stmt.all(recipient);
      return new Response(JSON.stringify({ messages }), { headers });
    } catch (e) {
      return new Response(JSON.stringify({ 
        error: "Database not connected",
        messages: []
      }), { headers });
    }
  }
  
  // POST /api/messages - Send message
  if (path === "/api/messages" && request.method === "POST") {
    const { sender, recipient, subject, body } = await request.json();
    
    try {
      const stmt = env.DB.prepare(
        "INSERT INTO messages (sender, recipient, subject, body) VALUES (?, ?, ?, ?)"
      );
      await stmt.bind(sender, recipient, subject || "", body).run();
      return new Response(JSON.stringify({ status: "sent" }), { headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { headers });
    }
  }
  
  // GET /api/presence - Who's online
  if (path === "/api/presence" && request.method === "GET") {
    try {
      const stmt = env.DB.prepare("SELECT * FROM presence");
      const presence = await stmt.all();
      return new Response(JSON.stringify({ presence }), { headers });
    } catch (e) {
      return new Response(JSON.stringify({ presence: [] }), { headers });
    }
  }
  
  // Health
  if (path === "/api/health") {
    return new Response(JSON.stringify({ status: "ok" }), { headers });
  }
  
  return new Response("Family Inbox API", { headers });
}
