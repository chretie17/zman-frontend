import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Loader2, Download, Calendar } from "lucide-react";
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-[#1E4B38]">
        Government Subsidy Report
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#1E4B38]" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">{error}</div>
      ) : (
        <div className="space-y-8">
          {/* Overview Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#1E4B38]">Report Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[#1E4B38]/5 rounded-lg">
                <p className="text-sm text-gray-600">Total Subsidy Given</p>
                <p className="text-2xl font-bold text-[#1E4B38]">{reportData.totalSubsidyGiven} RWF</p>
              </div>
              <div className="p-4 bg-[#1E4B38]/5 rounded-lg">
                <p className="text-sm text-gray-600">Total Subsidized Revenue</p>
                <p className="text-2xl font-bold text-[#1E4B38]">{reportData.totalSubsidizedRevenue} RWF</p>
              </div>
            </div>
          </div>

          {/* Beneficiaries Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#1E4B38]">Beneficiaries</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#1E4B38]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Beneficiary Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Phone Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Subsidy Applied</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Final Price</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.recipients.map((recipient, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{recipient.buyerName || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{recipient.phoneNumber || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{recipient.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{recipient.subsidyApplied} RWF</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{recipient.finalPrice} RWF</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inventory Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#1E4B38]">Subsidized Product Inventory</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#1E4B38]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Product ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Remaining Stock</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.subsidizedInventory.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.productId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.remainingStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Download Button */}
          <div className="flex justify-end">
            <button
              onClick={handlePDFDownload}
              className="flex items-center gap-2 bg-[#1E4B38] text-white px-4 py-2 rounded-lg hover:bg-[#1E4B38]/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Government Report
            </button>
          </div>

          {/* Custom Report Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-[#1E4B38]">Generate Custom Report</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  placeholderText="Start Date"
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B38]"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <span className="text-gray-500">to</span>
              <div className="relative">
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  placeholderText="End Date"
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E4B38]"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <button
                onClick={fetchCustomReport}
                className="bg-[#1E4B38] text-white px-4 py-2 rounded-lg hover:bg-[#1E4B38]/90 transition-colors"
              >
                Generate Custom Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernmentReport;