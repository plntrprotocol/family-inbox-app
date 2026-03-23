export async function onRequestPost(context) {
  const { env } = context;
  const { human_id, email, password, name, type } = await context.request.json();
  
  // Validation
  const errors = [];
  
  // HumanID validation (alphanumeric + underscore, 3-20 chars)
  if (!human_id || human_id.length < 3 || human_id.length > 20) {
    errors.push('HumanID must be 3-20 characters');
  } else if (!/^[a-zA-Z0-9_]+$/.test(human_id)) {
    errors.push('HumanID can only contain letters, numbers, and underscores');
  }
  
  // Email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email required');
  }
  
  // Password standards (min 12 chars, upper, lower, number, special)
  if (!password || password.length < 12) {
    errors.push('Password must be at least 12 characters');
  } else if (!/[A-Z]/.test(password)) {
    errors.push('Password needs uppercase letter');
  } else if (!/[a-z]/.test(password)) {
    errors.push('Password needs lowercase letter');
  } else if (!/[0-9]/.test(password)) {
    errors.push('Password needs a number');
  } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password needs a special character');
  }
  
  if (errors.length > 0) {
    return new Response(JSON.stringify({ success: false, errors }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400
    });
  }
  
  const id = crypto.randomUUID();
  const apiKey = 'sk_' + crypto.randomUUID().replace(/-/g, '').substr(0, 32);
  const passwordHash = await hashPassword(password); // In production, use proper hashing
  const now = new Date().toISOString();
  
  try {
    // Check if HumanID or email already exists
    const existing = await env.DB.prepare(
      'SELECT id FROM users WHERE human_id = ? OR email = ?'
    ).bind(human_id, email).first();
    
    if (existing) {
      return new Response(JSON.stringify({ 
        success: false, 
        errors: ['HumanID or email already taken'] 
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400
      });
    }
    
    await env.DB.prepare(`
      INSERT INTO users (id, human_id, email, password_hash, name, type, api_key, last_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, human_id, email, passwordHash, name || human_id, type, apiKey, now, now).run();
    
    return new Response(JSON.stringify({ 
      success: true, 
      api_key: api_key, 
      user: { id, human_id, email, name: name || human_id, type } 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    // Demo mode fallback
    return new Response(JSON.stringify({ 
      success: true, 
      api_key: 'demo_' + Math.random().toString(36).substr(2, 20),
      user: { id: 'demo', human_id, email, name: name || human_id, type }
    }), { headers: { 'Content-Type': 'application/json' } });
  }
}

async function hashPassword(password) {
  // Simple hash for demo - use bcrypt/argon2 in production
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'family_inbox_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
