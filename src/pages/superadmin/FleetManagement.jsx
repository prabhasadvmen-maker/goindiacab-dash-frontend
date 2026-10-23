import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import {
  Car, Plus, Pencil, Trash2, X, Loader2, ToggleLeft, ToggleRight,
  IndianRupee, Users, ArrowUpDown, Image, Package, ChevronDown, ChevronUp,
  RefreshCw, AlertCircle, CheckCircle2, Truck
} from 'lucide-react';
import clsx from 'clsx';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE = `${API_URL}/api/admins/website`;

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent';
const btnPrimary = 'inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-60 transition-colors';
const btnDanger = 'inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors';
const btnGhost = 'inline-flex items-center gap-2 border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors';

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={clsx('bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto', wide ? 'max-w-3xl' : 'max-w-lg')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const EMPTY_RULE = {
  vehicleType: '', name: '', model: '', seats: 4, imageUrl: '',
  perKmOneway: '', perKmRound: '', minKmOneway: 250, minKmPerDay: 250,
  driverAllowance: 300, driverAllowancePerDay: 300, gstPercent: 5,
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

  const openAdd = () => { setForm({ ...EMPTY_RULE }); setModal('add'); };
  const openEdit = (rule) => { setForm({ ...rule, packages: rule.packages || [] }); setSelected(rule); setModal('edit'); };
  const openDelete = (rule) => { setSelected(rule); setModal('delete'); };

  const handleChange = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handlePackageChange = (idx, field, val) => {
    const pkgs = [...form.packages];
    pkgs[idx] = { ...pkgs[idx], [field]: val };
    setForm((f) => ({ ...f, packages: pkgs }));
  };

  const addPackage = () => setForm((f) => ({ ...f, packages: [...f.packages, { ...EMPTY_PKG }] }));
  const removePackage = (idx) => setForm((f) => ({ ...f, packages: f.packages.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    if (!form.vehicleType || !form.name || !form.perKmOneway || !form.perKmRound) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        perKmOneway: Number(form.perKmOneway),
        perKmRound: Number(form.perKmRound),
        minKmOneway: Number(form.minKmOneway),
        minKmPerDay: Number(form.minKmPerDay),
        driverAllowance: Number(form.driverAllowance),
        driverAllowancePerDay: Number(form.driverAllowancePerDay),
        gstPercent: Number(form.gstPercent),
        sortOrder: Number(form.sortOrder),
        seats: Number(form.seats),
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
    try {
      const { data } = await api('post', '/../seed-defaults'.replace('/../', '/').replace('/seed-defaults', '').concat('/seed-defaults'));
      showToast(data.message || 'Defaults seeded!');
      fetchRules();
    } catch (err) {
      showToast(err.response?.data?.message || 'Seed failed', 'error');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={clsx(
          'fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-semibold animate-fade-in',
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        )}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-amber-600" />
            </div>
            Fleet & Pricing Management
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Manage vehicle types and pricing for the <span className="font-semibold text-amber-600">website booking flow</span>.
            Changes reflect on the website immediately.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={fetchRules} className={btnGhost}>
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          {canWrite && (
            <>
              <button
                onClick={async () => {
                  if (window.confirm('Seed default vehicle types? (Hatchback, Sedan, SUV, Innova — safe, only adds missing ones)')) {
                    await handleSeedDefaults();
                  }
                }}
                className={clsx(btnGhost, 'border-amber-300 text-amber-700 hover:bg-amber-50')}
              >
                <Package className="w-4 h-4" /> Seed Defaults
              </button>
              <button onClick={openAdd} className={btnPrimary}>
                <Plus className="w-4 h-4" /> Add Vehicle Type
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Types', value: rules.length, icon: Car, color: 'blue' },
          { label: 'Active', value: rules.filter((r) => r.isActive).length, icon: ToggleRight, color: 'green' },
          { label: 'Inactive', value: rules.filter((r) => !r.isActive).length, icon: ToggleLeft, color: 'red' },
          { label: 'Avg. Rate/km', value: `₹${rules.length ? Math.round(rules.reduce((s, r) => s + r.perKmOneway, 0) / rules.length) : 0}`, icon: IndianRupee, color: 'amber' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className={clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
              stat.color === 'blue' && 'bg-blue-100 text-blue-600',
              stat.color === 'green' && 'bg-green-100 text-green-600',
              stat.color === 'red' && 'bg-red-100 text-red-600',
              stat.color === 'amber' && 'bg-amber-100 text-amber-600',
            )}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
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
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <Car className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">No vehicle types found</p>
          <p className="text-sm text-gray-500 mt-1 mb-6">Add your first vehicle type or seed defaults to get started.</p>
          {canWrite && (
            <button onClick={openAdd} className={btnPrimary}>
              <Plus className="w-4 h-4" /> Add Vehicle Type
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rules.map((rule) => (
            <div
              key={rule._id}
              className={clsx(
                'bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md',
                rule.isActive ? 'border-gray-100' : 'border-dashed border-gray-300 opacity-60'
              )}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  {rule.imageUrl ? (
                    <img src={rule.imageUrl} alt={rule.name} className="w-12 h-12 rounded-xl object-contain bg-gray-50 border border-gray-100 p-1" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                      <Car className="w-6 h-6 text-amber-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">{rule.name}</h3>
                    <p className="text-xs text-gray-400">{rule.model || 'No model specified'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {canWrite && (
                    <>
                      <button
                        onClick={() => handleToggleActive(rule)}
                        title={rule.isActive ? 'Deactivate' : 'Activate'}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        {rule.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                      <button onClick={() => openEdit(rule)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => openDelete(rule)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="p-5 space-y-4">
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
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {rule.seats} seats
                  </span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5" /> Driver ₹{rule.driverAllowance}
                  </span>
                  <span className="flex items-center gap-1">
                    GST {rule.gstPercent}%
                  </span>
                </div>

                {/* Local Packages */}
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
                          <div key={i} className="flex items-center justify-between bg-amber-50/50 rounded-lg px-3 py-2 border border-amber-100">
                            <span className="text-xs font-medium text-gray-700">{pkg.label}</span>
                            <span className="text-xs font-bold text-amber-700">₹{pkg.price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Type badge */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-mono rounded-md">
                    {rule.vehicleType}
                  </span>
                  <span className={clsx(
                    'px-2 py-1 text-xs font-semibold rounded-full',
                    rule.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  )}>
                    {rule.isActive ? '● Active' : '○ Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Add / Edit Modal ─── */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add New Vehicle Type' : `Edit — ${selected?.name}`} onClose={() => setModal(null)} wide>
          <div className="space-y-5">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Vehicle Type ID" required>
                <input
                  value={form.vehicleType}
                  onChange={(e) => handleChange('vehicleType', e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="sedan, suv, hatchback..."
                  className={inputCls}
                  disabled={modal === 'edit'}
                />
                <p className="text-xs text-gray-400 mt-1">Unique ID (lowercase, no spaces). Cannot be changed after creation.</p>
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
              <Field label="Image URL">
                <input value={form.imageUrl} onChange={(e) => handleChange('imageUrl', e.target.value)} placeholder="https://..." className={inputCls} />
              </Field>
              <Field label="Sort Order">
                <input type="number" value={form.sortOrder} onChange={(e) => handleChange('sortOrder', e.target.value)} min={0} className={inputCls} />
              </Field>
            </div>

            {/* Pricing */}
            <div className="border-t pt-5">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-amber-500" /> Pricing Configuration
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="₹/km One Way" required>
                  <input type="number" value={form.perKmOneway} onChange={(e) => handleChange('perKmOneway', e.target.value)} placeholder="13" className={inputCls} />
                </Field>
                <Field label="₹/km Round Trip" required>
                  <input type="number" value={form.perKmRound} onChange={(e) => handleChange('perKmRound', e.target.value)} placeholder="12" className={inputCls} />
                </Field>
                <Field label="Min KM (One Way)">
                  <input type="number" value={form.minKmOneway} onChange={(e) => handleChange('minKmOneway', e.target.value)} className={inputCls} />
                </Field>
                <Field label="Min KM/Day (Round)">
                  <input type="number" value={form.minKmPerDay} onChange={(e) => handleChange('minKmPerDay', e.target.value)} className={inputCls} />
                </Field>
                <Field label="Driver Allowance (OW)">
                  <input type="number" value={form.driverAllowance} onChange={(e) => handleChange('driverAllowance', e.target.value)} className={inputCls} />
                </Field>
                <Field label="Driver Allowance/Day (RT)">
                  <input type="number" value={form.driverAllowancePerDay} onChange={(e) => handleChange('driverAllowancePerDay', e.target.value)} className={inputCls} />
                </Field>
                <Field label="GST %">
                  <input type="number" value={form.gstPercent} onChange={(e) => handleChange('gstPercent', e.target.value)} min={0} max={30} className={inputCls} />
                </Field>
              </div>
            </div>

            {/* Local Packages */}
            <div className="border-t pt-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-500" /> Local / Rental Packages
                  <span className="text-xs font-normal text-gray-400">(Optional — for local/hourly trips)</span>
                </h4>
                <button type="button" onClick={addPackage} className={clsx(btnGhost, 'text-xs px-3 py-1.5')}>
                  <Plus className="w-3.5 h-3.5" /> Add Package
                </button>
              </div>
              {form.packages.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center py-4 border border-dashed rounded-lg">No packages added. Click "Add Package" to include local/rental options.</p>
              ) : (
                <div className="space-y-3">
                  {form.packages.map((pkg, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 relative">
                      <button
                        type="button"
                        onClick={() => removePackage(idx)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Field label="Label">
                          <input value={pkg.label} onChange={(e) => handlePackageChange(idx, 'label', e.target.value)} placeholder="8 Hrs / 80 Km" className={inputCls} />
                        </Field>
                        <Field label="Hours">
                          <input type="number" value={pkg.hours} onChange={(e) => handlePackageChange(idx, 'hours', e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="KM Included">
                          <input type="number" value={pkg.km} onChange={(e) => handlePackageChange(idx, 'km', e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Price (₹)">
                          <input type="number" value={pkg.price} onChange={(e) => handlePackageChange(idx, 'price', e.target.value)} placeholder="2200" className={inputCls} />
                        </Field>
                        <Field label="Extra ₹/km">
                          <input type="number" value={pkg.extraKmRate} onChange={(e) => handlePackageChange(idx, 'extraKmRate', e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Extra ₹/hr">
                          <input type="number" value={pkg.extraHourRate} onChange={(e) => handlePackageChange(idx, 'extraHourRate', e.target.value)} className={inputCls} />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => handleChange('isActive', !form.isActive)}
                  className={clsx(
                    'w-11 h-6 rounded-full relative transition-colors cursor-pointer',
                    form.isActive ? 'bg-green-500' : 'bg-gray-300'
                  )}
                >
                  <div className={clsx(
                    'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow',
                    form.isActive ? 'left-5' : 'left-0.5'
                  )} />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {form.isActive ? 'Active (visible on website)' : 'Inactive (hidden from website)'}
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={() => setModal(null)} className={btnGhost}>Cancel</button>
              <button onClick={handleSave} disabled={saving} className={btnPrimary}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {modal === 'add' ? 'Add Vehicle Type' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Delete Modal ─── */}
      {modal === 'delete' && (
        <Modal title="Delete Vehicle Type" onClose={() => setModal(null)}>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">Delete "{selected?.name}"?</p>
              <p className="text-sm text-gray-500 mt-1">
                This will remove <strong>{selected?.vehicleType}</strong> from the website booking options.
                Any existing bookings with this vehicle type will not be affected.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button onClick={() => setModal(null)} className={btnGhost}>Cancel</button>
              <button onClick={handleDelete} disabled={saving} className={btnDanger}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Vehicle Type
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
