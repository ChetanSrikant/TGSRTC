// app/api/forecast11/route.js
export async function POST(request) {
  const baseUrl = process.env.API_WRL_UPPAL;

  try {
    const body = await request.json();
    const res = await fetch(`${baseUrl}/api/forecast_app11`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error('API responded with an error');

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error('POST /api/forecast_app11 error:', err);
    return Response.json({ error: 'Failed to fetch forecast' }, { status: 500 });
  }
}