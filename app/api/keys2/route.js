export async function GET() {
  const res = await fetch('https://5727-49-37-155-107.ngrok-free.app/api/keys2');
  const data = await res.json();
  return Response.json(data);
}