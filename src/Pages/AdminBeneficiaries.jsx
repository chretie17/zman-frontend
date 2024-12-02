import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import API from '../api';

const AdminBeneficiaryManagement = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [beneficiaryData, setBeneficiaryData] = useState({
    name: '',
    national_id: '',
    phone_number: '',
  });
  const [editBeneficiaryId, setEditBeneficiaryId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      const apiInstance = API.getApiInstance();
      const response = await apiInstance.get('/beneficiaries');
      setBeneficiaries(response.data);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      setError('Unable to fetch beneficiaries. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBeneficiaryData({ ...beneficiaryData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (beneficiaryData.national_id.length > 16) {
      setError('National ID must be 16 characters or fewer.');
      return;
    }

    try {
      const apiInstance = API.getApiInstance();

      if (editBeneficiaryId) {
        await apiInstance.put(`/beneficiaries/update/${editBeneficiaryId}`, beneficiaryData);
      } else {
        await apiInstance.post('/beneficiaries/add', beneficiaryData);
      }

      setBeneficiaryData({ name: '', national_id: '', phone_number: '' });
      setEditBeneficiaryId(null);
      fetchBeneficiaries();
    } catch (error) {
      setError('Error saving beneficiary. Please try again.');
      console.error('Error saving beneficiary:', error);
    }
  };

  const handleEdit = (beneficiary) => {
    setBeneficiaryData({
      name: beneficiary.name,
      national_id: beneficiary.national_id,
      phone_number: beneficiary.phone_number,
    });
    setEditBeneficiaryId(beneficiary.id);
  };

  const handleDelete = async (id) => {
    try {
      const apiInstance = API.getApiInstance();
      await apiInstance.delete(`/beneficiaries/delete/${id}`);
      fetchBeneficiaries();
    } catch (error) {
      console.error('Error deleting beneficiary:', error);
      setError('Unable to delete beneficiary. Please try again.');
    }
  };

  const handleActivate = async (id) => {
    try {
      const apiInstance = API.getApiInstance();
      await apiInstance.put(`/beneficiaries/activate/${id}`);
      fetchBeneficiaries();
    } catch (error) {
      console.error('Error activating beneficiary:', error);
      setError('Unable to activate beneficiary. Please try again.');
    }
  };

  const handleDeactivate = async (id) => {
    try {
      const apiInstance = API.getApiInstance();
      await apiInstance.put(`/beneficiaries/deactivate/${id}`);
      fetchBeneficiaries();
    } catch (error) {
      console.error('Error deactivating beneficiary:', error);
      setError('Unable to deactivate beneficiary. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-#23533E text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Users className="w-8 h-8" />
            <h1 className="text-2xl font-semibold">Beneficiary Management</h1>
          </div>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Form Section */}
        <div className="p-6 bg-gray-100">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={beneficiaryData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-#23533E"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                National ID
              </label>
              <input
                type="text"
                name="national_id"
                value={beneficiaryData.national_id}
                onChange={handleInputChange}
                required
                maxLength={16}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-#23533E"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                name="phone_number"
                value={beneficiaryData.phone_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-#23533E"
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button 
                type="submit" 
                className="px-6 py-2 bg-[#23533E] text-white rounded-md hover:bg-opacity-90 transition-colors flex items-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>{editBeneficiaryId ? 'Update Beneficiary' : 'Add Beneficiary'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Beneficiary List */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Name</th>
                  <th className="py-3 px-6 text-left">National ID</th>
                  <th className="py-3 px-6 text-left">Phone Number</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {beneficiaries.map((beneficiary) => (
                  <tr key={beneficiary.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium">{beneficiary.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-left">
                      {beneficiary.national_id}
                    </td>
                    <td className="py-3 px-6 text-left">
                      {beneficiary.phone_number}
                    </td>
                    <td className="py-3 px-6 text-center">
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-bold
                        ${beneficiary.is_active 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-red-200 text-red-800'
                        }
                      `}>
                        {beneficiary.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center space-x-3">
                        <button 
                          onClick={() => handleEdit(beneficiary)} 
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(beneficiary.id)} 
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        {beneficiary.is_active ? (
                          <button 
                            onClick={() => handleDeactivate(beneficiary.id)} 
                            className="text-yellow-500 hover:text-yellow-700 transition-colors"
                            title="Deactivate"
                          >
                            <ToggleLeft className="w-6 h-6" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleActivate(beneficiary.id)} 
                            className="text-green-500 hover:text-green-700 transition-colors"
                            title="Activate"
                          >
                            <ToggleRight className="w-6 h-6" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBeneficiaryManagement;