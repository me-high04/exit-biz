function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pw = '';
  for (let i = 0; i < 12; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { email, firmName, dosarId } = JSON.parse(event.body || '{}');
  if (!email) return { statusCode: 400, body: JSON.stringify({ error: 'Email lipsă' }) };

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Configurare server lipsă' }) };
  }

  const password = generatePassword();

  // Create user with auto-confirmed email
  const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true
    })
  });

  const createData = await createRes.json();

  if (!createRes.ok) {
    // User already exists — reset password instead
    if (createData?.msg?.includes('already') || createData?.code === 'email_exists') {
      // Find user and update password
      const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
        headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }
      });
      const listData = await listRes.json();
      const userId = listData?.users?.[0]?.id;

      if (userId) {
        await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
          method: 'PUT',
          headers: {
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password })
        });
      }
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: createData?.msg || 'Eroare la creare cont' }) };
    }
  }

  // Send credentials email via Resend
  const blue = '#1E40AF';
  const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#0F172A;max-width:520px;margin:0 auto;padding:24px 16px;">
      <div style="text-align:center;margin-bottom:28px;">
        <span style="font-size:24px;font-weight:300;">exit<strong style="color:${blue};">biz</strong></span>
      </div>
      <h2 style="font-size:20px;font-weight:600;margin:0 0 8px;">Contul tău ExitBiz este gata!</h2>
      <p style="color:#475569;line-height:1.6;margin:0 0 20px;">
        ${firmName ? `Dosarul pentru <strong>${firmName}</strong> a fost creat.` : 'Dosarul tău a fost creat.'}
        Mai jos găsești datele de acces la platformă, unde poți urmări progresul, descărca documente și comunica cu echipa noastră.
      </p>

      <div style="background:#F0F7FF;border:1px solid #BFDBFE;border-radius:12px;padding:20px 24px;margin:20px 0;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:${blue};text-transform:uppercase;letter-spacing:.5px;">Date de conectare</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="font-size:13px;color:#64748B;padding:6px 0;width:80px;">Email</td>
            <td style="font-size:15px;font-weight:600;color:#0F172A;padding:6px 0;">${email}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#64748B;padding:6px 0;">Parolă</td>
            <td style="font-size:15px;font-weight:600;color:#0F172A;padding:6px 0;letter-spacing:1px;">${password}</td>
          </tr>
        </table>
      </div>

      <div style="text-align:center;margin:28px 0;">
        <a href="https://exitbiz.ro/login.html" style="background:${blue};color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;display:inline-block;">
          Intră în contul meu →
        </a>
      </div>

      <p style="font-size:13px;color:#94a3b8;line-height:1.6;text-align:center;">
        Îți recomandăm să îți schimbi parola după prima autentificare.<br/>
        Dacă ai întrebări, răspunde la acest email sau scrie-ne pe WhatsApp.
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="font-size:12px;color:#94a3b8;text-align:center;">ExitBiz.ro — Închiderea firmei, simplu și legal.</p>
    </div>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'ExitBiz <noreply@exitbiz.ro>',
      to: [email],
      subject: 'Datele tale de acces ExitBiz',
      html
    })
  });

  return { statusCode: 200, body: JSON.stringify({ sent: true }) };
};
