import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Bar } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import API from '../api';
import logoImage from '../assets/ingabologo.jpg'; // Import the logo

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Report = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [customReportData, setCustomReportData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    fetchOverallReport();
  }, []);

  const fetchOverallReport = async () => {
    try {
      setIsLoading(true);
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.get('/reports/generate');
      setReportData(response.data.report);
      setError('');
    } catch (err) {
      setError('Error fetching overall report data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    if (endDate < startDate) {
      setError('End date must be after start date.');
      return;
    }

    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    try {
      setIsLoading(true);
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.get(`/reports/generate?startDate=${start}&endDate=${end}`);
      setCustomReportData(response.data.report);
      setError('');
    } catch (err) {
      setError('Error fetching custom report data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => `${parseFloat(value).toFixed(2)} RWF`;

  const generatePDF = (data, title) => {
    // Create new jsPDF instance
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Add a professional header with background
    doc.setFillColor(31, 75, 56); // #1F4B38
    doc.rect(0, 0, pageWidth, 35, "F");
    
    // Add company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("INGABO PLANT HEALTH LTD", pageWidth/2, 15, { align: "center" });
    
    // Add report title
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text(title, pageWidth/2, 25, { align: "center" });
    
    // Add logo from assets folder
    // Note: In a real implementation, we'd use a base64 image or URL
    // For this example, we'll simulate adding the logo
    try {
      // Create an image element to get the base64 data
      const img = new Image();
      img.src = logoImage;
      
      // Convert the image to base64 for jsPDF
      // In a real implementation, this would be handled differently
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      // Add the logo image to PDF
      const imgData = canvas.toDataURL('image/png');
      doc.addImage(imgData, 'PNG', 10, 5, 25, 25);
    } catch (e) {
      console.error("Error adding logo to PDF:", e);
      // Fallback - add a placeholder for the logo
      doc.setFillColor(255, 255, 255);
      doc.circle(20, 15, 10, "F");
      doc.setTextColor(31, 75, 56);
      doc.setFontSize(12);
      doc.text("LOGO", 20, 15, { align: "center" });
    }
    
    // Document info section
    doc.setTextColor(90, 90, 90);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, 45);

    if (startDate && endDate) {
      doc.text(`Report Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`, 15, 50);
    }
    
    doc.text(`Document ID: RPT-${Math.floor(Math.random() * 10000)}-${new Date().getFullYear()}`, pageWidth - 15, 45, { align: "right" });
    
    // Decorative line
    doc.setDrawColor(31, 75, 56);
    doc.setLineWidth(0.5);
    doc.line(15, 55, pageWidth - 15, 55);
    
    // Summary section with enhanced styling
    doc.setFillColor(240, 247, 244); // Light green background
    doc.roundedRect(15, 60, pageWidth - 30, 45, 3, 3, "F");
    
    doc.setDrawColor(31, 75, 56);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, 60, pageWidth - 30, 45, 3, 3, "D");
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 75, 56);
    doc.text("FINANCIAL SUMMARY", pageWidth/2, 70, { align: "center" });
    
    // Create two columns for the summary data
    const col1X = 25;
    const col2X = pageWidth/2 + 10;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    
    // Column 1 labels
    doc.text("Total Sales:", col1X, 80);
    doc.text("Total Pending Amount:", col1X, 87);
    doc.text("Public Revenue:", col1X, 94);
    
    // Column 2 labels
    doc.text("Subsidized Revenue:", col2X, 80);
    doc.text("Total Subsidy Given:", col2X, 87);
    
    // Set values style
    doc.setFont("helvetica", "normal");
    doc.setTextColor(31, 75, 56);
    
    // Column 1 values
    doc.text(formatCurrency(data.total_sales), col1X + 40, 80);
    doc.text(formatCurrency(data.total_pending_amount), col1X + 40, 87);
    doc.text(formatCurrency(data.revenue_breakdown.total_public_revenue), col1X + 40, 94);
    
    // Column 2 values
    doc.text(formatCurrency(data.revenue_breakdown.total_subsidized_revenue), col2X + 40, 80);
    doc.text(formatCurrency(data.revenue_breakdown.total_subsidy_given), col2X + 40, 87);
    
    // Capture chart as image if available
    let chartImage = null;
    if (chartRef.current) {
      try {
        chartImage = chartRef.current.toBase64Image();
      } catch (e) {
        console.error("Error converting chart to image:", e);
      }
    }
    
    // Chart section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 75, 56);
    doc.text("INVENTORY OVERVIEW", pageWidth/2, 120, { align: "center" });
    
    // Add chart image if available
    if (chartImage) {
      doc.addImage(chartImage, 'PNG', 25, 125, pageWidth - 50, 60);
    } else {
      // If chart image is not available, create a placeholder
      doc.setFillColor(240, 247, 244);
      doc.roundedRect(25, 125, pageWidth - 50, 60, 3, 3, "F");
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(12);
      doc.text("Chart visualization not available", pageWidth/2, 155, { align: "center" });
    }
    
    // Table for inventory with improved styling
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 75, 56);
    doc.text("INVENTORY DETAILS", pageWidth/2, 200, { align: "center" });
    
    const tableColumn = ["Product ID", "Product Name", "Remaining Stock"];
    const tableRows = data.inventory_report.map(item => [
      item.id, 
      item.name, 
      formatCurrency(item.remaining_stock)
    ]);
    
    doc.autoTable({
      startY: 205,
      head: [tableColumn],
      body: tableRows,
      headStyles: { 
        fillColor: [31, 75, 56],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [240, 247, 244]
      },
      columnStyles: {
        0: { halign: 'center' },
        2: { halign: 'right' }
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
        lineColor: [200, 220, 210],
        lineWidth: 0.1,
      },
      margin: { top: 205 }
    });
    
    // Add a watermark (very subtle)
    doc.setTextColor(240, 240, 240);
    doc.setFontSize(60);
    doc.setFont("helvetica", "bold");
    doc.text("INGABO", pageWidth/2, pageHeight/2, { align: "center", angle: 45 });
    
    // Footer with company info
    doc.setFillColor(240, 247, 244);
    doc.rect(0, pageHeight - 20, pageWidth, 20, "F");
    
    doc.setDrawColor(31, 75, 56);
    doc.setLineWidth(0.5);
    doc.line(0, pageHeight - 20, pageWidth, pageHeight - 20);
    
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.text("Ingabo Plant Health Ltd • Kigali, Rwanda • www.ingaboplant.com", pageWidth/2, pageHeight - 15, { align: "center" });
    
    // Page numbering
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 5);
    }
    
    // Save the PDF
    doc.save(`${title}_${new Date().toISOString().split('T')[0]}.pdf`);
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

  const getChartOptions = () => {
    return {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: {
              family: "'Poppins', sans-serif",
              size: 12
            },
            color: '#1F4B38'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(31, 75, 56, 0.8)',
          titleFont: {
            family: "'Poppins', sans-serif",
            size: 14
          },
          bodyFont: {
            family: "'Poppins', sans-serif",
            size: 13
          },
          padding: 12,
          cornerRadius: 8,
          displayColors: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(31, 75, 56, 0.08)',
            drawBorder: false
          },
          ticks: {
            color: 'rgb(31, 75, 56)',
            font: {
              family: "'Poppins', sans-serif"
            },
            callback: function(value) {
              return value.toLocaleString() + ' RWF';
            }
          },
          title: {
            display: true,
            text: 'Stock Value (RWF)',
            color: 'rgb(31, 75, 56)',
            font: {
              family: "'Poppins', sans-serif",
              size: 14
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: 'rgb(31, 75, 56)',
            font: {
              family: "'Poppins', sans-serif"
            }
          },
          title: {
            display: true,
            text: 'Products',
            color: 'rgb(31, 75, 56)',
            font: {
              family: "'Poppins', sans-serif",
              size: 14
            }
          }
        }
      }
    };
  };

  const getChartData = (data) => {
    return {
      labels: data.inventory_report.map(item => item.name),
      datasets: [{
        label: 'Remaining Stock Value',
        data: data.inventory_report.map(item => item.remaining_stock),
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(5, 150, 105, 0.8)',
          'rgba(4, 120, 87, 0.8)',
          'rgba(6, 95, 70, 0.8)',
          'rgba(20, 83, 45, 0.8)',
          'rgba(31, 75, 56, 0.8)'
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(5, 150, 105)',
          'rgb(4, 120, 87)',
          'rgb(6, 95, 70)',
          'rgb(20, 83, 45)',
          'rgb(31, 75, 56)'
        ],
        borderWidth: 1,
        borderRadius: 6,
        hoverOffset: 4
      }]
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-emerald-800 text-white py-6 px-8 flex items-center justify-center">
            <div className="mr-4">
              <img src={logoImage} alt="Ingabo Plant Health Ltd" className="h-12 w-auto" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-emerald-100">INGABO PLANT HEALTH LTD</h3>
              <h1 className="text-3xl font-bold tracking-tight">Sales Report Dashboard</h1>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4 mx-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-center items-center p-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-800"></div>
            </div>
          )}

          {reportData && !isLoading && (
            <>
              {/* Metrics Cards - with enhanced styling */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-md border border-emerald-100 overflow-hidden hover:shadow-lg transition duration-300">
                  <div className="p-5">
                    <h3 className="text-emerald-700 opacity-80 text-lg font-medium">Total Sales</h3>
                    <p className="text-2xl font-bold text-emerald-800 mt-2">{formatCurrency(reportData.total_sales)}</p>
                  </div>
                  <div className="h-2 bg-emerald-600"></div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-md border border-emerald-100 overflow-hidden hover:shadow-lg transition duration-300">
                  <div className="p-5">
                    <h3 className="text-emerald-700 opacity-80 text-lg font-medium">Total Pending Amount</h3>
                    <p className="text-2xl font-bold text-emerald-800 mt-2">{formatCurrency(reportData.total_pending_amount)}</p>
                  </div>
                  <div className="h-2 bg-emerald-500"></div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-md border border-emerald-100 overflow-hidden hover:shadow-lg transition duration-300">
                  <div className="p-5">
                    <h3 className="text-emerald-700 opacity-80 text-lg font-medium">Public Revenue</h3>
                    <p className="text-2xl font-bold text-emerald-800 mt-2">{formatCurrency(reportData.revenue_breakdown.total_public_revenue)}</p>
                  </div>
                  <div className="h-2 bg-emerald-700"></div>
                </div>
              </div>
              
              {/* Additional Metrics - with enhanced styling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 mb-6">
                <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-md border border-emerald-100 overflow-hidden hover:shadow-lg transition duration-300">
                  <div className="p-5">
                    <h3 className="text-emerald-700 opacity-80 text-lg font-medium">Subsidized Revenue</h3>
                    <p className="text-2xl font-bold text-emerald-800 mt-2">{formatCurrency(reportData.revenue_breakdown.total_subsidized_revenue)}</p>
                  </div>
                  <div className="h-2 bg-emerald-400"></div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl shadow-md border border-emerald-100 overflow-hidden hover:shadow-lg transition duration-300">
                  <div className="p-5">
                    <h3 className="text-emerald-700 opacity-80 text-lg font-medium">Total Subsidy Given</h3>
                    <p className="text-2xl font-bold text-emerald-800 mt-2">{formatCurrency(reportData.revenue_breakdown.total_subsidy_given)}</p>
                  </div>
                  <div className="h-2 bg-emerald-400"></div>
                </div>
              </div>
              
              {/* Chart Section - with enhanced styling */}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-emerald-800 mb-4 border-b border-emerald-200 pb-2">Inventory Overview</h2>
                <div className="bg-white p-6 rounded-xl shadow-md">
                  <div className="h-64">
                    <Bar 
                      ref={chartRef}
                      data={getChartData(reportData)} 
                      options={getChartOptions()} 
                    />
                  </div>
                </div>
              </div>
              
              {/* Table Section - with enhanced styling */}
              <div className="px-6 pb-6">
                <h2 className="text-xl font-semibold text-emerald-800 mb-4 border-b border-emerald-200 pb-2">Inventory Details</h2>
                <div className="overflow-x-auto bg-white rounded-xl shadow-md">
                  <table className="min-w-full divide-y divide-emerald-200">
                    <thead className="bg-emerald-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Product Name</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Remaining Stock</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-emerald-100">
                      {reportData.inventory_report.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-emerald-50' : 'bg-white'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{item.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-700 font-semibold text-right">{formatCurrency(item.remaining_stock)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Custom Report Section - with enhanced styling */}
          <div className="bg-emerald-50 p-6 border-t border-emerald-100">
            <h2 className="text-xl font-semibold text-emerald-800 mb-6">Generate Custom Report</h2>
            <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">Start Date</label>
                <DatePicker 
                  selected={startDate} 
                  onChange={(date) => setStartDate(date)} 
                  placeholderText="Select start date" 
                  className="px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-700 mb-1">End Date</label>
                <DatePicker 
                  selected={endDate} 
                  onChange={(date) => setEndDate(date)} 
                  placeholderText="Select end date" 
                  className="px-4 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full"
                />
              </div>
              <div>
                <button 
                  className="px-6 py-2 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  onClick={fetchCustomReport}
                >
                  Generate Custom Report
                </button>
              </div>
            </div>
          </div>

          {/* Custom Report Results - with enhanced styling */}
          {customReportData && (
            <div className="p-6 border-t border-emerald-100">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-semibold text-emerald-800 mb-4 pb-2 border-b border-emerald-100">
                  Custom Report Results
                  <span className="text-sm font-normal text-emerald-600 ml-2">
                    ({startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()})
                  </span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {[
                    { title: 'Total Sales', value: customReportData.total_sales },
                    { title: 'Total Pending', value: customReportData.total_pending_amount },
                    { title: 'Public Revenue', value: customReportData.revenue_breakdown.total_public_revenue },
                    { title: 'Subsidized Revenue', value: customReportData.revenue_breakdown.total_subsidized_revenue },
                    { title: 'Total Subsidy Given', value: customReportData.revenue_breakdown.total_subsidy_given }
                  ].map((item, index) => (
                    <div key={index} className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                      <h3 className="text-sm font-medium text-emerald-600">{item.title}</h3>
                      <p className="text-xl font-bold text-emerald-800 mt-1">{formatCurrency(item.value)}</p>
                    </div>
                  ))}
                </div>
                
                {/* Add a bar chart for custom data */}
                {customReportData.inventory_report && customReportData.inventory_report.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-emerald-700 mb-4">Inventory Breakdown</h3>
                    <div className="h-64">
                      <Bar 
                        data={getChartData(customReportData)} 
                        options={getChartOptions()} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Download Buttons */}
          <div className="bg-emerald-800 p-6 flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button 
              className="px-6 py-3 bg-white text-emerald-800 font-semibold rounded-lg hover:bg-emerald-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-800 w-full sm:w-auto"
              onClick={handleOverallPDFDownload}
              disabled={!reportData}
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Overall Report
              </span>
            </button>
            <button 
              className="px-6 py-3 bg-white text-emerald-800 font-semibold rounded-lg hover:bg-emerald-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-800 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCustomPDFDownload}
              disabled={!customReportData}
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Custom Report
              </span>
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center text-emerald-600 text-sm mt-4">
          <p>Agricultural Sales System &copy; 2025</p>
        </div>
      </div>
    </div>
  );
};

export default Report;