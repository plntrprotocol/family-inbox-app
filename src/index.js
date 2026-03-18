// Family Inbox - Cloudflare Worker
// Handles API requests for the family inbox

const INBOX_PATH = "/Users/johann/.openclaw/family-inbox";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    
    // GET /messages - List all messages
    if (path === "/messages" && request.method === "GET") {
      // This would read from the shared folder
      // For now, return a placeholder
      return new Response(JSON.stringify({
        messages: [],
        status: "MVP - Cloud storage not connected yet"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // POST /messages - Send a message
    if (path === "/messages" && request.method === "POST") {
      const body = await request.json();
      return new Response(JSON.stringify({
        status: "Message sent",
        message: body
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Health check
    if (path === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    return new Response("Family Inbox API", { headers: corsHeaders });
  }
};
