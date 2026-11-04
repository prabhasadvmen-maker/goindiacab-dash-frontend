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
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
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
  const [dateField, setDateField] = useState('trip'); // 'trip' = travel date, 'booked' = booking date
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notice, setNotice] = useState(null);
  const [driverForm, setDriverForm] = useState(null); // null = closed
  const [driverError, setDriverError] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/admins/website/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 10, status: statusFilter, payment: paymentFilter, search, dateField, from: dateFrom || undefined, to: dateTo || undefined }
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
  }, [token, page, statusFilter, paymentFilter, search, dateField, dateFrom, dateTo]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleStatusUpdate = async (bookingId, newStatus, extra = {}) => {
    let reason;
    if (newStatus === 'cancelled') {
      reason = window.prompt('Reason for cancellation (shown to the customer in the email):', '');
      if (reason === null) return;
    }
    setUpdatingStatus(true);
    setNotice(null);
    try {
      const { data } = await axios.patch(`${API_URL}/api/admins/website/bookings/${bookingId}`,
        { status: newStatus, ...(reason !== undefined ? { cancelReason: reason } : {}), ...extra },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings();
      if (selectedBooking?.bookingId === bookingId) {
        setSelectedBooking((prev) => ({ ...prev, ...data.data, assignedPartner: prev.assignedPartner, status: newStatus }));
      }
      const mail = data.email;
      const dMail = data.driverEmail;
      if (extra.assignedDriver) {
        const parts = [];
        parts.push(mail?.emailSent ? `Email sent to customer (${data.data?.passenger?.email})` : mail?.skipped === 'no_email' ? 'Customer has no email, so no mail was sent to them' : 'Customer email could not be sent');
        parts.push(dMail?.emailSent ? `Email sent to driver (${data.data?.assignedDriver?.email})` : dMail?.skipped === 'no_driver_email' ? 'No driver email entered, so the driver was not emailed' : 'Driver email could not be sent');
        const allOk = mail?.emailSent && dMail?.emailSent;
        setNotice({ type: allOk ? 'success' : 'warn', text: `Driver assigned. ${parts.join('. ')}.` });
      } else if (mail?.emailSent) setNotice({ type: 'success', text: `Status updated. Email sent to ${data.data?.passenger?.email}.` });
      else if (mail?.skipped === 'no_email') setNotice({ type: 'warn', text: 'Status updated. No email sent: customer did not give an email address.' });
      else if (mail) setNotice({ type: 'warn', text: 'Status updated, but the email could not be sent. Check EMAIL_ENABLED and Brevo settings on the server.' });
      else setNotice({ type: 'success', text: 'Status updated.' });
    } catch (err) {
      console.error('Status update failed:', err);
      const msg = err.response?.data?.message || 'Could not update the status. Please try again.';
      setNotice({ type: 'error', text: msg });
      if (extra.assignedDriver) setDriverError(msg);
      return false;
    } finally {
      setUpdatingStatus(false);
    }
    return true;
  };

  // The driver that is on this booking: typed-in details first, a linked partner record as fallback.
  const driverOf = (b) => (b?.assignedDriver?.name ? b.assignedDriver : b?.assignedPartner?.name ? b.assignedPartner : null);

  const openDriverForm = () => {
    const d = driverOf(selectedBooking) || {};
    setDriverError('');
    setNotice(null);
    setDriverForm({ name: d.name || '', phone: d.phone || '', email: d.email || '', vehicleNumber: d.vehicleNumber || '', vehicleModel: d.vehicleModel || '' });
  };

  const submitDriver = async (e) => {
    e.preventDefault();
    setDriverError('');
    const name = driverForm.name.trim();
    const phone = driverForm.phone.replace(/\D/g, '').slice(-10);
    if (!name) return setDriverError('Enter the driver name.');
    if (phone.length !== 10) return setDriverError('Enter a valid 10-digit driver mobile number.');
    if (driverForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driverForm.email.trim())) return setDriverError('Enter a valid driver email address.');
    const ok = await handleStatusUpdate(selectedBooking.bookingId, 'assigned', { assignedDriver: { ...driverForm, name, phone } });
    if (ok) setDriverForm(null);
  };

  const openDetail = async (booking) => {
    setNotice(null);
    setDriverForm(null);
    setDriverError('');
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

  // Calendar filter helpers (dates are India-time days, YYYY-MM-DD)
  const istDay = (offset = 0) => new Date(Date.now() + 5.5 * 3600000 + offset * 86400000).toISOString().slice(0, 10);
  const setRange = (from, to) => { setDateFrom(from); setDateTo(to); setPage(1); };
  const hasDate = !!(dateFrom || dateTo);
  const activeQuick = hasDate && dateFrom === dateTo ? (dateFrom === istDay(0) ? 'today' : dateFrom === istDay(1) ? 'tomorrow' : dateFrom === istDay(-1) ? 'yesterday' : '') : '';

  const IST = { timeZone: 'Asia/Kolkata' };
  const formatDate = (s) => s ? new Date(s).toLocaleString('en-IN', { ...IST, day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '—';

  // Trip date ("YYYY-MM-DD") + time ("HH:mm") are stored as plain strings in IST: format them without timezone shifts.
  const formatTripDate = (d) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || '');
    if (!m) return d || '—';
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleDateString('en-IN', { timeZone: 'UTC', weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  };
  const formatTripTime = (t) => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(t || '');
    if (!m) return t || '';
    const h = +m[1];
    return `${h % 12 || 12}:${m[2]} ${h >= 12 ? 'PM' : 'AM'}`;
  };

  // What was really received vs what is still due. fare.paidNow is only the amount asked for online, not money received.
  const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
  const getPaymentInfo = (b) => {
    const total = Number(b.fare?.total) || 0;
    const isCash = b.fare?.paymentOption === 'cash';
    const received = b.payment?.status === 'paid' ? (Number(b.payment?.paidAmount) || Number(b.fare?.paidNow) || 0) : 0;
    const cancelled = b.status === 'cancelled';
    const balance = cancelled ? 0 : Math.max(0, total - received);
    const awaiting = !isCash && !cancelled && b.payment?.status !== 'paid' ? Number(b.fare?.paidNow) || 0 : 0;
    return { total, isCash, received, balance, awaiting };
  };
  // A booking is saved as "confirmed" before the customer pays. Online bookings are only really confirmed once paid.
  const getDisplayStatus = (b) => {
    if (b.status === 'confirmed' && b.fare?.paymentOption !== 'cash' && b.payment?.status !== 'paid') {
      return b.payment?.status === 'failed' ? 'payment_failed' : 'awaiting_payment';
    }
    return b.status;
  };
  const STATUS_LABELS = { awaiting_payment: 'Awaiting payment', payment_failed: 'Payment failed' };
  const PAYMENT_LABELS ={ paid: 'Paid online', pending: 'Pending', failed: 'Failed' };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex flex-wrap gap-2 w-full xl:w-auto min-w-0">
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
        <form onSubmit={handleSearch} className="flex gap-2 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-64">
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

        {/* Calendar / date filter */}
        <div className="w-full flex flex-wrap items-center gap-x-5 gap-y-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 whitespace-nowrap">
              <CalendarDays className="w-4 h-4 text-blue-600" /> Date
            </span>
            <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
              {[['trip', 'Trip date'], ['booked', 'Booked on']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => { setDateField(v); setPage(1); }}
                  className={cn('px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all',
                    dateField === v ? 'bg-white text-blue-600 shadow-sm border border-gray-200/60' : 'text-gray-500 hover:bg-gray-200/50')}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="date" aria-label="From date" value={dateFrom} max={dateTo || undefined}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="h-9 w-[138px] px-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100" />
            <span className="text-gray-400 text-xs font-medium">to</span>
            <input type="date" aria-label="To date" value={dateTo} min={dateFrom || undefined}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="h-9 w-[138px] px-2.5 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100" />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[['yesterday', 'Yesterday', -1], ['today', 'Today', 0], ['tomorrow', 'Tomorrow', 1]].map(([k, l, o]) => (
              <button key={k} type="button" onClick={() => setRange(istDay(o), istDay(o))}
                className={cn('h-8 px-3 text-xs font-semibold rounded-full border transition-colors whitespace-nowrap',
                  activeQuick === k ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50')}>
                {l}
              </button>
            ))}
            <button type="button" onClick={() => setRange(istDay(0), istDay(6))}
              className="h-8 px-3 text-xs font-semibold rounded-full border bg-white text-gray-600 border-gray-200 hover:bg-gray-50 whitespace-nowrap">Next 7 days</button>
            {hasDate && (
              <button type="button" onClick={() => setRange('', '')}
                className="h-8 inline-flex items-center gap-1 px-3 text-xs font-semibold rounded-full text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 whitespace-nowrap">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Mobile cards */}
        <div className="md:hidden p-3 space-y-3 bg-slate-50/60">
          {loading ? (
            Array(3).fill(0).map((_, i) => <div key={i} className="h-44 rounded-2xl bg-white border border-gray-100 animate-pulse" />)
          ) : bookings.length === 0 ? (
            <div className="py-10 flex flex-col items-center text-gray-400 text-center">
              <Globe className="w-10 h-10 mb-2 opacity-30" />
              <p className="font-medium text-gray-900">No website bookings found</p>
              <p className="text-sm">Adjust filters or wait for new bookings.</p>
            </div>
          ) : bookings.map((b) => {
            const pay = getPaymentInfo(b);
            const ds = getDisplayStatus(b);
            return (
              <div key={b._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-start justify-between gap-2 px-4 pt-3.5">
                  <div className="min-w-0">
                    <p className="font-bold text-amber-700 font-mono text-xs truncate">{b.bookingId}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Booked {formatDate(b.createdAt)}</p>
                  </div>
                  <span className={cn('shrink-0 px-2.5 py-1 text-[11px] font-semibold rounded-full capitalize whitespace-nowrap',
                    ds === 'awaiting_payment' ? 'bg-yellow-100 text-yellow-800' : ds === 'payment_failed' ? 'bg-red-100 text-red-800' : STATUS_COLORS[ds] || 'bg-gray-100 text-gray-600')}>
                    {STATUS_LABELS[ds] || ds?.replace('_', ' ')}
                  </span>
                </div>

                <div className="px-4 mt-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{b.passenger?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{b.vehicle?.name}{b.vehicle?.model ? ` · ${b.vehicle.model}` : ''}</p>
                  </div>
                  {b.passenger?.mobile && (
                    <a href={`tel:${b.passenger.mobile}`} className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-3 py-2 rounded-full">
                      <Phone className="w-3.5 h-3.5" /> {b.passenger.mobile}
                    </a>
                  )}
                </div>

                <div className="mx-4 mt-3 rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-2">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 mt-0.5 text-amber-600 shrink-0" />
                    <p className="text-gray-800 leading-snug min-w-0">
                      <span className="font-medium">{b.trip?.from}</span>
                      <span className="text-gray-400"> → </span>
                      <span className="font-medium">{b.trip?.to || 'Local'}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1 font-semibold text-gray-900"><CalendarDays className="w-3.5 h-3.5 text-blue-500" /> {formatTripDate(b.trip?.date)}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-gray-900"><Clock className="w-3.5 h-3.5 text-blue-500" /> {formatTripTime(b.trip?.time)}</span>
                    <span className="capitalize text-gray-500">{b.trip?.tripType === 'airport' && b.trip?.airportDir ? `Airport ${b.trip.airportDir === 'from' ? 'pickup' : 'drop'}` : b.trip?.tripType}{b.trip?.distanceKm ? ` · ${b.trip.distanceKm} km` : ''}</span>
                  </div>
                  {driverOf(b) && (
                    <p className="text-xs text-indigo-600 flex items-center gap-1"><Car className="w-3.5 h-3.5" /> {driverOf(b).name}{driverOf(b).vehicleNumber ? ` · ${driverOf(b).vehicleNumber}` : ''}</p>
                  )}
                </div>

                <div className="px-4 mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-gray-50 py-2"><p className="text-[10px] uppercase font-bold text-gray-400">Total</p><p className="font-bold text-gray-900 text-sm">{money(pay.total)}</p></div>
                  <div className="rounded-xl bg-green-50 py-2"><p className="text-[10px] uppercase font-bold text-green-600/70">Received</p><p className="font-bold text-green-700 text-sm">{money(pay.received)}</p></div>
                  <div className={cn('rounded-xl py-2', pay.balance > 0 ? 'bg-red-50' : 'bg-green-50')}><p className={cn('text-[10px] uppercase font-bold', pay.balance > 0 ? 'text-red-400' : 'text-green-600/70')}>{pay.isCash ? 'To driver' : 'Balance'}</p><p className={cn('font-bold text-sm', pay.balance > 0 ? 'text-red-600' : 'text-green-700')}>{money(pay.balance)}</p></div>
                </div>

                <div className="flex items-center justify-between gap-2 px-4 py-3">
                  <span className={cn('px-2.5 py-1 text-[11px] font-semibold rounded-full', PAYMENT_COLORS[b.payment?.status] || 'bg-gray-100 text-gray-600')}>
                    {pay.isCash && b.payment?.status !== 'paid' ? 'Cash to driver' : PAYMENT_LABELS[b.payment?.status] || 'Pending'}
                  </span>
                  <button onClick={() => openDetail(b)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 active:bg-blue-700 px-5 py-2 rounded-full">
                    <Eye className="w-4 h-4" /> View details
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[1150px] text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-4 font-bold">Booking ID / Booked On</th>
                <th className="px-4 py-4 font-bold">Passenger</th>
                <th className="px-4 py-4 font-bold">Route</th>
                <th className="px-4 py-4 font-bold">Trip Date & Time</th>
                <th className="px-4 py-4 font-bold">Vehicle</th>
                <th className="px-4 py-4 font-bold">Payment Summary</th>
                <th className="px-4 py-4 font-bold">Status</th>
                <th className="px-4 py-4 font-bold text-right">Action</th>
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
                bookings.map((b) => {
                  const pay = getPaymentInfo(b);
                  return (
                  <tr key={b._id} className="hover:bg-slate-50/50 transition-colors align-top">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="font-bold text-amber-700 font-mono text-xs">{b.bookingId}</p>
                      <p className="text-[11px] text-gray-400 mt-1">Booked on</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(b.createdAt)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{b.passenger?.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                        <Phone className="w-3 h-3" /> {b.passenger?.mobile}
                      </p>
                      {b.passenger?.email && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 truncate max-w-[170px]" title={b.passenger.email}>
                          <Mail className="w-3 h-3 shrink-0" /> {b.passenger.email}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 min-w-[170px]">
                      <p className="font-medium text-gray-800 leading-snug">{b.trip?.from}</p>
                      <p className="text-gray-400 text-xs flex items-center gap-1"><ArrowRight className="w-3 h-3 shrink-0" /> {b.trip?.to || 'Local'}</p>
                      <span className="inline-block mt-1 text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded capitalize">
                        {b.trip?.tripType === 'airport' && b.trip?.airportDir ? `Airport ${b.trip.airportDir === 'from' ? 'pickup' : 'drop'}` : b.trip?.tripType}
                        {b.trip?.distanceKm ? ` · ${b.trip.distanceKm} km` : ''}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <p className="font-semibold text-gray-900 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5 text-blue-500" /> {formatTripDate(b.trip?.date)}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3 text-blue-500" /> {formatTripTime(b.trip?.time)}</p>
                      {b.trip?.tripType === 'roundtrip' && b.trip?.returnDate && (
                        <p className="text-xs text-gray-400 mt-0.5">Return: {formatTripDate(b.trip.returnDate)}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-800">{b.vehicle?.name}</p>
                      <p className="text-xs text-gray-400">{b.vehicle?.model}</p>
                      {driverOf(b) && (
                        <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1"><Car className="w-3 h-3" /> {driverOf(b).name}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 min-w-[210px]">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex justify-between gap-4"><span className="text-gray-500">Total fare</span><span className="font-bold text-gray-900 text-sm">{money(pay.total)}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-gray-500">Received</span><span className={cn('font-semibold', pay.received > 0 ? 'text-green-700' : 'text-gray-400')}>{money(pay.received)}</span></div>
                        <div className="flex justify-between gap-4 border-t border-gray-100 pt-0.5">
                          <span className="text-gray-500">{pay.isCash ? 'Pay to driver' : 'Balance due'}</span>
                          <span className={cn('font-semibold', pay.balance > 0 ? 'text-red-600' : 'text-green-700')}>{money(pay.balance)}</span>
                        </div>
                        {pay.awaiting > 0 && <p className="text-[11px] text-amber-600">Online {money(pay.awaiting)} not received yet</p>}
                      </div>
                      <span className={cn('inline-block mt-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full', PAYMENT_COLORS[b.payment?.status] || 'bg-gray-100 text-gray-600')}>
                        {pay.isCash && b.payment?.status !== 'paid' ? 'Cash to driver' : PAYMENT_LABELS[b.payment?.status] || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {(() => {
                        const ds = getDisplayStatus(b);
                        return (
                          <span className={cn('px-2 py-0.5 text-xs font-semibold rounded-full capitalize whitespace-nowrap',
                            ds === 'awaiting_payment' ? 'bg-yellow-100 text-yellow-800' : ds === 'payment_failed' ? 'bg-red-100 text-red-800' : STATUS_COLORS[ds] || 'bg-gray-100 text-gray-600')}>
                            {STATUS_LABELS[ds] || ds?.replace('_', ' ')}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => openDetail(b)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setDetailModal(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{selectedBooking.bookingId}</h3>
                <p className="text-xs text-gray-400">Booked on {formatDate(selectedBooking.createdAt)}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(() => {
                    const ds = getDisplayStatus(selectedBooking);
                    return (
                      <span className={cn('px-2 py-0.5 text-[11px] font-semibold rounded-full capitalize',
                        ds === 'awaiting_payment' ? 'bg-yellow-100 text-yellow-800' : ds === 'payment_failed' ? 'bg-red-100 text-red-800' : STATUS_COLORS[ds] || 'bg-gray-100 text-gray-600')}>
                        {STATUS_LABELS[ds] || ds?.replace('_', ' ')}
                      </span>
                    );
                  })()}
                  <span className={cn('px-2 py-0.5 text-[11px] font-semibold rounded-full', PAYMENT_COLORS[selectedBooking.payment?.status] || 'bg-gray-100 text-gray-600')}>
                    {getPaymentInfo(selectedBooking).isCash && selectedBooking.payment?.status !== 'paid' ? 'Cash to driver' : PAYMENT_LABELS[selectedBooking.payment?.status] || 'Pending'}
                  </span>
                </div>
              </div>
              <button onClick={() => setDetailModal(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Passenger */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Passenger Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-blue-500">Name</p><p className="font-semibold text-gray-900">{selectedBooking.passenger?.name}</p></div>
                  <div><p className="text-xs text-blue-500">Mobile</p><a href={`tel:${selectedBooking.passenger?.mobile}`} className="font-semibold text-blue-700 hover:underline">{selectedBooking.passenger?.mobile}</a></div>
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
                  <div><p className="text-xs text-amber-500">Date & Time</p><p className="font-semibold text-gray-900">{formatTripDate(selectedBooking.trip?.date)}, {formatTripTime(selectedBooking.trip?.time)}</p></div>
                  <div><p className="text-xs text-amber-500">Type</p><p className="font-semibold text-gray-900 capitalize">{selectedBooking.trip?.tripType === 'airport' && selectedBooking.trip?.airportDir ? `Airport ${selectedBooking.trip.airportDir === 'from' ? 'Pickup' : 'Drop'}` : selectedBooking.trip?.tripType}</p></div>
                  {selectedBooking.trip?.package && (
                    <div><p className="text-xs text-amber-500">Package</p><p className="font-semibold text-gray-900">{selectedBooking.trip.package}</p></div>
                  )}
                  {selectedBooking.trip?.tripType === 'roundtrip' && selectedBooking.trip?.returnDate && (
                    <div><p className="text-xs text-amber-500">Return Date</p><p className="font-semibold text-gray-900">{formatTripDate(selectedBooking.trip.returnDate)}</p></div>
                  )}
                  {selectedBooking.trip?.tripType === 'roundtrip' && (
                    <div><p className="text-xs text-amber-500">Days</p><p className="font-semibold text-gray-900">{selectedBooking.trip?.days || 1}</p></div>
                  )}
                  <div><p className="text-xs text-amber-500">Distance</p><p className="font-semibold text-gray-900">{selectedBooking.trip?.distanceKm ? `${selectedBooking.trip.distanceKm} km` : '—'}</p></div>
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
                    ...(Array.isArray(selectedBooking.fare?.addons) ? selectedBooking.fare.addons : []).map((a, i) => [
                      `Add-on: ${a?.label || a?.title || a?.name || a?.code || `#${i + 1}`}${a?.qty > 1 ? ` x${a.qty}` : ''}`,
                      Number(a?.total ?? a?.price ?? a?.amount) || 0,
                    ]),
                    ['GST', selectedBooking.fare?.gst],
                    ...(selectedBooking.fare?.discount > 0
                      ? [[`Coupon Discount${selectedBooking.fare.couponCode ? ` (${selectedBooking.fare.couponCode})` : ''}`, -selectedBooking.fare.discount]]
                      : []),
                    ['Total', selectedBooking.fare?.total],
                    ['Online amount requested', selectedBooking.fare?.paidNow],
                    ['Received so far', getPaymentInfo(selectedBooking).received],
                    ['Balance (to driver)', getPaymentInfo(selectedBooking).balance],
                  ].map(([label, val]) => (
                    <div key={label} className={cn('flex justify-between gap-3', label === 'Total' && 'font-bold border-t border-green-200 pt-1.5 mt-1.5')}>
                      <span className="text-green-700">{label}</span>
                      <span className={cn(val < 0 ? 'text-green-700 font-semibold' : 'text-gray-900')}>{val < 0 ? '- ' : ''}₹{Math.abs(val || 0)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1.5">
                    <span className="text-green-700">Payment Option</span>
                    <span className="text-gray-900 capitalize">{{ full: 'Full payment', cash: 'Pay to driver (cash)' }[selectedBooking.fare?.paymentOption] || 'Part payment'}</span>
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
                  <div><p className="text-xs text-slate-500">Last Updated</p><p className="font-semibold text-gray-900">{formatDate(selectedBooking.updatedAt)}</p></div>
                </div>
              </div>

              {/* Driver / notes */}
              {(
                <div className="bg-indigo-50 rounded-xl p-4">
                  <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2"><Car className="w-4 h-4" /> Driver &amp; Notes
                    {selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && (
                      <button type="button" onClick={openDriverForm} className="ml-auto text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-100 px-3 py-1 rounded-lg">
                        {driverOf(selectedBooking) ? 'Edit driver' : 'Assign driver'}
                      </button>
                    )}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {!driverOf(selectedBooking) && (
                      <div className="col-span-2"><p className="text-xs text-indigo-500">Driver</p><p className="font-semibold text-gray-500 italic">Not assigned yet</p></div>
                    )}
                    {driverOf(selectedBooking) && (
                      <>
                        <div><p className="text-xs text-indigo-500">Driver</p><p className="font-semibold text-gray-900">{driverOf(selectedBooking).name}</p></div>
                        <div><p className="text-xs text-indigo-500">Driver Phone</p><p className="font-semibold text-gray-900">{driverOf(selectedBooking).phone ? <a href={`tel:${driverOf(selectedBooking).phone}`} className="text-blue-700 hover:underline">{driverOf(selectedBooking).phone}</a> : '—'}</p></div>
                        <div><p className="text-xs text-indigo-500">Vehicle Number</p><p className="font-semibold text-gray-900">{driverOf(selectedBooking).vehicleNumber || '—'}</p></div>
                        {driverOf(selectedBooking).vehicleModel && <div><p className="text-xs text-indigo-500">Vehicle</p><p className="font-semibold text-gray-900">{driverOf(selectedBooking).vehicleModel}</p></div>}
                        {driverOf(selectedBooking).email && <div className="col-span-2"><p className="text-xs text-indigo-500">Driver Email</p><p className="font-semibold text-gray-900 break-all">{driverOf(selectedBooking).email}</p></div>}
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

              {/* Status timeline */}
              {Array.isArray(selectedBooking.statusHistory) && selectedBooking.statusHistory.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Status History</h4>
                  <ol className="space-y-2 text-sm">
                    {[...selectedBooking.statusHistory].reverse().map((h, i) => (
                      <li key={`${h.status}-${h.at}-${i}`} className="flex items-center justify-between gap-3">
                        <span className={cn('px-2 py-0.5 text-xs font-semibold rounded-full capitalize', STATUS_COLORS[h.status] || 'bg-gray-100 text-gray-600')}>{h.status?.replace('_', ' ')}</span>
                        <span className="text-xs text-gray-500">{formatDate(h.at)}</span>
                      </li>
                    ))}
                  </ol>
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
                      disabled={(selectedBooking.status === s && !(s === 'assigned')) || updatingStatus}
                      onClick={() => (s === 'assigned' ? openDriverForm() : handleStatusUpdate(selectedBooking.bookingId, s))}
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

                {driverForm && (
                  <form onSubmit={submitDriver} className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-indigo-900 text-sm flex items-center gap-2"><Car className="w-4 h-4" /> Driver details</h5>
                      <button type="button" onClick={() => setDriverForm(null)} aria-label="Close" className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-white"><X className="w-4 h-4" /></button>
                    </div>
                    <p className="text-xs text-gray-600">These details are emailed to the customer, and the trip details are emailed to the driver (if a driver email is given).</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        ['name', 'Driver name *', 'text', 'e.g. Ramesh Kumar'],
                        ['phone', 'Driver mobile *', 'tel', '10-digit number'],
                        ['vehicleNumber', 'Vehicle number', 'text', 'e.g. DL1CAB1234'],
                        ['vehicleModel', 'Vehicle model', 'text', 'e.g. Dzire White'],
                      ].map(([k, label, type, ph]) => (
                        <label key={k} className="block">
                          <span className="block text-xs font-semibold text-gray-600 mb-1">{label}</span>
                          <input type={type} value={driverForm[k]} placeholder={ph} inputMode={k === 'phone' ? 'numeric' : undefined}
                            onChange={(e) => setDriverForm((f) => ({ ...f, [k]: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                        </label>
                      ))}
                      <label className="block sm:col-span-2">
                        <span className="block text-xs font-semibold text-gray-600 mb-1">Driver email (to send the trip details)</span>
                        <input type="email" value={driverForm.email} placeholder="driver@example.com"
                          onChange={(e) => setDriverForm((f) => ({ ...f, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                      </label>
                    </div>
                    {driverError && <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{driverError}</p>}
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button type="button" onClick={() => setDriverForm(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-white">Cancel</button>
                      <button type="submit" disabled={updatingStatus} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-60">
                        {updatingStatus ? 'Saving...' : 'Save & send emails'}
                      </button>
                    </div>
                  </form>
                )}
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
    { id: 'website', short: 'Website', label: 'Website Bookings', icon: Globe, desc: 'Bookings from public website (goindiacab.com)' },
    { id: 'app', short: 'App', label: 'App / Dashboard Bookings', icon: Smartphone, desc: 'Bookings from mobile app & user dashboard' },
  ];

  return (
    <div className="md:p-6 max-w-7xl mx-auto space-y-3 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 gap-2 md:gap-4">
        <div>
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5 text-blue-600" />
            </div>
            Booking Management
          </h2>
          <p className="text-gray-500 mt-1 text-xs md:text-sm">Monitor and manage all trips — both from the app and website.</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center justify-center md:justify-start gap-2 md:gap-3 px-3 md:px-5 py-3 md:py-4 rounded-xl border transition-all text-left',
              activeTab === tab.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:bg-blue-50'
            )}
          >
            <tab.icon className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-xs md:text-sm"><span className="md:hidden">{tab.short}</span><span className="hidden md:inline">{tab.label}</span></p>
              <p className={cn('hidden md:block text-xs', activeTab === tab.id ? 'text-blue-200' : 'text-gray-400')}>{tab.desc}</p>
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
