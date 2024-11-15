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
  Tabs,
  Tab,
} from '@mui/material';
import API from '../api';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0); // 0 = Gov, 1 = Public

  useEffect(() => {
    fetchTransactions();
  }, [tab]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const apiInstance = API.getApiInstance();
      const endpoint = tab === 0 ? '/transactions/gov' : '/transactions/public';
      const response = await apiInstance.get(endpoint);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Transaction History
      </Typography>

      <Tabs value={tab} onChange={handleTabChange}>
        <Tab label="Government-Subsidized Sales" />
        <Tab label="Public Sales" />
      </Tabs>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                {tab === 1 && <TableCell>Buyer Name</TableCell>}
                {tab === 1 && <TableCell>Phone Number</TableCell>}
                {tab === 0 && (
                  <>
                    <TableCell>Beneficiary Name</TableCell>
                    <TableCell>Beneficiary National ID</TableCell>
                    <TableCell>Beneficiary Phone</TableCell>
                  </>
                )}
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
                  {tab === 1 && <TableCell>{transaction.buyer_name}</TableCell>}
                  {tab === 1 && <TableCell>{transaction.phone_number}</TableCell>}
                  {tab === 0 && (
                    <>
                      <TableCell>{transaction.beneficiary_name}</TableCell>
                      <TableCell>{transaction.beneficiary_national_id}</TableCell>
                      <TableCell>{transaction.beneficiary_phone}</TableCell>
                    </>
                  )}
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

export default TransactionHistory;
