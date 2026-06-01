exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const { type, to, client_name, service_type, status } = JSON.parse(event.body);

  const SERVICE_LABELS = {
    suspendare: 'Suspendare activitate',
    dizolvare: 'Dizolvare voluntară',
    radiere: 'Radiere ONRC',
    cabinet: 'Cabinet profesionist'
  };

  const STATUS_LABELS = {
    nou: 'Cerere primită',
    documente: 'Documente generate',
    depus_onrc: 'Dosar depus la ONRC',
    in_procesare: 'În procesare',
    finalizat: 'Finalizat'
  };

  const serviceLabel = SERVICE_LABELS[service_type] || service_type;
  const statusLabel = STATUS_LABELS[status] || status;
  const dashboardUrl = 'https://exitbiz.netlify.app/login.html';

  const baseStyle = `font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a1a;`;
  const green = '#1D9E75';

  let subject, html;

  if (type === 'welcome') {
    subject = `Dosarul tău ExitBiz a fost creat — ${serviceLabel}`;
    html = `
      <div style="${baseStyle}max-width:560px;margin:0 auto;padding:32px 16px;">
        <div style="text-align:center;margin-bottom:32px;">
          <span style="font-size:22px;font-weight:300;color:#1a1a1a;">exit<strong style="color:${green}">biz</strong></span>
        </div>
        <h1 style="font-size:24px;font-weight:400;margin-bottom:8px;">Bun venit, ${client_name}!</h1>
        <p style="color:#5a5a5a;line-height:1.6;margin-bottom:24px;">
          Dosarul tău pentru <strong>${serviceLabel}</strong> a fost creat și este în așteptare.
          Echipa noastră îl va procesa în cel mai scurt timp.
        </p>
        <div style="background:#f4f4f1;border-radius:12px;padding:20px;margin-bottom:24px;">
          <p style="margin:0;font-size:14px;color:#5a5a5a;">Serviciu solicitat</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:500;">${serviceLabel}</p>
        </div>
        <p style="color:#5a5a5a;line-height:1.6;margin-bottom:24px;">
          Creează-ți contul pentru a urmări statusul dosarului tău în timp real:
        </p>
        <div style="text-align:center;margin-bottom:32px;">
          <a href="${dashboardUrl}" style="background:${green};color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:500;font-size:15px;">
            Intră în contul tău →
          </a>
        </div>
        <p style="font-size:12px;color:#8a8a8a;text-align:center;">
          Ai întrebări? Scrie-ne pe WhatsApp: 0734 625 532
        </p>
      </div>`;
  } else if (type === 'status_update') {
    subject = `Status actualizat — ${serviceLabel}`;
    html = `
      <div style="${baseStyle}max-width:560px;margin:0 auto;padding:32px 16px;">
        <div style="text-align:center;margin-bottom:32px;">
          <span style="font-size:22px;font-weight:300;color:#1a1a1a;">exit<strong style="color:${green}">biz</strong></span>
        </div>
        <h1 style="font-size:24px;font-weight:400;margin-bottom:8px;">Veste nouă, ${client_name}!</h1>
        <p style="color:#5a5a5a;line-height:1.6;margin-bottom:24px;">
          Statusul dosarului tău pentru <strong>${serviceLabel}</strong> a fost actualizat.
        </p>
        <div style="background:#E1F5EE;border:1px solid ${green};border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
          <p style="margin:0;font-size:13px;color:#0F6E56;">Status nou</p>
          <p style="margin:6px 0 0;font-size:22px;font-weight:600;color:#0F6E56;">${statusLabel}</p>
        </div>
        <div style="text-align:center;margin-bottom:32px;">
          <a href="${dashboardUrl}" style="background:${green};color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:500;font-size:15px;">
            Vezi detalii în dashboard →
          </a>
        </div>
        <p style="font-size:12px;color:#8a8a8a;text-align:center;">
          Ai întrebări? Scrie-ne pe WhatsApp: 0734 625 532
        </p>
      </div>`;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'ExitBiz <onboarding@resend.dev>',
      to: [to],
      subject,
      html
    })
  });

  if (!res.ok) {
    const err = await res.text();
    return { statusCode: 500, body: err };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
