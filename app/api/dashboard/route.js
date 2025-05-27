import { pool } from '@/lib/db';

export async function GET() {
  try {
    const connection = await pool.getConnection();

    // Service type distribution
    const [serviceRows] = await connection.query(`
      SELECT 
        service_type,
        COUNT(*) as trip_count
      FROM wl_upl_nov24
      GROUP BY service_type
    `);

    // Daily trips count (last 7 days)
    const [dailyTripRows] = await connection.query(`
      SELECT 
        DATE(in_date) as trip_date,
        COUNT(*) as trip_count
      FROM wl_upl_nov24
      GROUP BY DATE(in_date)
      ORDER BY trip_date DESC
      LIMIT 7
    `);

    connection.release();

    return Response.json({
      serviceTypeDistribution: serviceRows,
      dailyTrips: dailyTripRows
    });

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
