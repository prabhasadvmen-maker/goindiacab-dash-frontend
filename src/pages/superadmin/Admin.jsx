import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Search, Plus, Edit2, Trash2, Power, X, Settings, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminManagement() {
  const token = useAuthStore((state) => state.superAdminToken);
  const login = useAuthStore((state) => state.adminLogin);
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', role: 'Admin', status: 'Active'
  });
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Dropdown State
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/admins`, {
        params: { search, role: filterRole, status: filterStatus },
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(data.admins);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [search, filterRole, filterStatus]);

  const handleOpenModal = (admin = null) => {
    setFormError('');
    setOpenDropdownId(null); // Close dropdown if open
    if (admin) {
      setIsEditMode(true);
      setCurrentId(admin._id);
      setFormData({
        name: admin.name,
        email: admin.email,
        phone: admin.phone || '',
        password: '',
        role: admin.role || 'Admin',
        status: admin.status || 'Active'
      });
    } else {
      setIsEditMode(false);
      setCurrentId(null);
      setFormData({ name: '', email: '', phone: '', password: '', role: 'Admin', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (isEditMode) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await axios.put(`${API_URL}/api/admins/${currentId}`, payload, config);
      } else {
        await axios.post(`${API_URL}/api/admins`, formData, config);
      }
      handleCloseModal();
      fetchAdmins();
    } catch (error) {
      setFormError(error.response?.data?.message || "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setOpenDropdownId(null);
    if (!window.confirm("Are you sure you want to delete this admin account?")) return;
    try {
      await axios.delete(`${API_URL}/api/admins/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdmins();
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting admin");
    }
  };

  const handleToggleStatus = async (id) => {
    setOpenDropdownId(null);
    try {
      await axios.patch(`${API_URL}/api/admins/${id}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdmins();
    } catch (error) {
      alert(error.response?.data?.message || "Error changing status");
    }
  };

  const handleImpersonate = async (id) => {
    setOpenDropdownId(null);
    try {
      const { data } = await axios.post(`${API_URL}/api/admins/${id}/impersonate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        login(data.user, data.token);
        // Open the admin portal in a new tab
        window.open('/admin/dashboard', '_blank'); 
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error logging in as this admin");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system administrators and NGOs</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center px-4 py-2 bg-[#fa9600] text-white rounded-lg font-medium hover:bg-[#e68a00] transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Admin
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-700"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="NGO">NGO</option>
            <option value="SuperAdmin">SuperAdmin</option>
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 text-gray-700"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-16">Sr. No.</th>
                <th className="px-6 py-4">Name / Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Login</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading admins...</td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No admins found matching the criteria.</td>
                </tr>
              ) : (
                admins.map((admin, index) => (
                  <tr key={admin._id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{index + 1}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{admin.name}</p>
                      <p className="text-xs text-gray-500">{admin.email}</p>
                    </td>
                    <td className="px-6 py-4">{admin.phone || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${admin.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleImpersonate(admin._id)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-xs font-semibold inline-flex items-center transition-colors"
                      >
                        <LogIn className="w-3 h-3 mr-1.5" />
                        Login
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center relative">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === admin._id ? null : admin._id)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center justify-center"
                      >
                        <Settings className="w-5 h-5" />
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdownId === admin._id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute right-10 top-10 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10"
                        >
                          <button
                            onClick={() => handleOpenModal(admin)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center"
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(admin._id)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center"
                          >
                            <Power className="w-4 h-4 mr-2" />
                            {admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(admin._id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {isEditMode ? 'Edit Admin' : 'Add New Admin'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                  {formError}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input 
                    type="text" required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input 
                    type="email" required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input 
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {isEditMode ? '(Leave blank to keep current)' : '*'}
                  </label>
                  <input 
                    type="password" required={!isEditMode}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Admin">Admin</option>
                      <option value="NGO">NGO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-70 flex items-center"
                >
                  {actionLoading ? 'Saving...' : 'Save Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
