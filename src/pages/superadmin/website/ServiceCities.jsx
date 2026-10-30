import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Pencil, Trash2, X, Loader2, ChevronLeft, ChevronRight, CheckCircle2, MapPin } from 'lucide-react';
import clsx from 'clsx';

const inputCls = 'w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:bg-gray-100 transition';
const btnBase = 'inline-flex items-center justify-center gap-2 h-10 text-sm font-semibold px-4 rounded-lg whitespace-nowrap transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
const btnPrimary = `${btnBase} bg-amber-500 hover:bg-amber-600 text-white shadow-sm`;
const btnGhost = `${btnBase} border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium`;

const PAGE_SIZE = 25;
const EMPTY = { name: '', state: '', isPopular: false, isActive: true, hourlyRental: false, hourlyOrder: 0 };

const FILTERS = [
  { id: '', label: 'All', count: 'total' },
  { id: 'hourly', label: 'Hourly Rental', count: 'hourly' },
  { id: 'popular', label: 'Popular', count: 'popular' },
  { id: 'inactive', label: 'Inactive', count: null },
];

function Toggle({ on, onClick, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={clsx('w-10 h-6 rounded-full relative transition-colors shrink-0 disabled:cursor-default disabled:opacity-60', on ? 'bg-green-500' : 'bg-gray-300')}
    >
      <span className={clsx('w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow', on ? 'left-[18px]' : 'left-0.5')} />
    </button>
  );
}

