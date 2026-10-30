import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, CheckCircle2, Check, ArrowUp, ArrowDown, Info } from 'lucide-react';
import clsx from 'clsx';
import { useTripTypes } from '../../../hooks/useWebsiteAdmin';

const btnBase = 'inline-flex items-center justify-center gap-2 h-10 text-sm font-semibold px-4 rounded-lg whitespace-nowrap transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
const btnPrimary = `${btnBase} bg-amber-500 hover:bg-amber-600 text-white shadow-sm`;
const btnGhost = `${btnBase} border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium`;

const KINDS = [
  { id: 'included', label: 'Inclusions', dot: 'bg-green-500', text: 'text-green-700', empty: 'No extra inclusions. The checkout already lists base fare, km, driver allowance, GST, bags and AC from the vehicle\'s fare.' },
  { id: 'excluded', label: 'Exclusions', dot: 'bg-red-500', text: 'text-red-600', empty: 'No extra exclusions. The checkout already lists the extra km / hour charges from the vehicle\'s fare.' },
];

const EMPTY = { kind: 'excluded', text: '', tripTypes: [] };

// The extra lines shown under "Inclusions / Exclusions" at checkout, with the trip types each one applies to.
export default function PolicyManager({ api, canWrite, showToast }) {
  const { tripTypes: TRIPS, loading: tripsLoading } = useTripTypes(api);
  const ALL = TRIPS.map((t) => t.value);
  const shownIn = (p) => (p.tripTypes.length ? p.tripTypes : ALL);

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [editingIdx, setEditingIdx] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api('get', '/policies');
      setList(data.data);
    } catch {
      showToast('Failed to load inclusions / exclusions', 'error');
    } finally {
      setLoading(false);
    }
  }, [api, showToast]);

  useEffect(() => { load(); }, [load]);

  // The whole list is saved in one request so order and content always match what the admin sees.
  const commit = async (next, okMsg) => {
    const before = list;
    setList(next);
    setSaving(true);
    try {
      const { data } = await api('put', '/policies', { policies: next });
      setList(data.data);
      if (okMsg) showToast(okMsg);
      return true;
    } catch (err) {
      setList(before);
      showToast(err.response?.data?.message || 'Save failed', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (idx, value) => {
    const current = shownIn(list[idx]);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    if (next.length === 0) return showToast('Keep at least one section on. To remove the line everywhere, delete it.', 'error');
    const tripTypes = next.length === ALL.length ? [] : ALL.filter((v) => next.includes(v));
    commit(list.map((p, i) => (i === idx ? { ...p, tripTypes } : p)));
  };

  const move = (idx, dir) => {
    const kind = list[idx].kind;
    let j = idx + dir;
    while (j >= 0 && j < list.length && list[j].kind !== kind) j += dir; // swap with the neighbour of the same kind
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[idx], next[j]] = [next[j], next[idx]];
    commit(next);
  };

  const remove = (idx) => {
    if (!window.confirm(`Delete "${list[idx].text}"?`)) return;
    commit(list.filter((_, i) => i !== idx), 'Line deleted');
  };

  const openAdd = (kind) => { setEditingIdx(null); setForm({ ...EMPTY, kind }); };
  const openEdit = (idx) => { setEditingIdx(idx); setForm({ ...list[idx] }); };

  const saveForm = async () => {
    const text = form.text.trim();
    if (!text) return showToast('Text is required', 'error');
    const item = { kind: form.kind, text, tripTypes: form.tripTypes };
    const next = editingIdx === null ? [...list, item] : list.map((p, i) => (i === editingIdx ? item : p));
    if (await commit(next, editingIdx === null ? 'Line added' : 'Line updated')) setForm(null);
  };

  const toggleFormTrip = (v) => setForm((f) => ({ ...f, tripTypes: f.tripTypes.includes(v) ? f.tripTypes.filter((x) => x !== v) : [...f.tripTypes, v] }));

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-4">
      <p className="flex items-start gap-2 text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2.5">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
        <span>
          Add lines here for rules like <i>Toll / State tax</i> or <i>Night charge ₹300</i>. Use the <b>Show in</b> chips to choose which trip types a line appears on.
          Fare-based lines (km included, extra km / hour rates, GST) are generated automatically from each vehicle's pricing.
        </span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {KINDS.map((k) => {
          const items = list.map((p, idx) => ({ p, idx })).filter(({ p }) => p.kind === k.id);
          return (
            <section key={k.id} className="bg-white border border-gray-200 rounded-2xl">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
                <h3 className={clsx('flex items-center gap-2 text-sm font-bold', k.text)}>
                  <span className={clsx('w-2 h-2 rounded-full', k.dot)} /> {k.label} <span className="text-gray-400 font-medium">({items.length})</span>
                </h3>
                {canWrite && <button onClick={() => openAdd(k.id)} className={clsx(btnGhost, 'h-8 text-xs px-3')}><Plus className="w-3.5 h-3.5" /> Add line</button>}
              </div>
              <ul className="p-3 space-y-2">
                {items.length === 0 && <li className="text-xs text-gray-400 px-1 py-3">{k.empty}</li>}
                {items.map(({ p, idx }, pos) => (
                  <li key={idx} className="rounded-xl border border-gray-200 px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      <p className="flex-1 text-sm font-medium text-gray-900 break-words">{p.text}</p>
                      {canWrite && (
                        <div className="flex items-center shrink-0">
                          <button disabled={saving || pos === 0} onClick={() => move(idx, -1)} title="Move up" className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                          <button disabled={saving || pos === items.length - 1} onClick={() => move(idx, 1)} title="Move down" className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                          <button onClick={() => openEdit(idx)} title="Edit" className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => remove(idx)} title="Delete" className="p-1.5 rounded-md text-red-500 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mr-0.5">Show in</span>
                      {tripsLoading && <Loader2 className="w-3 h-3 animate-spin text-gray-300" />}
                      {TRIPS.map((t) => {
                        const on = shownIn(p).includes(t.value);
                        return (
                          <button
                            key={t.value}
                            type="button"
                            role="switch"
                            aria-checked={on}
                            disabled={!canWrite || saving}
                            onClick={() => toggleSection(idx, t.value)}
                            title={on ? `Shown in ${t.label}. Click to hide.` : `Hidden in ${t.label}. Click to show.`}
                            className={clsx(
                              'inline-flex items-center gap-1 h-6 px-2 rounded-full border text-[11px] font-semibold transition-colors disabled:cursor-default',
                              on ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100' : 'bg-white border-gray-300 text-gray-400 hover:bg-gray-50 line-through'
                            )}
                          >
                            {on ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {form && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setForm(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">{editingIdx === null ? 'Add line' : 'Edit line'}</h3>
              <button onClick={() => setForm(null)} aria-label="Close" className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <span className="text-xs font-semibold text-gray-600 mb-1.5 block">Type</span>
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
                  {KINDS.map((k) => (
                    <button key={k.id} type="button" onClick={() => setForm({ ...form, kind: k.id })}
                      className={clsx('h-9 rounded-lg text-sm font-semibold', form.kind === k.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500')}>
                      {k.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="text-xs font-semibold text-gray-600 mb-1.5 block">Text shown to the customer <span className="text-red-500">*</span></span>
                <textarea rows={3} maxLength={200} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })}
                  placeholder="e.g. Night charge ₹300 extra if the driver drives between 10 PM and 6 AM"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400" />
                <span className="text-xs text-gray-400 mt-1 block text-right">{form.text.length}/200</span>
              </label>
              <div>
                <span className="text-xs font-semibold text-gray-600 mb-1.5 block">Show in <span className="font-normal text-gray-400">(none ticked = all trip types)</span></span>
                <div className="flex flex-wrap gap-2">
                  {TRIPS.map((t) => (
                    <button key={t.value} type="button" onClick={() => toggleFormTrip(t.value)}
                      className={clsx('h-9 px-3 rounded-lg text-xs font-semibold border', form.tripTypes.includes(t.value) ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50')}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setForm(null)} className={btnGhost}>Cancel</button>
              <button onClick={saveForm} disabled={saving} className={btnPrimary}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} {editingIdx === null ? 'Add line' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
