export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  switch (request.method) {
    case 'GET':
      return handleGet(context);
    case 'POST':
      return handlePost(context);
    case 'DELETE':
      return handleDelete(context);
    default:
      return new Response('Method Not Allowed', { status: 405 });
  }
}

async function handleGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 1];
  
  try {
    if (id && id !== 'photos') {
      // 获取单个照片文件
      const photo = await env.DB.prepare(
        'SELECT * FROM photos WHERE id = ?'
      ).bind(id).first();
      
      if (!photo) {
        return new Response('Not found', { status: 404 });
      }
      
      const object = await env.PHOTOS.get(photo.r2_key);
      if (!object) {
        return new Response('File not found', { status: 404 });
      }
      
      return new Response(await object.arrayBuffer(), {
        headers: {
          'Content-Type': photo.content_type,
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    } else {
      // 获取照片列表
      const { searchParams } = url;
      const commitment_id = searchParams.get('commitment_id');
      const meeting_id = searchParams.get('meeting_id');
      
      let query = 'SELECT * FROM photos WHERE 1=1';
      const params = [];
      
      if (commitment_id) {
        query += ' AND commitment_id = ?';
        params.push(commitment_id);
      }
      
      if (meeting_id) {
        query += ' AND meeting_id = ?';
        params.push(meeting_id);
      }
      
      query += ' ORDER BY created_at DESC';
      
      const { results } = await env.DB.prepare(query).bind(...params).all();
      
      return new Response(JSON.stringify({ data: results }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Get photo error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get photo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handlePost(context) {
  const { env, request } = context;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const commitment_id = formData.get('commitment_id');
    const meeting_id = formData.get('meeting_id');
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'File is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'File type not allowed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File size must be less than 5MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const fileExt = file.name.split('.').pop() || 'jpg';
    const r2Key = `${commitment_id || 'uncategorized'}/${id}_${now}.${fileExt}`;
    
    // 上传到 R2
    await env.PHOTOS.put(r2Key, file, {
      contentType: file.type,
    });
    
    // 保存记录到数据库
    await env.DB.prepare(
      'INSERT INTO photos (id, commitment_id, meeting_id, r2_key, filename, content_type, size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, commitment_id || null, meeting_id || null, r2Key, file.name, file.type, file.size, now).run();
    
    return new Response(JSON.stringify({ 
      data: { id, r2_key: r2Key },
      message: 'Photo uploaded successfully' 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    return new Response(JSON.stringify({ error: 'Failed to upload photo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleDelete(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  
  try {
    const photo = await env.DB.prepare(
      'SELECT * FROM photos WHERE id = ?'
    ).bind(id).first();
    
    if (!photo) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 从 R2 删除文件
    await env.PHOTOS.delete(photo.r2_key);
    
    // 从数据库删除记录
    await env.DB.prepare(
      'DELETE FROM photos WHERE id = ?'
    ).bind(id).run();
    
    return new Response(JSON.stringify({ message: 'Deleted successfully' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete photo' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
