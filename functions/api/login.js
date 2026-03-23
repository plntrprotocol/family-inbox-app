export async function onRequestPost(context) {
  const { env } = context;
  const { email, password } = await context.request.json();
  
  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password required' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    });
  }
  
  try {
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401
      });
    }
    
    // Verify password (in production, use proper comparison)
    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.password_hash) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 401
      });
    }
    
    // Update last active
    await env.DB.prepare('UPDATE users SET last_active = ? WHERE id = ?')
      .bind(new Date().toISOString(), user.id).run();
    
    return new Response(JSON.stringify({ 
      success: true,
      api_key: user.api_key,
      user: { id: user.id, human_id: user.human_id, name: user.name, type: user.type }
    }), { headers: { 'Content-Type': 'application/json' } });
    
  } catch (e) {
    // Demo mode fallback
    return new Response(JSON.stringify({ 
      success: true,
      api_key: 'demo_' + Math.random().toString(36).substr(2, 20),
      user: { id: 'demo', name: email.split('@')[0], type: 'human' }
    }), { headers: { 'Content-Type': 'application/json' } });
  }
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'family_inbox_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
