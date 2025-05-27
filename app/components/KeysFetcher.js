async function KeysFetcher() {
  const response = await fetch('http://localhost:3000/api/forecast');
  const { keys, default_start, default_end } = await response.json();

  return (
    <ForecastForm 
      initialKeys={keys} 
      defaultDates={{ default_start, default_end }} 
    />
  );
}