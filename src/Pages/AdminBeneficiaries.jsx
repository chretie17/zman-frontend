import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Edit, ToggleLeft, ToggleRight, Upload, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import API from '../api';

const AdminBeneficiaryManagement = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [beneficiaryData, setBeneficiaryData] = useState({
    name: '',
    national_id: '',
    phone_number: '',
    needs: '', // Added needs field
  });
  const [editBeneficiaryId, setEditBeneficiaryId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, {
        type: 'array',
        cellDates: true,
        cellNF: false,
        cellText: false
      });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validate the Excel structure
      const requiredColumns = ['name', 'national_id', 'phone_number', 'needs'];
      const headers = Object.keys(jsonData[0] || {}).map(key => key.toLowerCase());
      
      const missingColumns = requiredColumns.filter(col => 
        !headers.includes(col.toLowerCase())
      );

      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      // Process and upload each beneficiary
      const apiInstance = API.getApiInstance();
      let successCount = 0;
      let errorCount = 0;

      for (const row of jsonData) {
        try {
          await apiInstance.post('/beneficiaries/add', {
            name: row.name,
            national_id: row.national_id?.toString(),
            phone_number: row.phone_number?.toString(),
            needs: row.needs
          });
          successCount++;
        } catch (err) {
          errorCount++;
          console.error('Error adding beneficiary:', row, err);
        }
      }

      setSuccess(`Successfully added ${successCount} beneficiaries. ${errorCount > 0 ? `Failed to add ${errorCount} entries.` : ''}`);
      fetchBeneficiaries();
    } catch (error) {
      setError(`Error processing Excel file: ${error.message}`);
    } finally {
      setIsUploading(false);
      e.target.value = null; // Reset file input
    }
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

      setBeneficiaryData({ name: '', national_id: '', phone_number: '', needs: '' });
      setEditBeneficiaryId(null);
      fetchBeneficiaries();
      setSuccess('Beneficiary saved successfully!');
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
      needs: beneficiary.needs, // ✅ Add needs field
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


  // ... (keep existing handle functions: handleEdit, handleDelete, handleActivate, handleDeactivate)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#23533E] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Users className="w-8 h-8" />
            <h1 className="text-2xl font-semibold">Beneficiary Management</h1>
          </div>
          
          {/* Excel Upload Section */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 bg-white text-[#23533E] px-4 py-2 rounded-lg cursor-pointer hover:bg-opacity-90">
              <Upload className="w-5 h-5" />
              <span>Upload Excel</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-4">
            <p>{success}</p>
          </div>
        )}

        {/* Form Section */}
        <div className="p-6 bg-gray-100">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#23533E]"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#23533E]"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#23533E]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Needs
              </label>
              <textarea
                name="needs"
                value={beneficiaryData.needs}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#23533E]"
                rows="1"
              />
            </div>

            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
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
                  <th className="py-3 px-6 text-left">Needs</th>
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
                    <td className="py-3 px-6 text-left">
                      {beneficiary.needs}
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