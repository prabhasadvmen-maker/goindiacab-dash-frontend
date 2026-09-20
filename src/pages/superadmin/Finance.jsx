import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import {
  IndianRupee,
  Wallet,
  CreditCard,
  Banknote,
  TrendingUp,
  Percent,
  Download,
  Calendar
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Finance() {
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;

  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    platformCommission: 0,
    partnerEarnings: 0,
    paymentBreakdown: { cash: 0, online: 0 }
  });
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOverview = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admins/finance/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching finance overview:', error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/admins/finance/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 10 }
      });
      if (data.success) {
        setTransactions(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchTransactions();
    // eslint-disable-next-line
  }, [page]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Finance & Payouts</h2>
          <p className="text-gray-500 mt-1">Track platform revenue, commissions, and transaction history.</p>
        </div>
        <button className="flex items-center text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors border border-gray-200">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Gross Revenue</p>
              <h3 className="text-3xl font-black text-gray-900">{formatCurrency(stats.totalRevenue)}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center text-sm text-green-600 font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            + {formatCurrency(stats.todayRevenue)} Today
          </div>
        </div>

        {/* Platform Commission */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Platform Cut (20%)</p>
              <h3 className="text-3xl font-black text-purple-900">{formatCurrency(stats.platformCommission)}</h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
              <Percent className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center text-sm text-gray-500">
            Net company revenue
          </div>
        </div>

        {/* Partner Earnings */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Partner Earnings</p>
              <h3 className="text-3xl font-black text-green-900">{formatCurrency(stats.partnerEarnings)}</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-xl text-green-600">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10 mt-4 flex items-center text-sm text-gray-500">
            Total driver payouts owed
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-gray-500">Payment Breakdown</p>
            <Banknote className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 font-medium">Cash (COD)</span>
                <span className="font-bold text-gray-900">{formatCurrency(stats.paymentBreakdown.cash)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div 
                  className="bg-orange-400 h-1.5 rounded-full" 
                  style={{ width: `${stats.totalRevenue > 0 ? (stats.paymentBreakdown.cash / stats.totalRevenue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 font-medium">Online (UPI/Card)</span>
                <span className="font-bold text-gray-900">{formatCurrency(stats.paymentBreakdown.online)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full" 
                  style={{ width: `${stats.totalRevenue > 0 ? (stats.paymentBreakdown.online / stats.totalRevenue) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Recent Completed Rides</h3>
          <div className="flex items-center text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
            <Calendar className="w-4 h-4 mr-2" />
            All Time
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">Date & Time</th>
                <th className="px-6 py-4 font-bold">Transaction Info</th>
                <th className="px-6 py-4 font-bold">Method</th>
                <th className="px-6 py-4 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                    No completed transactions yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-gray-900">Ride: {tx._id.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="font-medium">C:</span> {tx.user?.name || 'User'} | 
                        <span className="font-medium ml-1">D:</span> {tx.partner?.personalInfo?.fullName || 'Driver'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 text-xs font-bold rounded-md inline-flex items-center",
                        tx.paymentMethod === 'CASH' ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {tx.paymentMethod === 'CASH' ? <Banknote className="w-3 h-3 mr-1" /> : <CreditCard className="w-3 h-3 mr-1" />}
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(tx.fare?.estimated)}</p>
                      <p className="text-[10px] text-gray-400 uppercase">{tx.vehicleType}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Page <span className="font-semibold text-gray-900">{page}</span> of {totalPages}
            </span>
            <div className="flex space-x-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors">Prev</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors">Next</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
