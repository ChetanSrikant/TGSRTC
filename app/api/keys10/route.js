// app/api/keys10/route.js
export async function GET() {
  const baseUrl = process.env.API_BASE;

  try {
    const res = await fetch(`${baseUrl}/api/keys_app10`);
    if (!res.ok) throw new Error('API responded with an error');
    
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error('GET /api/keys_app10 error:', err);
    return Response.json({ error: 'Failed to fetch keys' }, { status: 500 });
  }
}