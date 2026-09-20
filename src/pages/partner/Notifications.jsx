import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Bell, Info, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PartnerNotifications() {
  const { partnerToken } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    markAsRead();
    // eslint-disable-next-line
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/partner/notifications`, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await axios.put(`${API_URL}/api/partner/notifications/read`, {}, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  const getIcon = (type) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'ALERT': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type, isRead) => {
    if (isRead) return 'bg-white';
    switch (type) {
      case 'SUCCESS': return 'bg-green-50/50';
      case 'WARNING': return 'bg-orange-50/50';
      case 'ALERT': return 'bg-red-50/50';
      default: return 'bg-blue-50/50';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-500 mt-1">Important alerts and messages from Admin.</p>
        </div>
        <div className="relative">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
            <Bell className="w-6 h-6" />
          </div>
          {notifications.some(n => !n.isRead) && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
               <Bell className="w-8 h-8" />
             </div>
             <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
             <p className="text-gray-500 mt-1">You don't have any new notifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <div key={notif._id} className={cn("p-6 flex items-start space-x-4 transition-colors", getBgColor(notif.type, notif.isRead))}>
                <div className="mt-1 flex-shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={cn("font-bold text-base", notif.isRead ? "text-gray-800" : "text-gray-900")}>
                      {notif.title}
                    </h4>
                    <span className="text-xs font-medium text-gray-400 whitespace-nowrap ml-4">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={cn("mt-1 text-sm leading-relaxed", notif.isRead ? "text-gray-500" : "text-gray-700 font-medium")}>
                    {notif.message}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
