export async function POST(request) {
  const body = await request.json();
  
  const res = await fetch('https://5727-49-37-155-107.ngrok-free.app/api/forecast2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  const data = await res.json();
  return Response.json(data);
}