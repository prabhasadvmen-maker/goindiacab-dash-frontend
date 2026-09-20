import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import {
  Search,
  Filter,
  MoreVertical,
  ShieldBan,
  CheckCircle,
  User,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Users() {
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Actions
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/admins/users?_t=${new Date().getTime()}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 10, search, status: statusFilter }
      });
      if (data.success) {
        setUsers(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalUsers(data.total);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [page, statusFilter]);

  // Handle Search separately with a small delay or manual button (using form submit here for simplicity)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    if (!window.confirm(`Are you sure you want to ${currentStatus === 'active' ? 'block' : 'unblock'} this user?`)) return;

    setActionLoading(userId);
    try {
      const { data } = await axios.patch(`${API_URL}/api/admins/users/${userId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, status: newStatus } : u));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user? This cannot be undone.')) return;

    setActionLoading(userId);
    try {
      const { data } = await axios.delete(`${API_URL}/api/admins/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setUsers(users.filter(u => u._id !== userId));
        setTotalUsers(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-500 mt-1">Manage and moderate all {totalUsers} registered customers.</p>
        </div>
        <button 
          onClick={() => fetchUsers()} 
          className="flex items-center text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Status Tabs */}
        <div className="flex space-x-2 bg-gray-50 p-1 rounded-xl w-full md:w-auto">
          {['all', 'active', 'blocked'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-lg capitalize flex-1 md:flex-none transition-all",
                statusFilter === status 
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <button type="submit" className="hidden"></button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">User</th>
                <th scope="col" className="px-6 py-4 font-bold">Contact</th>
                <th scope="col" className="px-6 py-4 font-bold">Status</th>
                <th scope="col" className="px-6 py-4 font-bold">Joined</th>
                <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                // Skeletons
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <User className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-lg font-medium text-gray-900">No users found</p>
                      <p className="text-sm">Try adjusting your filters or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                          {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{user.name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-400">ID: {user._id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{user.phone}</p>
                      <p className="text-xs text-gray-400">{user.email || 'No email provided'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 text-xs font-bold rounded-full inline-flex items-center",
                        user.status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      )}>
                        {user.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <ShieldBan className="w-3 h-3 mr-1" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Action buttons */}
                        <button
                          onClick={() => handleStatusChange(user._id, user.status)}
                          disabled={actionLoading === user._id}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title={user.status === 'active' ? 'Block User' : 'Unblock User'}
                        >
                          <ShieldBan className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          disabled={actionLoading === user._id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing page <span className="font-semibold text-gray-900">{page}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
            </span>
            <div className="flex space-x-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
