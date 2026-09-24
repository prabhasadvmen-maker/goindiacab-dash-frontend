import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Bell, Check, Trash2, Loader2, Star, Gift, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PartnerNotifications() {
  const { partnerToken } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');
  
  // V2 API States
  const [notifications, setNotifications] = useState([]);
  const [ratings, setRatings] = useState({});
  const [referral, setReferral] = useState({});
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${partnerToken}` };
      const [notifRes, rateRes, refRes] = await Promise.all([
        axios.get(`${API_URL}/api/v2/partner/notifications/all`, { headers }),
        axios.get(`${API_URL}/api/v2/partner/performance/ratings`, { headers }),
        axios.get(`${API_URL}/api/v2/partner/referrals/code`, { headers })
      ]);

      if (notifRes.data.success) setNotifications(notifRes.data.data);
      if (rateRes.data.success) setRatings(rateRes.data.data);
      if (refRes.data.success) setReferral(refRes.data.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await axios.patch(`${API_URL}/api/v2/partner/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      // Update local state without refetching everything
      fetchData(); // Simplest way to sync
    } catch (error) {
      console.error("Failed to mark read");
    }
  };

  const handleClaimBonus = async () => {
    setClaiming(true);
    try {
      const res = await axios.post(`${API_URL}/api/v2/partner/referrals/claim`, {}, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      if (res.data.success) {
        alert(res.data.message);
      }
    } catch (error) {
      alert("Failed to claim bonus.");
    }
    setClaiming(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="animate-spin w-8 h-8 mb-4 text-blue-500" />
        <p className="font-bold">Loading Alerts & Performance...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'notifications', label: 'App Alerts', icon: Bell },
    { id: 'ratings', label: 'My Ratings', icon: Star },
    { id: 'referrals', label: 'Refer & Earn', icon: Gift },
  ];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-6">
         <div className="w-20 h-20 rounded-[1.5rem] bg-purple-50 flex items-center justify-center text-purple-600 shadow-lg">
            <Bell className="w-10 h-10" />
         </div>
         <div>
            <h1 className="text-3xl font-black text-gray-900">Alerts & Extras</h1>
            <p className="text-gray-500 font-medium mt-1">Manage notifications, ratings, and referrals.</p>
         </div>
      </div>

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
                isActive ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <Icon className={cn("w-5 h-5 mr-3", isActive ? "text-white" : "text-gray-400")} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="p-8 animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Recent Alerts</h2>
            {notifications.length === 0 ? (
               <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-bold">You're all caught up!</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {notifications.map((n, idx) => (
                     <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                           <p className="font-bold text-gray-900">{n.title || "New Notification"}</p>
                           <p className="text-sm text-gray-500 font-medium">{n.message || "Message content"}</p>
                        </div>
                        <button 
                           onClick={() => handleMarkRead(n.id)}
                           className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-green-500 hover:border-green-500 hover:bg-green-50 transition-colors"
                        >
                           <Check className="w-5 h-5" />
                        </button>
                     </div>
                  ))}
               </div>
            )}
          </div>
        )}

        {/* Ratings Tab */}
        {activeTab === 'ratings' && (
          <div className="p-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-100 pb-8 mb-8">
               <div>
                  <h2 className="text-2xl font-black text-gray-900">Customer Ratings</h2>
                  <p className="text-gray-500 font-medium mt-1">Your performance from {ratings.totalReviews || 0} trips.</p>
               </div>
               <div className="mt-6 md:mt-0 flex items-center bg-yellow-50 text-yellow-600 px-6 py-4 rounded-2xl border border-yellow-100">
                  <Star className="w-8 h-8 mr-3 fill-current" />
                  <span className="text-4xl font-black">{ratings.averageRating || 'N/A'}</span>
               </div>
            </div>
            
            <div>
               <h3 className="font-bold text-gray-900 mb-4">Latest Feedback</h3>
               {(!ratings.latestFeedback || ratings.latestFeedback.length === 0) ? (
                  <p className="text-gray-500 font-medium">No written feedback yet.</p>
               ) : (
                  <div className="space-y-4">
                     {ratings.latestFeedback.map((fb, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                           <div className="flex text-yellow-500 mb-2">
                              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                           </div>
                           <p className="font-medium text-gray-700">"{fb.comment}"</p>
                        </div>
                     ))}
                  </div>
               )}
            </div>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <div className="p-8 animate-in fade-in duration-300 text-center">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <Gift className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Refer & Earn ₹{referral.bonusAmount || 500}</h2>
            <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">
               Share your unique code with other drivers. When they complete their first trip, you both earn a bonus!
            </p>
            
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 max-w-sm mx-auto mb-8">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Referral Code</p>
               <h3 className="text-3xl font-black text-gray-900 font-mono tracking-widest">{referral.code || 'GOCAB123'}</h3>
            </div>
            
            <button 
               onClick={handleClaimBonus} disabled={claiming}
               className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white px-12 py-4 rounded-xl font-bold flex items-center justify-center mx-auto transition-transform active:scale-95 shadow-xl shadow-black/10 disabled:opacity-50"
            >
               {claiming ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Gift className="w-5 h-5 mr-2" />}
               Claim Pending Bonus
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
