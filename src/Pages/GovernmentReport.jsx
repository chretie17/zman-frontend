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
  
      console.log('Date range sent to API:', { start, end }); // For debugging
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Error fetching custom government report.');
    } finally {
      setLoading(false);
    }
  }; 
  const handlePDFDownload = async () => {
    if (!reportData) return;
  
    // Create PDF document in landscape orientation
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
  
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (2 * margin);
  
    // Add background header
    doc.setFillColor(30, 75, 56); // #1E4B38
    doc.rect(0, 0, pageWidth, 45, 'F');
  
    // Add decorative accent lines
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 43, pageWidth, 0.5, 'F');
    doc.setFillColor(234, 238, 236); // Lighter accent
    doc.rect(0, 43.5, pageWidth, 0.5, 'F');
  
    // Add logo
    try {
      const img = new Image();
      img.src = logo;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      doc.addImage(img, 'PNG', margin, 10, 25, 25);
    } catch (error) {
      console.error('Error loading logo:', error);
    }
  
    // Add header text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('Government Subsidy Report', margin + 35, 25);
  
    // Add date range and generation info
    doc.setFontSize(11);
    if (activeDateRange) {
      doc.text(
        `Report Period: ${format(new Date(activeDateRange.start), 'MMMM d, yyyy')} - ${format(new Date(activeDateRange.end), 'MMMM d, yyyy')}`,
        margin + 35,
        33
      );
    }
    doc.setFontSize(9);
    doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy HH:mm')}`, pageWidth - margin - 45, 33);
  
    let yPos = 60;
  
    // Function to create a stylish summary box
    const createSummaryBox = (x, width, title, value, options = {}) => {
      const boxHeight = 45;
      
      // Main box
      doc.setFillColor(248, 250, 249);
      doc.roundedRect(x, yPos, width, boxHeight, 3, 3, 'F');
      
      // Top accent border
      doc.setFillColor(30, 75, 56);
      doc.rect(x + 1, yPos, width - 2, 2, 'F');
      
      // Subtle border
      doc.setDrawColor(30, 75, 56);
      doc.setLineWidth(0.1);
      doc.roundedRect(x, yPos, width, boxHeight, 3, 3, 'S');
  
      // Title with decorative element
      doc.setFillColor(30, 75, 56);
      doc.circle(x + 8, yPos + 12, 1, 'F');
      
      doc.setFontSize(11);
      doc.setTextColor(102, 102, 102);
      doc.setFont('helvetica', 'normal');
      doc.text(title, x + 15, yPos + 15);
  
      // Value with enhanced styling
      const formattedValue = Number(value).toLocaleString();
      doc.setFontSize(18);
      doc.setTextColor(30, 75, 56);
      doc.setFont('helvetica', 'bold');
      doc.text(`${formattedValue} RWF`, x + 15, yPos + 35);
  
      // Add change indicator if available
      if (options.change) {
        const changeX = x + width - 45;
        const isPositive = options.change > 0;
        const changeColor = isPositive ? '#137333' : '#c5221f';
        
        // Background for change indicator
        doc.setFillColor(isPositive ? '#e6f4ea' : '#fce8e6');
        doc.roundedRect(changeX - 5, yPos + 20, 40, 15, 2, 2, 'F');
        
        // Change text
        doc.setTextColor(changeColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const changeText = `${isPositive ? '↑' : '↓'} ${Math.abs(options.change)}%`;
        doc.text(changeText, changeX, yPos + 30);
      }
    };
  
    // Create summary boxes with equal width
    const boxWidth = (contentWidth - 20) / 2;
    createSummaryBox(margin, boxWidth, 'Total Subsidy Given', reportData.totalSubsidyGiven, {
      change: 12.5 // Example change value
    });
    createSummaryBox(margin + boxWidth + 20, boxWidth, 'Total Subsidized Revenue', reportData.totalSubsidizedRevenue, {
      change: 8.3 // Example change value
    });
  
    yPos += 60;
  
    // Function to add section title
    const addSectionTitle = (title, subtitle = '') => {
      // Background accent
      doc.setFillColor(248, 250, 249);
      doc.rect(margin, yPos - 2, contentWidth, 12, 'F');
      
      // Left accent bar
      doc.setFillColor(30, 75, 56);
      doc.rect(margin, yPos, 4, 8, 'F');
      
      // Title text
      doc.setTextColor(30, 75, 56);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 10, yPos + 7);
      
      // Subtitle (if provided)
      if (subtitle) {
        doc.setTextColor(128, 128, 128);
        doc.setFontSize(10);
        doc.text(subtitle, margin + 10 + doc.getTextWidth(title) + 10, yPos + 7);
      }
      
      return yPos + 15;
    };
  
    // Beneficiaries Section
    yPos = addSectionTitle('Beneficiary Details', `${reportData.recipients.length} records found`);
  
    // Enhanced table styling for beneficiaries
    doc.autoTable({
      startY: yPos,
      head: [['Beneficiary Name', 'Phone Number', 'Product', 'Subsidy (RWF)', 'Price (RWF)', 'Date']],
      body: reportData.recipients.map((item) => [
        item.buyerName || 'N/A',
        item.phoneNumber || 'N/A',
        item.productName,
        Number(item.subsidyApplied).toLocaleString(),
        Number(item.finalPrice).toLocaleString(),
        format(new Date(item.transactionDate), 'MMM dd, yyyy HH:mm')
      ]),
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [30, 75, 56],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: { top: 6, right: 5, bottom: 6, left: 5 },
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 35 }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 249]
      },
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
      didDrawPage: (data) => {
        // Add header to each new page
        if (data.pageCount > 1) {
          doc.setFillColor(30, 75, 56);
          doc.rect(0, 0, pageWidth, 20, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(12);
          doc.text('Government Subsidy Report - Continued', margin, 13);
        }
      }
    });
  
    // Inventory Section
    yPos = doc.autoTable.previous.finalY + 20;
    yPos = addSectionTitle('Subsidized Product Inventory', `${reportData.subsidizedInventory.length} products`);
  
    // Enhanced table styling for inventory
    doc.autoTable({
      startY: yPos,
      head: [['Product ID', 'Product Name', 'Remaining Stock']],
      body: reportData.subsidizedInventory.map((item) => [
        item.productId,
        item.productName,
        Number(item.remainingStock).toLocaleString()
      ]),
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: { top: 5, right: 5, bottom: 5, left: 5 },
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [30, 75, 56],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: { top: 6, right: 5, bottom: 6, left: 5 },
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 70 },
        2: { cellWidth: 35, halign: 'right' }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 249]
      },
      margin: { left: margin, right: margin },
      tableWidth: contentWidth
    });
  
    // Add footer to all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(30, 75, 56);
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
      
      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      
      // Company info on left
      doc.text('© 2025 Agricultural Management System', margin, pageHeight - 10);
      
      // Page numbers on right
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: 'right' }
      );
    }
  
    // Save with formatted date in filename
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
    <div className="container mx-auto px-4 py-8">
      {/* Header with Date Range */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#1E4B38]">
          Government Subsidy Report
        </h1>
        {activeDateRange && (
          <div className="bg-[#1E4B38]/10 px-4 py-2 rounded-lg">
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
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#1E4B38]/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-600">Total Subsidy Given</h3>
                <span className="text-[#1E4B38] bg-[#1E4B38]/10 px-3 py-1 rounded-full text-sm">RWF</span>
              </div>
              <p className="text-3xl font-bold text-[#1E4B38] mt-2">
                {Number(reportData.totalSubsidyGiven).toLocaleString()}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#1E4B38]/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-600">Total Subsidized Revenue</h3>
                <span className="text-[#1E4B38] bg-[#1E4B38]/10 px-3 py-1 rounded-full text-sm">RWF</span>
              </div>
              <p className="text-3xl font-bold text-[#1E4B38] mt-2">
                {Number(reportData.totalSubsidizedRevenue).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Beneficiaries Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#1E4B38]/10">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#1E4B38]">Beneficiaries</h2>
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

          {/* Inventory Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#1E4B38]/10">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#1E4B38]">Subsidized Product Inventory</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#1E4B38]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Product ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Remaining Stock
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.subsidizedInventory.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.productId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Number(product.remainingStock).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions Section */}
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
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  placeholderText="End Date"
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