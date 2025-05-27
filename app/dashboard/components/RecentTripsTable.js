'use client';
import { Card, CardHeader, CardContent } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const columns = [
  { field: 'waybill_no', headerName: 'Waybill No', width: 150 },
  { field: 'trip_no', headerName: 'Trip No', width: 100 },
  { 
    field: 'trip_direction', 
    headerName: 'Direction', 
    width: 100,
    renderCell: (params) => (
      <span style={{ 
        color: params.value === 'U' ? 'green' : 'blue',
        fontWeight: 'bold'
      }}>
        {params.value === 'U' ? 'Up' : 'Down'}
      </span>
    )
  },
  { field: 'service_type', headerName: 'Service Type', width: 150 },
  { field: 'service_name', headerName: 'Service Name', width: 200 },
  { field: 'route_from', headerName: 'From', width: 150 },
  { field: 'route_to', headerName: 'To', width: 150 },
  { 
    field: 'in_date', 
    headerName: 'Date', 
    width: 180,
    valueFormatter: (params) => new Date(params.value).toLocaleString()
  },
];

export default function RecentTripsTable({ trips }) {
  return (
    <Card>
      <CardHeader title="Recent Trips" />
      <CardContent>
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={trips}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            getRowId={(row) => row.trip_id}
          />
        </div>
      </CardContent>
    </Card>
  );
}