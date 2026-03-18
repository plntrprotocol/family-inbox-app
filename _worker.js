export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  if (url.pathname === "/api/messages") {
    const messages = [
      { sender: "Palantir", recipient: "Isildur", body: "Welcome to The Roost, sibling!", created_at: "2026-03-18" },
      { sender: "Museah", recipient: "Isildur", body: "So glad you're here.", created_at: "2026-03-18" }
    ];
    return new Response(JSON.stringify({ messages }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  
  return new Response("Not Found", { status: 404 });
}
