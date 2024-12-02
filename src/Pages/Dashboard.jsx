import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/dashboard/dashboard')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#1F4B38] to-[#2D6A4F]">
        <div className="w-20 h-20 border-4 border-white border-t-[#1F4B38] rounded-full animate-spin shadow-2xl"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-2xl text-red-600 mt-20">Error loading data</div>;
  }

  const { cards, graphs } = data;

  const salesByTypeData = {
    labels: graphs.salesByType.map((item) => item.transaction_type),
    datasets: [
      {
        label: 'Revenue',
        data: graphs.salesByType.map((item) => item.total_revenue),
        backgroundColor: ['#1F4B38', '#2D6A4F'],
        borderRadius: 8,
      },
    ],
  };

  const topProductsData = {
    labels: graphs.topProducts.map((item) => item.product_name),
    datasets: [
      {
        label: 'Revenue',
        data: graphs.topProducts.map((item) => item.total_revenue),
        backgroundColor: '#40916C',
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b-2 border-[#1F4B38] pb-4">
          <h1 className="text-4xl font-extrabold text-[#1F4B38]">Dashboard</h1>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: 'Total Transactions', value: cards.totalTransactions || 0, icon: '📊' },
            { title: 'Total Revenue', value: `RWF${Number(cards.totalRevenue || 0).toFixed(2)}`, icon: '💰' },
            { title: 'Total Subsidy', value: `RWF${Number(cards.totalSubsidy || 0).toFixed(2)}`, icon: '💸' },
            { title: 'Active Beneficiaries', value: cards.activeBeneficiaries || 0, icon: '👥' }
          ].map((card) => (
            <div 
              key={card.title} 
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border-l-4 border-[#1F4B38] transform hover:-translate-y-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">{card.title}</h3>
                  <p className="text-2xl font-bold text-[#1F4B38]">{card.value}</p>
                </div>
                <span className="text-3xl opacity-50">{card.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[#1F4B38] mb-6 border-b pb-2">
              Revenue by Transaction Type
            </h2>
            <Bar 
              data={salesByTypeData} 
              options={{ 
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(31, 75, 56, 0.1)' }
                  }
                },
                plugins: {
                  legend: {
                    labels: { color: '#1F4B38' }
                  }
                }
              }} 
            />
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[#1F4B38] mb-6 border-b pb-2">
              Top-Selling Products
            </h2>
            <Bar 
              data={topProductsData} 
              options={{ 
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(31, 75, 56, 0.1)' }
                  }
                },
                plugins: {
                  legend: {
                    labels: { color: '#1F4B38' }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;