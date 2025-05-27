import { pool } from '@/lib/db'; // Make sure this path is correct

export async function GET(request) {
  // We no longer read start/end dates from the URL.
  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Get statistics (entire dataset)
    const [statsResult] = await connection.query(`
      SELECT 
        COUNT(*) as total_trips,
        AVG(trip_kms) as avg_distance
      FROM wl_upl_nov24
    `);
    const [popularRouteResult] = await connection.query(`
      SELECT route_code
      FROM wl_upl_nov24
      GROUP BY route_code
      ORDER BY COUNT(*) DESC
      LIMIT 1
    `);
    const stats = [{
        ...statsResult[0],
        popular_route: popularRouteResult[0]?.route_code || "N/A"
    }];


    // 2. Daily trips data (entire dataset)
    // Using DATE() based on your working example, assuming 'in_date' is a date/datetime or a parsable string.
    const [dailyTrips] = await connection.query(`
      SELECT 
        DATE_FORMAT(DATE(in_date), '%Y-%m-%d') as date,
        COUNT(*) as count
      FROM wl_upl_nov24
      GROUP BY date
      ORDER BY date
    `);

    // 3. Service type distribution (entire dataset)
    const [serviceTypes] = await connection.query(`
      SELECT 
        service_type as label,
        COUNT(*) as value
      FROM wl_upl_nov24
      GROUP BY service_type
    `);

    // 4. Top routes (entire dataset, limited to 5)
    const [topRoutes] = await connection.query(`
      SELECT 
        route_code as label,
        COUNT(*) as value
      FROM wl_upl_nov24
      GROUP BY route_code
      ORDER BY COUNT(*) DESC
      LIMIT 5
    `);

    // 5. Ticket types (entire dataset)
    const [ticketTypes] = await connection.query(`
      SELECT 
        ticket_type as label,
        COUNT(*) as value
      FROM wl_upl_nov24
      GROUP BY ticket_type
    `);

    // 6. Trip directions (entire dataset)
    const [tripDirections] = await connection.query(`
      SELECT 
        trip_direction as label,
        COUNT(*) as value
      FROM wl_upl_nov24
      GROUP BY trip_direction
    `);

    // 7. Time distribution (entire dataset)
    const [timeDistribution] = await connection.query(`
      SELECT 
        HOUR(tkt_issuetime) as hour,
        COUNT(*) as count
      FROM wl_upl_nov24
      GROUP BY HOUR(tkt_issuetime)
      ORDER BY hour
    `);

    // 8. Depot performance (entire dataset)
    const [depotPerformance] = await connection.query(`
      SELECT 
        depot_name as label,
        COUNT(*) as trips
      FROM wl_upl_nov24
      GROUP BY depot_name
    `);

    // 9. Distance coverage (entire dataset)
    const [distanceCoverage] = await connection.query(`
      SELECT 
        CASE
          WHEN trip_kms < 50 THEN '<50 km'
          WHEN trip_kms BETWEEN 50 AND 100 THEN '50-100 km'
          WHEN trip_kms BETWEEN 100 AND 150 THEN '100-150 km'
          ELSE '>150 km'
        END as \`range\`,
        COUNT(*) as count
      FROM wl_upl_nov24
      GROUP BY \`range\`
    `);

    // Additional Queries (already unfiltered)
    const [totalCount] = await connection.query(`SELECT COUNT(*) as count FROM wl_upl_nov24`);
    const [minMaxDate] = await connection.query(`SELECT MIN(DATE(in_date)) as min_date, MAX(DATE(in_date)) as max_date FROM wl_upl_nov24`);

    return Response.json({
      stats: [
        {
          title: "Total Trips",
          value: stats[0]?.total_trips || 0,
          icon: "🚌",
          trend: "Overall"
        },
        {
          title: "Avg Distance",
          value: `${stats[0]?.avg_distance?.toFixed(1) || 0} km`,
          icon: "📍",
          trend: "Per trip"
        },
        {
          title: "Popular Route",
          value: stats[0]?.popular_route || "N/A",
          icon: "🛣️",
          trend: "Most traveled"
        },
        {
          title: "Total Tickets",
          value: stats[0]?.total_trips || 0, // Using trip count as proxy
          icon: "🎫",
          trend: "Overall"
        }
      ],
      dailyTrips: {
        labels: dailyTrips.map(item => item.date),
        datasets: [{
          label: 'Trips',
          data: dailyTrips.map(item => item.count),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
        }]
      },
      serviceTypes: {
        labels: serviceTypes.map(item => item.label),
        datasets: [{
          data: serviceTypes.map(item => item.value),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
          ],
        }]
      },
      topRoutes: {
        labels: topRoutes.map(item => item.label),
        datasets: [{
          label: 'Trips',
          data: topRoutes.map(item => item.value),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }]
      },
      ticketTypes: {
        labels: ticketTypes.map(item => item.label),
        datasets: [{
          data: ticketTypes.map(item => item.value),
          backgroundColor: [
            'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
            'rgba(201, 203, 207, 0.7)', 'rgba(255, 99, 132, 0.7)'
          ],
        }]
      },
      tripDirections: {
        labels: tripDirections.map(item => item.label),
        datasets: [{
          data: tripDirections.map(item => item.value),
          backgroundColor: [ 'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)' ],
        }]
      },
      timeDistribution: {
        labels: timeDistribution.map(item => `${item.hour}:00`),
        datasets: [{
          label: 'Tickets Issued',
          data: timeDistribution.map(item => item.count),
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
        }]
      },
      depotPerformance: {
        labels: depotPerformance.map(item => item.label),
        datasets: [{
          label: 'Trips',
          data: depotPerformance.map(item => item.trips),
          backgroundColor: 'rgba(59, 130, 246, 0.6)'
        }]
      },
      distanceCoverage: {
        labels: distanceCoverage.map(item => item.range),
        datasets: [{
          data: distanceCoverage.map(item => item.count),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)',
          ],
        }]
      },
      additionalData: {
        totalCount: totalCount[0]?.count || 0,
        minDate: minMaxDate[0]?.min_date || null,
        maxDate: minMaxDate[0]?.max_date || null,
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

// Client-side code (e.g., in a React component)
useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = '/api/dashboard'; // No date params needed
      console.log('Fetching from:', apiUrl);

      const res = await fetch(apiUrl, {
        next: { revalidate: 3600 }
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log('Received data:', data); // This will now show all data
      setDashboardData(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, []); // Still runs only once on mount