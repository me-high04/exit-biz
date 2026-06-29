function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pw = '';
  for (let i = 0; i < 12; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { email, role, firmName } = JSON.parse(event.body || '{}');
  if (!email) return { statusCode: 400, body: JSON.stringify({ error: 'Email lipsă' }) };

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Configurare server lipsă' }) };
  }

  const blue = '#1E40AF';
  const roleLabel = role || 'Profesionist';

  // Check if user already exists
  const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
    headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }
  });
  const listData = await listRes.json();
  const existingUser = listData?.users?.[0];

  if (existingUser) {
    // User already has account — just send access notification, do NOT reset password
    const html = `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#0F172A;max-width:520px;margin:0 auto;padding:24px 16px;">
        <div style="text-align:center;margin-bottom:28px;">
          <span style="font-size:24px;font-weight:300;">exit<strong style="color:${blue};">biz</strong></span>
        </div>
        <h2 style="font-size:20px;font-weight:600;margin:0 0 8px;">Ai fost adăugat la un dosar nou</h2>
        <p style="color:#475569;line-height:1.6;margin:0 0 20px;">
          ${firmName ? `Ai acces la dosarul <strong>${firmName}</strong>.` : 'Un dosar nou ți-a fost asignat.'}
          Intră în panoul tău pentru a vizualiza progresul și a colabora.
        </p>
        <div style="background:#F0F7FF;border:1px solid #BFDBFE;border-radius:12px;padding:16px 24px;margin:20px 0;">
          <p style="margin:0;font-size:14px;color:#475569;">Folosește același cont cu care ești deja înregistrat pe <strong>ExitBiz</strong>.</p>
        </div>
        <div style="text-align:center;margin:28px 0;">
          <a href="https://exitbiz.ro/login.html" style="background:${blue};color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;display:inline-block;">
            Intră în panoul meu →
          </a>
        </div>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
        <p style="font-size:12px;color:#94a3b8;text-align:center;">ExitBiz.ro — Închiderea firmei, simplu și legal.</p>
      </div>`;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'ExitBiz <noreply@exitbiz.ro>',
        to: [email],
        subject: `Ai fost adăugat la dosarul ${firmName || 'nou'} — ExitBiz`,
        html
      })
    });

    return { statusCode: 200, body: JSON.stringify({ sent: true, existing: true }) };
  }

  // New user — create account with password and send credentials
  const password = generatePassword();

  const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, email_confirm: true })
  });

  const createData = await createRes.json();
  const userId = createData?.id;

  if (!createRes.ok || !userId) {
    return { statusCode: 400, body: JSON.stringify({ error: createData?.msg || 'Eroare la creare cont' }) };
  }

  // Set role = 'profesionist' in profiles table
  await fetch(`${supabaseUrl}/rest/v1/profiles`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=minimal'
    },
    body: JSON.stringify({ id: userId, role: 'profesionist' })
  });

  // Send credentials email
  const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#0F172A;max-width:520px;margin:0 auto;padding:24px 16px;">
      <div style="text-align:center;margin-bottom:28px;">
        <span style="font-size:24px;font-weight:300;">exit<strong style="color:${blue};">biz</strong></span>
      </div>
      <h2 style="font-size:20px;font-weight:600;margin:0 0 8px;">Ai fost adăugat ca ${roleLabel} pe platforma ExitBiz</h2>
      <p style="color:#475569;line-height:1.6;margin:0 0 20px;">
        ${firmName ? `Ai acces la dosarul <strong>${firmName}</strong>.` : 'Ai acces la dosarele care ți-au fost asignate.'}
        Intră în panoul tău pentru a vizualiza progresul, a aproba pași și a colabora cu ceilalți profesioniști.
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
          <tr>
            <td style="font-size:13px;color:#64748B;padding:6px 0;">Rol</td>
            <td style="font-size:15px;font-weight:600;color:#0F172A;padding:6px 0;">${roleLabel}</td>
          </tr>
        </table>
      </div>
      <div style="text-align:center;margin:28px 0;">
        <a href="https://exitbiz.ro/login.html" style="background:${blue};color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;display:inline-block;">
          Intră în panoul meu →
        </a>
      </div>
      <p style="font-size:13px;color:#94a3b8;line-height:1.6;text-align:center;">
        Îți recomandăm să îți schimbi parola după prima autentificare.
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="font-size:12px;color:#94a3b8;text-align:center;">ExitBiz.ro — Închiderea firmei, simplu și legal.</p>
    </div>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'ExitBiz <noreply@exitbiz.ro>',
      to: [email],
      subject: `Acces panou ExitBiz — ${roleLabel}`,
      html
    })
  });

  return { statusCode: 200, body: JSON.stringify({ sent: true, existing: false }) };
};
