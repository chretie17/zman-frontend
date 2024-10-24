import React, { useState, useEffect } from 'react';
import { Button, Container, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import API from '../api';

const GovernmentReport = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');

  // Fetch the government report on page load
  useEffect(() => {
    fetchGovernmentReport();
  }, []);

  // Fetch overall government report
  const fetchGovernmentReport = async () => {
    try {
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.get('/reports/generateGovernment');
      setReportData(response.data.report);
      setError('');
    } catch (err) {
      setError('Error fetching government report.');
    }
  };

  // Fetch custom report based on the date range
  const fetchCustomReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    try {
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.get(`/reports/generateGovernment?startDate=${start}&endDate=${end}`);
      setReportData(response.data.report);
      setError('');
    } catch (err) {
      setError('Error fetching custom government report.');
    }
  };

  // Generate PDF for the government report
  const handlePDFDownload = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    doc.text('Government Subsidy Report', 10, 10);
    doc.text(`Total Subsidy Given: ${reportData.total_subsidy_given} RWF`, 10, 20);
    doc.text(`Total Subsidized Revenue: ${reportData.total_subsidized_revenue} RWF`, 10, 30);

    const recipientTable = reportData.recipients.map(item => [
      item.buyer_name || 'N/A',
      item.phone_number || 'N/A',
      item.product_name,
      item.subsidy_applied,
      item.final_price
    ]);

    doc.autoTable({
      head: [['Buyer Name', 'Phone Number', 'Product', 'Subsidy Applied', 'Final Price']],
      body: recipientTable
    });

    const inventoryTable = reportData.subsidized_inventory.map(item => [
      item.id,
      item.name,
      item.remaining_stock
    ]);

    doc.autoTable({
      head: [['Product ID', 'Product Name', 'Remaining Stock']],
      body: inventoryTable,
      startY: doc.autoTable.previous.finalY + 10
    });

    doc.save('government_report.pdf');
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Government Subsidy Report
      </Typography>

      {/* Display Error */}
      {error && <Typography color="error">{error}</Typography>}

      {/* Display Report */}
      {reportData && (
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
                <TableCell>{reportData.total_subsidy_given} RWF</TableCell>
                <TableCell>{reportData.total_subsidized_revenue} RWF</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Typography variant="h6" style={{ marginTop: '20px' }}>
            Beneficiaries
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Buyer Name</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Subsidy Applied</TableCell>
                <TableCell>Final Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.recipients.map((recipient, index) => (
                <TableRow key={index}>
                  <TableCell>{recipient.buyer_name || 'N/A'}</TableCell>
                  <TableCell>{recipient.phone_number || 'N/A'}</TableCell>
                  <TableCell>{recipient.product_name}</TableCell>
                  <TableCell>{recipient.subsidy_applied} RWF</TableCell>
                  <TableCell>{recipient.final_price} RWF</TableCell>
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
              {reportData.subsidized_inventory.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.remaining_stock}</TableCell>
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

      {/* Date Range Picker */}
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