// Cities customers can book from. Hourly Rental cities are the only pickups allowed for hourly rentals.
export default function ServiceCities({ api, canWrite, showToast }) {
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, popular: 0, hourly: 0 });
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const loadId = useRef(0);

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    const id = ++loadId.current;
    setLoading(true);
    try {
      const { data } = await api('get', '/cities', undefined, { page, limit: PAGE_SIZE, search: query || undefined, filter: filter || undefined });
      if (id !== loadId.current) return; // a newer request already won
      setRows(data.data);
      setTotal(data.total);
      setPages(data.pages);
      setCounts(data.counts);
    } catch {
      if (id === loadId.current) showToast('Failed to load cities', 'error');
    } finally {
      if (id === loadId.current) setLoading(false);
    }
  }, [api, page, query, filter, showToast]);

  useEffect(() => { load(); }, [load]);

  const patch = async (city, changes, okMsg) => {
    const before = rows;
    setRows((list) => list.map((c) => (c._id === city._id ? { ...c, ...changes } : c)));
    try {
      await api('put', `/cities/${city._id}`, changes);
      if (okMsg) showToast(okMsg);
      load(); // refresh counts and ordering
    } catch (err) {
      setRows(before);
      showToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  const openAdd = () => { setEditingId(null); setForm({ ...EMPTY }); };
  const openEdit = (c) => { setEditingId(c._id); setForm({ ...EMPTY, ...c }); };

  const save = async () => {
    if (!form.name.trim()) return showToast('City name is required', 'error');
    setSaving(true);
    try {
      const payload = { ...form, name: form.name.trim(), state: (form.state || '').trim(), hourlyOrder: Number(form.hourlyOrder) || 0 };
      if (editingId) await api('put', `/cities/${editingId}`, payload);
      else await api('post', '/cities', payload);
      showToast(editingId ? 'City updated' : 'City added');
      setForm(null);
      load();
    } catch (err) {
      showToast(err.response?.status === 409 ? 'A city with this name already exists' : err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.name}"? It will disappear from the website suggestions.`)) return;
    try {
      await api('delete', `/cities/${c._id}`);
      showToast('City deleted');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const stat = (label, value, tone) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className={clsx('text-xl font-bold leading-tight', tone)}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stat('Total cities', counts.total, 'text-gray-900')}
        {stat('Active', counts.active, 'text-green-600')}
        {stat('Popular', counts.popular, 'text-amber-600')}
        {stat('Hourly Rental cities', counts.hourly, 'text-blue-600')}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => { setFilter(f.id); setPage(1); }}
                className={clsx(
                  'h-8 px-3 rounded-full text-xs font-semibold border transition-colors',
                  filter === f.id ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                )}
              >
                {f.label}{f.count ? ` (${counts[f.count]})` : ''}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-56">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search city..." className={clsx(inputCls, 'pl-9')} />
            </div>
            {canWrite && <button onClick={openAdd} className={btnPrimary}><Plus className="w-4 h-4" /> Add City</button>}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
                <th className="px-4 py-2.5 font-semibold">City</th>
                <th className="px-3 py-2.5 font-semibold text-center">Active</th>
                <th className="px-3 py-2.5 font-semibold text-center">Popular</th>
                <th className="px-3 py-2.5 font-semibold text-center">Hourly Rental</th>
                <th className="px-3 py-2.5 font-semibold text-center">Hourly order</th>
                {canWrite && <th className="px-4 py-2.5" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && rows.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-amber-500 inline" /></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-400">No cities match.</td></tr>
              ) : rows.map((c) => (
                <tr key={c._id} className={clsx('hover:bg-gray-50/70', !c.isActive && 'opacity-60')}>
                  <td className="px-4 py-2.5">
                    <p className="font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.state || '—'}</p>
                  </td>
                  <td className="px-3 py-2.5 text-center"><Toggle on={c.isActive} disabled={!canWrite} label={`${c.name} active`} onClick={() => patch(c, { isActive: !c.isActive }, `${c.name} ${!c.isActive ? 'activated' : 'deactivated'}`)} /></td>
                  <td className="px-3 py-2.5 text-center"><Toggle on={c.isPopular} disabled={!canWrite} label={`${c.name} popular`} onClick={() => patch(c, { isPopular: !c.isPopular })} /></td>
                  <td className="px-3 py-2.5 text-center">
                    <Toggle
                      on={c.hourlyRental}
                      disabled={!canWrite}
                      label={`${c.name} hourly rental`}
                      onClick={() => patch(c, { hourlyRental: !c.hourlyRental }, `${c.name} ${!c.hourlyRental ? 'added to' : 'removed from'} Hourly Rental cities`)}
                    />
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {c.hourlyRental ? (
                      <input
                        type="number"
                        min={0}
                        defaultValue={c.hourlyOrder}
                        key={`${c._id}-${c.hourlyOrder}`}
                        disabled={!canWrite}
                        aria-label={`${c.name} hourly order`}
                        onBlur={(e) => { const v = Math.max(0, Math.floor(Number(e.target.value) || 0)); if (v !== c.hourlyOrder) patch(c, { hourlyOrder: v }); }}
                        className="w-16 h-8 text-center border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-gray-100"
                      />
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  {canWrite && (
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(c)} title="Edit" className="p-2 rounded-lg text-blue-500 hover:bg-blue-50"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => remove(c)} title="Delete" className="p-2 rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
          <span>{total} {total === 1 ? 'city' : 'cities'}{loading && <Loader2 className="w-3.5 h-3.5 animate-spin inline ml-2" />}</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={clsx(btnGhost, 'h-8 px-2')} aria-label="Previous page"><ChevronLeft className="w-4 h-4" /></button>
            <span>Page {page} of {pages}</span>
            <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className={clsx(btnGhost, 'h-8 px-2')} aria-label="Next page"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <p className="flex items-start gap-2 text-xs text-gray-500">
        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <span><b>Hourly Rental</b> cities are the only pickups customers can choose for hourly rentals (in the order set above). Other trips can start anywhere; <b>Popular</b> cities are the quick suggestions on the website.</span>
      </p>

      {form && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setForm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">{editingId ? 'Edit City' : 'Add City'}</h3>
              <button onClick={() => setForm(null)} aria-label="Close" className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-gray-600 mb-1.5 block">City name <span className="text-red-500">*</span></span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mohali" className={inputCls} />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-gray-600 mb-1.5 block">State</span>
                <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="e.g. Punjab" className={inputCls} />
              </label>
              <div className="space-y-3">
                {[
                  ['isActive', 'Active', 'Shown in website suggestions'],
                  ['isPopular', 'Popular', 'Shown as a quick suggestion'],
                  ['hourlyRental', 'Hourly Rental city', 'Customers can start an hourly rental here'],
                ].map(([key, label, hint]) => (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <div><p className="text-sm font-semibold text-gray-900">{label}</p><p className="text-xs text-gray-500">{hint}</p></div>
                    <Toggle on={form[key]} label={label} onClick={() => setForm({ ...form, [key]: !form[key] })} />
                  </div>
                ))}
              </div>
              {form.hourlyRental && (
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 mb-1.5 block">Position in the Hourly Rental list</span>
                  <input type="number" min={0} value={form.hourlyOrder} onChange={(e) => setForm({ ...form, hourlyOrder: e.target.value })} className={inputCls} />
                  <span className="text-xs text-gray-400 mt-1 block">Lower numbers come first; same number sorts by name.</span>
                </label>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setForm(null)} className={btnGhost}>Cancel</button>
              <button onClick={save} disabled={saving} className={btnPrimary}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} {editingId ? 'Save Changes' : 'Add City'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
