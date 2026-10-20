import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import {
  Globe, MapPin, Route as RouteIcon, IndianRupee, CalendarDays, Plus, Pencil, Trash2,
  Search, X, Loader2, Database, Percent,
} from 'lucide-react';
import clsx from 'clsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE = `${API_URL}/api/admins/website`;

const TABS = [
  { id: 'bookings', label: 'Bookings', icon: CalendarDays },
  { id: 'cities', label: 'Cities', icon: MapPin },
  { id: 'routes', label: 'Routes & Distance', icon: RouteIcon },
  { id: 'fares', label: 'Fare Rules', icon: IndianRupee },
];

const STATUS_STYLES = {
  confirmed: 'bg-blue-50 text-blue-700',
  assigned: 'bg-indigo-50 text-indigo-700',
  in_progress: 'bg-amber-50 text-amber-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  paid: 'bg-green-50 text-green-700',
  pending: 'bg-gray-100 text-gray-600',
  failed: 'bg-red-50 text-red-700',
};

const Badge = ({ value }) => (
  <span className={clsx('px-2 py-0.5 rounded-full text-xs font-semibold capitalize', STATUS_STYLES[value] || 'bg-gray-100 text-gray-600')}>
    {String(value).replace('_', ' ')}
  </span>
);

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]';
const btnPrimary = 'inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-600 mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Pager({ page, pages, setPage }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 pt-4 text-sm">
      <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded disabled:opacity-40">Prev</button>
      <span className="text-gray-500">Page {page} of {pages}</span>
      <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded disabled:opacity-40">Next</button>
    </div>
  );
}

