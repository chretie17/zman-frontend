import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Loader2, Download, Calendar, Filter } from "lucide-react";
import API from '../api';
import logo from '../assets/ingabologo.jpg'; // Make sure this path matches your logo location
import { format } from 'date-fns';

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
  const [activeDateRange, setActiveDateRange] = useState(null);

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
      setActiveDateRange(null);
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
    try {
      // Create dates at local timezone
      const formattedStartDate = new Date(startDate);
      formattedStartDate.setHours(0, 0, 0, 0);
  
      const formattedEndDate = new Date(endDate);
      formattedEndDate.setHours(23, 59, 59, 999);
  
      // Format dates as YYYY-MM-DD for API
      const start = format(formattedStartDate, 'yyyy-MM-dd');
      const end = format(formattedEndDate, 'yyyy-MM-dd');
  
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.get(`/reports/generateGovernment?startDate=${start}&endDate=${end}`);
      
      setReportData(response.data.report || {
        totalSubsidyGiven: 0,
        totalSubsidizedRevenue: 0,
        recipients: [],
        subsidizedInventory: [],
      });
      
      setActiveDateRange({ 
        start: formattedStartDate,
        end: formattedEndDate 
      });
      
      setError('');
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Error fetching custom government report.');
    } finally {
      setLoading(false);
    }
  };

  const handlePDFDownload = async () => {
    if (!reportData) return;
  
    // Create PDF document in portrait orientation for a more document-like feel
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (2 * margin);
  
    // Add logo
    try {
      const img = new Image();
      img.src = logo;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      doc.addImage(img, 'PNG', margin, margin, 25, 25);
    } catch (error) {
      console.error('Error loading logo:', error);
    }
  
    // Document Header
    let yPos = margin;
    
    // Title and Date
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(30, 75, 56);
    doc.text('Government Subsidy Report', margin + 35, yPos + 15);
    
    // Add date range
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    if (activeDateRange) {
      doc.text(
        `Report Period: ${format(new Date(activeDateRange.start), 'MMMM d, yyyy')} to ${format(new Date(activeDateRange.end), 'MMMM d, yyyy')}`,
        margin + 35,
        yPos + 22
      );
    }
    
    // Add generation date
    doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy')}`, margin + 35, yPos + 29);
  
    // Add decorative line
    yPos += 45;
    doc.setDrawColor(30, 75, 56);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
  
    // Executive Summary
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 75, 56);
    doc.text('Executive Summary', margin, yPos);
  
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    
    const summaryText = [
      `This report provides a comprehensive overview of the government subsidy program's performance.`,
      `Total subsidy disbursement amounts to ${Number(reportData.totalSubsidyGiven).toLocaleString()} RWF,`,
      `generating a total subsidized revenue of ${Number(reportData.totalSubsidizedRevenue).toLocaleString()} RWF.`,
      `The program has served ${reportData.recipients.length} beneficiaries during this period.`
    ].join(' ');
  
    const splitSummary = doc.splitTextToSize(summaryText, contentWidth);
    doc.text(splitSummary, margin, yPos);
    yPos += splitSummary.length * 7;
  
    // Financial Overview Section
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 75, 56);
    doc.text('Financial Overview', margin, yPos);
  
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
  
    // Create two-column layout for financial data
    const col1X = margin;
    const col2X = margin + contentWidth/2;
    
    doc.text('Total Subsidy Given:', col1X, yPos);
    doc.text(`${Number(reportData.totalSubsidyGiven).toLocaleString()} RWF`, col1X + 45, yPos);
    
    doc.text('Total Subsidized Revenue:', col2X, yPos);
    doc.text(`${Number(reportData.totalSubsidizedRevenue).toLocaleString()} RWF`, col2X + 50, yPos);
  
    // Beneficiary Details Section
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(30, 75, 56);
    doc.text('Beneficiary Details', margin, yPos);
  
    yPos += 10;
    // Beneficiaries table with refined styling
    doc.autoTable({
      startY: yPos,
      head: [['Beneficiary Name', 'Phone Number', 'Product', 'Subsidy (RWF)', 'Price (RWF)', 'Date']],
      body: reportData.recipients.map((item) => [
        item.buyerName || 'N/A',
        item.phoneNumber || 'N/A',
        item.productName,
        Number(item.subsidyApplied).toLocaleString(),
        Number(item.finalPrice).toLocaleString(),
        format(new Date(item.transactionDate), 'MMM dd, yyyy')
      ]),
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [30, 75, 56],
        fontStyle: 'bold',
      },
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
    });
  
    // Add footer to all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      
      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Agricultural Management System', margin, pageHeight - 10);
      
      // Page numbers
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: 'right' }
      );
    }
  
    // Save the document
    const filename = `government_subsidy_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(filename);
  };
  
  const datePickerConfig = {
    maxDate: new Date(),
    dateFormat: "yyyy-MM-dd",
    isClearable: true,
    showTimeSelect: false,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header with Date Range */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-[#1E4B38]">
          Government Subsidy Report
        </h1>
        {activeDateRange && (
          <div className="bg-[#1E4B38]/10 px-4 py-2 rounded-lg self-start">
            <span className="text-[#1E4B38] font-medium">
              {format(new Date(activeDateRange.start), 'MMM dd, yyyy')} - {format(new Date(activeDateRange.end), 'MMM dd, yyyy')}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#1E4B38]" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">{error}</div>
      ) : (
        <div className="space-y-8">
          {/* Overview Cards - Enhanced Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-[#1E4B38]/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-medium text-gray-600">Total Subsidy Given</h3>
                <span className="text-[#1E4B38] bg-[#1E4B38]/10 px-3 py-1 rounded-full text-sm">RWF</span>
              </div>
              <p className="text-4xl font-bold text-[#1E4B38] mt-4">
                {Number(reportData.totalSubsidyGiven).toLocaleString()}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-8 border border-[#1E4B38]/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-medium text-gray-600">Total Subsidized Revenue</h3>
                <span className="text-[#1E4B38] bg-[#1E4B38]/10 px-3 py-1 rounded-full text-sm">RWF</span>
              </div>
              <p className="text-4xl font-bold text-[#1E4B38] mt-4">
                {Number(reportData.totalSubsidizedRevenue).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Statistics Overview Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#1E4B38]/10">
            <div className="p-2">
              <h2 className="text-xl font-semibold text-[#1E4B38] mb-4">Program Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-[#1E4B38]/10 p-3 rounded-full">
                    <Filter className="h-6 w-6 text-[#1E4B38]" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Total Beneficiaries</p>
                    <p className="text-xl font-semibold text-[#1E4B38]">
                      {reportData.recipients.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-[#1E4B38]/10 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-[#1E4B38]" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Latest Transaction</p>
                    <p className="text-xl font-semibold text-[#1E4B38]">
                      {reportData.recipients.length > 0 
                        ? format(new Date(Math.max(...reportData.recipients.map(r => new Date(r.transactionDate)))), 'MMM dd, yyyy') 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Beneficiaries Table - Enhanced Design */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#1E4B38]/10">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-[#1E4B38]">Beneficiaries</h2>
              <p className="text-gray-500 mt-1">Detailed list of all subsidy beneficiaries</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#1E4B38]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Beneficiary Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Subsidy Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Final Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Transaction Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.recipients.map((recipient, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {recipient.buyerName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {recipient.phoneNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {recipient.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Number(recipient.subsidyApplied).toLocaleString()} RWF
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Number(recipient.finalPrice).toLocaleString()} RWF
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(recipient.transactionDate), 'MMM dd, yyyy HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions Section - Enhanced UI */}
          <div className="flex flex-col md:flex-row md:justify-between gap-6 bg-white rounded-xl shadow-lg p-6 border border-[#1E4B38]/10">
            {/* Date Range Selector */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <DatePicker
                  {...datePickerConfig}
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  placeholderText="Start Date"
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B38] w-40"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <span className="text-gray-500">to</span>
              
              <div className="relative">
                <DatePicker
                  {...datePickerConfig}
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  placeholderText="End Date"
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B38] w-40"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <button
                onClick={fetchCustomReport}
                className="bg-[#1E4B38] text-white px-6 py-2 rounded-lg hover:bg-[#1E4B38]/90 transition-colors flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filter Report
              </button>
              
              {activeDateRange && (
                <button
                  onClick={fetchGovernmentReport}
                  className="text-[#1E4B38] border border-[#1E4B38] px-6 py-2 rounded-lg hover:bg-[#1E4B38]/10 transition-colors"
                >
                  Clear Filter
                </button>
              )}
            </div>

            {/* Download Button */}
            <button
              onClick={handlePDFDownload}
              className="flex items-center justify-center gap-2 bg-[#1E4B38] text-white px-6 py-2 rounded-lg hover:bg-[#1E4B38]/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Report
            </button>
          </div>

          {/* Empty State */}
          {reportData.recipients.length === 0 && (
            <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-lg p-12 border border-[#1E4B38]/10">
              <div className="bg-[#1E4B38]/10 rounded-full p-4 mb-4">
                <Filter className="h-8 w-8 text-[#1E4B38]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1E4B38] mb-2">No Transactions Found</h3>
              <p className="text-gray-500 text-center">
                {activeDateRange 
                  ? "No transactions were found for the selected date range. Try adjusting your filter criteria."
                  : "There are no transactions to display at this time."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GovernmentReport;