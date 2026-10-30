import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  Search, CalendarDays, MapPin, Car, User, Clock, Settings, Eye,
  RefreshCw, Navigation, Globe, Smartphone, X, CheckCircle, XCircle,
  ArrowRight, IndianRupee, Phone, Mail
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── App Bookings (from mobile/dashboard users) ───
function AppBookings({ token }) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/admins/operations/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 10, status: statusFilter, search }
      });
      if (data.success) {
        setBookings(data.data);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalBookings(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, search]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ENROUTE': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ARRIVED': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'IN_PROGRESS': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto no-scrollbar border border-gray-200/50">
          {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={cn(
                'px-4 py-2 text-sm font-semibold rounded-lg capitalize whitespace-nowrap transition-all',
                statusFilter === status
                  ? 'bg-white text-blue-600 shadow-sm border border-gray-200/60'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
              )}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, phone..."
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">Booking</th>
                <th className="px-6 py-4 font-bold">Passenger</th>
                <th className="px-6 py-4 font-bold">Route</th>
                <th className="px-6 py-4 font-bold">Driver / Partner</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Fare</th>
                <th className="px-6 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Navigation className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-lg font-medium text-gray-900">No bookings found</p>
                      <p className="text-sm">Try adjusting your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 font-mono text-xs mb-1">
                        #{b._id.toString().substring(18).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {formatDate(b.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{b.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{b.user?.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="font-medium text-gray-700">{b.pickup?.address?.split(',')[0] || b.pickup?.city || '—'}</span>
                        <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="text-gray-500">{b.drop?.address?.split(',')[0] || b.drop?.city || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {b.partner ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 shrink-0">
                            <Car className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{b.partner.personalInfo?.fullName || b.partner.name || 'Driver'}</p>
                            <p className="text-xs text-gray-500 font-mono">{b.partner.vehicleDetails?.vehicleNumber || b.partner.vehicleNumber || 'N/A'}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm italic">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('px-2.5 py-1 text-[11px] font-bold rounded-full border uppercase tracking-wider', getStatusColor(b.status))}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">₹{b.fare?.estimated || b.fare?.total || 0}</p>
                      <p className="text-xs text-gray-500">{b.paymentMethod || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === b._id ? null : b._id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Settings className={cn('w-5 h-5 transition-transform duration-300', activeDropdown === b._id && 'rotate-90 text-blue-600')} />
                        </button>
                        {activeDropdown === b._id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1.5 overflow-hidden">
                              <button
                                onClick={() => { setActiveDropdown(null); navigate(String(b._id)); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center font-medium"
                              >
                                <Eye className="w-4 h-4 mr-2.5 text-gray-400" /> Manage
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
              Page <span className="font-semibold text-gray-900">{page}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
              {' '}· {totalBookings} total
            </span>
            <div className="flex space-x-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Website Bookings (from public website) ───
function WebsiteBookings({ token }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notice, setNotice] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/admins/website/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 10, status: statusFilter, payment: paymentFilter, search }
      });
      if (data.success) {
        setBookings(data.data || []);
        setTotalPages(data.pages || 1);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching web bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [token, page, statusFilter, paymentFilter, search]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    let reason;
    if (newStatus === 'cancelled') {
      reason = window.prompt('Reason for cancellation (shown to the customer in the email):', '');
      if (reason === null) return;
    }
    setUpdatingStatus(true);
    setNotice(null);
    try {
      const { data } = await axios.patch(`${API_URL}/api/admins/website/bookings/${bookingId}`,
        { status: newStatus, ...(reason !== undefined ? { cancelReason: reason } : {}) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings();
      if (selectedBooking?.bookingId === bookingId) {
        setSelectedBooking((prev) => ({ ...prev, ...data.data, status: newStatus }));
      }
      const mail = data.email;
      if (mail?.emailSent) setNotice({ type: 'success', text: `Status updated. Email sent to ${data.data?.passenger?.email}.` });
      else if (mail?.skipped === 'no_email') setNotice({ type: 'warn', text: 'Status updated. No email sent: customer did not give an email address.' });
      else if (mail) setNotice({ type: 'warn', text: 'Status updated, but the email could not be sent. Check EMAIL_ENABLED and Brevo settings on the server.' });
      else setNotice({ type: 'success', text: 'Status updated.' });
    } catch (err) {
      console.error('Status update failed:', err);
      setNotice({ type: 'error', text: err.response?.data?.message || 'Could not update the status. Please try again.' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openDetail = async (booking) => {
    setNotice(null);
    setSelectedBooking(booking);
    setDetailModal(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/admins/website/bookings/${booking.bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) setSelectedBooking(data.data);
    } catch { /* use list data */ }
  };

  const STATUS_COLORS = {
    confirmed: 'bg-blue-100 text-blue-800',
    assigned: 'bg-indigo-100 text-indigo-800',
    in_progress: 'bg-amber-100 text-amber-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const PAYMENT_COLORS = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
  };

  const formatDate = (s) => s ? new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-xl overflow-x-auto no-scrollbar border border-gray-200/50">
            {['all', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={cn('px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-all',
                  statusFilter === s ? 'bg-white text-blue-600 shadow-sm border border-gray-200/60' : 'text-gray-500 hover:bg-gray-200/50'
                )}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
            {['all', 'paid', 'pending', 'failed'].map((p) => (
              <button
                key={p}
                onClick={() => { setPaymentFilter(p); setPage(1); }}
                className={cn('px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-all',
                  paymentFilter === p ? 'bg-white text-green-600 shadow-sm border border-gray-200/60' : 'text-gray-500 hover:bg-gray-200/50'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Booking ID, name, mobile..."
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-4 font-bold">Booking ID</th>
                <th className="px-5 py-4 font-bold">Passenger</th>
                <th className="px-5 py-4 font-bold">Route & Date</th>
                <th className="px-5 py-4 font-bold">Vehicle</th>
                <th className="px-5 py-4 font-bold">Fare</th>
                <th className="px-5 py-4 font-bold">Payment</th>
                <th className="px-5 py-4 font-bold">Status</th>
                <th className="px-5 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(8).fill(0).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center text-gray-400">
                      <Globe className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-lg font-medium text-gray-900">No website bookings found</p>
                      <p className="text-sm">Adjust filters or wait for new bookings from the website.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-amber-700 font-mono text-xs">{b.bookingId}</p>
                      <p className="text-xs text-gray-400">{formatDate(b.createdAt)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{b.passenger?.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {b.passenger?.mobile}
                      </p>
                      {b.passenger?.email && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 truncate max-w-[160px]">
                          <Mail className="w-3 h-3" /> {b.passenger.email}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        {b.trip?.from} <ArrowRight className="w-3 h-3 text-gray-400 shrink-0" /> {b.trip?.to || 'Local'}
                      </div>
                      <p className="text-xs text-gray-400">{b.trip?.date} at {b.trip?.time}</p>
                      <span className="inline-block mt-0.5 text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">{b.trip?.tripType}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">{b.vehicle?.name}</p>
                      <p className="text-xs text-gray-400">{b.vehicle?.model}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900">₹{b.fare?.total}</p>
                      <p className="text-xs text-gray-400">Paid: ₹{b.fare?.paidNow} | Later: ₹{b.fare?.payLater}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('px-2 py-0.5 text-xs font-semibold rounded-full capitalize', PAYMENT_COLORS[b.payment?.status] || 'bg-gray-100 text-gray-600')}>
                        {b.payment?.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('px-2 py-0.5 text-xs font-semibold rounded-full capitalize', STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600')}>
                        {b.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openDetail(b)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Page {page} of {totalPages} · {total} total</span>
            <div className="flex space-x-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailModal && selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDetailModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{selectedBooking.bookingId}</h3>
                <p className="text-xs text-gray-400">{formatDate(selectedBooking.createdAt)}</p>
              </div>
              <button onClick={() => setDetailModal(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Passenger */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Passenger Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-blue-500">Name</p><p className="font-semibold text-gray-900">{selectedBooking.passenger?.name}</p></div>
                  <div><p className="text-xs text-blue-500">Mobile</p><p className="font-semibold text-gray-900">{selectedBooking.passenger?.mobile}</p></div>
                  <div><p className="text-xs text-blue-500">Email</p><p className="font-semibold text-gray-900">{selectedBooking.passenger?.email || '—'}</p></div>
                  <div className="col-span-2"><p className="text-xs text-blue-500">Pickup Address</p><p className="font-semibold text-gray-900 text-sm">{selectedBooking.passenger?.pickupAddress || '—'}</p></div>
                  {selectedBooking.passenger?.dropAddress && (
                    <div className="col-span-2"><p className="text-xs text-blue-500">Drop Address</p><p className="font-semibold text-gray-900 text-sm">{selectedBooking.passenger.dropAddress}</p></div>
                  )}
                  {selectedBooking.passenger?.instructions && (
                    <div className="col-span-2"><p className="text-xs text-blue-500">Special Instructions</p><p className="font-semibold text-gray-900 text-sm">{selectedBooking.passenger.instructions}</p></div>
                  )}
                </div>
              </div>

              {/* Trip */}
              <div className="bg-amber-50 rounded-xl p-4">
                <h4 className="font-semibold text-amber-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Trip Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-amber-500">From</p><p className="font-semibold text-gray-900">{selectedBooking.trip?.from}</p></div>
                  <div><p className="text-xs text-amber-500">To</p><p className="font-semibold text-gray-900">{selectedBooking.trip?.to || 'Local'}</p></div>
                  {selectedBooking.trip?.stop && (
                    <div><p className="text-xs text-amber-500">Stop</p><p className="font-semibold text-gray-900">{selectedBooking.trip.stop}</p></div>
                  )}
                  <div><p className="text-xs text-amber-500">Date & Time</p><p className="font-semibold text-gray-900">{selectedBooking.trip?.date} at {selectedBooking.trip?.time}</p></div>
                  <div><p className="text-xs text-amber-500">Type</p><p className="font-semibold text-gray-900 capitalize">{selectedBooking.trip?.tripType === 'airport' && selectedBooking.trip?.airportDir ? `Airport ${selectedBooking.trip.airportDir === 'from' ? 'Pickup' : 'Drop'}` : selectedBooking.trip?.tripType}</p></div>
                  {selectedBooking.trip?.package && (
                    <div><p className="text-xs text-amber-500">Package</p><p className="font-semibold text-gray-900">{selectedBooking.trip.package}</p></div>
                  )}
                  {selectedBooking.trip?.tripType === 'roundtrip' && (
                    <div><p className="text-xs text-amber-500">Days</p><p className="font-semibold text-gray-900">{selectedBooking.trip?.days || 1}</p></div>
                  )}
                  <div><p className="text-xs text-amber-500">Distance</p><p className="font-semibold text-gray-900">{selectedBooking.trip?.distanceKm} km</p></div>
                  <div><p className="text-xs text-amber-500">Vehicle</p><p className="font-semibold text-gray-900">{selectedBooking.vehicle?.name} — {selectedBooking.vehicle?.model}{selectedBooking.vehicle?.seats ? ` (${selectedBooking.vehicle.seats} seats)` : ''}</p></div>
                </div>
              </div>

              {/* Fare */}
              <div className="bg-green-50 rounded-xl p-4">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Fare Breakdown</h4>
                <div className="space-y-1.5 text-sm">
                  {[
                    ['Base Fare', selectedBooking.fare?.baseFare],
                    ['Extra KM Fare', selectedBooking.fare?.extraKmFare],
                    ['Driver Allowance', selectedBooking.fare?.driverAllowance],
                    ['GST', selectedBooking.fare?.gst],
                    ...(selectedBooking.fare?.discount > 0
                      ? [[`Coupon Discount${selectedBooking.fare.couponCode ? ` (${selectedBooking.fare.couponCode})` : ''}`, -selectedBooking.fare.discount]]
                      : []),
                    ['Total', selectedBooking.fare?.total],
                    ['Paid Now', selectedBooking.fare?.paidNow],
                    ['Pay Later (to driver)', selectedBooking.fare?.payLater],
                  ].map(([label, val]) => (
                    <div key={label} className={cn('flex justify-between', label === 'Total' && 'font-bold border-t border-green-200 pt-1.5 mt-1.5')}>
                      <span className="text-green-700">{label}</span>
                      <span className={cn(val < 0 ? 'text-green-700 font-semibold' : 'text-gray-900')}>{val < 0 ? '- ' : ''}₹{Math.abs(val || 0)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1.5">
                    <span className="text-green-700">Payment Option</span>
                    <span className="text-gray-900 capitalize">{selectedBooking.fare?.paymentOption === 'full' ? 'Full payment' : 'Part payment'}</span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Payment Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">Status</p>
                    <span className={cn('inline-block px-2 py-0.5 text-xs font-semibold rounded-full capitalize', PAYMENT_COLORS[selectedBooking.payment?.status] || 'bg-gray-100 text-gray-600')}>
                      {selectedBooking.payment?.status || 'pending'}
                    </span>
                  </div>
                  <div><p className="text-xs text-slate-500">Amount Paid</p><p className="font-semibold text-gray-900">₹{selectedBooking.payment?.paidAmount || 0}</p></div>
                  <div><p className="text-xs text-slate-500">Paid On</p><p className="font-semibold text-gray-900">{formatDate(selectedBooking.payment?.paidAt)}</p></div>
                  <div><p className="text-xs text-slate-500">Payment ID</p><p className="font-semibold text-gray-900 text-xs font-mono break-all">{selectedBooking.payment?.paymentId || '—'}</p></div>
                  <div className="col-span-2"><p className="text-xs text-slate-500">Razorpay Order ID</p><p className="font-semibold text-gray-900 text-xs font-mono break-all">{selectedBooking.payment?.orderId || '—'}</p></div>
                  <div>
                    <p className="text-xs text-slate-500">Confirmation Email</p>
                    <p className="font-semibold text-gray-900">
                      {!selectedBooking.passenger?.email ? 'No email given' : selectedBooking.notification?.emailSent ? 'Sent' : 'Not sent'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Driver / notes */}
              {(selectedBooking.assignedPartner?.name || selectedBooking.adminNote || selectedBooking.cancelReason) && (
                <div className="bg-indigo-50 rounded-xl p-4">
                  <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2"><Car className="w-4 h-4" /> Driver &amp; Notes</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedBooking.assignedPartner?.name && (
                      <>
                        <div><p className="text-xs text-indigo-500">Driver</p><p className="font-semibold text-gray-900">{selectedBooking.assignedPartner.name}</p></div>
                        <div><p className="text-xs text-indigo-500">Driver Phone</p><p className="font-semibold text-gray-900">{selectedBooking.assignedPartner.phone || '—'}</p></div>
                        <div><p className="text-xs text-indigo-500">Vehicle Number</p><p className="font-semibold text-gray-900">{selectedBooking.assignedPartner.vehicleNumber || '—'}</p></div>
                      </>
                    )}
                    {selectedBooking.cancelReason && (
                      <div className="col-span-2"><p className="text-xs text-indigo-500">Cancel Reason</p><p className="font-semibold text-gray-900">{selectedBooking.cancelReason}</p></div>
                    )}
                    {selectedBooking.adminNote && (
                      <div className="col-span-2"><p className="text-xs text-indigo-500">Admin Note</p><p className="font-semibold text-gray-900">{selectedBooking.adminNote}</p></div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Update Status</h4>
                <p className="text-xs text-gray-500 mb-3">The customer gets an email on every status change.</p>
                {notice && (
                  <div className={cn('mb-3 rounded-lg px-3 py-2 text-xs font-medium border',
                    notice.type === 'success' && 'bg-green-50 text-green-800 border-green-200',
                    notice.type === 'warn' && 'bg-amber-50 text-amber-800 border-amber-200',
                    notice.type === 'error' && 'bg-red-50 text-red-800 border-red-200'
                  )}>{notice.text}</div>
                )}
                <div className="flex flex-wrap gap-2">
                  {['confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'].map((s) => (
                    <button
                      key={s}
                      disabled={selectedBooking.status === s || updatingStatus}
                      onClick={() => handleStatusUpdate(selectedBooking.bookingId, s)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-semibold rounded-lg capitalize border transition-colors disabled:opacity-50',
                        selectedBooking.status === s
                          ? 'bg-gray-800 text-white border-gray-800'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Bookings Page ───
export default function Bookings() {
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;

  const [activeTab, setActiveTab] = useState('website');

  const TABS = [
    { id: 'website', label: 'Website Bookings', icon: Globe, desc: 'Bookings from public website (goindiacab.com)' },
    { id: 'app', label: 'App / Dashboard Bookings', icon: Smartphone, desc: 'Bookings from mobile app & user dashboard' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-blue-600" />
            </div>
            Booking Management
          </h2>
          <p className="text-gray-500 mt-1 text-sm">Monitor and manage all trips — both from the app and website.</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-3 px-5 py-4 rounded-xl border transition-all text-left',
              activeTab === tab.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:bg-blue-50'
            )}
          >
            <tab.icon className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">{tab.label}</p>
              <p className={cn('text-xs', activeTab === tab.id ? 'text-blue-200' : 'text-gray-400')}>{tab.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'app' ? (
        <AppBookings token={token} />
      ) : (
        <WebsiteBookings token={token} />
      )}
    </div>
  );
}
