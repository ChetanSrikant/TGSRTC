'use client';
import { Card, CardHeader, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function DailyTripsChart({ data }) {
  const formattedData = data.map(item => ({
    ...item,
    trip_date: format(new Date(item.trip_date), 'MMM dd'),
  }));

  return (
    <Card>
      <CardHeader title="Daily Trips (Last 7 Days)" />
      <CardContent style={{ height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            {/* <XAxis dataKey="trip_date" /> */}
            <YAxis />
            <Tooltip />
            <Bar dataKey="trip_count" fill="#8884d8" name="Trips" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