export default function WebsiteManagement() {
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;
  const canWrite = !!superAdminToken;
  const api = useCallback(
    (method, url, data, params) =>
      axios({ method, url: `${BASE}${url}`, data, params, headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const [tab, setTab] = useState('bookings');
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);

  const notify = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
  const errMsg = (e) => e.response?.data?.message || e.message || 'Something went wrong';

  const loadStats = useCallback(async () => {
    try { setStats((await api('get', '/stats')).data.data); } catch { /* non-critical */ }
  }, [api]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const seedDefaults = async () => {
    if (!window.confirm('Add default cities and fare rules? Existing entries are kept.')) return;
    try {
      const { data } = await api('post', '/seed-defaults');
      notify(data.message);
      loadStats();
      setTab('cities');
    } catch (e) { notify(errMsg(e), 'err'); }
  };

  const statCards = stats && [
    { label: 'Website bookings', value: stats.total },
    { label: 'Paid online', value: stats.paid },
    { label: 'Online revenue', value: `₹${stats.onlineRevenue.toLocaleString('en-IN')}` },
    { label: 'Cities / Routes / Fares', value: `${stats.cities} / ${stats.routes} / ${stats.fareRules}` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 text-[#F59E0B] flex items-center justify-center"><Globe className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Website Management</h1>
            <p className="text-sm text-gray-500">Controls the public booking website: cities, distances, fares and bookings.</p>
          </div>
        </div>
        {canWrite && (
          <button onClick={seedDefaults} className="inline-flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded-lg">
            <Database className="w-4 h-4" /> Load default data
          </button>
        )}
      </div>

      {statCards && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((c) => (
            <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="text-xl font-bold text-gray-800 mt-1">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap',
              tab === t.id ? 'border-[#F59E0B] text-[#F59E0B]' : 'border-transparent text-gray-500 hover:text-gray-800'
            )}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5">
        {tab === 'bookings' && <BookingsTab api={api} notify={notify} errMsg={errMsg} reloadStats={loadStats} />}
        {tab === 'cities' && <CitiesTab api={api} notify={notify} errMsg={errMsg} canWrite={canWrite} reloadStats={loadStats} />}
        {tab === 'routes' && <RoutesTab api={api} notify={notify} errMsg={errMsg} canWrite={canWrite} reloadStats={loadStats} />}
        {tab === 'fares' && <FaresTab api={api} notify={notify} errMsg={errMsg} canWrite={canWrite} token={token} reloadStats={loadStats} />}
      </div>

      {toast && (
        <div className={clsx('fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-lg shadow-lg text-sm text-white', toast.type === 'err' ? 'bg-red-600' : 'bg-green-600')}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ───────────── Shared list hook ───────────── */
function useList(api, path, extraParams, errMsg, notify) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const paramsKey = JSON.stringify(extraParams);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api('get', path, undefined, { ...JSON.parse(paramsKey), page });
      setRows(data.data);
      setPages(data.pages || 1);
    } catch (e) { notify(errMsg(e), 'err'); }
    finally { setLoading(false); }
  }, [api, path, paramsKey, page, errMsg, notify]);

  useEffect(() => { load(); }, [load]);
  return { rows, loading, page, pages, setPage, reload: load };
}

const Loading = () => <div className="py-10 flex justify-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>;
const Empty = ({ text }) => <p className="py-10 text-center text-sm text-gray-400">{text}</p>;

function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={clsx(inputCls, 'pl-9')} />
    </div>
  );
}

/* ───────────── Bookings ───────────── */
function BookingsTab({ api, notify, errMsg, reloadStats }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [payment, setPayment] = useState('all');
  const [debounced, setDebounced] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => { const t = setTimeout(() => setDebounced(search), 350); return () => clearTimeout(t); }, [search]);
  const { rows, loading, page, pages, setPage, reload } = useList(api, '/bookings', { search: debounced, status, payment }, errMsg, notify);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="ID, name, mobile, city" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={clsx(inputCls, 'sm:w-44')}>
          <option value="all">All statuses</option>
          {['confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select value={payment} onChange={(e) => { setPayment(e.target.value); setPage(1); }} className={clsx(inputCls, 'sm:w-44')}>
          <option value="all">All payments</option>
          {['pending', 'paid', 'failed'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <Loading /> : rows.length === 0 ? <Empty text="No website bookings yet." /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-500 border-b">
              <tr><th className="py-2 pr-3">Booking</th><th className="pr-3">Passenger</th><th className="pr-3">Trip</th><th className="pr-3">Pickup</th><th className="pr-3">Fare</th><th className="pr-3">Payment</th><th className="pr-3">Status</th><th /></tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 pr-3 font-mono text-xs">{b.bookingId}</td>
                  <td className="pr-3"><div className="font-medium">{b.passenger.name}</div><div className="text-xs text-gray-500">{b.passenger.mobile}</div></td>
                  <td className="pr-3"><div>{b.trip.from}{b.trip.to ? ` → ${b.trip.to}` : ''}</div><div className="text-xs text-gray-500 capitalize">{b.trip.tripType} · {b.vehicle.name}</div></td>
                  <td className="pr-3 text-xs">{b.trip.date} {b.trip.time}</td>
                  <td className="pr-3"><div>₹{b.fare.total}</div><div className="text-xs text-gray-500">now ₹{b.fare.paidNow}</div></td>
                  <td className="pr-3"><Badge value={b.payment.status} /></td>
                  <td className="pr-3"><Badge value={b.status} /></td>
                  <td><button onClick={() => setSelected(b)} className="text-[#F59E0B] text-xs font-semibold">Manage</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={page} pages={pages} setPage={setPage} />

      {selected && (
        <BookingModal
          booking={selected} api={api} errMsg={errMsg} notify={notify}
          onClose={() => setSelected(null)}
          onSaved={() => { setSelected(null); reload(); reloadStats(); }}
        />
      )}
    </div>
  );
}

const Row = ({ k, v }) => <div className="flex justify-between py-1.5 text-sm"><span className="text-gray-500">{k}</span><span className="font-medium text-right">{v || '-'}</span></div>;

function BookingModal({ booking: b, api, errMsg, notify, onClose, onSaved }) {
  const [status, setStatus] = useState(b.status);
  const [cancelReason, setCancelReason] = useState(b.cancelReason || '');
  const [adminNote, setAdminNote] = useState(b.adminNote || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api('patch', `/bookings/${b.bookingId}`, { status, cancelReason, adminNote });
      notify('Booking updated');
      onSaved();
    } catch (e) { notify(errMsg(e), 'err'); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={`Booking ${b.bookingId}`} onClose={onClose}>
      <div className="grid sm:grid-cols-2 gap-x-8">
        <div>
          <h4 className="text-xs font-bold uppercase text-gray-400 mb-1">Passenger</h4>
          <Row k="Name" v={b.passenger.name} /><Row k="Mobile" v={b.passenger.mobile} /><Row k="Email" v={b.passenger.email} />
          <Row k="Pickup" v={b.passenger.pickupAddress} /><Row k="Notes" v={b.passenger.instructions} />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase text-gray-400 mb-1">Trip</h4>
          <Row k="Route" v={`${b.trip.from}${b.trip.to ? ' → ' + b.trip.to : ''}`} /><Row k="When" v={`${b.trip.date} ${b.trip.time}`} />
          <Row k="Type" v={b.trip.tripType} /><Row k="Distance" v={`${b.trip.distanceKm} km`} /><Row k="Vehicle" v={`${b.vehicle.name} (${b.vehicle.model})`} />
        </div>
        <div className="sm:col-span-2 mt-3">
          <h4 className="text-xs font-bold uppercase text-gray-400 mb-1">Fare & Payment</h4>
          <div className="grid sm:grid-cols-2 gap-x-8">
            <div>
              <Row k="Base fare" v={`₹${b.fare.baseFare}`} /><Row k="Extra km" v={`₹${b.fare.extraKmFare}`} />
              <Row k="Driver allowance" v={`₹${b.fare.driverAllowance}`} /><Row k="GST" v={`₹${b.fare.gst}`} />
            </div>
            <div>
              <Row k="Total" v={`₹${b.fare.total}`} /><Row k="Pay now / later" v={`₹${b.fare.paidNow} / ₹${b.fare.payLater}`} />
              <Row k="Payment" v={b.payment.status} /><Row k="Razorpay payment ID" v={b.payment.paymentId} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-5 pt-5 border-t">
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            {['confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </Field>
        {status === 'cancelled' && (
          <Field label="Cancel reason"><input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className={inputCls} /></Field>
        )}
        <div className="sm:col-span-2">
          <Field label="Admin note (internal)"><textarea rows={2} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} className={inputCls} /></Field>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg">Close</button>
        <button onClick={save} disabled={saving} className={btnPrimary}>{saving && <Loader2 className="w-4 h-4 animate-spin" />} Save</button>
      </div>
    </Modal>
  );
}

/* ───────────── Cities ───────────── */
function CitiesTab({ api, notify, errMsg, canWrite, reloadStats }) {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => { const t = setTimeout(() => setDebounced(search), 350); return () => clearTimeout(t); }, [search]);
  const { rows, loading, page, pages, setPage, reload } = useList(api, '/cities', { search: debounced }, errMsg, notify);

  const remove = async (c) => {
    if (!window.confirm(`Delete ${c.name}?`)) return;
    try { await api('delete', `/cities/${c._id}`); notify('City deleted'); reload(); reloadStats(); }
    catch (e) { notify(errMsg(e), 'err'); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search city" />
        {canWrite && <button onClick={() => setEditing({ name: '', state: '', isPopular: false, isActive: true })} className={btnPrimary}><Plus className="w-4 h-4" /> Add city</button>}
      </div>
      <p className="text-xs text-gray-500 mb-3">These cities power the pickup / drop autocomplete on the website. Popular cities are listed first.</p>
      {loading ? <Loading /> : rows.length === 0 ? <Empty text="No cities. Use “Load default data” or add one." /> : (
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500 border-b"><tr><th className="py-2">City</th><th>State</th><th>Popular</th><th>Active</th><th /></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c._id} className="border-b last:border-0">
                <td className="py-2.5 font-medium">{c.name}</td><td>{c.state || '-'}</td>
                <td>{c.isPopular ? '★' : ''}</td><td><Badge value={c.isActive ? 'paid' : 'cancelled'} /></td>
                <td className="text-right whitespace-nowrap">
                  {canWrite && <>
                    <button onClick={() => setEditing(c)} className="p-1.5 text-gray-500 hover:text-[#F59E0B]"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(c)} className="p-1.5 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Pager page={page} pages={pages} setPage={setPage} />
      {editing && <CityForm city={editing} api={api} notify={notify} errMsg={errMsg} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); reloadStats(); }} />}
    </div>
  );
}

function CityForm({ city, api, notify, errMsg, onClose, onSaved }) {
  const [f, setF] = useState({ name: city.name, state: city.state || '', isPopular: !!city.isPopular, isActive: city.isActive !== false });
  const [saving, setSaving] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (city._id) await api('put', `/cities/${city._id}`, f); else await api('post', '/cities', f);
      notify('City saved'); onSaved();
    } catch (err) { notify(errMsg(err), 'err'); }
    finally { setSaving(false); }
  };
  return (
    <Modal title={city._id ? 'Edit city' : 'Add city'} onClose={onClose}>
      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
        <Field label="City name"><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} /></Field>
        <Field label="State"><input value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })} className={inputCls} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isPopular} onChange={(e) => setF({ ...f, isPopular: e.target.checked })} /> Popular (show first)</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} /> Active</label>
        <div className="sm:col-span-2 flex justify-end gap-2"><button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg">Cancel</button><button disabled={saving} className={btnPrimary}>{saving && <Loader2 className="w-4 h-4 animate-spin" />} Save</button></div>
      </form>
    </Modal>
  );
}

