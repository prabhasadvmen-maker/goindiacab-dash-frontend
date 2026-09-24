import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { HeadphonesIcon, AlertCircle, MessageSquare, Plus, Loader2, CheckCircle2, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PartnerSupport() {
  const { partnerToken } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  
  // V2 API States
  const [tickets, setTickets] = useState([]);
  
  // Create Ticket Form
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // SOS state
  const [triggeringSOS, setTriggeringSOS] = useState(false);

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v2/partner/support/tickets`, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      if (res.data.success) {
        setTickets(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await axios.post(`${API_URL}/api/v2/partner/support/tickets/create`, { subject, description }, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      if (res.data.success) {
        setSuccessMsg('Support ticket created successfully!');
        setSubject('');
        setDescription('');
        setTimeout(() => {
           setSuccessMsg('');
           setActiveTab('tickets');
           fetchTickets();
        }, 2000);
      }
    } catch (error) {
      alert("Failed to create ticket");
    }
    setCreating(false);
  };

  const handleSOS = async () => {
    if (!window.confirm("WARNING: This will instantly alert emergency services and GoIndiaCab Admin. Continue?")) return;
    setTriggeringSOS(true);
    try {
      // Send hardcoded location for demo
      const res = await axios.post(`${API_URL}/api/v2/partner/support/emergency/sos`, { lat: 28.7, lng: 77.1 }, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      if (res.data.success) {
        alert(res.data.message || "SOS ALARM TRIGGERED. Help is on the way.");
      }
    } catch (error) {
      alert("SOS Failed to trigger. Call 112 immediately.");
    }
    setTriggeringSOS(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="animate-spin w-8 h-8 mb-4 text-blue-500" />
        <p className="font-bold">Loading Support Hub...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'tickets', label: 'My Tickets', icon: MessageSquare },
    { id: 'new', label: 'Raise Issue', icon: Plus },
    { id: 'sos', label: 'Emergency', icon: AlertCircle },
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-6">
         <div className="w-20 h-20 rounded-[1.5rem] bg-blue-50 flex items-center justify-center text-blue-600 shadow-lg">
            <HeadphonesIcon className="w-10 h-10" />
         </div>
         <div>
            <h1 className="text-3xl font-black text-gray-900">Driver Support Center</h1>
            <p className="text-gray-500 font-medium mt-1">24/7 help powered by V2 Support APIs.</p>
         </div>
      </div>

      {successMsg && (
        <div className="bg-green-50 text-green-700 p-4 rounded-2xl flex items-center border border-green-200 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 mr-3" />
          <p className="font-bold">{successMsg}</p>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto space-x-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 no-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center px-6 py-4 rounded-xl font-bold transition-all whitespace-nowrap",
                isActive ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-50",
                tab.id === 'sos' && isActive && "bg-red-600 shadow-red-600/20",
                tab.id === 'sos' && !isActive && "hover:bg-red-50 text-red-600"
              )}
            >
              <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-white" : "text-inherit")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* My Tickets */}
        {activeTab === 'tickets' && (
          <div className="p-8 animate-in fade-in duration-300">
            <div className="flex justify-between items-center border-b border-gray-100 pb-6 mb-6">
               <h2 className="text-2xl font-black text-gray-900">Recent Support Tickets</h2>
               <button onClick={() => setActiveTab('new')} className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-xl font-bold text-sm transition-colors">
                  Create New
               </button>
            </div>
            
            {tickets.length === 0 ? (
               <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-bold">No support tickets found.</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {tickets.map((t, idx) => (
                     <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 cursor-pointer group transition-colors">
                        <div>
                           <p className="font-bold text-gray-900">{t.subject}</p>
                           <p className="text-xs text-gray-500 font-medium">Ticket ID: {t.id} • Status: {t.status}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                     </div>
                  ))}
               </div>
            )}
          </div>
        )}

        {/* New Ticket */}
        {activeTab === 'new' && (
          <div className="p-8 animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Raise a New Issue</h2>
            <form onSubmit={handleCreateTicket} className="space-y-6">
               <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Subject</label>
                  <input 
                     type="text" required
                     value={subject} onChange={e => setSubject(e.target.value)}
                     placeholder="E.g., Payment missing for trip #1234"
                     className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-bold text-gray-900 focus:bg-white focus:border-blue-500 outline-none transition-all"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Description</label>
                  <textarea 
                     required rows="4"
                     value={description} onChange={e => setDescription(e.target.value)}
                     placeholder="Please explain the issue in detail..."
                     className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 font-medium text-gray-900 focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
                  ></textarea>
               </div>
               <button 
                  type="submit" disabled={creating}
                  className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50 shadow-xl shadow-black/10"
               >
                  {creating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                  Submit Ticket
               </button>
            </form>
          </div>
        )}

        {/* SOS */}
        {activeTab === 'sos' && (
          <div className="p-8 text-center animate-in fade-in duration-300">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <AlertCircle className="w-12 h-12 text-red-600 animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Emergency SOS</h2>
            <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">
               Use this button only in case of a severe emergency. It will instantly alert the police and our 24/7 admin response team.
            </p>
            
            <button 
               onClick={handleSOS} disabled={triggeringSOS}
               className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-12 py-5 rounded-2xl font-black text-xl flex items-center justify-center mx-auto transition-transform active:scale-95 shadow-2xl shadow-red-600/30 disabled:opacity-50"
            >
               {triggeringSOS ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <AlertCircle className="w-6 h-6 mr-3" />}
               TRIGGER SOS ALARM
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
