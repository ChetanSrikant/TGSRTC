export async function POST(request) {
  const body = await request.json();
  
  const res = await fetch('https://2f76-2405-201-c034-18b1-88a2-78f5-2901-444d.ngrok-free.app/api/forecast3', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  const data = await res.json();
  return Response.json(data);
}