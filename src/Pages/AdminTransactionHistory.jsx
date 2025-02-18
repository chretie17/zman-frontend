import React, { useState, useEffect } from 'react';
import API from '../api';
import { format } from 'date-fns';

const AdminTransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const [error, setError] = useState('');
  
  // Filter states
  const [filters, setFilters] = useState({
    dateRange: 'all',
    searchTerm: '',
    transactionType: 'all',
    priceRange: 'all',
    paymentMethod: 'all'
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

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(transaction => {
        const searchFields = tab === 0 
          ? [transaction.beneficiary_name, transaction.beneficiary_national_id, transaction.product_name]
          : [transaction.buyer_name, transaction.phone_number, transaction.product_name];
        return searchFields.some(field => field?.toLowerCase().includes(searchLower));
      });
    }

    

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const past = new Date();
      switch (filters.dateRange) {
        case 'today':
          past.setDate(now.getDate() - 1);
          break;
        case 'week':
          past.setDate(now.getDate() - 7);
          break;
        case 'month':
          past.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      filtered = filtered.filter(t => new Date(t.transaction_date) >= past);
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      const ranges = {
        'low': [0, 50],
        'medium': [51, 150],
        'high': [151, Infinity]
      };
      const [min, max] = ranges[filters.priceRange];
      filtered = filtered.filter(t => {
        const price = parseFloat(t.final_price);
        return price >= min && price <= max;
      });
    }

    // Payment method filter
    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(t => t.payment_method === filters.paymentMethod);
    }

    setFilteredTransactions(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const apiInstance = API.getApiInstance();
      await apiInstance.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleEdit = (transaction) => {
    setEditTransaction(transaction);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setEditTransaction(null);
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    if (!editTransaction) return;

    try {
      const apiInstance = API.getApiInstance();
      await apiInstance.put(`/transactions/${editTransaction.id}`, editTransaction);
      setOpenDialog(false);
      fetchTransactions();
    } catch (error) {
      setError('Error updating transaction');
    }
  };

  const FilterSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 bg-white rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          value={filters.searchTerm}
          onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          value={filters.dateRange}
          onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>

     
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          value={filters.priceRange}
          onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
        >
          <option value="all">All Prices</option>
          <option value="low">Low (≤ 50 RWF)</option>
          <option value="medium">Medium (51-150 RWF)</option>
          <option value="high">High ({'>'} 150 RWF)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          value={filters.paymentMethod}
          onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
        >
          <option value="all">All Methods</option>
          <option value="field sale">Field Sale</option>
          <option value="mobile money">Mobile Money</option>
          <option value="cash">Cash</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-700 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-t-2xl shadow-xl p-6 mb-6">
          <h2 className="text-3xl font-bold text-emerald-900 text-center mb-6">
            Transaction Management Dashboard
          </h2>
          
          {/* Tab Navigation */}
          <div className="flex justify-center">
            <div className="inline-flex bg-emerald-50 rounded-full p-1">
              <button
                onClick={() => setTab(0)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  tab === 0 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                Government Transactions
              </button>
              <button
                onClick={() => setTab(1)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  tab === 1 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                Public Transactions
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <FilterSection />

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-900"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-emerald-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">Product</th>
                    {tab === 1 ? (
                      <>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">Buyer</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">Phone</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">Beneficiary</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">National ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">Phone</th>
                      </>
                    )}
                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">Subsidy</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">Final Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-emerald-900">Payment</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-emerald-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-emerald-50 transition-colors">
                      <td className="px-4 py-3 text-sm">{transaction.product_name}</td>
                      {tab === 1 ? (
                        <>
                          <td className="px-4 py-3 text-sm">{transaction.buyer_name}</td>
                          <td className="px-4 py-3 text-sm">{transaction.phone_number}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-sm">{transaction.beneficiary_name}</td>
                          <td className="px-4 py-3 text-sm">{transaction.beneficiary_national_id}</td>
                          <td className="px-4 py-3 text-sm">{transaction.beneficiary_phone}</td>
                        </>
                      )}
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.transaction_type === 'subsidized'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {transaction.transaction_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{Number(transaction.price).toLocaleString()} RWF</td>
                      <td className="px-4 py-3 text-sm">{Number(transaction.subsidy_applied).toLocaleString()} RWF</td>
                      <td className="px-4 py-3 text-sm font-medium text-emerald-900">
                        {Number(transaction.final_price).toLocaleString()} RWF
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {format(new Date(transaction.transaction_date), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xsfont-medium">
                          {transaction.payment_method}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <span className="px-3 py-1 rounded-md border border-blue-600 hover:bg-blue-50">
                              Edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <span className="px-3 py-1 rounded-md border border-red-600 hover:bg-red-50">
                              Delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTransactions.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-lg">No transactions found</div>
                  <p className="text-gray-400 mt-2">Try adjusting your filters or search criteria</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Transactions</h3>
            <p className="text-2xl font-bold text-emerald-900">
              {filteredTransactions.length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Value</h3>
            <p className="text-2xl font-bold text-emerald-900">
              {filteredTransactions.reduce((sum, t) => sum + parseFloat(t.final_price), 0).toLocaleString()} RWF
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Subsidies</h3>
            <p className="text-2xl font-bold text-emerald-900">
              {filteredTransactions.reduce((sum, t) => sum + parseFloat(t.subsidy_applied), 0).toLocaleString()} RWF
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Average Transaction Value</h3>
            <p className="text-2xl font-bold text-emerald-900">
              {(filteredTransactions.reduce((sum, t) => sum + parseFloat(t.final_price), 0) / 
                (filteredTransactions.length || 1)).toLocaleString()} RWF
            </p>
          </div>
        </div>

        {/* Edit Dialog */}
        {openDialog && editTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 m-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-emerald-900">Edit Transaction</h2>
                <button 
                  onClick={handleCloseDialog}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {tab === 1 ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
                      <input
                        value={editTransaction.buyer_name || ''}
                        onChange={(e) => setEditTransaction({ ...editTransaction, buyer_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        value={editTransaction.phone_number || ''}
                        onChange={(e) => setEditTransaction({ ...editTransaction, phone_number: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary Name</label>
                      <input
                        value={editTransaction.beneficiary_name || ''}
                        onChange={(e) => setEditTransaction({ ...editTransaction, beneficiary_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                      <input
                        value={editTransaction.beneficiary_national_id || ''}
                        onChange={(e) => setEditTransaction({ ...editTransaction, beneficiary_national_id: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        value={editTransaction.beneficiary_phone || ''}
                        onChange={(e) => setEditTransaction({ ...editTransaction, beneficiary_phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </>
                )}
                
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (RWF)</label>
                  <input
                    type="number"
                    value={editTransaction.price}
                    onChange={(e) => setEditTransaction({ ...editTransaction, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={editTransaction.payment_method}
                    onChange={(e) => setEditTransaction({ ...editTransaction, payment_method: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="field sale">Field Sale</option>
                    <option value="mobile money">Mobile Money</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                {error && (
                  <div className="text-red-600 text-sm mt-2">{error}</div>
                )}

                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={handleCloseDialog}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactionManagement;