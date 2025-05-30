import { query } from '@/lib/db';

export async function GET(request) {
  try {
    // Fetch different datasets for your dashboard
    const salesData = await query({
      query: 'SELECT * FROM sales_data ORDER BY date',
    });

    const userData = await query({
      query: 'SELECT * FROM user_activity ORDER BY date',
    });

    const productData = await query({
      query: 'SELECT product_category, SUM(quantity) as total_quantity FROM products GROUP BY product_category',
    });

    return new Response(JSON.stringify({
      salesData,
      userData,
      productData,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}