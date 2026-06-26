exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { email, firmName, dosarId } = JSON.parse(event.body || '{}');
  if (!email) return { statusCode: 400, body: JSON.stringify({ error: 'Email lipsă' }) };

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Configurare server lipsă' }) };
  }

  // Invite user via Supabase Admin Auth API
  const inviteRes = await fetch(`${supabaseUrl}/auth/v1/invite`, {
    method: 'POST',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      redirect_to: 'https://exitbiz.ro/set-password.html'
    })
  });

  const inviteData = await inviteRes.json();

  if (!inviteRes.ok) {
    // "User already registered" is not a real error — invite still sent
    const isAlreadyExists = inviteData?.msg?.includes('already') || inviteData?.code === 'email_exists';
    if (!isAlreadyExists) {
      return { statusCode: 400, body: JSON.stringify({ error: inviteData?.msg || 'Eroare la trimiterea invitației' }) };
    }
  }

  // Send a branded welcome email via Resend
  const blue = '#1E40AF';
  const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;color:#0F172A;max-width:520px;margin:0 auto;padding:24px 16px;">
      <div style="text-align:center;margin-bottom:28px;">
        <span style="font-size:24px;font-weight:300;">exit<strong style="color:${blue};">biz</strong></span>
      </div>
      <h2 style="font-size:20px;font-weight:600;margin:0 0 8px;">Bun venit pe platforma ExitBiz!</h2>
      <p style="color:#475569;line-height:1.6;margin:0 0 20px;">
        Dosarul tău${firmName ? ` pentru <strong>${firmName}</strong>` : ''} a fost creat.
        Prin contul tău poți urmări progresul, descărca documente și trimite acte semnate.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="https://exitbiz.ro/dashboard.html" style="background:${blue};color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;display:inline-block;">
          Creează-ți parola și intră în cont →
        </a>
      </div>
      <p style="font-size:13px;color:#94a3b8;line-height:1.5;">
        Vei primi un email separat de la Supabase cu link-ul de setare a parolei.
        Dacă nu îl găsești, verifică folderul Spam.
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
      subject: 'Contul tău ExitBiz — Setează parola',
      html
    })
  });

  return { statusCode: 200, body: JSON.stringify({ sent: true }) };
};
