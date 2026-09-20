import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Search, Eye, Filter, CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PartnerApplications() {
  // Try to use superAdminToken, fallback to adminToken
  const superAdminToken = useAuthStore((state) => state.superAdminToken);
  const adminToken = useAuthStore((state) => state.adminToken);
  const token = superAdminToken || adminToken;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/partner/admin/applications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: statusFilter, page, limit: 10 }
      });
      if (data.success) {
        setApplications(data.partners);
        setTotalPages(data.pages);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, page]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">Approved</span>;
      case 'rejected': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">Rejected</span>;
      case 'submitted': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">New Submission</span>;
      case 'under_review': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">Under Review</span>;
      case 'correction_required': return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">Correction</span>;
      default: return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 capitalize">{status}</span>;
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Partner Applications</h2>
          <p className="text-sm text-gray-500 mt-1">Review and manage partner onboarding requests.</p>
        </div>
        <div className="flex space-x-3">
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border-gray-300 rounded-lg shadow-sm focus:ring-[#fa9600] focus:border-[#fa9600] text-sm py-2 px-3"
          >
            <option value="">All Statuses</option>
            <option value="submitted">New Submissions</option>
            <option value="under_review">Under Review</option>
            <option value="correction_required">Corrections Required</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Partner</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">Loading applications...</td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">No applications found.</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app._id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold overflow-hidden border border-blue-200">
                          {app.profilePhoto && app.profilePhoto.length > 20 ? (
                            <img src={app.profilePhoto} alt={app.name} className="w-full h-full object-cover" />
                          ) : (
                            app.name ? app.name.charAt(0).toUpperCase() : 'P'
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="font-semibold text-gray-800">{app.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">+91 {app.phone}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{app.vehicleNumber || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{app.vehicleDetails?.make} {app.vehicleDetails?.model}</p>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(app.applicationStatus)}</td>
                    <td className="px-6 py-4">
                      {app.onboardingPayment?.status === 'paid' ? (
                        <span className="text-green-600 font-semibold text-xs flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Paid</span>
                      ) : (
                        <span className="text-red-600 font-semibold text-xs flex items-center"><XCircle className="w-3 h-3 mr-1"/> Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(app._id)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center"
                        title="Review Application"
                      >
                        <Eye className="w-5 h-5 mr-1" /> <span className="text-sm font-semibold">Review</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>



    </div>
  );
}
