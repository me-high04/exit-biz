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

  const today = new Date().toISOString().split('T')[0];

  try {
    const res = await fetch('https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ cui: parseInt(cleanCui), data: today }])
    });

    if (!res.ok) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: 'Eroare ANAF' }) };
    }

    const data = await res.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Eroare server' }) };
  }
};
