import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Wallet, TrendingUp, Calendar, CreditCard, ArrowRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PartnerEarnings() {
  const { partnerToken } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
    // eslint-disable-next-line
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/partner/earnings`, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
        <p>Calculating earnings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Earnings & Wallet</h2>
          <p className="text-gray-500 mt-1">Track your revenue and wallet balance.</p>
        </div>
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
          <Wallet className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Card */}
        <div className="md:col-span-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10 text-white">
              <CreditCard className="w-24 h-24 transform rotate-12" />
           </div>
           <p className="text-gray-300 text-sm font-medium uppercase tracking-wider mb-2">Available Balance</p>
           <h3 className="text-4xl font-black mb-6">₹{data?.walletBalance?.toFixed(2) || '0.00'}</h3>
           
           <button className="w-full py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center shadow-sm">
             Withdraw Funds <ArrowRight className="w-4 h-4 ml-2" />
           </button>
        </div>

        {/* Metrics Cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="flex items-center space-x-3 mb-2">
                 <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <TrendingUp className="w-5 h-5" />
                 </div>
                 <p className="text-gray-500 font-bold uppercase text-sm">Today's Earnings</p>
              </div>
              <p className="text-3xl font-black text-gray-900 mt-2">₹{data?.todayEarnings?.toFixed(2) || '0.00'}</p>
           </div>
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
              <div className="flex items-center space-x-3 mb-2">
                 <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                    <Calendar className="w-5 h-5" />
                 </div>
                 <p className="text-gray-500 font-bold uppercase text-sm">This Week</p>
              </div>
              <p className="text-3xl font-black text-gray-900 mt-2">₹{data?.weekEarnings?.toFixed(2) || '0.00'}</p>
           </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-lg">Recent Transactions</h3>
          <span className="text-sm font-bold text-[#F59E0B] bg-orange-50 px-3 py-1 rounded-full">Lifetime: ₹{data?.totalEarnings?.toFixed(2) || '0.00'}</span>
        </div>
        
        {data?.recentTransactions?.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No transactions found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data?.recentTransactions?.map((tx, idx) => (
              <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    tx.type === 'CREDIT' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                  )}>
                    {tx.type === 'CREDIT' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{tx.description}</p>
                    <p className="text-sm text-gray-500">{new Date(tx.date).toLocaleString()}</p>
                  </div>
                </div>
                <div className={cn(
                  "font-black text-lg",
                  tx.type === 'CREDIT' ? "text-green-600" : "text-gray-900"
                )}>
                  {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
