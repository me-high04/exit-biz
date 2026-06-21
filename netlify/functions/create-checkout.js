const Stripe = require('stripe');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'STRIPE_SECRET_KEY lipsă în Netlify env' }) };
  }

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Body invalid' }) }; }

  const { cui, firmName, scop, facturare, email, phone, totalRon } = body;

  const stripe = new Stripe(key, { apiVersion: '2024-04-10' });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'ron',
            product_data: {
              name: 'Certificat Constatator — ExitBiz',
              description: '30 RON taxă ONRC + 49 RON serviciu ExitBiz',
            },
            unit_amount: 7900, // 79 RON (fără TVA)
          },
          quantity: 1,
        }
      ],
      metadata: {
        cui: cui || '',
        firm_name: (firmName || '').substring(0, 500),
        scop: (scop || '').substring(0, 500),
        facturare: (facturare || '').substring(0, 500),
        phone: phone || '',
      },
      success_url: `${process.env.SITE_URL || 'https://exitbiz.ro'}/succes-plata.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.SITE_URL || 'https://exitbiz.ro'}/#certificat-constatator`,
    });

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ url: session.url }) };

  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
