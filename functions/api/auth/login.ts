import { sign } from 'jose';
import { hash, compare } from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const { password } = await request.json();
    
    if (!password) {
      return new Response(JSON.stringify({ error: 'Password is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 从 D1 查询用户
    const userQuery = await env.DB.prepare(
      'SELECT * FROM users WHERE id = ?'
    ).bind('admin').first();
    
    if (!userQuery) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const user = userQuery;
    
    // 验证密码
    const isValid = await compare(password, user.password_hash);
    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 生成 JWT token
    const token = await sign(
      { 
        sub: user.id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400 // 24 小时过期
      },
      new TextEncoder().encode(JWT_SECRET)
    );
    
    // 存储到 KV
    await env.SESSION_STORE.put(`session:${token}`, user.id, { expirationTtl: 86400 });
    
    return new Response(JSON.stringify({ 
      token,
      user: { id: user.id }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
