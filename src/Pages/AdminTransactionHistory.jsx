import React, { useState, useEffect } from 'react';
import API from '../api';

const AdminTransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [tab]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const apiInstance = API.getApiInstance();
      const endpoint = tab === 0 ? '/transactions/gov' : '/transactions/public';
      const response = await apiInstance.get(endpoint);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
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

  const handleTabChange = (newValue) => {
    setTab(newValue);
  };

  return (
    <div className="bg-gradient-to-br from-#1F4B38 to-[#2a6b52] min-h-screen p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-[#1F4B38] text-white p-6">
          <h2 className="text-3xl font-bold text-center">Admin Transaction Management</h2>
        </div>

        <div className="p-6">
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 rounded-full p-1 flex space-x-2">
              <button
                onClick={() => handleTabChange(0)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  tab === 0 
                    ? 'bg-[#1F4B38] text-white' 
                    : 'text-[#1F4B38] hover:bg-gray-200'
                }`}
              >
                Government Transactions
              </button>
              <button
                onClick={() => handleTabChange(1)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  tab === 1 
                    ? 'bg-[#1F4B38] text-white' 
                    : 'text-[#1F4B38] hover:bg-gray-200'
                }`}
              >
                Public Transactions
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#1F4B38]"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Product Name</th>
                    {tab === 1 && <th className="p-3 text-left">Buyer Name</th>}
                    {tab === 1 && <th className="p-3 text-left">Phone Number</th>}
                    {tab === 0 && (
                      <>
                        <th className="p-3 text-left">Beneficiary Name</th>
                        <th className="p-3 text-left">National ID</th>
                        <th className="p-3 text-left">Beneficiary Phone</th>
                      </>
                    )}
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Price (RWF)</th>
                    <th className="p-3 text-left">Subsidy (RWF)</th>
                    <th className="p-3 text-left">Final Price (RWF)</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Payment Method</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{transaction.product_name}</td>
                      {tab === 1 && <td className="p-3">{transaction.buyer_name}</td>}
                      {tab === 1 && <td className="p-3">{transaction.phone_number}</td>}
                      {tab === 0 && (
                        <>
                          <td className="p-3">{transaction.beneficiary_name}</td>
                          <td className="p-3">{transaction.beneficiary_national_id}</td>
                          <td className="p-3">{transaction.beneficiary_phone}</td>
                        </>
                      )}
                      <td className="p-3">{transaction.transaction_type}</td>
                      <td className="p-3">{transaction.price}</td>
                      <td className="p-3">{transaction.subsidy_applied}</td>
                      <td className="p-3">{transaction.final_price}</td>
                      <td className="p-3">{new Date(transaction.transaction_date).toLocaleString()}</td>
                      <td className="p-3">{transaction.payment_method}</td>
                      <td className="p-3 flex space-x-2 justify-center">
                        <button 
                          onClick={() => handleEdit(transaction)}
                          className="text-blue-600 hover:text-blue-800 transition"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {openDialog && editTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
              <h2 className="text-2xl font-bold text-[#1F4B38] mb-4">Edit Transaction</h2>
              
              <div className="space-y-4">
                {tab === 1 && (
                  <>
                    <input
                      placeholder="Buyer Name"
                      value={editTransaction.buyer_name}
                      onChange={(e) => setEditTransaction({ ...editTransaction, buyer_name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4B38]"
                    />
                    <input
                      placeholder="Phone Number"
                      value={editTransaction.phone_number}
                      onChange={(e) => setEditTransaction({ ...editTransaction, phone_number: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4B38]"
                    />
                  </>
                )}
                {tab === 0 && (
                  <>
                    <input
                      placeholder="Beneficiary Name"
                      value={editTransaction.beneficiary_name}
                      onChange={(e) => setEditTransaction({ ...editTransaction, beneficiary_name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4B38]"
                    />
                    <input
                      placeholder="Beneficiary National ID"
                      value={editTransaction.beneficiary_national_id}
                      onChange={(e) => setEditTransaction({ ...editTransaction, beneficiary_national_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4B38]"
                    />
                    <input
                      placeholder="Beneficiary Phone"
                      value={editTransaction.beneficiary_phone}
                      onChange={(e) => setEditTransaction({ ...editTransaction, beneficiary_phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4B38]"
                    />
                  </>
                )}
                <input
                  placeholder="Transaction Type"
                  value={editTransaction.transaction_type}
                  onChange={(e) => setEditTransaction({ ...editTransaction, transaction_type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4B38]"
                />
                <input
                  placeholder="Price"
                  type="number"
                  value={editTransaction.price}
                  onChange={(e) => setEditTransaction({ ...editTransaction, price: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F4B38]"
                />
                <div className="flex space-x-4 mt-4">
                  <button 
                    onClick={handleCloseDialog}
                    className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmit}
                    className="w-full bg-[#1F4B38] text-white py-2 rounded-lg hover:bg-opacity-90 transition"
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