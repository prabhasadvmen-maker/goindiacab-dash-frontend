import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserAuthStore } from '../../store/userAuthStore';
import { Bell, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Notifications() {
  const { userToken } = useUserAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/user/operations/notifications`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (response.data.success) {
        setNotifications(response.data.data);
        markAsRead();
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await axios.put(`${API_URL}/api/v1/user/operations/notifications/read`, {}, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-[calc(100vh-80px)] overflow-y-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Notifications</h2>
          <p className="text-gray-500 font-medium mt-1">Updates about your rides and offers.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-orange-500 mb-4"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
            <Bell className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">You're all caught up!</h3>
          <p className="text-gray-500 font-medium">No new notifications at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div key={notif._id} className={cn(
               "bg-white p-6 rounded-3xl border shadow-sm flex items-start transition-colors",
               notif.isRead ? "border-gray-100" : "border-orange-200 bg-orange-50/30"
            )}>
              <div className={cn(
                 "w-12 h-12 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0",
                 notif.isRead ? "bg-gray-50 text-gray-400" : "bg-orange-100 text-orange-500"
              )}>
                 <Bell className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-lg">{notif.title}</h4>
                <p className="text-gray-600 font-medium mt-1">{notif.message}</p>
                <p className="text-xs font-bold text-gray-400 mt-3 uppercase tracking-wider">
                  {new Date(notif.createdAt).toLocaleString()}
                </p>
              </div>
              {!notif.isRead && <div className="w-3 h-3 bg-orange-500 rounded-full ml-4 mt-2 shadow-sm"></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
