export async function GET() {
  // Fetch keys from your new external API
  const res = await fetch('https://07fe-2405-201-c034-18b1-f428-57b3-398e-5b6c.ngrok-free.app/api/keys');
  const data = await res.json();
  
  return Response.json(data);
}

export async function POST(request) {
  const body = await request.json();
  
  // Forward request to new external API
  const res = await fetch('https://07fe-2405-201-c034-18b1-f428-57b3-398e-5b6c.ngrok-free.app/api/forecast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  const data = await res.json();
  return Response.json(data);
}

