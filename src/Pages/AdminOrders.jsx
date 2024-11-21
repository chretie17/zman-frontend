import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Button,
  Snackbar,
  Container,
  Typography,
  Paper,
  TableContainer,
} from '@mui/material';
import { styled } from '@mui/system';
import API from '../api';

const CustomContainer = styled(Container)({
  backgroundColor: '#f9f9f9',
  padding: '2rem',
  borderRadius: '10px',
  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
  marginTop: '2rem',
});

const CustomButton = styled(Button)({
  backgroundColor: '#1F4B38',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#2C6E54',
  },
  borderRadius: '25px',
  padding: '0.5rem 2rem',
  boxShadow: '0px 4px 12px rgba(31, 75, 56, 0.4)',
  transition: 'all 0.3s ease-in-out',
});

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
    <CustomContainer>
      <Typography variant="h4" gutterBottom className="text-[#1F4B38] font-bold text-center mb-8">
        Admin: Manage Orders
      </Typography>

      <TableContainer component={Paper} elevation={3} className="p-4">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer Email</TableCell>
              <TableCell>Customer Phone</TableCell>
              <TableCell>Products</TableCell>
              <TableCell>Total Price (RWF)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customer_email}</TableCell>
                <TableCell>{order.customer_phone}</TableCell>
                <TableCell>{order.products}</TableCell>
                <TableCell>{order.total_price} RWF</TableCell>
                <TableCell>
                  <Select
                    value={selectedStatus[order.id] || order.status || 'Pending'}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    variant="outlined"
                    style={{ minWidth: '120px' }}
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Accepted">Accepted</MenuItem>
                    <MenuItem value="Delivered">Delivered</MenuItem>
                    <MenuItem value="Received">Received</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <CustomButton onClick={() => handleUpdateStatus(order.id)}>
                    Update Status
                  </CustomButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </CustomContainer>
  );
};

export default AdminOrderManagement;
