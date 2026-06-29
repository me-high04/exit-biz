exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const token = (event.headers.authorization || '').replace('Bearer ', '');
  if (!token) return { statusCode: 401, body: 'Unauthorized' };

  // Verify token and get user id
  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${token}` }
  });
  if (!userRes.ok) return { statusCode: 401, body: 'Invalid token' };

  const { id: userId } = await userRes.json();

  // Delete user via admin API
  const del = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }
  });

  if (!del.ok) return { statusCode: 500, body: JSON.stringify({ error: 'Delete failed' }) };

  return { statusCode: 200, body: JSON.stringify({ deleted: true }) };
};
