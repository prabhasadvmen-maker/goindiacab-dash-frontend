import { useState, useCallback, useEffect } from 'react';
import { Globe, MapPin, ListChecks, CheckCircle2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { useWebsiteAdmin } from '../../hooks/useWebsiteAdmin';
import ServiceCities from './website/ServiceCities';
import PolicyManager from './website/PolicyManager';

const TABS = [
  { id: 'cities', label: 'Service Cities', icon: MapPin },
  { id: 'policies', label: 'Inclusions & Exclusions', icon: ListChecks },
];

// Everything here is read from and saved to the API; nothing on this page is a fixed list.
export default function WebsiteManagement() {
  const { api, canWrite } = useWebsiteAdmin();
  const [tab, setTab] = useState('cities');
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => setToast({ msg, type, at: Date.now() }), []);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

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

      <div className="flex items-start gap-4 bg-white px-5 py-4 md:px-6 md:py-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
          <Globe className="w-5 h-5 text-amber-600" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Website Management</h2>
          <p className="text-gray-500 mt-1 text-sm">
            Cities customers can book from, and the inclusions / exclusions shown at checkout. Changes reach the website within seconds.
            {!canWrite && <span className="ml-1 font-semibold text-amber-600">View only: SuperAdmin can edit.</span>}
          </p>
        </div>
      </div>

      <div role="tablist" className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors',
              tab === t.id ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-800'
            )}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'cities' && <ServiceCities api={api} canWrite={canWrite} showToast={showToast} />}
      {tab === 'policies' && <PolicyManager api={api} canWrite={canWrite} showToast={showToast} />}
    </div>
  );
}
