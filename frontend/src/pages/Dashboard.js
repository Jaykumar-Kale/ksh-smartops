import { useEffect, useState } from 'react';
import api from '../services/api';

function Dashboard() {
  const [warehouseData, setWarehouseData] = useState([]);

  useEffect(() => {
    api.get('/analytics/warehouse')
      .then(res => setWarehouseData(res.data.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <h2>Warehouse Analytics</h2>

      <pre style={{ background: '#fff', padding: '16px' }}>
        {JSON.stringify(warehouseData, null, 2)}
      </pre>
    </div>
  );
}

export default Dashboard;
