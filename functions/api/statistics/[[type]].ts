export async function onRequest(context) {
  const { env } = context;
  const url = new URL(context.request.url);
  
  // 总览统计
  if (url.pathname.includes('overview')) {
    return handleOverview(env);
  }
  
  // 月度趋势
  if (url.pathname.includes('monthly')) {
    return handleMonthly(env, url);
  }
  
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleOverview(env) {
  try {
    // 总数统计
    const totalQuery = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM commitments'
    ).first();
    
    // 已完成统计
    const completedQuery = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM commitments WHERE status = ?'
    ).bind('completed').first();
    
    // 分类统计
    const categoryQuery = await env.DB.prepare(
      'SELECT category, COUNT(*) as count FROM commitments GROUP BY category'
    ).all();
    
    // 本月打卡次数
    const now = Math.floor(Date.now() / 1000);
    const monthStart = now - (now % (30 * 24 * 60 * 60));
    const monthlyCheckinQuery = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM checkins WHERE checked_at > ?'
    ).bind(monthStart).first();
    
    return new Response(JSON.stringify({
      data: {
        total_commitments: totalQuery?.count || 0,
        completed_commitments: completedQuery?.count || 0,
        completion_rate: Math.round((completedQuery?.count || 0) / (totalQuery?.count || 1) * 100),
        categories: categoryQuery?.results || [],
        monthly_checkins: monthlyCheckinQuery?.count || 0
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get statistics' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleMonthly(env, url) {
  try {
    const months = parseInt(url.searchParams.get('months') || '6');
    const now = Math.floor(Date.now() / 1000);
    const monthSeconds = 30 * 24 * 60 * 60;
    
    const monthlyData = [];
    for (let i = months - 1; i >= 0; i--) {
      const start = now - ((i + 1) * monthSeconds);
      const end = now - (i * monthSeconds);
      
      const query = await env.DB.prepare(
        'SELECT COUNT(*) as count FROM checkins WHERE checked_at BETWEEN ? AND ?'
      ).bind(start, end).first();
      
      const date = new Date((now - (i * monthSeconds)) * 1000);
      monthlyData.push({
        month: `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`,
        count: query?.count || 0
      });
    }
    
    return new Response(JSON.stringify({ data: monthlyData }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get monthly statistics error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get monthly statistics' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
