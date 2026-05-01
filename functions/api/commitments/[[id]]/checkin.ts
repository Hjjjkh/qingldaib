export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.indexOf('commitments') + 1];
  
  if (request.method === 'POST') {
    // 打卡
    return handleCheckin(id, env);
  } else if (request.method === 'DELETE') {
    // 取消打卡
    return handleCancelCheckin(id, env);
  } else {
    return new Response('Method Not Allowed', { status: 405 });
  }
}

async function handleCheckin(id, env) {
  try {
    const commitment = await env.DB.prepare(
      'SELECT * FROM commitments WHERE id = ?'
    ).bind(id).first();
    
    if (!commitment) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const checkinId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    
    await env.DB.prepare(
      'INSERT INTO checkins (id, commitment_id, checked_at, created_at) VALUES (?, ?, ?, ?)'
    ).bind(checkinId, id, now, now).run();
    
    await env.DB.prepare(
      'UPDATE commitments SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?'
    ).bind('completed', now, now, id).run();
    
    return new Response(JSON.stringify({ message: 'Checkin successful' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Checkin error:', error);
    return new Response(JSON.stringify({ error: 'Failed to checkin' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleCancelCheckin(id, env) {
  try {
    const commitment = await env.DB.prepare(
      'SELECT * FROM commitments WHERE id = ?'
    ).bind(id).first();
    
    if (!commitment) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await env.DB.prepare(
      'DELETE FROM checkins WHERE commitment_id = ? ORDER BY checked_at DESC LIMIT 1'
    ).bind(id).run();
    
    await env.DB.prepare(
      'UPDATE commitments SET status = ?, completed_at = NULL, updated_at = ? WHERE id = ?'
    ).bind('pending', Math.floor(Date.now() / 1000), id).run();
    
    return new Response(JSON.stringify({ message: 'Checkin cancelled successfully' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Cancel checkin error:', error);
    return new Response(JSON.stringify({ error: 'Failed to cancel checkin' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
