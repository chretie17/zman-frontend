import React, { useState, useEffect } from 'react';
import { Loader2 } from "lucide-react";
import API from '../api';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0); // 0 = Gov, 1 = Public

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

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-[#1E4B38]">
        Transaction History
      </h1>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <div className="flex -mb-px">
            <button
              className={`py-2 px-4 text-sm font-medium mr-4 focus:outline-none ${
                tab === 0
                  ? 'border-b-2 border-[#1E4B38] text-[#1E4B38]'
                  : 'text-gray-500 hover:text-[#1E4B38]'
              }`}
              onClick={() => handleTabChange(null, 0)}
            >
              Government-Subsidized Sales
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium focus:outline-none ${
                tab === 1
                  ? 'border-b-2 border-[#1E4B38] text-[#1E4B38]'
                  : 'text-gray-500 hover:text-[#1E4B38]'
              }`}
              onClick={() => handleTabChange(null, 1)}
            >
              Public Sales
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#1E4B38]" />
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
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.product_name}
                  </td>
                  {tab === 1 && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.buyer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.phone_number}
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
                    {transaction.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.subsidy_applied}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.final_price}
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
    </div>
  );
};

export default TransactionHistory;