/* ───────────── Routes ───────────── */
function RoutesTab({ api, notify, errMsg, canWrite, reloadStats }) {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [editing, setEditing] = useState(null);

  useEffect(() => { const t = setTimeout(() => setDebounced(search), 350); return () => clearTimeout(t); }, [search]);
  const { rows, loading, page, pages, setPage, reload } = useList(api, '/routes', { search: debounced }, errMsg, notify);

  const remove = async (r) => {
    if (!window.confirm(`Delete route ${r.from} ↔ ${r.to}?`)) return;
    try { await api('delete', `/routes/${r._id}`); notify('Route deleted'); reload(); reloadStats(); }
    catch (e) { notify(errMsg(e), 'err'); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <SearchBox value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search route" />
        {canWrite && <button onClick={() => setEditing({ from: '', to: '', distanceKm: '', durationMins: '', isActive: true })} className={btnPrimary}><Plus className="w-4 h-4" /> Add route</button>}
      </div>
      <p className="text-xs text-gray-500 mb-3">Distance lookup order: your routes (either direction) → automatic routing API. Automatic results are cached here as “auto”; edit one to lock in your own value.</p>
      {loading ? <Loading /> : rows.length === 0 ? <Empty text="No routes yet. They are cached automatically as customers search." /> : (
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500 border-b"><tr><th className="py-2">Route</th><th>Distance</th><th>Duration</th><th>Source</th><th>Active</th><th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-b last:border-0">
                <td className="py-2.5 font-medium">{r.from} ↔ {r.to}</td><td>{r.distanceKm} km</td>
                <td>{r.durationMins ? `${Math.floor(r.durationMins / 60)}h ${r.durationMins % 60}m` : '-'}</td>
                <td><Badge value={r.source === 'admin' ? 'confirmed' : 'pending'} /> <span className="text-xs text-gray-500">{r.source}</span></td>
                <td><Badge value={r.isActive ? 'paid' : 'cancelled'} /></td>
                <td className="text-right whitespace-nowrap">
                  {canWrite && <>
                    <button onClick={() => setEditing(r)} className="p-1.5 text-gray-500 hover:text-[#F59E0B]"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(r)} className="p-1.5 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Pager page={page} pages={pages} setPage={setPage} />
      {editing && <RouteForm route={editing} api={api} notify={notify} errMsg={errMsg} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); reloadStats(); }} />}
    </div>
  );
}

