import React, { useState, useEffect } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container,
  CircularProgress,
  Paper,
  TableContainer,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import API from '../API'; // Import your API instance

const AdminTransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null); // For editing a transaction
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.get('/transactions/admin/history');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
      const apiInstance = API.getApiInstance();
      await apiInstance.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleEdit = (transaction) => {
    setEditTransaction(transaction);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setEditTransaction(null);
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    if (!editTransaction) return;
    
    try {
      const apiInstance = API.getApiInstance();
      await apiInstance.put(`/transactions/${editTransaction.id}`, editTransaction);
      setOpenDialog(false);
      fetchTransactions();
    } catch (error) {
      setError('Error updating transaction');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Admin Transaction Management
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Buyer Name</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Government ID</TableCell>
                <TableCell>Transaction Type</TableCell>
                <TableCell>Price (RWF)</TableCell>
                <TableCell>Subsidy Applied (RWF)</TableCell>
                <TableCell>Final Price (RWF)</TableCell>
                <TableCell>Transaction Date</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.product_name}</TableCell>
                  <TableCell>{transaction.buyer_name}</TableCell>
                  <TableCell>{transaction.phone_number}</TableCell>
                  <TableCell>{transaction.government_id || 'N/A'}</TableCell>
                  <TableCell>{transaction.transaction_type}</TableCell>
                  <TableCell>{transaction.price}</TableCell>
                  <TableCell>{transaction.subsidy_applied}</TableCell>
                  <TableCell>{transaction.final_price}</TableCell>
                  <TableCell>{new Date(transaction.transaction_date).toLocaleString()}</TableCell>
                  <TableCell>{transaction.payment_method}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(transaction)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handleDelete(transaction.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Transaction Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent>
          {editTransaction && (
            <>
              <TextField
                label="Buyer Name"
                value={editTransaction.buyer_name}
                onChange={(e) => setEditTransaction({ ...editTransaction, buyer_name: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Phone Number"
                value={editTransaction.phone_number}
                onChange={(e) => setEditTransaction({ ...editTransaction, phone_number: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Government ID"
                value={editTransaction.government_id || ''}
                onChange={(e) => setEditTransaction({ ...editTransaction, government_id: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Transaction Type"
                value={editTransaction.transaction_type}
                onChange={(e) => setEditTransaction({ ...editTransaction, transaction_type: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Price"
                type="number"
                value={editTransaction.price}
                onChange={(e) => setEditTransaction({ ...editTransaction, price: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Subsidy Applied"
                type="number"
                value={editTransaction.subsidy_applied}
                onChange={(e) => setEditTransaction({ ...editTransaction, subsidy_applied: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Final Price"
                type="number"
                value={editTransaction.final_price}
                onChange={(e) => setEditTransaction({ ...editTransaction, final_price: e.target.value })}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Payment Method"
                value={editTransaction.payment_method}
                onChange={(e) => setEditTransaction({ ...editTransaction, payment_method: e.target.value })}
                fullWidth
                margin="normal"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminTransactionManagement;
