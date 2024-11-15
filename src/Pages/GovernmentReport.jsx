import React, { useState, useEffect } from 'react';
import {
  Button,
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import API from '../api';

const GovernmentReport = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState({
    totalSubsidyGiven: 0,
    totalSubsidizedRevenue: 0,
    recipients: [],
    subsidizedInventory: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGovernmentReport();
  }, []);

  const fetchGovernmentReport = async () => {
    setLoading(true);
    try {
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.get('/reports/generateGovernment');
      setReportData(response.data.report || {
        totalSubsidyGiven: 0,
        totalSubsidizedRevenue: 0,
        recipients: [],
        subsidizedInventory: [],
      });
      setError('');
    } catch (err) {
      setError('Error fetching government report.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    setLoading(true);
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    try {
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.get(`/reports/generateGovernment?startDate=${start}&endDate=${end}`);
      setReportData(response.data.report || {
        totalSubsidyGiven: 0,
        totalSubsidizedRevenue: 0,
        recipients: [],
        subsidizedInventory: [],
      });
      setError('');
    } catch (err) {
      setError('Error fetching custom government report.');
    } finally {
      setLoading(false);
    }
  };

  const handlePDFDownload = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    doc.text('Government Subsidy Report', 10, 10);
    doc.text(`Total Subsidy Given: ${reportData.totalSubsidyGiven} RWF`, 10, 20);
    doc.text(`Total Subsidized Revenue: ${reportData.totalSubsidizedRevenue} RWF`, 10, 30);

    const recipientTable = reportData.recipients.map((item) => [
      item.buyerName || 'N/A',
      item.phoneNumber || 'N/A',
      item.productName,
      item.subsidyApplied,
      item.finalPrice,
    ]);

    doc.autoTable({
      head: [['Beneficiary Name', 'Phone Number', 'Product', 'Subsidy Applied', 'Final Price']],
      body: recipientTable,
    });

    const inventoryTable = reportData.subsidizedInventory.map((item) => [
      item.productId,
      item.productName,
      item.remainingStock,
    ]);

    doc.autoTable({
      head: [['Product ID', 'Product Name', 'Remaining Stock']],
      body: inventoryTable,
      startY: doc.autoTable.previous.finalY + 10,
    });

    doc.save('government_report.pdf');
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Government Subsidy Report
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <Typography variant="h6" style={{ marginTop: '20px' }}>
            Report Overview
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Total Subsidy Given</TableCell>
                <TableCell>Total Subsidized Revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{reportData.totalSubsidyGiven} RWF</TableCell>
                <TableCell>{reportData.totalSubsidizedRevenue} RWF</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Typography variant="h6" style={{ marginTop: '20px' }}>
            Beneficiaries
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Beneficiary Name</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Subsidy Applied</TableCell>
                <TableCell>Final Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.recipients.map((recipient, index) => (
                <TableRow key={index}>
                  <TableCell>{recipient.buyerName || 'N/A'}</TableCell>
                  <TableCell>{recipient.phoneNumber || 'N/A'}</TableCell>
                  <TableCell>{recipient.productName}</TableCell>
                  <TableCell>{recipient.subsidyApplied} RWF</TableCell>
                  <TableCell>{recipient.finalPrice} RWF</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Typography variant="h6" style={{ marginTop: '20px' }}>
            Subsidized Product Inventory
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product ID</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Remaining Stock</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.subsidizedInventory.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>{product.productId}</TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.remainingStock}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div style={{ marginTop: '40px' }}>
            <Button variant="contained" color="secondary" onClick={handlePDFDownload}>
              Download Government Report
            </Button>
          </div>
        </>
      )}

      <div style={{ marginTop: '40px', marginBottom: '20px' }}>
        <Typography variant="h6">Generate Custom Report (Date Range):</Typography>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          placeholderText="Start Date"
        />
        &nbsp; to &nbsp;
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          placeholderText="End Date"
        />
        <Button variant="contained" color="primary" onClick={fetchCustomReport} style={{ marginLeft: '10px' }}>
          Generate Custom Report
        </Button>
      </div>
    </Container>
  );
};

export default GovernmentReport;
