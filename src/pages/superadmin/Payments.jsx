import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import {
  IndianRupee,
  TrendingUp,
  CreditCard,
  Briefcase,
  RefreshCw,
  Wallet,
  CheckCircle,
  AlertTriangle,
  Receipt
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Payments() {
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;

  const [overview, setOverview] = useState({
    totalRevenue: 0,
    platformCommission: 0,
    partnerEarnings: 0,
    paymentBreakdown: { cash: 0, online: 0 }
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      // Fetch Overview
      const overviewRes = await axios.get(`${API_URL}/api/admins/finance/overview?_t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (overviewRes.data.success) {
        setOverview(overviewRes.data.data);
      }

      // Fetch Transactions
      const txRes = await axios.get(`${API_URL}/api/admins/finance/transactions?_t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 10 }
      });
      if (txRes.data.success) {
        setTransactions(txRes.data.data);
        setTotalPages(txRes.data.pagination.totalPages);
        setTotalTransactions(txRes.data.total);
      }
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
    // eslint-disable-next-line
  }, [page]);

  const handlePayout = async (id) => {
    if (!window.confirm('Initiate Razorpay payout to this partner?')) return;
    
    setActionLoading(id);
    try {
      const { data } = await axios.post(`${API_URL}/api/admins/finance/payouts/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        alert(data.message);
        setTransactions(transactions.map(tx => tx._id === id ? data.data : tx));
      }
    } catch (error) {
      console.error('Error processing payout:', error);
      alert(error.response?.data?.message || 'Failed to process payout');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const MetricCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
      <div className={cn("w-14 h-14 rounded-full flex items-center justify-center shrink-0", colorClass)}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-gray-900 mt-1">₹{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <IndianRupee className="w-6 h-6 mr-3 text-blue-600" />
            Payment Management
          </h2>
          <p className="text-gray-500 mt-1">Manage platform revenue, Razorpay settlements, and partner payouts.</p>
        </div>
        <button 
          onClick={() => fetchFinanceData()} 
          className="flex items-center text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Stats
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard 
          title="Total Gross Revenue" 
          value={overview.totalRevenue} 
          icon={TrendingUp} 
          colorClass="bg-blue-100 text-blue-600"
        />
        <MetricCard 
          title="Platform Commission" 
          value={overview.platformCommission} 
          icon={Briefcase} 
          colorClass="bg-green-100 text-green-600"
          subtitle="20% cut across all trips"
        />
        <MetricCard 
          title="Partner Earnings" 
          value={overview.partnerEarnings} 
          icon={Wallet} 
          colorClass="bg-orange-100 text-orange-600"
          subtitle="80% to drivers"
        />
        <MetricCard 
          title="Online Payments" 
          value={overview.paymentBreakdown.online} 
          icon={CreditCard} 
          colorClass="bg-purple-100 text-purple-600"
          subtitle="Razorpay & UPI"
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
           <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-blue-500" />
              Recent Completed Trip Transactions
           </h3>
           <span className="text-sm font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border shadow-sm">
             Total: {totalTransactions}
           </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-white border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold">Booking ID & Date</th>
                <th scope="col" className="px-6 py-4 font-bold">Driver / Partner</th>
                <th scope="col" className="px-6 py-4 font-bold">Amount</th>
                <th scope="col" className="px-6 py-4 font-bold">Method</th>
                <th scope="col" className="px-6 py-4 font-bold text-right">Settlement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded-lg w-28 ml-auto"></div></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Receipt className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-lg font-medium text-gray-900">No transactions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 font-mono text-xs mb-1">
                        {tx._id.toString().substring(18).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <p className="font-bold text-gray-900">{tx.partner?.personalInfo?.fullName || 'Unknown'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 text-base">₹{tx.fare?.estimated || 0}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 text-[11px] font-bold rounded-full border uppercase tracking-wider inline-flex items-center",
                        tx.paymentMethod === 'CASH' ? "bg-gray-100 text-gray-700 border-gray-200" : "bg-purple-100 text-purple-700 border-purple-200"
                      )}>
                        {tx.paymentMethod === 'CASH' ? <Wallet className="w-3 h-3 mr-1" /> : <CreditCard className="w-3 h-3 mr-1" />}
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {tx.paymentStatus === 'COMPLETED' ? (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-green-50 text-green-700">
                          <CheckCircle className="w-4 h-4 mr-1.5" /> Settled
                        </span>
                      ) : tx.paymentMethod === 'CASH' ? (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-gray-50 text-gray-500">
                          Cash / Settled
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePayout(tx._id)}
                          disabled={actionLoading === tx._id}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                          <IndianRupee className="w-4 h-4 mr-1.5" />
                          Settle Payout
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <span className="text-sm text-gray-500">
              Page <span className="font-semibold text-gray-900">{page}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
            </span>
            <div className="flex space-x-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button 
                disabled={page === totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
