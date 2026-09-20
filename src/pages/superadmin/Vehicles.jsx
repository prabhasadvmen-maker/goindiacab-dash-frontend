import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  Search,
  CheckCircle,
  XCircle,
  Car,
  AlertTriangle,
  RefreshCw,
  Eye,
  Settings,
  ShieldBan
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Vehicles() {
  const navigate = useNavigate();
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);

  // Actions
  const [actionLoading, setActionLoading] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/admins/vehicles?_t=${new Date().getTime()}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 10, search, status: statusFilter }
      });
      if (data.success) {
        setVehicles(data.data);
        setTotalPages(data.pages);
        setTotalVehicles(data.total);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchVehicles();
  };

  const handleToggleEligibility = async (partnerId, currentEligibility) => {
    const action = currentEligibility ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this vehicle?`)) return;

    setActionLoading(partnerId);
    try {
      const { data } = await axios.patch(`${API_URL}/api/admins/vehicles/${partnerId}/eligibility`, 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setVehicles(vehicles.map(v => v._id === partnerId ? { ...v, isVehicleEligible: data.isVehicleEligible } : v));
      }
    } catch (error) {
      console.error('Error updating vehicle eligibility:', error);
      alert('Failed to update vehicle status');
    } finally {
      setActionLoading(null);
    }
  };

  const formatPlate = (plate) => {
    if (!plate) return 'N/A';
    // Add spaces if it's a standard Indian format like UP14AA1234 -> UP 14 AA 1234
    // Simplistic formatting just for visual appeal
    return plate.toUpperCase().replace(/^([A-Z]{2})(\d{2})([A-Z]{1,2})(\d{4})$/, '$1 $2 $3 $4') || plate.toUpperCase();
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Car className="w-6 h-6 mr-3 text-blue-600" />
            Vehicle Fleet Management
          </h2>
          <p className="text-gray-500 mt-1">Monitor and manage all {totalVehicles} registered vehicles in the network.</p>
        </div>
        <button 
          onClick={() => fetchVehicles()} 
          className="flex items-center text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Status Tabs */}
        <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar border border-gray-200/50">
          {['all', 'eligible', 'ineligible'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={cn(
                "px-5 py-2 text-sm font-semibold rounded-lg capitalize whitespace-nowrap transition-all",
                statusFilter === status 
                  ? "bg-white text-blue-600 shadow-sm border border-gray-200/60 ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
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
            placeholder="Search by license plate, owner or phone..."
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
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">S.No.</th>
                <th scope="col" className="px-6 py-4 font-bold">Vehicle Details</th>
                <th scope="col" className="px-6 py-4 font-bold">License Plate</th>
                <th scope="col" className="px-6 py-4 font-bold">Owner / Partner</th>
                <th scope="col" className="px-6 py-4 font-bold">Eligibility</th>
                <th scope="col" className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                // Skeletons
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-6"></div></td>
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-md w-28"></div></td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded-lg w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Car className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-lg font-medium text-gray-900">No vehicles found</p>
                      <p className="text-sm">Try adjusting your filters or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                vehicles.map((v, index) => (
                  <tr key={v._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-500">
                      #{(page - 1) * 10 + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center">
                          {v.vehiclePhotos?.front ? (
                            <img src={v.vehiclePhotos.front} alt="Vehicle Front" className="w-full h-full object-cover" />
                          ) : (
                            <Car className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {v.vehicleDetails?.make} {v.vehicleDetails?.model || 'Unknown Vehicle'}
                          </p>
                          <div className="flex items-center mt-0.5 space-x-2 text-xs text-gray-500">
                            <span className="capitalize">{v.vehicleDetails?.color || 'N/A color'}</span>
                            <span>•</span>
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">
                              {v.vehicleDetails?.category || 'General'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-block bg-yellow-100 border border-yellow-400 rounded-md px-3 py-1 text-center shadow-sm relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-2 h-full bg-blue-700"></div>
                         <p className="font-bold text-gray-900 tracking-wider ml-1">{formatPlate(v.vehicleNumber)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{v.name || 'Anonymous Partner'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">+91 {v.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      {v.isVehicleEligible ? (
                        <span className="px-3 py-1 text-xs font-bold rounded-full inline-flex items-center bg-green-100 text-green-700 border border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1.5" /> Eligible
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-bold rounded-full inline-flex items-center bg-red-100 text-red-700 border border-red-200">
                          <AlertTriangle className="w-3 h-3 mr-1.5" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === v._id ? null : v._id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-100"
                        >
                          <Settings className={cn("w-5 h-5 transition-transform duration-300", activeDropdown === v._id && "rotate-90 text-blue-600")} />
                        </button>
                        
                        {activeDropdown === v._id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1.5 overflow-hidden transform origin-top-right transition-all">
                              <button 
                                onClick={() => { setActiveDropdown(null); navigate(v._id); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                              >
                                <Eye className="w-4 h-4 mr-2.5 text-gray-400" /> View Details
                              </button>
                              
                              <div className="h-px bg-gray-100 my-1"></div>
                              
                              <button
                                onClick={() => { handleToggleEligibility(v._id, v.isVehicleEligible); setActiveDropdown(null); }}
                                disabled={actionLoading === v._id}
                                className={cn(
                                  "w-full text-left px-4 py-2 text-sm flex items-center transition-colors disabled:opacity-50",
                                  v.isVehicleEligible 
                                    ? "text-red-600 hover:bg-red-50" 
                                    : "text-green-600 hover:bg-green-50"
                                )}
                              >
                                {v.isVehicleEligible ? (
                                  <><ShieldBan className="w-4 h-4 mr-2.5" /> Suspend Vehicle</>
                                ) : (
                                  <><CheckCircle className="w-4 h-4 mr-2.5" /> Activate Vehicle</>
                                )}
                              </button>
                            </div>
                          </>
                        )}
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
