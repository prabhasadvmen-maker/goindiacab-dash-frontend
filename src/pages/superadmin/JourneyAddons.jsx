import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Plus, Pencil, Trash2, X, Loader2, CheckCircle2, Info, Check } from 'lucide-react';
import clsx from 'clsx';

const inputCls = 'w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition';
const btnBase = 'inline-flex items-center justify-center gap-2 h-10 text-sm font-semibold px-4 rounded-lg whitespace-nowrap transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
const btnPrimary = `${btnBase} bg-amber-500 hover:bg-amber-600 text-white shadow-sm`;
const btnGhost = `${btnBase} border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium`;

const TRIP_OPTIONS = [
  { value: 'oneway', label: 'One Way' },
  { value: 'roundtrip', label: 'Round Trip' },
  { value: 'airport', label: 'Airport' },
  { value: 'local', label: 'Hourly Rental' },
];

const ALL_TRIPS = TRIP_OPTIONS.map((o) => o.value);
// An empty tripTypes list means "every trip type"; the row shows the real on/off state of each section.
const shownIn = (a) => (a.tripTypes?.length ? a.tripTypes : ALL_TRIPS);

const EMPTY = { code: '', title: '', price: '', unit: 'flat', badge: '', tripTypes: [], sortOrder: 0, isActive: true };

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
const priceLabel = (a) => (a.unit === 'perKm' ? `₹${a.price}/km` : `₹${a.price}`);

