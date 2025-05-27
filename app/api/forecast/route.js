export async function GET() {
  // Fetch keys from your external API
  const res = await fetch('https://7e20-49-37-152-74.ngrok-free.app/api/keys');
  const data = await res.json();
  
  return Response.json(data);
}

export async function POST(request) {
  const body = await request.json();
  
  // Forward request to external API
  const res = await fetch('https://7e20-49-37-152-74.ngrok-free.app/api/forecast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  const data = await res.json();
  return Response.json(data);
}