const Stripe = require('stripe');

exports.handler = async (event) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key    = process.env.STRIPE_SECRET_KEY;

  if (!key || !secret) {
    return { statusCode: 500, body: 'Config lipsă' };
  }

  const stripe = new Stripe(key, { apiVersion: '2024-04-10' });
  const sig = event.headers['stripe-signature'];

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, secret);
  } catch (err) {
    return { statusCode: 400, body: `Webhook signature invalid: ${err.message}` };
  }

  if (stripeEvent.type !== 'checkout.session.completed') {
    return { statusCode: 200, body: 'Ignored' };
  }

  const session = stripeEvent.data.object;
  const { cui, firm_name, scop, facturare, phone } = session.metadata || {};
  const email = session.customer_email || session.customer_details?.email || '';

  // Trimite email de confirmare prin Resend
  if (email) {
    const green  = '#1d9e75';
    const baseStyle = `font-family:'Helvetica Neue',Arial,sans-serif;color:#0F172A;`;
    const html = `
      <div style="${baseStyle}max-width:560px;margin:0 auto;padding:32px 16px;">
        <div style="text-align:center;margin-bottom:28px;">
          <span style="font-size:22px;font-weight:300;color:#0F172A;">exit<strong style="color:${green}">biz</strong></span>
        </div>
        <h1 style="font-size:22px;font-weight:500;margin-bottom:8px;">Plata confirmată! ✅</h1>
        <p style="color:#475569;line-height:1.6;margin-bottom:20px;">
          Mulțumim pentru comanda ta. Echipa ExitBiz va procesa Certificatul Constatator
          și îl vei primi pe această adresă de email.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:20px;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#15803d;text-transform:uppercase;letter-spacing:.5px;">Detalii comandă</p>
          ${firm_name ? `<p style="margin:4px 0;font-size:14px;"><strong>Firmă:</strong> ${firm_name}${cui ? ` (RO${cui})` : ''}</p>` : ''}
          ${scop     ? `<p style="margin:4px 0;font-size:14px;"><strong>Scop:</strong> ${scop}</p>` : ''}
          ${facturare? `<p style="margin:4px 0;font-size:14px;"><strong>Facturare:</strong> ${facturare}</p>` : ''}
          ${phone    ? `<p style="margin:4px 0;font-size:14px;"><strong>Telefon:</strong> ${phone}</p>` : ''}
          <p style="margin:10px 0 0;font-size:14px;"><strong>Total plătit:</strong> 94,01 RON (incl. TVA)</p>
        </div>
        <div style="background:#eff6ff;border-radius:10px;padding:16px;margin-bottom:24px;">
          <p style="margin:0;font-size:14px;color:#1e40af;">
            ⏱ Termenul de livrare este de <strong>1–2 zile lucrătoare</strong>.
            Dacă ai întrebări, ne poți contacta oricând pe WhatsApp:
            <a href="https://wa.me/40772129941" style="color:#1d9e75;">0772 129 941</a>
          </p>
        </div>
        <p style="font-size:12px;color:#94a3b8;text-align:center;">
          ExitBiz.ro — Închiderea firmei, simplu și legal.
        </p>
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
        subject: 'Comandă confirmată — Certificat Constatator ExitBiz',
        html
      })
    });
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
