import React, { useState, useEffect } from 'react';
import { Button, Container, Table, TableBody, TableCell, TableHead, TableRow, Typography, Grid, Card, CardContent, Divider } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Bar } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import API from '../api';

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

    doc.autoTable({
      startY: 100,
      head: [['Product ID', 'Product Name', 'Remaining Stock']],
      body: data.inventory_report.map(item => [item.id, item.name, formatCurrency(item.remaining_stock)]),
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
    <Container className="bg-[#1F4B38]/5 min-h-screen py-12">
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
        <Typography 
          variant="h4" 
          className="bg-[#1F4B38] text-white text-center py-6 font-bold tracking-wide"
        >
          Sales Report Dashboard
        </Typography>

        {error && <Typography className="text-red-600 text-center p-4">{error}</Typography>}

        {reportData && (
          <>
            <Grid container spacing={4} className="p-8">
              {[
                { title: 'Total Sales', value: reportData.total_sales, color: 'text-[#1F4B38]' },
                { title: 'Total Pending Amount', value: reportData.total_pending_amount, color: 'text-[#1F4B38]/80' },
                { title: 'Total Public Revenue', value: reportData.revenue_breakdown.total_public_revenue, color: 'text-[#1F4B38]' }
              ].map((metric, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Card 
                    variant="outlined" 
                    className="border-[#1F4B38]/20 hover:shadow-lg transition-shadow duration-300"
                  >
                    <CardContent className="text-center">
                      <Typography variant="h6" className="text-[#1F4B38]/70 mb-2">
                        {metric.title}
                      </Typography>
                      <Typography variant="h5" className={`${metric.color} font-bold`}>
                        {formatCurrency(metric.value)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Divider className="my-4 bg-[#1F4B38]/20" />

            <div className="px-8 pb-8">
              <Typography variant="h6" className="text-[#1F4B38] mb-4">
                Inventory Overview
              </Typography>
              <Bar 
                data={{
                  labels: reportData.inventory_report.map(item => item.name),
                  datasets: [{
                    label: 'Remaining Stock',
                    data: reportData.inventory_report.map(item => item.remaining_stock),
                    backgroundColor: 'rgba(31, 75, 56, 0.7)',
                    borderColor: '#1F4B38',
                    borderWidth: 1,
                  }],
                }} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(31, 75, 56, 0.1)'
                      }
                    }
                  }
                }} 
              />
            </div>
          </>
        )}

        <div className="bg-[#1F4B38]/10 p-8">
          <Typography variant="h6" className="text-[#1F4B38] mb-4">
            Generate Custom Report
          </Typography>
          <div className="flex space-x-4 items-center justify-center">
            <DatePicker 
              selected={startDate} 
              onChange={(date) => setStartDate(date)} 
              placeholderText="Start Date" 
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F4B38]/50"
            />
            <span className="text-[#1F4B38]/70">to</span>
            <DatePicker 
              selected={endDate} 
              onChange={(date) => setEndDate(date)} 
              placeholderText="End Date" 
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1F4B38]/50"
            />
            <Button 
              variant="contained" 
              className="!bg-[#1F4B38] hover:!bg-[#1F4B38]/90 transition-colors"
              onClick={fetchCustomReport}
            >
              Generate Custom Report
            </Button>
          </div>
        </div>

        {customReportData && (
          <div className="p-8">
            <Typography variant="h6" className="text-[#1F4B38] mb-4">
              Custom Report Details
            </Typography>
            <Table className="border border-[#1F4B38]/20">
              <TableHead>
                <TableRow>
                  {['Total Sales', 'Total Pending', 'Public Revenue', 'Subsidized Revenue', 'Total Subsidy'].map((header, index) => (
                    <TableCell key={index} className="!text-[#1F4B38] !font-bold !border-[#1F4B38]/20">{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell className="!border-[#1F4B38]/20">{formatCurrency(customReportData.total_sales)}</TableCell>
                  <TableCell className="!border-[#1F4B38]/20">{formatCurrency(customReportData.total_pending_amount)}</TableCell>
                  <TableCell className="!border-[#1F4B38]/20">{formatCurrency(customReportData.revenue_breakdown.total_public_revenue)}</TableCell>
                  <TableCell className="!border-[#1F4B38]/20">{formatCurrency(customReportData.revenue_breakdown.total_subsidized_revenue)}</TableCell>
                  <TableCell className="!border-[#1F4B38]/20">{formatCurrency(customReportData.revenue_breakdown.total_subsidy_given)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}

        <div className="p-8 bg-[#1F4B38]/5 flex justify-center space-x-4">
          <Button 
            variant="contained" 
            className="!bg-[#1F4B38] hover:!bg-[#1F4B38]/90 transition-colors"
            onClick={handleOverallPDFDownload}
          >
            Download Overall Report
          </Button>
          <Button 
            variant="contained" 
            className="!bg-[#1F4B38] hover:!bg-[#1F4B38]/90 transition-colors"
            disabled={!customReportData}
            onClick={handleCustomPDFDownload}
          >
            Download Custom Report
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default Report;