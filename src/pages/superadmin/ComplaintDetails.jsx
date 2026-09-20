import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { 
  ArrowLeft, AlertCircle, Clock, CheckCircle2, XCircle, 
  MessageSquare, User, Car, MapPin, Save 
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit states
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchComplaint();
    // eslint-disable-next-line
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admins/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setComplaint(data.data);
        setStatus(data.data.status);
        setPriority(data.data.priority);
        setAdminRemarks(data.data.adminRemarks || '');
      }
    } catch (error) {
      console.error('Error fetching complaint details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const { data } = await axios.put(`${API_URL}/api/admins/complaints/${id}`, {
        status, priority, adminRemarks
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setComplaint(data.data);
        setMessage({ type: 'success', text: 'Complaint updated successfully!' });
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      setMessage({ type: 'error', text: 'Failed to update complaint.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p>Loading details...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Complaint Not Found</h2>
          <Link to="/admin/complaints" className="mt-6 text-blue-600 font-bold hover:underline">
            ← Back to Complaints
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (s) => {
    switch (s) {
      case 'OPEN': return <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-bold border border-red-100 flex items-center w-fit"><AlertCircle className="w-4 h-4 mr-1.5" /> Open</span>;
      case 'IN_PROGRESS': return <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-bold border border-blue-100 flex items-center w-fit"><Clock className="w-4 h-4 mr-1.5" /> In Progress</span>;
      case 'RESOLVED': return <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-bold border border-green-100 flex items-center w-fit"><CheckCircle2 className="w-4 h-4 mr-1.5" /> Resolved</span>;
      case 'CLOSED': return <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm font-bold border border-gray-200 flex items-center w-fit"><XCircle className="w-4 h-4 mr-1.5" /> Closed</span>;
      default: return null;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center space-x-4 mb-2">
        <button onClick={() => navigate('/admin/complaints')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Ticket {complaint.complaintId}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details (Left Col) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Complaint Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{complaint.subject}</h3>
                <p className="text-sm text-gray-500">
                  Raised on {new Date(complaint.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              {getStatusBadge(complaint.status)}
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                  {complaint.description}
                </p>
              </div>
            </div>
          </div>

          {/* Action Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">Resolution Dashboard</h3>
              <p className="text-sm text-gray-500">Update ticket status and provide resolution remarks.</p>
            </div>
            
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              {message.text && (
                <div className={cn(
                  "p-4 rounded-lg flex items-center text-sm font-medium",
                  message.type === 'success' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                )}>
                  {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  >
                    <option value="URGENT">Urgent</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Admin Remarks (Internal/Resolution Notes)</label>
                <textarea
                  rows="4"
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="Enter resolution details or internal notes here..."
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center px-8 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
                >
                  {saving ? 'Updating...' : <><Save className="w-5 h-5 mr-2" /> Update Ticket</>}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Sidebar Info (Right Col) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* User/Partner Profile */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-500" />
              <h3 className="font-bold text-gray-900">Raised By</h3>
            </div>
            <div className="p-5">
              {complaint.raisedBy ? (
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0",
                    complaint.raisedByModel === 'Partner' ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {complaint.raisedByModel.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-gray-900 truncate">{complaint.raisedBy.name}</p>
                    <p className="text-sm text-gray-500 truncate">{complaint.raisedBy.phone}</p>
                    <p className="text-xs font-semibold mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md w-fit uppercase">
                      {complaint.raisedByModel}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Unknown User</p>
              )}
            </div>
          </div>

          {/* Booking Info if available */}
          {complaint.booking && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center space-x-2">
                <Car className="w-5 h-5 text-gray-500" />
                <h3 className="font-bold text-gray-900">Related Ride</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <div className="w-0.5 h-6 bg-gray-200 ml-1 my-1"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  </div>
                  <div className="space-y-4 flex-1 overflow-hidden">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-0.5">Pickup</p>
                      <p className="text-sm text-gray-900 truncate">{complaint.booking.pickup.address}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-0.5">Dropoff</p>
                      <p className="text-sm text-gray-900 truncate">{complaint.booking.dropoff.address}</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <Link 
                    to={`/admin/bookings/${complaint.booking._id}`}
                    className="w-full block text-center py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors text-sm"
                  >
                    View Full Booking
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Resolution Info */}
          {(complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') && (
            <div className="bg-green-50 rounded-2xl shadow-sm border border-green-100 p-5">
              <h3 className="font-bold text-green-900 mb-2 flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2" /> Resolution Info
              </h3>
              <div className="space-y-2 text-sm text-green-800">
                <p><span className="font-semibold">Resolved By:</span> {complaint.resolvedBy ? complaint.resolvedBy.name : 'Admin'}</p>
                <p><span className="font-semibold">Role:</span> {complaint.resolvedByModel}</p>
                <p><span className="font-semibold">Date:</span> {complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
