import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // 跳过认证的路径
  const publicPaths = ['/api/auth/login', '/health'];
  if (publicPaths.includes(url.pathname)) {
    return context.next();
  }
  
  // 检查 JWT token
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const verified = await jwtVerify(token, JWT_SECRET);
    
    // 将用户信息添加到上下文
    context.user = {
      id: verified.payload.sub,
    };
    
    return context.next();
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
