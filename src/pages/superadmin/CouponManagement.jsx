import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import {
  Ticket, Plus, Pencil, Trash2, X, Loader2, RefreshCw, AlertCircle, CheckCircle2,
  Search, Copy, Percent, IndianRupee, Users, Wand2, ToggleLeft, ToggleRight,
} from 'lucide-react';
import clsx from 'clsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE = `${API_URL}/api/admins/website`;

const inputCls = 'w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition';
const btnBase = 'inline-flex items-center justify-center gap-2 h-10 text-sm font-semibold px-4 rounded-lg whitespace-nowrap transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
const btnPrimary = `${btnBase} bg-amber-500 hover:bg-amber-600 text-white shadow-sm`;
const btnDanger = `${btnBase} bg-red-500 hover:bg-red-600 text-white shadow-sm`;
const btnGhost = `${btnBase} border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium`;

// Trip types understood by the booking API.
const TRIP_TYPES = [
  { value: 'oneway', label: 'One Way' },
  { value: 'roundtrip', label: 'Round Trip' },
  { value: 'airport', label: 'Airport Transfer' },
  { value: 'local', label: 'Local / Hourly' },
];

const EMPTY = {
  code: '', title: '', description: '', discountType: 'percent', discountValue: '', maxDiscount: '',
  minOrderAmount: '', tripTypes: [], vehicleTypes: [], startsAt: '', expiresAt: '',
  usageLimit: '', perMobileLimit: '', showOnWebsite: true, isActive: true,
};

const pad = (n) => String(n).padStart(2, '0');
// ISO → value for <input type="datetime-local"> in the viewer's timezone
const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null);
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const randomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

function couponState(c) {
  const now = Date.now();
  if (!c.isActive) return { label: 'Inactive', tone: 'bg-gray-100 text-gray-600' };
  if (c.expiresAt && new Date(c.expiresAt).getTime() < now) return { label: 'Expired', tone: 'bg-red-100 text-red-700' };
  if (c.startsAt && new Date(c.startsAt).getTime() > now) return { label: 'Scheduled', tone: 'bg-blue-100 text-blue-700' };
  if (c.usageLimit > 0 && c.usedCount >= c.usageLimit) return { label: 'Used up', tone: 'bg-orange-100 text-orange-700' };
  return { label: 'Active', tone: 'bg-green-100 text-green-700' };
}

function Field({ label, required, hint, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-600 mb-1.5 block">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-gray-400 mt-1 block">{hint}</span>}
    </label>
  );
}

