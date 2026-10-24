import React, { useState } from 'react';
import { Globe, MapPin, Search, Plus, Pencil, Trash2, X } from 'lucide-react';
import clsx from 'clsx';

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B]';
const btnPrimary = 'inline-flex items-center gap-2 bg-[#F59E0B] hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg';

const DEFAULT_LOCATIONS = [
  { name: 'Agra', state: 'Uttar Pradesh', isPopular: true },
  { name: 'Ajmer', state: 'Rajasthan', isPopular: false },
  { name: 'Aligarh', state: 'Uttar Pradesh', isPopular: false },
  { name: 'Almora', state: 'Uttarakhand', isPopular: false },
  { name: 'Amritsar', state: 'Punjab', isPopular: true },
  { name: 'Ayodhya', state: 'Uttar Pradesh', isPopular: true },
  { name: 'Ambala', state: 'Haryana', isPopular: false },
  { name: 'Anandpur Sahib', state: 'Punjab', isPopular: false },
  { name: 'Abu Road', state: 'Rajasthan', isPopular: false },
  { name: 'Bahadurgarh', state: 'Haryana' },
  { name: 'Bareilly', state: 'Uttar Pradesh' },
  { name: 'Bharatpur', state: 'Rajasthan' },
  { name: 'Bhimtal', state: 'Uttarakhand' },
  { name: 'Bhiwani', state: 'Haryana' },
  { name: 'Bikaner', state: 'Rajasthan' },
  { name: 'Bilaspur', state: 'Himachal Pradesh' },
  { name: 'Bulandshahr', state: 'Uttar Pradesh' },
  { name: 'Budaun', state: 'Uttar Pradesh' },
  { name: 'Chandigarh', state: 'Chandigarh', isPopular: true },
  { name: 'Chamba', state: 'Himachal Pradesh' },
  { name: 'Chamba', state: 'Uttarakhand' },
  { name: 'Chittorgarh', state: 'Rajasthan' },
  { name: 'Churu', state: 'Rajasthan' },
  { name: 'Corbett / Ramnagar', state: 'Uttarakhand' },
  { name: 'Delhi', state: 'Delhi', isPopular: true },
  { name: 'Dehradun', state: 'Uttarakhand', isPopular: true },
  { name: 'Dharamshala', state: 'Himachal Pradesh', isPopular: true },
  { name: 'Dhanaulti', state: 'Uttarakhand' },
  { name: 'Dausa', state: 'Rajasthan' },
  { name: 'Dholpur', state: 'Rajasthan' },
  { name: 'Dwarka', state: 'Delhi' },
  { name: 'Etah', state: 'Uttar Pradesh' },
  { name: 'Etawah', state: 'Uttar Pradesh' },
  { name: 'Faridabad', state: 'Haryana' },
  { name: 'Fatehpur Sikri', state: 'Uttar Pradesh' },
  { name: 'Firozabad', state: 'Uttar Pradesh' },
  { name: 'Fatehabad', state: 'Haryana' },
  { name: 'Ghaziabad', state: 'Uttar Pradesh' },
  { name: 'Greater Noida', state: 'Uttar Pradesh' },
  { name: 'Gurugram', state: 'Haryana' },
  { name: 'Ganganagar', state: 'Rajasthan' },
  { name: 'Govardhan', state: 'Uttar Pradesh' },
  { name: 'Gokul', state: 'Uttar Pradesh' },
  { name: 'Gaurikund', state: 'Uttarakhand' },
  { name: 'Gorakhpur', state: 'Uttar Pradesh' },
  { name: 'Haridwar', state: 'Uttarakhand', isPopular: true },
  { name: 'Haldwani', state: 'Uttarakhand' },
  { name: 'Hapur', state: 'Uttar Pradesh' },
  { name: 'Hisar', state: 'Haryana' },
  { name: 'Hamirpur', state: 'Himachal Pradesh' },
  { name: 'Hoshiarpur', state: 'Punjab' },
  { name: 'Hanumangarh', state: 'Rajasthan' },
  { name: 'Hathras', state: 'Uttar Pradesh' },
  { name: 'Indri', state: 'Haryana' },
  { name: 'Indergarh', state: 'Rajasthan' },
  { name: 'Jaipur', state: 'Rajasthan', isPopular: true },
  { name: 'Jalandhar', state: 'Punjab', isPopular: false },
  { name: 'Jammu', state: 'Jammu & Kashmir', isPopular: true },
  { name: 'Jodhpur', state: 'Rajasthan', isPopular: true },
  { name: 'Jhansi', state: 'Uttar Pradesh' },
  { name: 'Jim Corbett', state: 'Uttarakhand' },
  { name: 'Jaisalmer', state: 'Rajasthan' },
  { name: 'Jibhi', state: 'Himachal Pradesh' },
  { name: 'Jind', state: 'Haryana' },
  { name: 'Jhunjhunu', state: 'Rajasthan' },
  { name: 'Kanpur', state: 'Uttar Pradesh' },
  { name: 'Karnal', state: 'Haryana' },
  { name: 'Kasauli', state: 'Himachal Pradesh' },
  { name: 'Kasol', state: 'Himachal Pradesh' },
  { name: 'Katra', state: 'Jammu & Kashmir' },
  { name: 'Kausani', state: 'Uttarakhand' },
  { name: 'Khatu Shyam Ji', state: 'Rajasthan' },
  { name: 'Kota', state: 'Rajasthan' },
  { name: 'Kurukshetra', state: 'Haryana' },
  { name: 'Kullu', state: 'Himachal Pradesh' },
  { name: 'Kufri', state: 'Himachal Pradesh' },
  { name: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'Ludhiana', state: 'Punjab' },
  { name: 'Lansdowne', state: 'Uttarakhand' },
  { name: 'Lakhimpur', state: 'Uttar Pradesh' },
  { name: 'Manali', state: 'Himachal Pradesh', isPopular: true },
  { name: 'Mathura', state: 'Uttar Pradesh', isPopular: true },
  { name: 'Meerut', state: 'Uttar Pradesh' },
  { name: 'Moradabad', state: 'Uttar Pradesh' },
  { name: 'Mussoorie', state: 'Uttarakhand', isPopular: true },
  { name: 'Mandi', state: 'Himachal Pradesh' },
  { name: 'Mukteshwar', state: 'Uttarakhand' },
  { name: 'Mount Abu', state: 'Rajasthan' },
  { name: 'Mahendragarh', state: 'Haryana' },
  { name: 'Mahoba', state: 'Uttar Pradesh' },
  { name: 'McLeodganj', state: 'Himachal Pradesh' },
  { name: 'Nainital', state: 'Uttarakhand', isPopular: true },
  { name: 'Noida', state: 'Uttar Pradesh', isPopular: true },
  { name: 'Neemrana', state: 'Rajasthan' },
  { name: 'Nathdwara', state: 'Rajasthan' },
  { name: 'Nagaur', state: 'Rajasthan' },
  { name: 'Narkanda', state: 'Himachal Pradesh' },
  { name: 'Orai', state: 'Uttar Pradesh' },
  { name: 'Osian', state: 'Rajasthan' },
  { name: 'Panth Nagar Airport', state: 'Uttarakhand' },
  { name: 'Panipat', state: 'Haryana' },
  { name: 'Patiala', state: 'Punjab' },
  { name: 'Pithoragarh', state: 'Uttarakhand' },
  { name: 'Pushkar', state: 'Rajasthan' },
  { name: 'Pratapgarh', state: 'Uttar Pradesh' },
  { name: 'Prayagraj', state: 'Uttar Pradesh' },
  { name: 'Pilibhit', state: 'Uttar Pradesh' },
  { name: 'Qadian', state: 'Punjab' },
  { name: 'Rishikesh', state: 'Uttarakhand', isPopular: true },
  { name: 'Roorkee', state: 'Uttarakhand' },
  { name: 'Rohtak', state: 'Haryana' },
  { name: 'Ranthambore', state: 'Rajasthan' },
  { name: 'Rajsamand', state: 'Rajasthan' },
  { name: 'Rewari', state: 'Haryana' },
  { name: 'Ranikhet', state: 'Uttarakhand' },
  { name: 'Rudrapur', state: 'Uttarakhand' },
  { name: 'Rampur', state: 'Uttar Pradesh' },
  { name: 'Shimla', state: 'Himachal Pradesh', isPopular: true },
  { name: 'Sonipat', state: 'Haryana' },
  { name: 'Saharanpur', state: 'Uttar Pradesh' },
  { name: 'Sikar', state: 'Rajasthan' },
  { name: 'Sirsa', state: 'Haryana' },
  { name: 'Solan', state: 'Himachal Pradesh' },
  { name: 'Sambhal', state: 'Uttar Pradesh' },
  { name: 'Sawai Madhopur', state: 'Rajasthan' },
  { name: 'Sitapur', state: 'Uttar Pradesh' },
  { name: 'Salasar', state: 'Rajasthan' },
  { name: 'Sattal', state: 'Uttarakhand' },
  { name: 'Taj Mahal, Agra', state: 'Uttar Pradesh' },
  { name: 'Tapovan', state: 'Uttarakhand' },
  { name: 'Tehri', state: 'Uttarakhand' },
  { name: 'Thanesar', state: 'Haryana' },
  { name: 'Tirthan Valley', state: 'Himachal Pradesh' },
  { name: 'Tonk', state: 'Rajasthan' },
  { name: 'Tundla', state: 'Uttar Pradesh' },
  { name: 'Udaipur', state: 'Rajasthan', isPopular: true },
  { name: 'Unnao', state: 'Uttar Pradesh' },
  { name: 'Varanasi', state: 'Uttar Pradesh', isPopular: true },
  { name: 'Vrindavan', state: 'Uttar Pradesh', isPopular: false },
  { name: 'Yamunanagar', state: 'Haryana' },
];

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function WebsiteManagement() {
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', state: '', isPopular: false });

  const filtered = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.state.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm({ name: '', state: '', isPopular: false }); setEditing('new'); };
  const openEdit = (loc, idx) => { setForm({ name: loc.name, state: loc.state, isPopular: !!loc.isPopular }); setEditing(idx); };

  const save = () => {
    if (!form.name.trim()) return;
    if (editing === 'new') {
      setLocations([...locations, { name: form.name.trim(), state: form.state.trim(), isPopular: form.isPopular }]);
    } else {
      setLocations(locations.map((l, i) => (i === editing ? { name: form.name.trim(), state: form.state.trim(), isPopular: form.isPopular } : l)));
    }
    setEditing(null);
  };

  const remove = (idx) => {
    if (!window.confirm(`Delete "${locations[idx].name}"?`)) return;
    setLocations(locations.filter((_, i) => i !== idx));
  };

  // Group by first letter
  const grouped = filtered.reduce((acc, loc, idx) => {
    const letter = loc.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push({ ...loc, originalIdx: locations.indexOf(loc) });
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-orange-100 text-[#F59E0B] flex items-center justify-center">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Website Management</h1>
          <p className="text-sm text-gray-500">Manage From locations shown on the booking website.</p>
        </div>
      </div>

      {/* Tab bar — only one tab */}
      <div className="flex gap-1 border-b border-gray-200">
        <div className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 border-[#F59E0B] text-[#F59E0B]">
          <MapPin className="w-4 h-4" /> From Locations
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city or state..."
              className={clsx(inputCls, 'pl-9')}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{filtered.length} locations</span>
            <button onClick={openAdd} className={btnPrimary}><Plus className="w-4 h-4" /> Add Location</button>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          These are the <strong>From</strong> (pickup) locations shown on the website. <strong>To</strong> (drop) is unlimited via Google Maps search.
        </p>

        {Object.keys(grouped).sort().map((letter) => (
          <div key={letter}>
            <div className="text-xs font-bold text-[#F59E0B] uppercase tracking-widest mb-1 mt-3">{letter}</div>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
              {grouped[letter].map((loc) => (
                <div key={loc.originalIdx} className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{loc.name}</span>
                    <span className="text-xs text-gray-400">{loc.state}</span>
                    {loc.isPopular && <span className="text-xs bg-orange-100 text-[#F59E0B] font-semibold px-2 py-0.5 rounded-full">Popular</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(loc, loc.originalIdx)} className="p-1.5 text-gray-400 hover:text-[#F59E0B]"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(loc.originalIdx)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {editing !== null && (
        <Modal title={editing === 'new' ? 'Add Location' : 'Edit Location'} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-gray-600 mb-1 block">City / Location Name</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Nainital" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-600 mb-1 block">State</span>
              <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputCls} placeholder="e.g. Uttarakhand" />
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} className="accent-[#F59E0B]" />
              <span className="text-gray-700">Mark as Popular <span className="text-xs text-gray-400">(shown as suggestion in To field on website)</span></span>
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button onClick={save} className={btnPrimary}>Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
