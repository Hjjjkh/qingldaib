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
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    if (id && id !== 'meetings') {
      // 获取单个见面记录
      const meeting = await env.DB.prepare(
        'SELECT * FROM meetings WHERE id = ?'
      ).bind(id).first();
      
      if (!meeting) {
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ data: meeting }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // 获取列表
      const { searchParams } = url;
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      
      const offset = (page - 1) * limit;
      
      const { results } = await env.DB.prepare(
        'SELECT * FROM meetings ORDER BY date DESC LIMIT ? OFFSET ?'
      ).bind(limit, offset).all();
      
      return new Response(JSON.stringify({ 
        data: results,
        pagination: { page, limit }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Get meetings error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get meetings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handlePost(request, env) {
  try {
    const { date, location, notes } = await request.json();
    
    if (!date) {
      return new Response(JSON.stringify({ error: 'Date is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    
    await env.DB.prepare(
      'INSERT INTO meetings (id, date, location, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, date, location || null, notes || null, now, now).run();
    
    const meeting = await env.DB.prepare(
      'SELECT * FROM meetings WHERE id = ?'
    ).bind(id).first();
    
    return new Response(JSON.stringify({ data: meeting, message: 'Created successfully' }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create meeting' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handlePut(request, env) {
  try {
    const id = request.url.split('/').pop();
    const { date, location, notes } = await request.json();
    
    const existing = await env.DB.prepare(
      'SELECT * FROM meetings WHERE id = ?'
    ).bind(id).first();
    
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const now = Math.floor(Date.now() / 1000);
    
    await env.DB.prepare(
      'UPDATE meetings SET date = ?, location = ?, notes = ?, updated_at = ? WHERE id = ?'
    ).bind(
      date || existing.date,
      location !== undefined ? location : existing.location,
      notes !== undefined ? notes : existing.notes,
      now,
      id
    ).run();
    
    const meeting = await env.DB.prepare(
      'SELECT * FROM meetings WHERE id = ?'
    ).bind(id).first();
    
    return new Response(JSON.stringify({ data: meeting, message: 'Updated successfully' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update meeting' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleDelete(url, env) {
  try {
    const id = url.pathname.split('/').pop();
    
    const existing = await env.DB.prepare(
      'SELECT * FROM meetings WHERE id = ?'
    ).bind(id).first();
    
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await env.DB.prepare(
      'DELETE FROM meetings WHERE id = ?'
    ).bind(id).run();
    
    return new Response(JSON.stringify({ message: 'Deleted successfully' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete meeting error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete meeting' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
