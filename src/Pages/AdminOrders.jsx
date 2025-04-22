import React, { useState, useEffect } from 'react';
import API from '../api';

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.get('/orders/admin/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    setSelectedStatus((prev) => ({ ...prev, [orderId]: newStatus }));
  };

  const handleUpdateStatus = async (orderId) => {
    try {
      const apiInstance = API.getApiInstance();
      const status = selectedStatus[orderId] || 'Pending';
      await apiInstance.put(`/orders/admin/orders/${orderId}/status`, { status });
      setSnackbarMessage('Order status updated successfully and customer notified.');
      setSnackbarOpen(true);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      setSnackbarMessage('Error updating order status.');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto my-6 px-4 py-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-center text-emerald-800 mb-6">
        Admin: Manage Orders
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price (RWF)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{order.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{order.customer_email}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{order.customer_phone}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{order.products}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.total_price} RWF</td>
                <td className="px-4 py-3 text-sm">
                  <select
                    value={selectedStatus[order.id] || order.status || 'Pending'}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Received">Received</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => handleUpdateStatus(order.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {snackbarOpen && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg text-sm flex items-center">
          <span>{snackbarMessage}</span>
          <button 
            onClick={handleCloseSnackbar}
            className="ml-3 text-gray-300 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminOrderManagement;