exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { dosarId, firmName, clientEmail, fileName, uploadedBy } = JSON.parse(event.body || '{}');
  if (!fileName || !uploadedBy) return { statusCode: 400, body: 'Date lipsă' };

  const green = '#1d9e75';
  const base = `font-family:'Helvetica Neue',Arial,sans-serif;color:#0F172A;`;

  let to, subject, html;

  if (uploadedBy === 'client') {
    to = ['ducaduca124@gmail.com'];
    subject = `📎 Document nou de la client — ${firmName || dosarId}`;
    html = `<div style="${base}max-width:520px;margin:0 auto;padding:24px 16px;">
      <span style="font-size:20px;font-weight:300;">exit<strong style="color:${green};">biz</strong></span>
      <h2 style="margin:16px 0 8px;">Document nou încărcat de client</h2>
      <p style="color:#475569;">Clientul a încărcat un document nou în dosarul:</p>
      <div style="background:#f8fafc;border-radius:10px;padding:16px;margin:16px 0;">
        <p style="margin:4px 0;font-size:14px;"><strong>Firmă:</strong> ${firmName || '—'}</p>
        <p style="margin:4px 0;font-size:14px;"><strong>Email client:</strong> ${clientEmail || '—'}</p>
        <p style="margin:4px 0;font-size:14px;"><strong>Fișier:</strong> ${fileName}</p>
      </div>
      <p style="font-size:13px;color:#94a3b8;">Intră în panoul admin pentru a vizualiza și descărca documentul.</p>
    </div>`;
  } else {
    to = [clientEmail];
    subject = `📎 Document nou disponibil — ExitBiz`;
    html = `<div style="${base}max-width:520px;margin:0 auto;padding:24px 16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:22px;font-weight:300;">exit<strong style="color:${green};">biz</strong></span>
      </div>
      <h2 style="margin:0 0 8px;font-size:20px;">Ai un document nou de descărcat</h2>
      <p style="color:#475569;line-height:1.6;">Echipa ExitBiz a încărcat un document nou în dosarul tău. Intră în contul tău pentru a-l descărca, semna și reîncărca.</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:20px 0;">
        <p style="margin:4px 0;font-size:14px;"><strong>Fișier:</strong> ${fileName}</p>
        ${firmName ? `<p style="margin:4px 0;font-size:14px;"><strong>Dosar:</strong> ${firmName}</p>` : ''}
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://exitbiz.ro/dashboard.html" style="background:${green};color:#fff;text-decoration:none;padding:13px 28px;border-radius:10px;font-size:15px;font-weight:600;display:inline-block;">
          Deschide dosarul meu →
        </a>
      </div>
      <p style="font-size:12px;color:#94a3b8;text-align:center;">ExitBiz.ro — Închiderea firmei, simplu și legal.</p>
    </div>`;
  }

  if (!to || (uploadedBy === 'cabinet' && !clientEmail)) {
    return { statusCode: 200, body: 'No email sent (missing recipient)' };
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: 'ExitBiz <noreply@exitbiz.ro>', to, subject, html })
  });

  return { statusCode: 200, body: JSON.stringify({ sent: true }) };
};