function RouteForm({ route, api, notify, errMsg, onClose, onSaved }) {
  const [f, setF] = useState({ from: route.from, to: route.to, distanceKm: route.distanceKm, durationMins: route.durationMins, isActive: route.isActive !== false });
  const [saving, setSaving] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const body = { ...f, distanceKm: Number(f.distanceKm), durationMins: Number(f.durationMins) || 0 };
    try {
      if (route._id) await api('put', `/routes/${route._id}`, body); else await api('post', '/routes', body);
      notify('Route saved'); onSaved();
    } catch (err) { notify(errMsg(err), 'err'); }
    finally { setSaving(false); }
  };
  return (
    <Modal title={route._id ? 'Edit route' : 'Add route'} onClose={onClose}>
      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
        <Field label="From"><input required disabled={!!route._id} value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} className={inputCls} /></Field>
        <Field label="To"><input required disabled={!!route._id} value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} className={inputCls} /></Field>
        <Field label="Distance (km)"><input required type="number" min="1" value={f.distanceKm} onChange={(e) => setF({ ...f, distanceKm: e.target.value })} className={inputCls} /></Field>
        <Field label="Duration (minutes)"><input type="number" min="0" value={f.durationMins} onChange={(e) => setF({ ...f, durationMins: e.target.value })} className={inputCls} /></Field>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} /> Active</label>
        <div className="sm:col-span-2 flex justify-end gap-2"><button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg">Cancel</button><button disabled={saving} className={btnPrimary}>{saving && <Loader2 className="w-4 h-4 animate-spin" />} Save</button></div>
      </form>
    </Modal>
  );
}

