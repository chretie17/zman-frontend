import React, { useState, useEffect } from 'react';
import { Button, Container, Table, TableBody, TableCell, TableHead, TableRow, Typography, Grid, Card, CardContent, Divider } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Bar } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import API from '../api'; // Ensure the path is correct

// Register required Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Report = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [customReportData, setCustomReportData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOverallReport();
  }, []);

  const fetchOverallReport = async () => {
    try {
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.get('/reports/generate');
      setReportData(response.data.report);
    } catch (err) {
      setError('Error fetching overall report data. Please try again.');
    }
  };

  const fetchCustomReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    try {
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.get(`/reports/generate?startDate=${start}&endDate=${end}`);
      setCustomReportData(response.data.report);
    } catch (err) {
      setError('Error fetching custom report data. Please try again.');
    }
  };

  const formatCurrency = (value) => `${parseFloat(value).toFixed(2)} RWF`;

  const generatePDF = (data, title) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 10, 10);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 20);

    if (startDate && endDate) {
      doc.text(`Date Range: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`, 10, 30);
    }

    doc.text('Summary', 10, 40);
    doc.text(`Total Sales: ${formatCurrency(data.total_sales)}`, 10, 50);
    doc.text(`Total Pending Amount: ${formatCurrency(data.total_pending_amount)}`, 10, 60);
    doc.text(`Total Public Revenue: ${formatCurrency(data.revenue_breakdown.total_public_revenue)}`, 10, 70);
    doc.text(`Total Subsidized Revenue: ${formatCurrency(data.revenue_breakdown.total_subsidized_revenue)}`, 10, 80);
    doc.text(`Total Subsidy Given: ${formatCurrency(data.revenue_breakdown.total_subsidy_given)}`, 10, 90);

    // Inventory Table
    doc.autoTable({
      startY: 100,
      head: [['Product ID', 'Product Name', 'Remaining Stock']],
      body: data.inventory_report.map(item => [item.id, item.name, formatCurrency(item.remaining_stock)]),
    });

    // Government Payment Table
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 10,
      head: [['Buyer Name', 'Phone Number', 'Product Name', 'Subsidy Applied', 'Final Price']],
      body: data.government_payments.map(item => [
        item.buyerName || 'N/A',
        item.phoneNumber || 'N/A',
        item.productName,
        formatCurrency(item.subsidyApplied),
        formatCurrency(item.finalPrice),
      ]),
    });

    // Orders Table
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 10,
      head: [['Order ID', 'Customer Email', 'Customer Phone', 'Total Price', 'Order Date', 'Status', 'Products']],
      body: data.orders.map(order => [
        order.orderId,
        order.customerEmail,
        order.customerPhone,
        formatCurrency(order.totalPrice),
        new Date(order.orderDate).toLocaleDateString(),
        order.status,
        order.products.join(', '),
      ]),
    });

    doc.save(`${title}.pdf`);
  };

  const handleOverallPDFDownload = () => {
    if (reportData) {
      generatePDF(reportData, 'Overall Sales Report');
    }
  };

  const handleCustomPDFDownload = () => {
    if (customReportData) {
      generatePDF(customReportData, 'Custom Sales Report');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom style={{ textAlign: 'center', marginTop: '20px', fontWeight: 'bold' }}>
        Sales Report Dashboard
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

      {reportData && (
        <>
          <Grid container spacing={4} style={{ marginTop: '20px' }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Total Sales</Typography>
                  <Typography variant="h5" color="primary">{formatCurrency(reportData.total_sales)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Total Pending Amount</Typography>
                  <Typography variant="h5" color="secondary">{formatCurrency(reportData.total_pending_amount)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Total Public Revenue</Typography>
                  <Typography variant="h5" color="primary">{formatCurrency(reportData.revenue_breakdown.total_public_revenue)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider style={{ margin: '20px 0' }} />

          {/* Inventory Chart */}
          <Typography variant="h6" style={{ marginTop: '20px' }}>Inventory Overview (Overall)</Typography>
          <div style={{ width: '100%', marginTop: '20px' }}>
            <Bar data={{
              labels: reportData.inventory_report.map(item => item.name),
              datasets: [{
                label: 'Remaining Stock',
                data: reportData.inventory_report.map(item => item.remaining_stock),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              }],
            }} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>
        </>
      )}

      {/* Date Range Picker for Custom Report */}
      <div style={{ marginTop: '40px', marginBottom: '20px' }}>
        <Typography variant="h6">Generate Custom Report (Date Range):</Typography>
        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} placeholderText="Start Date" />
        &nbsp; to &nbsp;
        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} placeholderText="End Date" />
        <Button variant="contained" color="primary" onClick={fetchCustomReport} style={{ marginLeft: '10px' }}>
          Generate Custom Report
        </Button>
      </div>

      {customReportData && (
        <>
          <Typography variant="h6" style={{ marginTop: '20px' }}>Custom Report</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Total Sales</TableCell>
                <TableCell>Total Pending Amount</TableCell>
                <TableCell>Total Public Revenue</TableCell>
                <TableCell>Total Subsidized Revenue</TableCell>
                <TableCell>Total Subsidy Given</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{formatCurrency(customReportData.total_sales)}</TableCell>
                <TableCell>{formatCurrency(customReportData.total_pending_amount)}</TableCell>
                <TableCell>{formatCurrency(customReportData.revenue_breakdown.total_public_revenue)}</TableCell>
                <TableCell>{formatCurrency(customReportData.revenue_breakdown.total_subsidized_revenue)}</TableCell>
                <TableCell>{formatCurrency(customReportData.revenue_breakdown.total_subsidy_given)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Inventory Chart for Custom Report */}
          <Typography variant="h6" style={{ marginTop: '20px' }}>Inventory Overview (Custom)</Typography>
          <div style={{ width: '100%', marginTop: '20px' }}>
            <Bar data={{
              labels: customReportData.inventory_report.map(item => item.name),
              datasets: [{
                label: 'Remaining Stock',
                data: customReportData.inventory_report.map(item => item.remaining_stock),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              }],
            }} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>
        </>
      )}

      {/* Download Buttons */}
      <div style={{ marginTop: '40px' }}>
        <Button variant="contained" color="secondary" onClick={handleOverallPDFDownload} style={{ marginRight: '10px' }}>
          Download Overall Report
        </Button>
        <Button variant="contained" color="secondary" onClick={handleCustomPDFDownload} disabled={!customReportData}>
          Download Custom Report
        </Button>
      </div>
    </Container>
  );
};

export default Report;
