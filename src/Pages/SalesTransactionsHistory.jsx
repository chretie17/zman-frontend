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
} from '@mui/material';
import API from '../api'; // Import your API instance

const SalesTransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.get('/transactions/sales/history');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Sales Transaction History
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
                <TableCell>Transaction Type</TableCell>
                <TableCell>Price (RWF)</TableCell>
                <TableCell>Subsidy Applied (RWF)</TableCell>
                <TableCell>Final Price (RWF)</TableCell>
                <TableCell>Transaction Date</TableCell>
                <TableCell>Payment Method</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.product_name}</TableCell>
                  <TableCell>{transaction.buyer_name}</TableCell>
                  <TableCell>{transaction.phone_number}</TableCell>
                  <TableCell>{transaction.transaction_type}</TableCell>
                  <TableCell>{transaction.price}</TableCell>
                  <TableCell>{transaction.subsidy_applied}</TableCell>
                  <TableCell>{transaction.final_price}</TableCell>
                  <TableCell>{new Date(transaction.transaction_date).toLocaleString()}</TableCell>
                  <TableCell>{transaction.payment_method}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default SalesTransactionHistory;
