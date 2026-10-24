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
  Receipt,
  Globe,
  Smartphone,
  Search
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const formatStamp = (s) => s
  ? new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—';

const PAYMENT_BADGE = {
  paid: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
};

// ─── Website payments (Razorpay) ───
function WebsitePayments({ token }) {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ paidCount: 0, collected: 0, discountGiven: 0, balanceWithDrivers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState('paid');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await axios.get(`${API_URL}/api/admins/finance/web-payments`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, limit: 10, payment, search, _t: Date.now() },
        });
        if (cancelled || !data.success) return;
        setRows(data.data || []);
        setSummary(data.summary);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.total || 0);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load website payments. Please refresh.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token, page, payment, search]);

  const cards = [
    { title: 'Online Collected', value: inr(summary.collected), icon: CreditCard, tone: 'bg-purple-100 text-purple-600', sub: 'Razorpay, paid bookings' },
    { title: 'Paid Bookings', value: summary.paidCount, icon: CheckCircle, tone: 'bg-green-100 text-green-600', sub: 'Payment verified' },
    { title: 'Balance To Collect', value: inr(summary.balanceWithDrivers), icon: Wallet, tone: 'bg-orange-100 text-orange-600', sub: 'Pay-to-driver on active trips' },
    { title: 'Coupon Discounts', value: inr(summary.discountGiven), icon: TrendingUp, tone: 'bg-blue-100 text-blue-600', sub: 'Given on paid bookings' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map((c) => (
          <div key={c.title} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className={cn('w-14 h-14 rounded-full flex items-center justify-center shrink-0', c.tone)}>
              <c.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{c.title}</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{c.value}</p>
              <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Receipt className="w-5 h-5 mr-2 text-blue-500" /> Website Payment History
            <span className="ml-3 text-sm font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border shadow-sm">Total: {total}</span>
          </h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex space-x-1 bg-gray-100/60 p-1 rounded-xl border border-gray-200/50">
              {['paid', 'pending', 'failed', 'all'].map((p) => (
                <button
                  key={p}
                  onClick={() => { setPayment(p); setPage(1); }}
                  className={cn('px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all',
                    payment === p ? 'bg-white text-green-600 shadow-sm border border-gray-200/60' : 'text-gray-500 hover:bg-gray-200/50')}
                >{p}</button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput.trim()); setPage(1); }} className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Booking ID, name, mobile, payment ID"
                  className="w-full sm:w-64 pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">Search</button>
            </form>
          </div>
        </div>

        {error && <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-700 uppercase bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold">Booking ID & Paid On</th>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Trip</th>
                <th className="px-6 py-4 font-bold">Total Fare</th>
                <th className="px-6 py-4 font-bold">Paid Online</th>
                <th className="px-6 py-4 font-bold">Pay To Driver</th>
                <th className="px-6 py-4 font-bold">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(7).fill(0).map((__, j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>)}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Receipt className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-lg font-medium text-gray-900">No {payment === 'all' ? '' : payment} website payments found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-amber-700 font-mono text-xs mb-1">{b.bookingId}</p>
                      <p className="text-xs text-gray-500">{formatStamp(b.payment?.paidAt || b.createdAt)}</p>
                      {b.payment?.paymentId && <p className="text-[11px] text-gray-400 font-mono">{b.payment.paymentId}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{b.passenger?.name}</p>
                      <p className="text-xs text-gray-500">{b.passenger?.mobile}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{b.trip?.from} → {b.trip?.to || 'Local'}</p>
                      <p className="text-xs text-gray-400 capitalize">{b.trip?.date} · {b.status?.replace('_', ' ')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{inr(b.fare?.total)}</p>
                      {b.fare?.discount > 0 && <p className="text-xs text-green-600">Coupon {b.fare.couponCode}: - {inr(b.fare.discount)}</p>}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{b.payment?.status === 'paid' ? inr(b.payment.paidAmount) : inr(0)}</td>
                    <td className="px-6 py-4 font-semibold text-gray-700">{inr(b.fare?.payLater)}</td>
                    <td className="px-6 py-4">
                      <span className={cn('px-2.5 py-1 text-[11px] font-bold rounded-full border uppercase tracking-wider', PAYMENT_BADGE[b.payment?.status] || 'bg-gray-100 text-gray-600 border-gray-200')}>
                        {b.payment?.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <span className="text-sm text-gray-500">Page <span className="font-semibold text-gray-900">{page}</span> of <span className="font-semibold text-gray-900">{totalPages}</span></span>
            <div className="flex space-x-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page: tabs for website payments and app trips ───
export default function Payments() {
  const { superAdminToken, adminToken } = useAuthStore();
  const token = superAdminToken || adminToken;
  const [tab, setTab] = useState('website');

  const TABS = [
    { id: 'website', label: 'Website Payments', icon: Globe },
    { id: 'app', label: 'App / Dashboard Trips', icon: Smartphone },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="px-4 md:px-6 pt-4 md:pt-6">
        <div className="inline-flex space-x-1 bg-gray-100/60 p-1 rounded-xl border border-gray-200/60">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn('flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all',
                tab === t.id ? 'bg-white text-blue-600 shadow-sm border border-gray-200/60' : 'text-gray-500 hover:bg-gray-200/50')}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>
      {tab === 'website' ? (
        <div className="p-4 md:p-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <IndianRupee className="w-6 h-6 mr-3 text-blue-600" /> Payment Management
            </h2>
            <p className="text-gray-500 mt-1">Razorpay payments received from website bookings.</p>
          </div>
          <WebsitePayments token={token} />
        </div>
      ) : (
        <AppPayments token={token} />
      )}
    </div>
  );
}

function AppPayments() {
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
