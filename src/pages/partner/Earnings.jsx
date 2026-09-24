import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Wallet, TrendingUp, IndianRupee, Download, Building, Loader2, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PartnerEarnings() {
  const { partnerToken } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // States for V2 APIs
  const [balance, setBalance] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [tds, setTds] = useState({});
  
  // Action state
  const [withdrawing, setWithdrawing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchEarningsData();
    // eslint-disable-next-line
  }, []);

  const fetchEarningsData = async () => {
    try {
      const headers = { Authorization: `Bearer ${partnerToken}` };
      // Call multiple Granular APIs
      const [balRes, todayRes, txRes, setRes, tdsRes] = await Promise.all([
        axios.get(`${API_URL}/api/v2/partner/finance/wallet/balance`, { headers }),
        axios.get(`${API_URL}/api/v2/partner/finance/earnings/today`, { headers }),
        axios.get(`${API_URL}/api/v2/partner/finance/wallet/transactions`, { headers }),
        axios.get(`${API_URL}/api/v2/partner/finance/settlements/history`, { headers }),
        axios.get(`${API_URL}/api/v2/partner/finance/taxes/tds-summary`, { headers })
      ]);

      if (balRes.data.success) setBalance(balRes.data.data.balance);
      if (todayRes.data.success) setTodayEarnings(todayRes.data.data);
      if (txRes.data.success) setTransactions(txRes.data.data);
      if (setRes.data.success) setSettlements(setRes.data.data);
      if (tdsRes.data.success) setTds(tdsRes.data.data);
      
    } catch (error) {
      console.error('Error fetching earnings data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (balance < 500) return alert("Minimum withdrawal amount is ₹500");
    setWithdrawing(true);
    try {
      const res = await axios.post(`${API_URL}/api/v2/partner/finance/wallet/withdraw`, { amount: balance }, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        setBalance(0);
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (error) {
      alert("Withdrawal request failed.");
    }
    setWithdrawing(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="animate-spin w-8 h-8 mb-4 text-green-500" />
        <p className="font-bold">Loading Financial Data...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Earnings Overview', icon: TrendingUp },
    { id: 'wallet', label: 'Wallet & Passbook', icon: Wallet },
    { id: 'settlements', label: 'Bank Settlements', icon: Building },
    { id: 'tax', label: 'Tax & TDS', icon: IndianRupee },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center md:items-start justify-between">
         <div className="flex items-center space-x-6">
           <div className="w-20 h-20 rounded-[1.5rem] bg-green-50 flex items-center justify-center text-green-600 shadow-lg">
              <Wallet className="w-10 h-10" />
           </div>
           <div>
              <h1 className="text-3xl font-black text-gray-900">₹{balance}</h1>
              <p className="text-gray-500 font-bold mt-1 uppercase tracking-wider text-sm">Available Wallet Balance</p>
           </div>
         </div>
         <button 
           onClick={handleWithdraw}
           disabled={withdrawing || balance < 500}
           className="mt-6 md:mt-0 bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-black flex items-center transition-transform active:scale-95 disabled:opacity-50 shadow-xl shadow-black/10"
         >
           {withdrawing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <IndianRupee className="w-5 h-5 mr-2" />}
           Withdraw to Bank
         </button>
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
        
        {/* Earnings Overview */}
        {activeTab === 'overview' && (
          <div className="p-8 space-y-8 animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900 border-b border-gray-100 pb-4">Today's Snapshot</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <p className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-2">Total Earnings</p>
                <h3 className="text-4xl font-black text-gray-900">₹{todayEarnings.today || 0}</h3>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <p className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-2">Trips Completed</p>
                <h3 className="text-4xl font-black text-gray-900">{todayEarnings.trips || 0} Trips</h3>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 flex items-center justify-between">
               <div>
                  <h4 className="font-black text-orange-900 text-lg">Weekly & Monthly APIs</h4>
                  <p className="text-orange-700 font-medium text-sm">V2 APIs for weekly (55) & monthly (56) are available for detailed graphs.</p>
               </div>
               <TrendingUp className="w-10 h-10 text-orange-200" />
            </div>
          </div>
        )}

        {/* Wallet & Passbook */}
        {activeTab === 'wallet' && (
          <div className="p-8 animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Wallet Transactions</h2>
            {transactions.length === 0 ? (
               <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-bold">No transactions found yet.</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {transactions.map((tx, idx) => (
                     <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center space-x-4">
                           <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", tx.type === 'CREDIT' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
                              {tx.type === 'CREDIT' ? <ArrowDownRight className="w-5 h-5"/> : <ArrowUpRight className="w-5 h-5"/>}
                           </div>
                           <div>
                              <p className="font-bold text-gray-900">{tx.description}</p>
                              <p className="text-xs text-gray-500 font-medium">{new Date(tx.date).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <p className={cn("font-black text-lg", tx.type === 'CREDIT' ? "text-green-600" : "text-red-600")}>
                           {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                        </p>
                     </div>
                  ))}
               </div>
            )}
          </div>
        )}

        {/* Settlements */}
        {activeTab === 'settlements' && (
          <div className="p-8 animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Bank Settlements (Payouts)</h2>
            {settlements.length === 0 ? (
               <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-bold">No bank payouts found yet.</p>
               </div>
            ) : (
               <div>{/* List settlements here */}</div>
            )}
          </div>
        )}

        {/* Tax & TDS */}
        {activeTab === 'tax' && (
          <div className="p-8 animate-in fade-in duration-300">
            <h2 className="text-2xl font-black text-gray-900 border-b border-gray-100 pb-4">TDS & Tax Summary</h2>
            <div className="mt-6 bg-blue-50 rounded-2xl p-6 border border-blue-100">
               <p className="text-blue-600 font-bold uppercase tracking-wider text-xs mb-2">Financial Year {tds.financialYear || '2025-2026'}</p>
               <h3 className="text-4xl font-black text-blue-900 mb-4">₹{tds.totalTdsDeducted || 0}</h3>
               <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center transition-colors">
                  <Download className="w-4 h-4 mr-2" /> Download Form 16A
               </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
