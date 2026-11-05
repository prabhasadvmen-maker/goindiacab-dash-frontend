import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Search, Eye, X, Trash2, Mail, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const LIMIT = 20;

const STATUSES = ['new', 'read', 'replied', 'closed'];
const STATUS_STYLES = {
  new: 'bg-blue-50 text-blue-600 border-blue-100',
  read: 'bg-gray-100 text-gray-600 border-gray-200',
  replied: 'bg-green-50 text-green-600 border-green-100',
  closed: 'bg-red-50 text-red-600 border-red-100',
};
const SUBJECT_STYLES = {
  'General Inquiry': 'bg-indigo-50 text-indigo-700',
  'Booking Help': 'bg-amber-50 text-amber-700',
  Complaint: 'bg-red-50 text-red-700',
  Partnership: 'bg-purple-50 text-purple-700',
  Other: 'bg-gray-100 text-gray-600',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n) => String(n).padStart(2, '0');
const fmtDate = (v) => {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '—';
  return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const StatusBadge = ({ status }) => (
  <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold border capitalize', STATUS_STYLES[status] || STATUS_STYLES.read)}>{status}</span>
);
const SubjectBadge = ({ subject }) => (
  <span className={cn('px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap', SUBJECT_STYLES[subject] || SUBJECT_STYLES.Other)}>{subject}</span>
);

export default function ContactInquiries() {
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;
  const headers = { Authorization: `Bearer ${token}` };

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, read: 0, replied: 0, closed: 0 });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState(null);
  const [draftStatus, setDraftStatus] = useState('new');
  const [draftNote, setDraftNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [drawerMsg, setDrawerMsg] = useState('');
  const reqId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchList = useCallback(async (silent = false) => {
    const id = ++reqId.current;
    if (!silent) setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (statusFilter) params.status = statusFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await axios.get(`${API_URL}/api/admin/contacts`, { headers, params });
      if (id !== reqId.current) return;
      if (data.success) {
        setItems(data.data);
        setStats(data.stats);
        setPagination(data.pagination);
        setError('');
      }
    } catch (err) {
      if (id !== reqId.current) return;
      console.error('Error fetching inquiries:', err);
      setError(err.response?.data?.message || 'Failed to load inquiries');
    } finally {
      if (id === reqId.current && !silent) setLoading(false);
    }
    // eslint-disable-next-line
  }, [page, statusFilter, debouncedSearch, token]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // Auto-refresh every 60s, only while looking at "new" inquiries.
  useEffect(() => {
    if (statusFilter !== 'new') return undefined;
    const t = setInterval(() => fetchList(true), 60000);
    return () => clearInterval(t);
  }, [statusFilter, fetchList]);

  const openInquiry = async (row) => {
    setSelected(row);
    setDraftStatus(row.status);
    setDraftNote(row.adminNote || '');
    setConfirmDelete(false);
    setDrawerMsg('');
    try {
      // Fetching marks a "new" inquiry as "read".
      const { data } = await axios.get(`${API_URL}/api/admin/contacts/${row._id}`, { headers });
      if (data.success) {
        setSelected(data.data);
        setDraftStatus(data.data.status);
        setDraftNote(data.data.adminNote || '');
        setItems((list) => list.map((i) => (i._id === data.data._id ? data.data : i)));
        if (row.status === 'new' && data.data.status !== 'new') {
          setStats((s) => ({ ...s, new: Math.max(s.new - 1, 0), [data.data.status]: (s[data.data.status] || 0) + 1 }));
          window.dispatchEvent(new Event('contact-inquiries-changed'));
        }
      }
    } catch (err) {
      setDrawerMsg(err.response?.data?.message || 'Failed to load inquiry');
    }
  };

  const closeDrawer = () => { setSelected(null); setConfirmDelete(false); };

  const save = async () => {
    setSaving(true);
    setDrawerMsg('');
    try {
      const { data } = await axios.patch(`${API_URL}/api/admin/contacts/${selected._id}`, { status: draftStatus, adminNote: draftNote }, { headers });
      if (data.success) {
        setSelected(data.data);
        setDrawerMsg('Saved');
        fetchList(true);
        window.dispatchEvent(new Event('contact-inquiries-changed'));
      }
    } catch (err) {
      setDrawerMsg(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await axios.delete(`${API_URL}/api/admin/contacts/${selected._id}`, { headers });
      closeDrawer();
      fetchList(true);
      window.dispatchEvent(new Event('contact-inquiries-changed'));
    } catch (err) {
      setDrawerMsg(err.response?.data?.message || 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const clearFilters = () => { setSearch(''); setDebouncedSearch(''); setStatusFilter(''); setPage(1); };
  const hasFilters = search || statusFilter;
  const dirty = selected && (draftStatus !== selected.status || draftNote !== (selected.adminNote || ''));

  const statCards = [
    { key: 'total', label: 'Total', cls: 'bg-slate-100 text-slate-700' },
    { key: 'new', label: 'New', cls: 'bg-blue-50 text-blue-600' },
    { key: 'read', label: 'Read', cls: 'bg-gray-100 text-gray-600' },
    { key: 'replied', label: 'Replied', cls: 'bg-green-50 text-green-600' },
    { key: 'closed', label: 'Closed', cls: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="p-2 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Inquiries</h2>
          <p className="text-gray-500 mt-1">Messages submitted through the website contact form.</p>
        </div>
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
          <MessageSquare className="w-6 h-6" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statCards.map((s) => (
          <button
            key={s.key}
            onClick={() => { setStatusFilter(s.key === 'total' ? '' : s.key); setPage(1); }}
            className={cn('rounded-2xl p-4 text-left border border-gray-100 shadow-sm transition-shadow hover:shadow-md', s.cls)}
          >
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">{s.label}</p>
            <p className="text-2xl font-extrabold mt-1">{stats[s.key] ?? 0}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-gray-900"
        >
          <option value="">Status: All</option>
          {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
        <button
          onClick={clearFilters}
          disabled={!hasFilters}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Clear filters
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
            <p>Loading inquiries...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No inquiries found</h3>
            <p className="text-gray-500 mt-1">There are no inquiries matching your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50">
                <tr>
                  {['#', 'Name', 'Phone', 'Email', 'Subject', 'Message', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className={cn('px-2.5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider', h === 'Actions' ? 'text-right' : 'text-left')}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {items.map((row, idx) => (
                  <tr
                    key={row._id}
                    onClick={() => openInquiry(row)}
                    className={cn('hover:bg-gray-50/70 transition-colors cursor-pointer', row.status === 'new' && 'bg-blue-50/30')}
                  >
                    <td className="px-2.5 py-3 text-sm text-gray-500">{(pagination.page - 1) * LIMIT + idx + 1}</td>
                    <td className="px-2.5 py-3 text-sm font-bold text-gray-900 whitespace-nowrap">{row.name}</td>
                    <td className="px-2.5 py-3 text-sm whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <a href={`tel:+91${row.phone}`} className="text-blue-600 hover:underline">{row.phone}</a>
                    </td>
                    <td className="px-2.5 py-3 text-sm" onClick={(e) => e.stopPropagation()}>
                      {row.email ? <a href={`mailto:${row.email}`} title={row.email} className="block max-w-[140px] truncate text-blue-600 hover:underline">{row.email}</a> : '—'}
                    </td>
                    <td className="px-2.5 py-3 whitespace-nowrap"><SubjectBadge subject={row.subject} /></td>
                    <td className="px-2.5 py-3 text-sm text-gray-600" title={row.message}>
                      <div className="max-w-[150px] truncate">{row.message.length > 60 ? `${row.message.slice(0, 60)}…` : row.message}</div>
                    </td>
                    <td className="px-2.5 py-3 whitespace-nowrap"><StatusBadge status={row.status} /></td>
                    <td className="px-2.5 py-3 text-xs text-gray-600 whitespace-nowrap">{fmtDate(row.createdAt).split(", ").map((p, i) => <span key={i} className={i ? "block text-gray-400" : "block font-medium text-gray-700"}>{p}</span>)}</td>
                    <td className="px-2.5 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); openInquiry(row); }}
                        aria-label="View inquiry"
                        className="p-2 rounded-lg text-gray-500 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-600">
            <span>Page {pagination.page} of {pagination.pages} · {pagination.total} inquiries</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50" aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50" aria-label="Next page"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={closeDrawer} aria-hidden="true" />
          <aside className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Inquiry Details</h3>
              <button onClick={closeDrawer} aria-label="Close" className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="flex flex-wrap gap-2 items-center">
                <SubjectBadge subject={selected.subject} />
                <StatusBadge status={selected.status} />
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm [&>*:last-child]:sm:col-span-2">
                <div><dt className="text-xs font-bold uppercase text-gray-400">Name</dt><dd className="font-semibold text-gray-900">{selected.name}</dd></div>
                <div><dt className="text-xs font-bold uppercase text-gray-400">Phone</dt><dd><a href={`tel:+91${selected.phone}`} className="text-blue-600 hover:underline">{selected.phone}</a></dd></div>
                <div><dt className="text-xs font-bold uppercase text-gray-400">Email</dt><dd>{selected.email ? <a href={`mailto:${selected.email}`} className="text-blue-600 hover:underline break-all">{selected.email}</a> : '—'}</dd></div>
                {selected.serviceType && <div><dt className="text-xs font-bold uppercase text-gray-400">Service Type</dt><dd className="text-gray-800">{selected.serviceType}</dd></div>}
                {selected.pickupLocation && <div><dt className="text-xs font-bold uppercase text-gray-400">Pickup</dt><dd className="text-gray-800">{selected.pickupLocation}</dd></div>}
                {selected.dropLocation && <div><dt className="text-xs font-bold uppercase text-gray-400">Drop</dt><dd className="text-gray-800">{selected.dropLocation}</dd></div>}
                {selected.travelDate && <div><dt className="text-xs font-bold uppercase text-gray-400">Travel Date</dt><dd className="text-gray-800">{selected.travelDate}</dd></div>}
                {selected.passengers && <div><dt className="text-xs font-bold uppercase text-gray-400">Passengers</dt><dd className="text-gray-800">{selected.passengers}</dd></div>}
                <div><dt className="text-xs font-bold uppercase text-gray-400">Received</dt><dd className="text-gray-700">{fmtDate(selected.createdAt)}</dd></div>
                <div><dt className="text-xs font-bold uppercase text-gray-400">Message</dt><dd className="text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-xl p-3 mt-1 break-words">{selected.message}</dd></div>
              </dl>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Status</label>
                <select value={draftStatus} onChange={(e) => setDraftStatus(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-gray-900">
                  {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Admin Note (internal)</label>
                <textarea value={draftNote} onChange={(e) => setDraftNote(e.target.value)} rows={4} maxLength={2000} placeholder="Add an internal note..." className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-3 text-sm outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
              </div>
              {drawerMsg && <p className={cn('text-sm font-medium', drawerMsg === 'Saved' ? 'text-green-600' : 'text-red-600')}>{drawerMsg}</p>}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
              {confirmDelete ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-red-600 font-semibold">Delete permanently?</span>
                  <button onClick={remove} disabled={saving} className="px-3 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50">Yes</button>
                  <button onClick={() => setConfirmDelete(false)} className="px-3 py-2 rounded-lg border border-gray-200 text-gray-600 font-semibold">No</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
              <button onClick={save} disabled={saving || !dirty} className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
