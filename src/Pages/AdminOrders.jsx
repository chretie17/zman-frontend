import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Select, MenuItem, Button, Snackbar, Container, Typography
} from '@mui/material';
import API from '../api'; // Import API instance

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Fetch all orders on component mount
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

  // Handle status change for each order
  const handleStatusChange = (orderId, newStatus) => {
    setSelectedStatus((prev) => ({ ...prev, [orderId]: newStatus }));
  };

  // Handle updating the order status
  const handleUpdateStatus = async (orderId) => {
    try {
      const apiInstance = API.getApiInstance();
      const status = selectedStatus[orderId] || 'Pending'; // Default to 'Pending' if no status is selected
      await apiInstance.put(`/orders/admin/orders/${orderId}/status`, { status });
      setSnackbarMessage('Order status updated successfully and customer notified.');
      setSnackbarOpen(true);
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error updating order status:', error);
      setSnackbarMessage('Error updating order status.');
      setSnackbarOpen(true);
    }
  };

  // Handle Snackbar close
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Admin: Manage Orders
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Customer Email</TableCell>
            <TableCell>Customer Phone</TableCell>
            <TableCell>Products</TableCell>
            <TableCell>Total Price</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.customer_email}</TableCell>
              <TableCell>{order.customer_phone}</TableCell>
              <TableCell>{order.products}</TableCell>
              <TableCell>{order.total_price} RWF</TableCell>
              <TableCell>
                <Select
                  value={selectedStatus[order.id] || order.status || 'Pending'} // Default to 'Pending'
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  <MenuItem value="Pending">Pending</MenuItem> {/* Auto */}
                  <MenuItem value="Accepted">Accepted</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                  <MenuItem value="Received">Received</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleUpdateStatus(order.id)}
                >
                  Update Status
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Snackbar for feedback messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default AdminOrderManagement;
