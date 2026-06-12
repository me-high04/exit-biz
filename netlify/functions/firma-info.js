exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  const cui = event.queryStringParameters?.cui;
  if (!cui) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'CUI lipsă' }) };
  }

  const cleanCui = cui.replace(/[^0-9]/g, '');
  if (!cleanCui || cleanCui.length < 2 || cleanCui.length > 10) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'CUI invalid' }) };
  }

  const apiKey = process.env.OPENAPI_RO_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key lipsă — adaugă OPENAPI_RO_KEY în Netlify Environment Variables' }) };
  }

  try {
    const res = await fetch(`https://api.openapi.ro/api/companies/${cleanCui}`, {
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (res.status === 404) {
      return { statusCode: 200, headers, body: JSON.stringify({ found: [] }) };
    }

    if (!res.ok) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: `openapi.ro error: ${res.status}` }) };
    }

    const data = await res.json();

    // Normalizează răspunsul în același format pe care îl citește frontend-ul
    // openapi.ro returnează direct obiectul firmei
    const normalized = {
      found: [{
        date_generale: {
          denumire:  data.denumire  || data.name        || '',
          adresa:    data.adresa    || data.address      || '',
          nrRegCom:  data.numar_reg_com || data.nrRegCom || data.registration_number || '',
          stare:     data.stare     || data.status       || '',
          cui:       parseInt(cleanCui),
          tva:       data.tva_la_incasare ?? data.platitor_tva ?? false,
          caen:      data.cod_caen  || data.caen_code    || '',
          caenDen:   data.denumire_caen || data.caen_name || '',
        }
      }]
    };

    return { statusCode: 200, headers, body: JSON.stringify(normalized) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Eroare server: ' + err.message }) };
  }
};