// Extras customers can tick at checkout ("Personalize your journey"). Prices are applied by the server.
export default function JourneyAddons({ api, canWrite, showToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null); // null = closed
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api('get', '/addons');
      setItems(data.data || []);
    } catch {
      showToast('Failed to load add-ons', 'error');
    } finally {
      setLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleTrip = (v) => set('tripTypes', form.tripTypes.includes(v) ? form.tripTypes.filter((x) => x !== v) : [...form.tripTypes, v]);

  const openAdd = () => { setEditingId(null); setForm({ ...EMPTY, sortOrder: items.length + 1 }); };
  const openEdit = (a) => { setEditingId(a._id); setForm({ ...EMPTY, ...a }); };

  const save = async () => {
    if (!form.title.trim()) return showToast('Add-on title is required', 'error');
    if (!(Number(form.price) > 0)) return showToast('Enter a price greater than 0', 'error');
    const code = editingId ? form.code : slug(form.code || form.title);
    if (!code) return showToast('Add-on code is required', 'error');
    setSaving(true);
    try {
      const payload = { ...form, code, title: form.title.trim(), badge: form.badge.trim(), price: Number(form.price), sortOrder: Number(form.sortOrder) || 0 };
      if (editingId) await api('put', `/addons/${editingId}`, payload);
      else await api('post', '/addons', payload);
      showToast(editingId ? 'Add-on updated' : 'Add-on added');
      setForm(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // One-click show/hide of an add-on for a single section (One Way, Round Trip, Airport, Hourly).
  const toggleSection = async (a, value) => {
    const current = shownIn(a);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    if (next.length === 0) {
      showToast('Keep at least one section on. To hide this add-on everywhere, use Hide.', 'error');
      return;
    }
    const tripTypes = next.length === ALL_TRIPS.length ? [] : ALL_TRIPS.filter((v) => next.includes(v)); // all four = no restriction
    const before = items;
    setItems((list) => list.map((x) => (x._id === a._id ? { ...x, tripTypes } : x)));
    try {
      await api('put', `/addons/${a._id}`, { tripTypes });
      const label = TRIP_OPTIONS.find((o) => o.value === value).label;
      showToast(`${a.title}: ${next.includes(value) ? 'now shown in' : 'hidden from'} ${label}`);
    } catch {
      setItems(before);
      showToast('Could not update this section', 'error');
    }
  };

  const toggleActive = async (a) => {
    try {
      await api('put', `/addons/${a._id}`, { isActive: !a.isActive });
      showToast(`${a.title} ${!a.isActive ? 'is now live on the website' : 'hidden from the website'}`);
      load();
    } catch {
      showToast('Toggle failed', 'error');
    }
  };

  const remove = async (a) => {
    if (!window.confirm(`Delete "${a.title}"? Existing bookings keep their add-on.`)) return;
    try {
      await api('delete', `/addons/${a._id}`);
      showToast('Add-on deleted');
      load();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5" /></span>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900">Journey Add-ons</h3>
            <p className="text-xs text-gray-500">Optional extras shown at checkout under “Personalize Your Journey”. Only <b>live</b> add-ons are visible to customers.</p>
          </div>
        </div>
        {canWrite && <button onClick={openAdd} className={btnPrimary}><Plus className="w-4 h-4" /> Add Add-on</button>}
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 py-6 border border-dashed border-gray-200 rounded-lg">
            <Info className="w-4 h-4" /> No add-ons yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((a) => (
              <li key={a._id} className={clsx('flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3', a.isActive ? 'border-gray-200 bg-white' : 'border-dashed border-gray-300 bg-gray-50')}>
                <div className="flex-1 min-w-[12rem]">
                  <p className={clsx('text-sm font-semibold', a.isActive ? 'text-gray-900' : 'text-gray-500')}>
                    {a.title}
                    {a.badge && <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 align-middle">{a.badge}</span>}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{a.unit === 'perKm' ? 'Charged per km of billed distance' : 'Charged once per booking'}</p>
                </div>
                <span className="text-sm font-extrabold text-gray-900">{priceLabel(a)}</span>
                <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full', a.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600')}>
                  {a.isActive ? '● Live' : '○ Hidden'}
                </span>
                {canWrite && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleActive(a)} className={clsx(btnGhost, 'h-8 text-xs px-3')}>{a.isActive ? 'Hide' : 'Make live'}</button>
                    <button onClick={() => openEdit(a)} title="Edit" className="p-2 rounded-lg text-blue-500 hover:bg-blue-50"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(a)} title="Delete" className="p-2 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
                <div className="basis-full flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mr-1">Show in</span>
                  {TRIP_OPTIONS.map((o) => {
                    const on = shownIn(a).includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        role="switch"
                        aria-checked={on}
                        disabled={!canWrite}
                        onClick={() => toggleSection(a, o.value)}
                        title={on ? `Shown in ${o.label}. Click to hide.` : `Hidden in ${o.label}. Click to show.`}
                        className={clsx(
                          'inline-flex items-center gap-1 h-7 px-2.5 rounded-full border text-xs font-semibold transition-colors disabled:cursor-default',
                          on ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100' : 'bg-white border-gray-300 text-gray-400 hover:bg-gray-50 line-through'
                        )}
                      >
                        {on ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {form && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-6" onClick={() => setForm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">{editingId ? 'Edit Add-on' : 'New Add-on'}</h3>
              <button onClick={() => setForm(null)} aria-label="Close" className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-gray-600 mb-1.5 block">Title shown to customer <span className="text-red-500">*</span></span>
                <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Cab with Luggage Carrier" className={inputCls} />
                <span className="text-xs text-gray-400 mt-1 block">Tip: write <b>{'{city}'}</b> to insert the destination city, e.g. “Pause in {'{city}'} &amp; Go (Up to 6 hours)”.</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 mb-1.5 block">Price (₹) <span className="text-red-500">*</span></span>
                  <input type="number" min={0} step="0.1" value={form.price} onChange={(e) => set('price', e.target.value)} className={inputCls} />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 mb-1.5 block">Charged</span>
                  <select value={form.unit} onChange={(e) => set('unit', e.target.value)} className={inputCls}>
                    <option value="flat">Once per booking</option>
                    <option value="perKm">Per km (× billed km)</option>
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 mb-1.5 block">Badge (optional)</span>
                  <input value={form.badge} onChange={(e) => set('badge', e.target.value)} placeholder="Most Popular" className={inputCls} />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 mb-1.5 block">Sort order</span>
                  <input type="number" min={0} value={form.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} className={inputCls} />
                </label>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-600 mb-1.5 block">Available for <span className="font-normal text-gray-400">(none ticked = all trip types)</span></span>
                <div className="flex flex-wrap gap-2">
                  {TRIP_OPTIONS.map((o) => (
                    <button key={o.value} type="button" onClick={() => toggleTrip(o.value)}
                      className={clsx('h-9 px-3 rounded-lg text-xs font-semibold border', form.tripTypes.includes(o.value) ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2.5 text-sm font-medium text-gray-800">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="w-4 h-4 accent-amber-500" />
                Live on the website
              </label>
              <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                Add-on prices are final (GST included) and are added on top of the fare. Coupons discount the fare only.
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setForm(null)} className={btnGhost}>Cancel</button>
              <button onClick={save} disabled={saving} className={btnPrimary}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} {editingId ? 'Save Changes' : 'Add Add-on'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