function Modal({ title, subtitle, onClose, children, footer, wide }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div
        className={clsx('bg-white rounded-2xl shadow-2xl w-full max-h-[92vh] flex flex-col overflow-hidden', wide ? 'max-w-3xl' : 'max-w-md')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700 p-1.5 -mr-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 bg-gray-50/40">{children}</div>
        {footer && <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

function ChipSelect({ options, value, onChange }) {
  const toggle = (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => toggle(o.value)}
          className={clsx(
            'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
            value.includes(o.value) ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function CouponManagement() {
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;
  const canWrite = !!superAdminToken;

  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, redemptions: 0, discountGiven: 0 });
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'delete'
  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const api = useCallback(
    (method, url, data, params) =>
      axios({ method, url: `${BASE}${url}`, data, params, headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api('get', '/coupons', undefined, { search: search || undefined, status: status || undefined });
      setCoupons(data.data || []);
      setStats(data.stats || {});
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  }, [api, search, status]);

  // Debounce the search box; filters refetch immediately.
  useEffect(() => {
    const t = setTimeout(fetchCoupons, 250);
    return () => clearTimeout(t);
  }, [fetchCoupons]);

  useEffect(() => {
    api('get', '/fare-rules')
      .then(({ data }) => setVehicleOptions((data.data || []).map((r) => ({ value: r.vehicleType, label: r.name }))))
      .catch(() => setVehicleOptions([]));
  }, [api]);

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const openAdd = () => { setForm({ ...EMPTY }); setSelected(null); setModal('add'); };
  const openEdit = (c) => {
    setSelected(c);
    setForm({
      ...EMPTY, ...c,
      maxDiscount: c.maxDiscount || '', minOrderAmount: c.minOrderAmount || '',
      usageLimit: c.usageLimit || '', perMobileLimit: c.perMobileLimit || '',
      startsAt: toLocalInput(c.startsAt), expiresAt: toLocalInput(c.expiresAt),
    });
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.title.trim() || !form.discountValue) {
      showToast('Code, title and discount value are required', 'error');
      return;
    }
    if (form.discountType === 'percent' && Number(form.discountValue) > 100) {
      showToast('Percent discount cannot exceed 100', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        title: form.title.trim(),
        description: form.description.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxDiscount: Number(form.maxDiscount) || 0,
        minOrderAmount: Number(form.minOrderAmount) || 0,
        tripTypes: form.tripTypes,
        vehicleTypes: form.vehicleTypes,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : '',
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : '',
        usageLimit: Number(form.usageLimit) || 0,
        perMobileLimit: Number(form.perMobileLimit) || 0,
        showOnWebsite: form.showOnWebsite,
        isActive: form.isActive,
      };
      if (modal === 'add') {
        await api('post', '/coupons', payload);
        showToast('Coupon created');
      } else {
        await api('put', `/coupons/${selected._id}`, payload);
        showToast('Coupon updated');
      }
      setModal(null);
      fetchCoupons();
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (c) => {
    try {
      await api('put', `/coupons/${c._id}`, { isActive: !c.isActive });
      showToast(`${c.code} ${c.isActive ? 'deactivated' : 'activated'}`);
      fetchCoupons();
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api('delete', `/coupons/${selected._id}`);
      showToast('Coupon deleted');
      setModal(null);
      fetchCoupons();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast(`${code} copied`);
    } catch {
      showToast('Could not copy', 'error');
    }
  };

  const statCards = useMemo(() => [
    { label: 'Total Coupons', value: stats.total ?? 0, icon: Ticket, tone: 'bg-blue-100 text-blue-600' },
    { label: 'Live Now', value: stats.active ?? 0, icon: CheckCircle2, tone: 'bg-green-100 text-green-600' },
    { label: 'Redemptions', value: stats.redemptions ?? 0, icon: Users, tone: 'bg-purple-100 text-purple-600' },
    { label: 'Discount Given', value: inr(stats.discountGiven), icon: IndianRupee, tone: 'bg-amber-100 text-amber-600' },
  ], [stats]);

  const preview = form.discountValue
    ? form.discountType === 'percent'
      ? `${form.discountValue}% off${Number(form.maxDiscount) ? ` up to ${inr(form.maxDiscount)}` : ''}`
      : `${inr(form.discountValue)} off`
    : '';

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      {toast && (
        <div className={clsx(
          'fixed top-5 right-5 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold',
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        )}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white px-5 py-4 md:px-6 md:py-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <Ticket className="w-5 h-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Coupon Codes</h2>
            <p className="text-gray-500 mt-1 text-sm">
              Create discount coupons for the <span className="font-semibold text-amber-600">website checkout</span>. Rules are checked on the server at booking time.
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap shrink-0">
          <button onClick={fetchCoupons} className={btnGhost}>
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} /> Refresh
          </button>
          {canWrite && (
            <button onClick={openAdd} className={btnPrimary}>
              <Plus className="w-4 h-4" /> New Coupon
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-center gap-3.5">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', s.tone)}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className="text-xl font-bold text-gray-900 leading-tight truncate">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by code or title" className={`${inputCls} pl-9`} />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${inputCls} sm:w-48`}>
          <option value="">All statuses</option>
          <option value="active">Live</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* List */}
      {loading && coupons.length === 0 ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 px-6 py-14 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-lg font-semibold text-gray-800">No coupons found</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">{search || status ? 'Try a different search or filter.' : 'Create your first coupon to offer discounts on the website.'}</p>
          {canWrite && !search && !status && (
            <button onClick={openAdd} className={btnPrimary}><Plus className="w-4 h-4" /> New Coupon</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {coupons.map((c) => {
            const st = couponState(c);
            const usedPct = c.usageLimit > 0 ? Math.min(100, Math.round((c.usedCount / c.usageLimit) * 100)) : 0;
            return (
              <div key={c._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="p-4 flex items-start justify-between gap-3 border-b border-dashed border-gray-200">
                  <div className="min-w-0">
                    <button onClick={() => copyCode(c.code)} title="Copy code" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-dashed border-teal-400 bg-teal-50 text-teal-700 font-mono font-bold text-sm">
                      {c.code} <Copy className="w-3 h-3" />
                    </button>
                    <h3 className="font-bold text-gray-900 mt-2 truncate">{c.title}</h3>
                    {c.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{c.description}</p>}
                  </div>
                  <span className={clsx('px-2.5 py-1 text-xs font-semibold rounded-full shrink-0', st.tone)}>{st.label}</span>
                </div>

                <div className="p-4 space-y-3 flex-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
                    {c.discountType === 'percent' ? <Percent className="w-4 h-4 text-amber-500" /> : <IndianRupee className="w-4 h-4 text-amber-500" />}
                    {c.discountType === 'percent'
                      ? `${c.discountValue}% off${c.maxDiscount ? ` (max ${inr(c.maxDiscount)})` : ''}`
                      : `${inr(c.discountValue)} off`}
                  </div>
                  <ul className="text-xs text-gray-500 space-y-1">
                    {c.minOrderAmount > 0 && <li>Min. fare {inr(c.minOrderAmount)}</li>}
                    <li>Trips: {c.tripTypes?.length ? c.tripTypes.map((t) => TRIP_TYPES.find((x) => x.value === t)?.label || t).join(', ') : 'All'}</li>
                    <li>Cabs: {c.vehicleTypes?.length ? c.vehicleTypes.join(', ') : 'All'}</li>
                    <li>
                      {fmtDate(c.startsAt) ? `From ${fmtDate(c.startsAt)}` : 'No start date'} · {fmtDate(c.expiresAt) ? `Until ${fmtDate(c.expiresAt)}` : 'No expiry'}
                    </li>
                    {c.perMobileLimit > 0 && <li>{c.perMobileLimit} use per customer</li>}
                    {!c.showOnWebsite && <li className="text-amber-600">Hidden from the checkout list (code only)</li>}
                  </ul>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Redeemed</span>
                      <span>{c.usedCount}{c.usageLimit > 0 ? ` / ${c.usageLimit}` : ' (no limit)'}</span>
                    </div>
                    {c.usageLimit > 0 && (
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${usedPct}%` }} />
                      </div>
                    )}
                  </div>
                </div>

                {canWrite && (
                  <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <button onClick={() => handleToggle(c)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900">
                      {c.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                      {c.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} title="Edit" className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => { setSelected(c); setModal('delete'); }} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal
          wide
          title={modal === 'add' ? 'New Coupon' : `Edit ${selected?.code}`}
          subtitle="Fields marked * are required"
          onClose={() => setModal(null)}
          footer={
            <>
              <button onClick={() => setModal(null)} className={btnGhost}>Cancel</button>
              <button onClick={handleSave} disabled={saving} className={btnPrimary}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {modal === 'add' ? 'Create Coupon' : 'Save Changes'}
              </button>
            </>
          }
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Coupon Code" required hint={modal === 'edit' ? 'Cannot be changed after creation.' : '3–20 characters: letters, numbers, - or _'}>
                <div className="flex gap-2">
                  <input
                    value={form.code}
                    onChange={(e) => set('code', e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                    placeholder="WELCOME100"
                    maxLength={20}
                    disabled={modal === 'edit'}
                    className={`${inputCls} font-mono`}
                  />
                  {modal === 'add' && (
                    <button type="button" onClick={() => set('code', randomCode())} title="Generate code" className={`${btnGhost} px-3`}>
                      <Wand2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Field>
              <Field label="Title" required hint="Shown to customers at checkout.">
                <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Get ₹100 off your first booking" maxLength={80} className={inputCls} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description">
                  <input value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Valid on all outstation trips" maxLength={200} className={inputCls} />
                </Field>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Discount Type" required>
                <select value={form.discountType} onChange={(e) => set('discountType', e.target.value)} className={inputCls}>
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat amount (₹)</option>
                </select>
              </Field>
              <Field label={form.discountType === 'percent' ? 'Discount %' : 'Discount ₹'} required>
                <input type="number" min={1} max={form.discountType === 'percent' ? 100 : undefined} value={form.discountValue} onChange={(e) => set('discountValue', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Max Discount ₹" hint={form.discountType === 'percent' ? 'Cap for % coupons. Blank = no cap.' : 'Only used for % coupons.'}>
                <input type="number" min={0} value={form.maxDiscount} onChange={(e) => set('maxDiscount', e.target.value)} disabled={form.discountType !== 'percent'} className={inputCls} />
              </Field>
              <Field label="Min. Fare ₹" hint="Blank = no minimum.">
                <input type="number" min={0} value={form.minOrderAmount} onChange={(e) => set('minOrderAmount', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Total Usage Limit" hint="Blank = unlimited.">
                <input type="number" min={0} value={form.usageLimit} onChange={(e) => set('usageLimit', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Uses per Customer" hint="By mobile number. Blank = unlimited.">
                <input type="number" min={0} value={form.perMobileLimit} onChange={(e) => set('perMobileLimit', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Starts At" hint="Blank = starts immediately.">
                <input type="datetime-local" value={form.startsAt} onChange={(e) => set('startsAt', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Expires At" hint="Blank = never expires.">
                <input type="datetime-local" value={form.expiresAt} onChange={(e) => set('expiresAt', e.target.value)} className={inputCls} />
              </Field>
            </div>

            <div className="space-y-4">
              <Field label="Valid for trip types" hint="None selected = all trip types.">
                <ChipSelect options={TRIP_TYPES} value={form.tripTypes} onChange={(v) => set('tripTypes', v)} />
              </Field>
              <Field label="Valid for cabs" hint="None selected = all cabs.">
                {vehicleOptions.length > 0
                  ? <ChipSelect options={vehicleOptions} value={form.vehicleTypes} onChange={(v) => set('vehicleTypes', v)} />
                  : <p className="text-xs text-gray-400">No vehicle types yet.</p>}
              </Field>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.showOnWebsite} onChange={(e) => set('showOnWebsite', e.target.checked)} className="w-4 h-4 accent-amber-500" />
                List on website checkout <span className="text-xs text-gray-400">(off = customers must type the code)</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 accent-amber-500" />
                Active
              </label>
            </div>

            {preview && (
              <div className="rounded-xl border border-dashed border-teal-300 bg-teal-50 px-4 py-3 text-sm">
                <p className="text-xs text-teal-700 font-semibold mb-0.5">Customer sees</p>
                <p className="font-bold text-gray-900">{form.code || 'CODE'} — {preview}</p>
                <p className="text-xs text-gray-500">{form.title}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Delete */}
      {modal === 'delete' && selected && (
        <Modal
          title="Delete Coupon"
          onClose={() => setModal(null)}
          footer={
            <>
              <button onClick={() => setModal(null)} className={btnGhost}>Cancel</button>
              <button onClick={handleDelete} disabled={saving} className={btnDanger}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
              </button>
            </>
          }
        >
          <div className="text-center space-y-3 py-2">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto"><Trash2 className="w-7 h-7 text-red-500" /></div>
            <p className="font-semibold text-gray-900 text-lg">Delete “{selected.code}”?</p>
            <p className="text-sm text-gray-500">Coupons that were used in bookings cannot be deleted — disable them instead.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
