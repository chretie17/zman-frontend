import React, { useState, useEffect } from 'react';
import API from '../api';

// Custom Button Component
const Button = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md font-medium focus:outline-none 
    bg-[#1E4B38] text-white hover:bg-[#163728] 
    flex items-center justify-center ${className}`}
  >
    {children}
  </button>
);

// Custom Input Component
const Input = ({ className = '', ...props }) => (
  <input
    className={`px-3 py-2 rounded-md border border-gray-300 
    focus:outline-none focus:ring-2 focus:ring-[#1E4B38] 
    focus:border-transparent w-full ${className}`}
    {...props}
  />
);

// Custom Select Component
const Select = ({ options, value, onChange, placeholder, className = '' }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`px-3 py-2 rounded-md border border-gray-300 
    focus:outline-none focus:ring-2 focus:ring-[#1E4B38] 
    focus:border-transparent w-full bg-white ${className}`}
  >
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

// Icons
const DownloadIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
  </svg>
);

const LoaderIcon = () => (
  <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"/>
    <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
);

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    dateFrom: '',
    dateTo: '',
    paymentMethod: '',
    productName: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, [tab]);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const apiInstance = API.getApiInstance();
      const endpoint = tab === 0 ? '/transactions/gov' : '/transactions/public';
      const response = await apiInstance.get(endpoint);
      setTransactions(response.data);
      setFilteredTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(transaction => {
        const searchFields = tab === 0 
          ? [transaction.beneficiary_name, transaction.beneficiary_national_id, transaction.product_name]
          : [transaction.buyer_name, transaction.product_name];
        return searchFields.some(field => field?.toLowerCase().includes(searchLower));
      });
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.transaction_date) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(transaction => 
        new Date(transaction.transaction_date) <= new Date(filters.dateTo)
      );
    }

    if (filters.paymentMethod) {
      filtered = filtered.filter(transaction => 
        transaction.payment_method === filters.paymentMethod
      );
    }

    if (filters.productName) {
      filtered = filtered.filter(transaction => 
        transaction.product_name === filters.productName
      );
    }

    setFilteredTransactions(filtered);
  };

  const handlePrint = () => {
    window.print();
  };

  const getUniqueValues = (field) => {
    return [...new Set(transactions.map(t => t[field]))].filter(Boolean);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#1E4B38]">
          Transaction History
        </h1>
        <Button onClick={handlePrint}>
          <DownloadIcon />
          Export PDF
        </Button>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <div className="flex -mb-px">
          <button
            className={`py-2 px-4 text-sm font-medium mr-4 focus:outline-none ${
              tab === 0
                ? 'border-b-2 border-[#1E4B38] text-[#1E4B38]'
                : 'text-gray-500 hover:text-[#1E4B38]'
            }`}
            onClick={() => setTab(0)}
          >
            Government-Subsidized Sales
          </button>
          <button
            className={`py-2 px-4 text-sm font-medium focus:outline-none ${
              tab === 1
                ? 'border-b-2 border-[#1E4B38] text-[#1E4B38]'
                : 'text-gray-500 hover:text-[#1E4B38]'
            }`}
            onClick={() => setTab(1)}
          >
            Public Sales
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <div className="absolute left-3 top-2.5 text-gray-400">
              <SearchIcon />
            </div>
            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>

          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
          />

          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
          />

          <Select
            value={filters.paymentMethod}
            onChange={(value) => setFilters(prev => ({ ...prev, paymentMethod: value }))}
            options={getUniqueValues('payment_method')}
            placeholder="Payment Method"
          />

          <Select
            value={filters.productName}
            onChange={(value) => setFilters(prev => ({ ...prev, productName: value }))}
            options={getUniqueValues('product_name')}
            placeholder="Product"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoaderIcon />
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#1E4B38]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Product Name
                </th>
                {tab === 1 && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Buyer Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Phone Number
                    </th>
                  </>
                )}
                {tab === 0 && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Beneficiary Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Beneficiary National ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Beneficiary Phone
                    </th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Transaction Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Price (RWF)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Subsidy Applied (RWF)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Final Price (RWF)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Transaction Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Payment Method
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.product_name}
                  </td>
                  {tab === 1 && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.buyer_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.phone_number || '-'}
                      </td>
                    </>
                  )}
                  {tab === 0 && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.beneficiary_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.beneficiary_national_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.beneficiary_phone}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.transaction_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Number(transaction.price).toLocaleString()} RWF
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Number(transaction.subsidy_applied).toLocaleString()} RWF
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Number(transaction.final_price).toLocaleString()} RWF
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.transaction_date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.payment_method}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .container, .container * {
            visibility: visible;
          }
          .container {
            position: absolute;
            left: 0;
            top: 0;
          }
          button, .no-print {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default TransactionHistory;