import { sign, verify } from 'jose';
import { hash, compare } from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  switch (request.method) {
    case 'GET':
      return handleGet(url, env);
    case 'POST':
      return handlePost(request, env);
    case 'PUT':
      return handlePut(request, env);
    case 'DELETE':
      return handleDelete(url, env);
    default:
      return new Response('Method Not Allowed', { status: 405 });
  }
}

async function handleGet(url, env) {
  try {
    const id = url.pathname.split('/').pop();
    
    if (id && id !== 'commitments') {
      // 获取单个约定
      const commitment = await env.DB.prepare(
        'SELECT * FROM commitments WHERE id = ?'
      ).bind(id).first();
      
      if (!commitment) {
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ data: commitment }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // 获取列表
      const { searchParams } = url;
      const status = searchParams.get('status');
      const category = searchParams.get('category');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      
      let query = 'SELECT * FROM commitments WHERE 1=1';
      const params = [];
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      
      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }
      
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      const offset = (page - 1) * limit;
      params.push(limit, offset);
      
      const { results } = await env.DB.prepare(query).bind(...params).all();
      
      return new Response(JSON.stringify({ 
        data: results,
        pagination: { page, limit }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Get commitments error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get commitments' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handlePost(request, env) {
  try {
    const { title, description, category, meeting_id } = await request.json();
    
    if (!title) {
      return new Response(JSON.stringify({ error: 'Title is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    
    await env.DB.prepare(
      'INSERT INTO commitments (id, title, description, category, status, created_at, updated_at, meeting_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, title, description || null, category || null, 'pending', now, now, meeting_id || null).run();
    
    const commitment = await env.DB.prepare(
      'SELECT * FROM commitments WHERE id = ?'
    ).bind(id).first();
    
    return new Response(JSON.stringify({ data: commitment, message: 'Created successfully' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create commitment error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create commitment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handlePut(request, env) {
  try {
    const id = request.url.split('/').pop();
    const { title, description, category, status, meeting_id } = await request.json();
    
    const existing = await env.DB.prepare(
      'SELECT * FROM commitments WHERE id = ?'
    ).bind(id).first();
    
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const now = Math.floor(Date.now() / 1000);
    const completed_at = status === 'completed' ? now : null;
    
    await env.DB.prepare(
      'UPDATE commitments SET title = ?, description = ?, category = ?, status = ?, completed_at = ?, meeting_id = ?, updated_at = ? WHERE id = ?'
    ).bind(
      title || existing.title,
      description !== undefined ? description : existing.description,
      category !== undefined ? category : existing.category,
      status || existing.status,
      completed_at,
      meeting_id !== undefined ? meeting_id : existing.meeting_id,
      now,
      id
    ).run();
    
    const commitment = await env.DB.prepare(
      'SELECT * FROM commitments WHERE id = ?'
    ).bind(id).first();
    
    return new Response(JSON.stringify({ data: commitment, message: 'Updated successfully' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update commitment error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update commitment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleDelete(url, env) {
  try {
    const id = url.pathname.split('/').pop();
    
    const existing = await env.DB.prepare(
      'SELECT * FROM commitments WHERE id = ?'
    ).bind(id).first();
    
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await env.DB.prepare(
      'DELETE FROM commitments WHERE id = ?'
    ).bind(id).run();
    
    return new Response(JSON.stringify({ message: 'Deleted successfully' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete commitment error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete commitment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
