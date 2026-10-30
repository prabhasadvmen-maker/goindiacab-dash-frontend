import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import {
  Car, Plus, Pencil, Trash2, X, Loader2, ToggleLeft, ToggleRight,
  IndianRupee, Users, Package, ChevronDown, ChevronUp,
  RefreshCw, AlertCircle, CheckCircle2, Truck, Info, MoreVertical, Eye,
  Plane, Repeat, Clock, Route, MapPin, Calculator
} from 'lucide-react';
import clsx from 'clsx';
import JourneyAddons from './JourneyAddons';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE = `${API_URL}/api/admins/website`;

const inputCls = 'w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition';
const btnBase = 'inline-flex items-center justify-center gap-2 h-10 text-sm font-semibold px-4 rounded-lg whitespace-nowrap transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
const btnPrimary = `${btnBase} bg-amber-500 hover:bg-amber-600 text-white shadow-sm`;
const btnDanger = `${btnBase} bg-red-500 hover:bg-red-600 text-white shadow-sm`;
const btnGhost = `${btnBase} border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium`;

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

function Section({ icon: Icon, title, subtitle, action, children }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 rounded-t-xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 leading-tight">{title}</h4>
            {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
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
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700 p-1.5 -mr-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 bg-gray-50/40">{children}</div>
        {footer && <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-white shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

function VehicleImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  if (!src || failed) {
    return (
      <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
        <Car className="w-9 h-9 text-amber-500" />
      </div>
    );
  }
  return <img src={src} alt={alt} onError={() => setFailed(true)} className={className} />;
}

const num = (v) => Number(v) || 0;
const rupees = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

const EMPTY_AIRPORT = { perKm: '', minKm: 0, driverAllowance: '', pickupFee: 0, dropFee: 0 };

// One tab per option the customer can pick on the website.
const PRICE_TABS = [
  { id: 'oneway', label: 'One Way', where: 'Website › Outstation › One Way', icon: Route },
  { id: 'roundtrip', label: 'Round Trip', where: 'Website › Outstation › Round Trip', icon: Repeat },
  { id: 'airport', label: 'Airport', where: 'Website › Airport › Pickup from / Drop to', icon: Plane },
  { id: 'hourly', label: 'Hourly Rental', where: 'Website › Hourly Rentals', icon: Clock },
];

// Mirrors backend calculateWebFare so the admin sees exactly what a customer would be charged.
function previewFare(f, tab, { km, days, dir, pkgIdx }) {
  let base;
  let extra = 0;
  let driver = 0;
  let kmLine;

  if (tab === 'hourly') {
    const pkg = f.packages[pkgIdx];
    if (!pkg) return null;
    base = num(pkg.price);
    kmLine = `${num(pkg.km)} km / ${num(pkg.hours)} hr included, then ₹${num(pkg.extraKmRate)}/km`;
  } else if (tab === 'roundtrip') {
    const travel = km * 2;
    const included = num(f.minKmPerDay) * days;
    base = included * num(f.perKmRound);
    const extraRate = num(f.perKmRoundExtra) > 0 ? num(f.perKmRoundExtra) : num(f.perKmRound);
    extra = Math.max(0, travel - included) * extraRate;
    driver = num(f.driverAllowancePerDay) * days;
    const over = Math.max(0, travel - included);
    kmLine = `${Math.round(travel)} km travelled (both ways) · ${included} km included for ${days} day${days > 1 ? 's' : ''}${over ? ` · ${Math.round(over)} km extra × ₹${extraRate}` : ''}`;
  } else if (tab === 'airport') {
    const a = f.airport || {};
    const own = num(a.perKm) > 0;
    const perKm = own ? num(a.perKm) : num(f.perKmOneway);
    const billable = Math.max(km, own ? num(a.minKm) : num(f.minKmOneway));
    const fee = dir === 'from' ? num(a.pickupFee) : num(a.dropFee);
    base = billable * perKm + fee;
    driver = own ? num(a.driverAllowance) : num(f.driverAllowance);
    kmLine = `${Math.round(billable)} km × ₹${perKm}${fee ? ` + ₹${fee} airport fee` : ''}${own ? '' : ' (One Way rate)'}`;
  } else {
    const billable = Math.max(km, num(f.minKmOneway));
    base = billable * num(f.perKmOneway);
    driver = num(f.driverAllowance);
    kmLine = `${Math.round(billable)} km × ₹${num(f.perKmOneway)}`;
  }

  base = Math.round(base);
  extra = Math.round(extra);
  driver = Math.round(driver);
  const gst = Math.round(((base + extra + driver) * num(f.gstPercent)) / 100);
  return { base, extra, driver, gst, total: base + extra + driver + gst, kmLine };
}

function FarePreview({ form, tab }) {
  const [km, setKm] = useState(100);
  const [days, setDays] = useState(2);
  const [dir, setDir] = useState('to');
  const [pkgIdx, setPkgIdx] = useState(0);
  const r = previewFare(form, tab, { km: num(km), days: Math.max(1, num(days)), dir, pkgIdx });

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
        <Calculator className="w-3.5 h-3.5" /> Customer will see
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        {tab === 'hourly' ? (
          <label className="text-xs text-gray-600">
            Package
            <select value={pkgIdx} onChange={(e) => setPkgIdx(Number(e.target.value))} className={clsx(inputCls, 'mt-1 w-48')}>
              {form.packages.map((p, i) => <option key={i} value={i}>{p.label || `Package ${i + 1}`}</option>)}
            </select>
          </label>
        ) : (
          <label className="text-xs text-gray-600">
            {tab === 'roundtrip' ? 'One-way distance (km)' : 'Trip distance (km)'}
            <input type="number" min={0} value={km} onChange={(e) => setKm(e.target.value)} className={clsx(inputCls, 'mt-1 w-32')} />
          </label>
        )}
        {tab === 'roundtrip' && (
          <label className="text-xs text-gray-600">
            Days
            <input type="number" min={1} max={30} value={days} onChange={(e) => setDays(e.target.value)} className={clsx(inputCls, 'mt-1 w-20')} />
          </label>
        )}
        {tab === 'airport' && (
          <div className="text-xs text-gray-600">
            Direction
            <div className="mt-1 flex rounded-lg border border-gray-300 overflow-hidden bg-white">
              {[['from', 'Pickup from airport'], ['to', 'Drop to airport']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => setDir(v)}
                  className={clsx('h-10 px-3 text-xs font-semibold', dir === v ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-50')}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!r ? (
        <p className="mt-4 text-sm text-gray-500">Add a package to see its price.</p>
      ) : (
        <>
          <p className="mt-3 text-xs text-gray-500">{r.kmLine}</p>
          <dl className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="flex justify-between"><dt>Base fare</dt><dd>{rupees(r.base)}</dd></div>
            {r.extra > 0 && <div className="flex justify-between"><dt>Extra km</dt><dd>{rupees(r.extra)}</dd></div>}
            <div className="flex justify-between"><dt>Driver allowance</dt><dd>{rupees(r.driver)}</dd></div>
            <div className="flex justify-between"><dt>GST ({num(form.gstPercent)}%)</dt><dd>{rupees(r.gst)}</dd></div>
            <div className="flex justify-between border-t border-emerald-200 pt-2 text-base font-extrabold text-gray-900"><dt>Total</dt><dd>{rupees(r.total)}</dd></div>
          </dl>
        </>
      )}
    </div>
  );
}

const EMPTY_RULE = {
  vehicleType: '', name: '', model: '', seats: 4, bags: 2, rating: 0, fuelType: '', imageUrl: '',
  perKmOneway: '', perKmRound: '', minKmOneway: 0, minKmPerDay: 250,
  driverAllowance: 300, driverAllowancePerDay: 300, gstPercent: 5, airport: { ...EMPTY_AIRPORT },
  sortOrder: 0, isActive: true, packages: [],
};

const EMPTY_PKG = { label: '', hours: 8, km: 80, price: '', extraKmRate: '', extraHourRate: '' };

export default function FleetManagement() {
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;
  const canWrite = !!superAdminToken;

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'delete' | 'packages'
  const [form, setForm] = useState(EMPTY_RULE);
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [priceTab, setPriceTab] = useState('oneway');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const api = useCallback(
    (method, url, data) =>
      axios({ method, url: `${BASE}${url}`, data, headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api('get', '/fare-rules');
      setRules(data.data || []);
    } catch {
      showToast('Failed to load fleet data', 'error');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const openAdd = () => { setForm({ ...EMPTY_RULE, airport: { ...EMPTY_AIRPORT } }); setPriceTab('oneway'); setModal('add'); };
  const openEdit = (rule) => { setForm({ ...rule, packages: rule.packages || [], airport: { ...EMPTY_AIRPORT, ...(rule.airport || {}) } }); setSelected(rule); setPriceTab('oneway'); setModal('edit'); };
  const openView = (rule) => { setSelected(rule); setModal('view'); };
  const openDelete = (rule) => { setSelected(rule); setModal('delete'); };

  const handleChange = (field, val) => setForm((f) => ({ ...f, [field]: val }));
  const handleAirport = (field, val) => setForm((f) => ({ ...f, airport: { ...f.airport, [field]: val } }));

  // Resize to max 800px, compress, and keep as a data URL; the backend uploads it to R2 on save.
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Please select an image file', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 800 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        // WebP keeps transparency at a fraction of PNG size, so the save request stays under nginx's 1 MB default body limit.
        const webp = canvas.toDataURL('image/webp', 0.85);
        handleChange('imageUrl', webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => showToast('Could not read image', 'error');
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePackageChange = (idx, field, val) => {
    const pkgs = [...form.packages];
    pkgs[idx] = { ...pkgs[idx], [field]: val };
    setForm((f) => ({ ...f, packages: pkgs }));
  };

  const addPackage = () => setForm((f) => ({ ...f, packages: [...f.packages, { ...EMPTY_PKG }] }));
  const removePackage = (idx) => setForm((f) => ({ ...f, packages: f.packages.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    if (!form.vehicleType || !form.name) {
      showToast('Vehicle Type ID and Display Name are required', 'error');
      return;
    }
    if (!(Number(form.perKmOneway) > 0)) {
      setPriceTab('oneway');
      showToast('Enter the One Way ₹ per km rate', 'error');
      return;
    }
    if (!(Number(form.perKmRound) > 0)) {
      setPriceTab('roundtrip');
      showToast('Enter the Round Trip ₹ per km rate', 'error');
      return;
    }
    const badPkg = form.packages.findIndex((p) => !p.label || !(Number(p.price) > 0) || !(Number(p.km) > 0));
    if (badPkg >= 0) {
      setPriceTab('hourly');
      showToast(`Hourly package ${badPkg + 1}: label, KM and price are required`, 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        perKmOneway: Number(form.perKmOneway),
        perKmRound: Number(form.perKmRound),
        perKmRoundExtra: Number(form.perKmRoundExtra) || 0,
        minKmOneway: Number(form.minKmOneway),
        minKmPerDay: Number(form.minKmPerDay),
        driverAllowance: Number(form.driverAllowance),
        driverAllowancePerDay: Number(form.driverAllowancePerDay),
        gstPercent: Number(form.gstPercent),
        airport: {
          perKm: Number(form.airport?.perKm) || 0,
          minKm: Number(form.airport?.minKm) || 0,
          driverAllowance: Number(form.airport?.driverAllowance) || 0,
          pickupFee: Number(form.airport?.pickupFee) || 0,
          dropFee: Number(form.airport?.dropFee) || 0,
        },
        sortOrder: Number(form.sortOrder),
        seats: Number(form.seats),
        bags: Number(form.bags) || 0,
        rating: Number(form.rating) || 0,
        packages: form.packages.map((p) => ({
          ...p,
          hours: Number(p.hours),
          km: Number(p.km),
          price: Number(p.price),
          extraKmRate: Number(p.extraKmRate),
          extraHourRate: Number(p.extraHourRate),
        })),
      };

      if (modal === 'add') {
        await api('post', '/fare-rules', payload);
        showToast('Vehicle type added successfully!');
      } else {
        await api('put', `/fare-rules/${selected._id}`, payload);
        showToast('Vehicle type updated successfully!');
      }
      setModal(null);
      fetchRules();
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api('delete', `/fare-rules/${selected._id}`);
      showToast('Vehicle type deleted');
      setModal(null);
      fetchRules();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (rule) => {
    try {
      await api('put', `/fare-rules/${rule._id}`, { ...rule, isActive: !rule.isActive });
      showToast(`${rule.name} ${!rule.isActive ? 'activated' : 'deactivated'}`);
      fetchRules();
    } catch {
      showToast('Toggle failed', 'error');
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm('Seed default vehicle types? (Hatchback, Sedan, SUV, Innova — only adds missing ones)')) return;
    try {
      const { data } = await api('post', '/seed-defaults');
      showToast(data.message || 'Defaults seeded!');
      fetchRules();
    } catch (err) {
      showToast(err.response?.data?.message || 'Seed failed', 'error');
    }
  };

  const avgRate = rules.length ? Math.round(rules.reduce((s, r) => s + Number(r.perKmOneway || 0), 0) / rules.length) : 0;
  const stats = [
    { label: 'Total Types', value: rules.length, icon: Car, tone: 'bg-blue-100 text-blue-600' },
    { label: 'Active', value: rules.filter((r) => r.isActive).length, icon: ToggleRight, tone: 'bg-green-100 text-green-600' },
    { label: 'Inactive', value: rules.filter((r) => !r.isActive).length, icon: ToggleLeft, tone: 'bg-red-100 text-red-600' },
    { label: 'Avg. Rate/km', value: `₹${avgRate}`, icon: IndianRupee, tone: 'bg-amber-100 text-amber-600' },
  ];

  const formFooter = (
    <>
      <button onClick={() => setModal(null)} className={btnGhost}>Cancel</button>
      <button onClick={handleSave} disabled={saving} className={btnPrimary}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        {modal === 'add' ? 'Add Vehicle Type' : 'Save Changes'}
      </button>
    </>
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      {/* Toast */}
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
            <Truck className="w-5 h-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Fleet &amp; Pricing Management</h2>
            <p className="text-gray-500 mt-1 text-sm">
              Manage vehicle types and pricing for the <span className="font-semibold text-amber-600">website booking flow</span>. Changes reflect on the website immediately.
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap lg:flex-nowrap shrink-0">
          <button onClick={fetchRules} className={btnGhost}>
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} /> Refresh
          </button>
          {canWrite && (
            <>
              <button onClick={handleSeedDefaults} className={clsx(btnGhost, 'border-amber-300 text-amber-700 hover:bg-amber-50')}>
                <Package className="w-4 h-4" /> Seed Defaults
              </button>
              <button onClick={openAdd} className={btnPrimary}>
                <Plus className="w-4 h-4" /> Add Vehicle Type
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3.5 flex items-center gap-3.5">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', stat.tone)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900 leading-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fleet Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 px-6 py-14 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-lg font-semibold text-gray-800">No vehicle types found</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">Add your first vehicle type or seed defaults to get started.</p>
          {canWrite && (
            <div className="flex justify-center gap-3 flex-wrap">
              <button onClick={handleSeedDefaults} className={btnGhost}>
                <Package className="w-4 h-4" /> Seed Defaults
              </button>
              <button onClick={openAdd} className={btnPrimary}>
                <Plus className="w-4 h-4" /> Add Vehicle Type
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rules.map((rule) => (
            <div
              key={rule._id}
              className={clsx(
                'relative bg-white rounded-2xl border shadow-sm transition-all hover:shadow-md flex flex-col',
                rule.isActive ? 'border-gray-100' : 'border-dashed border-gray-300'
              )}
            >
              <div className={clsx('relative bg-gradient-to-br from-gray-50 to-amber-50/40 border-b border-gray-100 rounded-t-2xl overflow-hidden', !rule.isActive && 'opacity-60')}>
                <div className="h-44 flex items-center justify-center">
                  <VehicleImage src={rule.imageUrl} alt={rule.name} className="w-full h-full object-cover" />
                </div>
                <span className={clsx(
                  'absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold rounded-full',
                  rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                )}>
                  {rule.isActive ? '● Active' : '○ Inactive'}
                </span>
              </div>
              {canWrite && (
                <div className="absolute top-2.5 right-2.5 z-10">
                  <button
                    onClick={() => setMenuId(menuId === rule._id ? null : rule._id)}
                    title="Actions"
                    className="p-1.5 rounded-lg bg-white/90 border border-gray-200 hover:bg-white text-gray-500 hover:text-gray-800 shadow-sm transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {menuId === rule._id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuId(null)} />
                      <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl border border-gray-100 shadow-xl py-1.5 z-20">
                        <button onClick={() => { setMenuId(null); openView(rule); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Eye className="w-4 h-4 text-gray-400" /> View
                        </button>
                        <button onClick={() => { setMenuId(null); openEdit(rule); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <Pencil className="w-4 h-4 text-blue-500" /> Edit
                        </button>
                        <button onClick={() => { setMenuId(null); handleToggleActive(rule); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          {rule.isActive
                            ? <><ToggleLeft className="w-4 h-4 text-gray-400" /> Disable</>
                            : <><ToggleRight className="w-4 h-4 text-green-500" /> Enable</>}
                        </button>
                        <div className="my-1 border-t border-gray-100" />
                        <button onClick={() => { setMenuId(null); openDelete(rule); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className={clsx('px-4 pt-4', !rule.isActive && 'opacity-60')}>
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{rule.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{rule.model || 'No model specified'}</p>
              </div>

              <div className={clsx('p-4 pt-3 space-y-4 flex-1 flex flex-col', !rule.isActive && 'opacity-60')}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs text-blue-500 font-medium mb-0.5">One Way</p>
                    <p className="text-lg font-bold text-blue-700">₹{rule.perKmOneway}<span className="text-xs font-normal">/km</span></p>
                    <p className="text-xs text-blue-400">Min: {rule.minKmOneway} km</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <p className="text-xs text-purple-500 font-medium mb-0.5">Round Trip</p>
                    <p className="text-lg font-bold text-purple-700">₹{rule.perKmRound}<span className="text-xs font-normal">/km</span></p>
                    <p className="text-xs text-purple-400">Min: {rule.minKmPerDay} km/day</p>
                  </div>
                  <div className="bg-sky-50 rounded-xl p-3">
                    <p className="text-xs text-sky-600 font-medium mb-0.5 flex items-center gap-1"><Plane className="w-3 h-3" /> Airport</p>
                    {Number(rule.airport?.perKm) > 0 ? (
                      <>
                        <p className="text-lg font-bold text-sky-700">₹{rule.airport.perKm}<span className="text-xs font-normal">/km</span></p>
                        <p className="text-xs text-sky-500">Pickup +₹{rule.airport.pickupFee || 0} · Drop +₹{rule.airport.dropFee || 0}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-bold text-sky-700">₹{rule.perKmOneway}<span className="text-xs font-normal">/km</span></p>
                        <p className="text-xs text-sky-500">Uses One Way rate</p>
                      </>
                    )}
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-xs text-amber-600 font-medium mb-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> Hourly</p>
                    {rule.packages?.length > 0 ? (
                      <>
                        <p className="text-lg font-bold text-amber-700"><span className="text-xs font-normal">from </span>₹{Math.min(...rule.packages.map((p) => p.price))}</p>
                        <p className="text-xs text-amber-500">{rule.packages.length} package{rule.packages.length > 1 ? 's' : ''}</p>
                      </>
                    ) : (
                      <p className="text-xs text-red-500 mt-1">No packages — hidden for hourly</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {rule.seats} seats</span>
                  <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /> Driver ₹{rule.driverAllowance}</span>
                  <span>GST {rule.gstPercent}%</span>
                </div>

                {rule.packages?.length > 0 && (
                  <div>
                    <button
                      onClick={() => setExpanded(expanded === rule._id ? null : rule._id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700"
                    >
                      <Package className="w-3.5 h-3.5" />
                      {rule.packages.length} Local Package{rule.packages.length > 1 ? 's' : ''}
                      {expanded === rule._id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {expanded === rule._id && (
                      <div className="mt-2 space-y-1.5">
                        {rule.packages.map((pkg, i) => (
                          <div key={i} className="flex items-center justify-between bg-amber-50/60 rounded-lg px-3 py-2 border border-amber-100">
                            <span className="text-xs font-medium text-gray-700">{pkg.label}</span>
                            <span className="text-xs font-bold text-amber-700">₹{pkg.price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-1">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded-md">{rule.vehicleType}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <JourneyAddons api={api} canWrite={canWrite} showToast={showToast} />

      {/* ─── Add / Edit Modal ─── */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal
          wide
          title={modal === 'add' ? 'Add New Vehicle Type' : `Edit ${selected?.name || 'Vehicle Type'}`}
          subtitle="Fields marked * are required"
          onClose={() => setModal(null)}
          footer={formFooter}
        >
          <div className="space-y-5">
            <Section icon={Car} title="Vehicle Details" subtitle="How this vehicle appears on the website">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Vehicle Type ID" required hint={modal === 'edit' ? 'Cannot be changed after creation.' : 'Unique ID — lowercase, no spaces.'}>
                  <input
                    value={form.vehicleType}
                    onChange={(e) => handleChange('vehicleType', e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="sedan, suv, hatchback"
                    className={inputCls}
                    disabled={modal === 'edit'}
                  />
                </Field>
                <Field label="Display Name" required>
                  <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Sedan" className={inputCls} />
                </Field>
                <Field label="Model Description">
                  <input value={form.model} onChange={(e) => handleChange('model', e.target.value)} placeholder="Dzire, Etios or similar" className={inputCls} />
                </Field>
                <Field label="Seating Capacity">
                  <input type="number" value={form.seats} onChange={(e) => handleChange('seats', e.target.value)} min={1} max={50} className={inputCls} />
                </Field>
                <Field label="Luggage Capacity (bags)">
                  <input type="number" value={form.bags} onChange={(e) => handleChange('bags', e.target.value)} min={0} max={30} className={inputCls} />
                </Field>
                <Field label="Rating" hint="0 hides the rating on the website.">
                  <input type="number" value={form.rating} onChange={(e) => handleChange('rating', e.target.value)} min={0} max={5} step={0.1} className={inputCls} />
                </Field>
                <Field label="Fuel Type" hint="Shown as a filter on the website.">
                  <select value={form.fuelType || ''} onChange={(e) => handleChange('fuelType', e.target.value)} className={inputCls}>
                    <option value="">Not specified</option>
                    {['Petrol', 'Diesel', 'Petrol + CNG', 'CNG', 'Electric'].map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Vehicle Image" hint="PNG/JPG, auto-resized.">
                  <div className="flex items-center gap-3">
                    {form.imageUrl && (
                      <img src={form.imageUrl} alt="Preview" className="w-12 h-12 rounded-lg object-contain bg-gray-50 border border-gray-200 p-1 shrink-0" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="w-full text-sm text-gray-600 file:mr-3 file:h-10 file:px-4 file:rounded-lg file:border-0 file:bg-amber-50 file:text-amber-700 file:font-semibold hover:file:bg-amber-100"
                    />
                  </div>
                </Field>
                <Field label="Sort Order" hint="Lower numbers appear first.">
                  <input type="number" value={form.sortOrder} onChange={(e) => handleChange('sortOrder', e.target.value)} min={0} className={inputCls} />
                </Field>
              </div>
            </Section>

            <Section icon={IndianRupee} title="Pricing by Trip Type" subtitle="Each tab controls one option on the website — set the rate for every trip type this vehicle serves">
              <div className="flex flex-wrap gap-2 mb-4" role="tablist">
                {PRICE_TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={priceTab === t.id}
                    onClick={() => setPriceTab(t.id)}
                    className={clsx(
                      'inline-flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold border transition-colors',
                      priceTab === t.id ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <t.icon className="w-4 h-4" /> {t.label}
                  </button>
                ))}
              </div>

              <p className="mb-4 flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" /> {PRICE_TABS.find((t) => t.id === priceTab).where}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="space-y-4">
                  {priceTab === 'oneway' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="₹ per km" required hint="Charged on the trip distance.">
                        <input type="number" value={form.perKmOneway} onChange={(e) => handleChange('perKmOneway', e.target.value)} placeholder="13" min={0} className={inputCls} />
                      </Field>
                      <Field label="Minimum km" hint="Customer pays for at least this many km. 0 = actual distance.">
                        <input type="number" value={form.minKmOneway} onChange={(e) => handleChange('minKmOneway', e.target.value)} min={0} className={inputCls} />
                      </Field>
                      <Field label="Driver allowance (₹ per trip)" hint="Flat amount added to every one-way trip.">
                        <input type="number" value={form.driverAllowance} onChange={(e) => handleChange('driverAllowance', e.target.value)} min={0} className={inputCls} />
                      </Field>
                    </div>
                  )}

                  {priceTab === 'roundtrip' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="₹ per km" required hint="Charged on distance travelled both ways.">
                        <input type="number" value={form.perKmRound} onChange={(e) => handleChange('perKmRound', e.target.value)} placeholder="12" min={0} className={inputCls} />
                      </Field>
                      <Field label="Minimum km per day" hint="Billed at least this many km for each day of the trip.">
                        <input type="number" value={form.minKmPerDay} onChange={(e) => handleChange('minKmPerDay', e.target.value)} min={0} className={inputCls} />
                      </Field>
                      <Field label="Extra km rate (₹ per km)" hint="Charged for every km beyond the included km. Leave empty to use the ₹ per km above.">
                        <input type="number" value={form.perKmRoundExtra || ''} onChange={(e) => handleChange('perKmRoundExtra', e.target.value)} placeholder="Same as ₹ per km" min={0} className={inputCls} />
                      </Field>
                      <Field label="Driver allowance (₹ per day)" hint="Multiplied by the number of days.">
                        <input type="number" value={form.driverAllowancePerDay} onChange={(e) => handleChange('driverAllowancePerDay', e.target.value)} min={0} className={inputCls} />
                      </Field>
                    </div>
                  )}

                  {priceTab === 'airport' && (
                    <>
                      {!(Number(form.airport?.perKm) > 0) && (
                        <p className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                          <Info className="w-4 h-4 shrink-0 mt-0.5" /> Airport rate is empty, so airport trips are currently charged at the One Way rate. Enter a rate below to price airport transfers separately.
                        </p>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="₹ per km" hint="Leave empty to use the One Way rate.">
                          <input type="number" value={form.airport?.perKm ?? ''} onChange={(e) => handleAirport('perKm', e.target.value)} placeholder="Same as One Way" min={0} className={inputCls} />
                        </Field>
                        <Field label="Minimum km" hint="0 = actual distance.">
                          <input type="number" value={form.airport?.minKm ?? 0} onChange={(e) => handleAirport('minKm', e.target.value)} min={0} className={inputCls} />
                        </Field>
                        <Field label="Driver allowance (₹ per trip)">
                          <input type="number" value={form.airport?.driverAllowance ?? ''} onChange={(e) => handleAirport('driverAllowance', e.target.value)} min={0} className={inputCls} />
                        </Field>
                        <div className="hidden sm:block" />
                        <Field label="Pickup from airport — extra fee (₹)" hint="Parking / waiting charge, added to base fare.">
                          <input type="number" value={form.airport?.pickupFee ?? 0} onChange={(e) => handleAirport('pickupFee', e.target.value)} min={0} className={inputCls} />
                        </Field>
                        <Field label="Drop to airport — extra fee (₹)" hint="Added to base fare. Usually 0.">
                          <input type="number" value={form.airport?.dropFee ?? 0} onChange={(e) => handleAirport('dropFee', e.target.value)} min={0} className={inputCls} />
                        </Field>
                      </div>
                    </>
                  )}

                  {priceTab === 'hourly' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-gray-500">Fixed price per package. Customers choose a package on the Hourly Rentals tab.</p>
                        <button type="button" onClick={addPackage} className={clsx(btnGhost, 'h-8 text-xs px-3 shrink-0')}>
                          <Plus className="w-3.5 h-3.5" /> Add Package
                        </button>
                      </div>
                      {form.packages.length === 0 ? (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 py-5 border border-dashed border-gray-200 rounded-lg">
                          <Info className="w-4 h-4" /> No packages yet. Click “Add Package”.
                        </div>
                      ) : (
                        form.packages.map((pkg, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50/60">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Package {idx + 1}</span>
                              <button type="button" onClick={() => removePackage(idx)} title="Remove package" className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="col-span-2">
                                <Field label="Label">
                                  <input value={pkg.label} onChange={(e) => handlePackageChange(idx, 'label', e.target.value)} placeholder="8 Hrs / 80 Km" className={inputCls} />
                                </Field>
                              </div>
                              <Field label="Hours">
                                <input type="number" value={pkg.hours} onChange={(e) => handlePackageChange(idx, 'hours', e.target.value)} min={0} className={inputCls} />
                              </Field>
                              <Field label="KM included">
                                <input type="number" value={pkg.km} onChange={(e) => handlePackageChange(idx, 'km', e.target.value)} min={0} className={inputCls} />
                              </Field>
                              <Field label="Package price (₹)">
                                <input type="number" value={pkg.price} onChange={(e) => handlePackageChange(idx, 'price', e.target.value)} placeholder="2200" min={0} className={inputCls} />
                              </Field>
                              <Field label="Extra ₹ / km">
                                <input type="number" value={pkg.extraKmRate} onChange={(e) => handlePackageChange(idx, 'extraKmRate', e.target.value)} min={0} className={inputCls} />
                              </Field>
                              <Field label="Extra ₹ / hr">
                                <input type="number" value={pkg.extraHourRate} onChange={(e) => handlePackageChange(idx, 'extraHourRate', e.target.value)} min={0} className={inputCls} />
                              </Field>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  <Field label="GST % (applies to every trip type)">
                    <input type="number" value={form.gstPercent} onChange={(e) => handleChange('gstPercent', e.target.value)} min={0} max={30} className={clsx(inputCls, 'max-w-[8rem]')} />
                  </Field>
                </div>

                <div className="lg:sticky lg:top-0 self-start">
                  <FarePreview key={priceTab} form={form} tab={priceTab} />
                </div>
              </div>
            </Section>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-5 py-3.5">
              <div>
                <p className="text-sm font-semibold text-gray-900">{form.isActive ? 'Active' : 'Inactive'}</p>
                <p className="text-xs text-gray-500">{form.isActive ? 'Visible on the website booking flow' : 'Hidden from the website'}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.isActive}
                onClick={() => handleChange('isActive', !form.isActive)}
                className={clsx('w-11 h-6 rounded-full relative transition-colors shrink-0', form.isActive ? 'bg-green-500' : 'bg-gray-300')}
              >
                <span className={clsx('w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow', form.isActive ? 'left-[22px]' : 'left-0.5')} />
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── View Modal ─── */}
      {modal === 'view' && selected && (
        <Modal
          title={selected.name}
          subtitle={selected.vehicleType}
          onClose={() => setModal(null)}
          footer={
            <>
              <button onClick={() => setModal(null)} className={btnGhost}>Close</button>
              {canWrite && <button onClick={() => openEdit(selected)} className={btnPrimary}><Pencil className="w-4 h-4" /> Edit</button>}
            </>
          }
        >
          <div className="space-y-4">
            <div className="h-44 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 p-4">
              <VehicleImage src={selected.imageUrl} alt={selected.name} className="max-h-full max-w-full object-contain" />
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {[
                ['Model', selected.model || '—'],
                ['Seats', selected.seats],
                ['₹/km One Way', `₹${selected.perKmOneway}`],
                ['₹/km Round Trip', `₹${selected.perKmRound}`],
                ['Min KM (One Way)', `${selected.minKmOneway} km`],
                ['Min KM / Day', `${selected.minKmPerDay} km`],
                ['Driver Allowance', `₹${selected.driverAllowance}`],
                ['Driver Allowance / Day', `₹${selected.driverAllowancePerDay}`],
                ['Airport ₹/km', Number(selected.airport?.perKm) > 0 ? `₹${selected.airport.perKm}` : 'Uses One Way rate'],
                ['Airport Min KM', `${selected.airport?.minKm || 0} km`],
                ['Airport Driver Allowance', Number(selected.airport?.perKm) > 0 ? `₹${selected.airport.driverAllowance || 0}` : 'Uses One Way'],
                ['Airport Pickup / Drop Fee', `+₹${selected.airport?.pickupFee || 0} / +₹${selected.airport?.dropFee || 0}`],
                ['GST', `${selected.gstPercent}%`],
                ['Status', selected.isActive ? 'Active' : 'Inactive'],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-gray-500">{k}</dt><dd className="font-semibold text-gray-900">{v}</dd></div>
              ))}
            </dl>
            {selected.packages?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Local Packages</p>
                <div className="space-y-1.5">
                  {selected.packages.map((pkg, i) => (
                    <div key={i} className="flex items-center justify-between bg-amber-50/60 rounded-lg px-3 py-2 border border-amber-100">
                      <span className="text-xs font-medium text-gray-700">{pkg.label} · {pkg.hours}h / {pkg.km}km</span>
                      <span className="text-xs font-bold text-amber-700">₹{pkg.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ─── Delete Modal ─── */}
      {modal === 'delete' && (
        <Modal
          title="Delete Vehicle Type"
          onClose={() => setModal(null)}
          footer={
            <>
              <button onClick={() => setModal(null)} className={btnGhost}>Cancel</button>
              <button onClick={handleDelete} disabled={saving} className={btnDanger}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </>
          }
        >
          <div className="text-center space-y-3 py-2">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <p className="font-semibold text-gray-900 text-lg">Delete “{selected?.name}”?</p>
            <p className="text-sm text-gray-500">
              This removes <strong>{selected?.vehicleType}</strong> from the website booking options. Existing bookings with this vehicle type are not affected.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
