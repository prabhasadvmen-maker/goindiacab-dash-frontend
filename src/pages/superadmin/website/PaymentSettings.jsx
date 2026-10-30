import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle2, Percent, Clock, Wallet, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';

const inputCls = 'w-full h-10 border border-gray-300 rounded-lg px-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:bg-gray-100 disabled:text-gray-500 transition';
const btnPrimary = 'inline-flex items-center justify-center gap-2 h-10 text-sm font-semibold px-5 rounded-lg whitespace-nowrap bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed';

const humanMinutes = (m) => {
  const n = Number(m);
  if (!Number.isFinite(n) || n < 0) return '';
  if (n === 0) return 'No free cancellation';
  if (n < 60) return `${n} minutes before pickup`;
  const h = Math.floor(n / 60);
  const rest = n % 60;
  return `${h} hr${h > 1 ? 's' : ''}${rest ? ` ${rest} min` : ''} before pickup`;
};

function Toggle({ on, onClick, disabled, label }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={onClick}
      className={clsx('w-11 h-6 rounded-full relative transition-colors shrink-0 disabled:opacity-60', on ? 'bg-green-500' : 'bg-gray-300')}>
      <span className={clsx('w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow', on ? 'left-[22px]' : 'left-0.5')} />
    </button>
  );
}

function Row({ icon: Icon, title, hint, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6 py-5 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3 sm:w-80 shrink-0">
        <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><Icon className="w-4 h-4" /></span>
        <div><p className="text-sm font-semibold text-gray-900">{title}</p><p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{hint}</p></div>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// What customers pay online and when they can cancel for free. Saved to the server; the website picks it up within seconds.
export default function PaymentSettings({ api, canWrite, showToast }) {
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api('get', '/payment-settings');
      setSaved(data.data);
      setForm(data.data);
    } catch {
      showToast('Failed to load payment settings', 'error');
    }
  }, [api, showToast]);

  useEffect(() => { load(); }, [load]);

  if (!form) return <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 animate-spin text-amber-500" /></div>;

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const num = (v) => (v === '' ? '' : Number(v));
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api('put', '/payment-settings', {
        partPaymentPercent: Number(form.partPaymentPercent),
        freeCancelMinutes: Number(form.freeCancelMinutes),
        cashToDriverEnabled: !!form.cashToDriverEnabled,
        cashMaxOpenBookings: Number(form.cashMaxOpenBookings),
      });
      setSaved(data.data);
      setForm(data.data);
      showToast('Payment settings saved');
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const example = Math.round((10000 * (Number(form.partPaymentPercent) || 0)) / 100);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 md:px-6">
      <Row icon={Percent} title="Part payment" hint="The share of the fare a customer pays online to confirm the booking. The rest is paid to the driver.">
        <div className="flex items-center gap-3">
          <div className="relative w-28">
            <input type="number" min={1} max={100} step={1} value={form.partPaymentPercent} disabled={!canWrite} aria-label="Part payment percent"
              onChange={(e) => set('partPaymentPercent', num(e.target.value))} className={clsx(inputCls, 'pr-8')} />
            <span className="absolute right-3 top-2.5 text-sm text-gray-400">%</span>
          </div>
          <p className="text-xs text-gray-500">Example: on a ₹10,000 fare the customer pays <b className="text-gray-800">₹{example.toLocaleString('en-IN')}</b> now.</p>
        </div>
      </Row>

      <Row icon={Clock} title="Free cancellation window" hint="Customers can cancel without a charge up to this long before pickup. Use 0 to switch free cancellation off.">
        <div className="flex items-center gap-3">
          <div className="relative w-28">
            <input type="number" min={0} max={10080} step={1} value={form.freeCancelMinutes} disabled={!canWrite} aria-label="Free cancellation minutes"
              onChange={(e) => set('freeCancelMinutes', num(e.target.value))} className={clsx(inputCls, 'pr-12')} />
            <span className="absolute right-3 top-2.5 text-sm text-gray-400">min</span>
          </div>
          <p className="text-xs text-gray-500">{humanMinutes(form.freeCancelMinutes)}</p>
        </div>
      </Row>

      <Row icon={Wallet} title="Pay to driver" hint="Lets a customer book now and pay the whole fare to the driver after the ride. Nothing is charged online.">
        <div className="flex items-center gap-3">
          <Toggle on={!!form.cashToDriverEnabled} disabled={!canWrite} label="Allow pay to driver" onClick={() => set('cashToDriverEnabled', !form.cashToDriverEnabled)} />
          <span className="text-sm font-semibold text-gray-800">{form.cashToDriverEnabled ? 'Shown at checkout' : 'Hidden at checkout'}</span>
        </div>
      </Row>

      <Row icon={ShieldAlert} title="Open pay-to-driver bookings per mobile" hint="Unpaid bookings can be misused, so one mobile number can hold only this many upcoming pay-to-driver bookings at a time.">
        <div className="relative w-28">
          <input type="number" min={1} max={20} step={1} value={form.cashMaxOpenBookings} disabled={!canWrite || !form.cashToDriverEnabled} aria-label="Open pay to driver bookings per mobile"
            onChange={(e) => set('cashMaxOpenBookings', num(e.target.value))} className={inputCls} />
        </div>
      </Row>

      <div className="flex items-center justify-end gap-3 py-4">
        {!canWrite && <span className="text-xs font-semibold text-amber-600">View only: SuperAdmin can edit.</span>}
        {canWrite && dirty && <button onClick={() => setForm(saved)} className="h-10 px-4 text-sm font-medium text-gray-600 hover:text-gray-900">Reset</button>}
        {canWrite && (
          <button onClick={save} disabled={saving || !dirty} className={btnPrimary}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save changes
          </button>
        )}
      </div>
    </div>
  );
}
