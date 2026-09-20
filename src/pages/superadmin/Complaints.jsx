import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Search, Filter, AlertCircle, Clock, CheckCircle2, MoreVertical, XCircle, FileText } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Complaints() {
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line
  }, [activeTab, priorityFilter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let query = `?status=${activeTab}`;
      if (priorityFilter !== 'ALL') query += `&priority=${priorityFilter}`;
      
      const { data } = await axios.get(`${API_URL}/api/admins/complaints${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 flex items-center w-fit"><AlertCircle className="w-3 h-3 mr-1" /> Open</span>;
      case 'IN_PROGRESS': return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 flex items-center w-fit"><Clock className="w-3 h-3 mr-1" /> In Progress</span>;
      case 'RESOLVED': return <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100 flex items-center w-fit"><CheckCircle2 className="w-3 h-3 mr-1" /> Resolved</span>;
      case 'CLOSED': return <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-bold border border-gray-200 flex items-center w-fit"><XCircle className="w-3 h-3 mr-1" /> Closed</span>;
      default: return null;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT': return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md text-[10px] font-extrabold uppercase">Urgent</span>;
      case 'HIGH': return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md text-[10px] font-bold uppercase">High</span>;
      case 'MEDIUM': return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-md text-[10px] font-bold uppercase">Medium</span>;
      case 'LOW': return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase">Low</span>;
      default: return null;
    }
  };

  const filteredComplaints = complaints.filter(c => 
    c.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.raisedBy && c.raisedBy.name && c.raisedBy.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Complaints Management</h2>
          <p className="text-gray-500 mt-1">View and resolve issues raised by Users and Partners.</p>
        </div>
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
          <AlertCircle className="w-6 h-6" />
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row items-center justify-between p-2">
        <div className="flex w-full md:w-auto overflow-x-auto hide-scrollbar p-2 space-x-2">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
                activeTab === tab 
                  ? "bg-gray-900 text-white shadow-md" 
                  : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {tab === 'ALL' ? 'All Tickets' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>
        
        <div className="flex w-full md:w-auto items-center p-2 space-x-3">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search ID, Subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all outline-none"
            />
          </div>
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="block w-32 rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
          >
            <option value="ALL">Priority: All</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
            <p>Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No complaints found</h3>
            <p className="text-gray-500 mt-1">There are no tickets matching your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ticket Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Raised By</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-mono text-xs font-bold text-gray-500">{complaint.complaintId}</span>
                          {getPriorityBadge(complaint.priority)}
                        </div>
                        <p className="font-bold text-gray-900 text-sm truncate max-w-xs">{complaint.subject}</p>
                        {complaint.booking && (
                          <p className="text-xs text-blue-600 mt-1 font-medium">Related to Booking</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3",
                          complaint.raisedByModel === 'Partner' ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {complaint.raisedByModel.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{complaint.raisedBy ? complaint.raisedBy.name : 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{complaint.raisedByModel}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900 font-medium">
                        {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(complaint.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(complaint.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/admin/complaints/${complaint._id}`}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