/* ───────────── Fare rules ───────────── */
function FaresTab({ api, notify, errMsg, canWrite, token, reloadStats }) {
  const [editing, setEditing] = useState(null);
  const { rows, loading, reload } = useList(api, '/fare-rules', {}, errMsg, notify);
  const [percent, setPercent] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/api/admins/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setPercent(data.data.webPartPaymentPercent ?? 25))
      .catch(() => {});
  }, [token]);

  const savePercent = async () => {
    try {
      await axios.put(`${API_URL}/api/admins/settings`, { webPartPaymentPercent: Number(percent) }, { headers: { Authorization: `Bearer ${token}` } });
      notify('Part-payment percentage saved');
    } catch (e) { notify(errMsg(e), 'err'); }
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete fare rule for ${r.name}?`)) return;
    try { await api('delete', `/fare-rules/${r._id}`); notify('Fare rule deleted'); reload(); reloadStats(); }
    catch (e) { notify(errMsg(e), 'err'); }
  };

  const blank = { vehicleType: '', name: '', model: '', seats: 4, perKmOneway: '', perKmRound: '', minKmOneway: 250, minKmPerDay: 250, driverAllowance: 0, driverAllowancePerDay: 0, gstPercent: 5, sortOrder: 0, isActive: true, packages: [] };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div className="flex items-end gap-2">
          <Field label="Part-payment % (paid online at booking)">
            <div className="relative w-40"><Percent className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
              <input type="number" min="1" max="100" disabled={!canWrite} value={percent} onChange={(e) => setPercent(e.target.value)} className={inputCls} />
            </div>
          </Field>
          {canWrite && <button onClick={savePercent} className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">Save</button>}
        </div>
        {canWrite && <button onClick={() => setEditing(blank)} className={btnPrimary}><Plus className="w-4 h-4" /> Add vehicle fare</button>}
      </div>
      {loading ? <Loading /> : rows.length === 0 ? <Empty text="No fare rules. Use “Load default data” or add one." /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-500 border-b">
              <tr><th className="py-2">Vehicle</th><th>One-way ₹/km</th><th>Round ₹/km</th><th>Min km</th><th>Allowance</th><th>GST</th><th>Packages</th><th>Active</th><th /></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-b last:border-0">
                  <td className="py-2.5"><div className="font-medium">{r.name} <span className="text-xs text-gray-400">({r.vehicleType})</span></div><div className="text-xs text-gray-500">{r.model} · {r.seats} seats</div></td>
                  <td>₹{r.perKmOneway}</td><td>₹{r.perKmRound}</td>
                  <td className="text-xs">{r.minKmOneway} / {r.minKmPerDay} per day</td>
                  <td className="text-xs">₹{r.driverAllowance} / ₹{r.driverAllowancePerDay} per day</td>
                  <td>{r.gstPercent}%</td><td>{r.packages.length}</td>
                  <td><Badge value={r.isActive ? 'paid' : 'cancelled'} /></td>
                  <td className="text-right whitespace-nowrap">
                    {canWrite && <>
                      <button onClick={() => setEditing(r)} className="p-1.5 text-gray-500 hover:text-[#F59E0B]"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => remove(r)} className="p-1.5 text-gray-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && <FareForm rule={editing} api={api} notify={notify} errMsg={errMsg} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); reloadStats(); }} />}
    </div>
  );
}

function FareForm({ rule, api, notify, errMsg, onClose, onSaved }) {
  const [f, setF] = useState({ ...rule, packages: rule.packages.map((p) => ({ ...p })) });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const setPkg = (i, k, v) => setF({ ...f, packages: f.packages.map((p, idx) => (idx === i ? { ...p, [k]: v } : p)) });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const num = ['seats', 'perKmOneway', 'perKmRound', 'minKmOneway', 'minKmPerDay', 'driverAllowance', 'driverAllowancePerDay', 'gstPercent', 'sortOrder'];
    const body = { ...f };
    num.forEach((k) => { body[k] = Number(body[k]) || 0; });
    body.packages = f.packages.map((p) => ({
      label: p.label, hours: Number(p.hours) || 0, km: Number(p.km) || 0, price: Number(p.price) || 0,
      extraKmRate: Number(p.extraKmRate) || 0, extraHourRate: Number(p.extraHourRate) || 0,
    }));
    delete body._id; delete body.__v; delete body.createdAt; delete body.updatedAt;
    try {
      if (rule._id) await api('put', `/fare-rules/${rule._id}`, body); else await api('post', '/fare-rules', body);
      notify('Fare rule saved'); onSaved();
    } catch (err) { notify(errMsg(err), 'err'); }
    finally { setSaving(false); }
  };

  const numField = (label, k) => (
    <Field label={label}><input type="number" min="0" step="any" value={f[k]} onChange={set(k)} className={inputCls} /></Field>
  );

  return (
    <Modal title={rule._id ? `Edit ${rule.name}` : 'Add vehicle fare'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Vehicle ID (e.g. sedan)"><input required disabled={!!rule._id} value={f.vehicleType} onChange={set('vehicleType')} className={inputCls} /></Field>
          <Field label="Display name"><input required value={f.name} onChange={set('name')} className={inputCls} /></Field>
          <Field label="Model text"><input value={f.model} onChange={set('model')} className={inputCls} /></Field>
          {numField('Seats', 'seats')}{numField('Sort order', 'sortOrder')}{numField('GST %', 'gstPercent')}
          {numField('One-way ₹ / km', 'perKmOneway')}{numField('Round-trip ₹ / km', 'perKmRound')}
          {numField('One-way minimum km', 'minKmOneway')}{numField('Round-trip min km / day', 'minKmPerDay')}
          {numField('Driver allowance (one-way ₹)', 'driverAllowance')}{numField('Driver allowance (round ₹ / day)', 'driverAllowancePerDay')}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-700">Local packages</h4>
            <button type="button" onClick={() => setF({ ...f, packages: [...f.packages, { label: '', hours: 8, km: 80, price: 0, extraKmRate: 0, extraHourRate: 0 }] })} className="text-xs text-[#F59E0B] font-semibold">+ Add package</button>
          </div>
          {f.packages.length === 0 && <p className="text-xs text-gray-400">No packages. Local-trip fares need at least one.</p>}
          {f.packages.map((p, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-7 gap-2 mb-2 items-end">
              <div className="col-span-2"><Field label="Label"><input required value={p.label} onChange={(e) => setPkg(i, 'label', e.target.value)} placeholder="8 Hrs / 80 Km" className={inputCls} /></Field></div>
              <Field label="Hours"><input type="number" value={p.hours} onChange={(e) => setPkg(i, 'hours', e.target.value)} className={inputCls} /></Field>
              <Field label="Km"><input type="number" value={p.km} onChange={(e) => setPkg(i, 'km', e.target.value)} className={inputCls} /></Field>
              <Field label="Price ₹"><input type="number" value={p.price} onChange={(e) => setPkg(i, 'price', e.target.value)} className={inputCls} /></Field>
              <Field label="Extra ₹/km"><input type="number" value={p.extraKmRate} onChange={(e) => setPkg(i, 'extraKmRate', e.target.value)} className={inputCls} /></Field>
              <button type="button" onClick={() => setF({ ...f, packages: f.packages.filter((_, idx) => idx !== i) })} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isActive} onChange={set('isActive')} /> Active (visible on website)</label>
        <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg">Cancel</button><button disabled={saving} className={btnPrimary}>{saving && <Loader2 className="w-4 h-4 animate-spin" />} Save</button></div>
      </form>
    </Modal>
  );
}
