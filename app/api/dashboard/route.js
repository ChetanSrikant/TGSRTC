import { pool } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = searchParams.get('end') || new Date().toISOString().split('T')[0];

  console.log('API Request - Start Date:', startDate);
  console.log('API Request - End Date:', endDate);

  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Get statistics - using only columns that exist
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_trips,
        AVG(trip_kms) as avg_distance,
        route_code as popular_route
      FROM wl_upl_nov24
      WHERE in_date BETWEEN ? AND ?
      GROUP BY route_code
      ORDER BY COUNT(*) DESC
      LIMIT 1
    `, [startDate, endDate]);

    // 2. Daily trips data
    const [dailyTrips] = await connection.query(`
      SELECT 
        DATE_FORMAT(STR_TO_DATE(in_date, '%d%m%Y'), '%Y-%m-%d') as date,
        COUNT(*) as count
      FROM wl_upl_nov24
      WHERE STR_TO_DATE(in_date, '%d%m%Y') BETWEEN ? AND ?
      GROUP BY date
      ORDER BY date
    `, [startDate, endDate]);

    // 3. Service type distribution
    const [serviceTypes] = await connection.query(`
      SELECT 
        service_type as label,
        COUNT(*) as value
      FROM wl_upl_nov24
      WHERE STR_TO_DATE(in_date, '%d%m%Y') BETWEEN ? AND ?
      GROUP BY service_type
    `, [startDate, endDate]);

    // 4. Top routes
    const [topRoutes] = await connection.query(`
      SELECT 
        route_code as label,
        COUNT(*) as value
      FROM wl_upl_nov24
      WHERE in_date BETWEEN ? AND ?
      GROUP BY route_code
      ORDER BY COUNT(*) DESC
      LIMIT 5
    `, [startDate, endDate]);

    // 5. Ticket types
    const [ticketTypes] = await connection.query(`
      SELECT 
        ticket_type as label,
        COUNT(*) as value
      FROM wl_upl_nov24
      WHERE in_date BETWEEN ? AND ?
      GROUP BY ticket_type
    `, [startDate, endDate]);

    // 6. Trip directions
    const [tripDirections] = await connection.query(`
      SELECT 
        trip_direction as label,
        COUNT(*) as value
      FROM wl_upl_nov24
      WHERE in_date BETWEEN ? AND ?
      GROUP BY trip_direction
    `, [startDate, endDate]);

    // 7. Time distribution (using tkt_issuetime)
    const [timeDistribution] = await connection.query(`
      SELECT 
        HOUR(tkt_issuetime) as hour,
        COUNT(*) as count
      FROM wl_upl_nov24
      WHERE in_date BETWEEN ? AND ?
      GROUP BY HOUR(tkt_issuetime)
      ORDER BY hour
    `, [startDate, endDate]);

    // 8. Depot performance
    const [depotPerformance] = await connection.query(`
      SELECT 
        depot_name as label,
        COUNT(*) as trips
      FROM wl_upl_nov24
      WHERE in_date BETWEEN ? AND ?
      GROUP BY depot_name
    `, [startDate, endDate]);

    // 9. Distance coverage
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
      WHERE in_date BETWEEN ? AND ?
      GROUP BY \`range\`
    `, [startDate, endDate]);

    // Additional Queries
    const [totalCount] = await connection.query(`SELECT COUNT(*) as count FROM wl_upl_nov24`);
    const [minMaxDate] = await connection.query(`SELECT MIN(in_date) as min_date, MAX(in_date) as max_date FROM wl_upl_nov24`);

    return Response.json({
      stats: [
        {
          title: "Total Trips",
          value: stats[0]?.total_trips || 0,
          icon: "🚌",
          trend: "Daily average"
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
          trend: "Daily average"
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
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
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
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(201, 203, 207, 0.7)',
          ],
        }]
      },
      tripDirections: {
        labels: tripDirections.map(item => item.label),
        datasets: [{
          data: tripDirections.map(item => item.value),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
          ],
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
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
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