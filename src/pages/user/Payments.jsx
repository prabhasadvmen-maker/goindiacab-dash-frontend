import React, { useState } from 'react';
import { useUserAuthStore } from '../../store/userAuthStore';
import { CreditCard, Wallet, Plus, ArrowUpRight, History } from 'lucide-react';

export default function Payments() {
  const { user } = useUserAuthStore();
  const [activeTab, setActiveTab] = useState('wallet'); // wallet, methods, history

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-[calc(100vh-80px)] overflow-y-auto space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h2 className="text-3xl font-black text-gray-900">Payments</h2>
            <p className="text-gray-500 font-medium mt-1">Manage your wallet and payment methods.</p>
         </div>
      </div>

      {/* Wallet Card */}
      <div className="bg-gradient-to-br from-blue-900 to-black rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="w-48 h-48" />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end">
            <div>
               <p className="text-blue-200 font-bold uppercase tracking-wider text-sm mb-2">Wallet Balance</p>
               <h3 className="text-5xl font-black">₹{user?.walletBalance?.toFixed(2) || '0.00'}</h3>
            </div>
            <button className="mt-6 md:mt-0 bg-white text-blue-900 px-6 py-3 rounded-xl font-bold flex items-center hover:bg-gray-100 transition-colors">
               <Plus className="w-5 h-5 mr-2" /> Add Money
            </button>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
         <button onClick={() => setActiveTab('wallet')} className={`px-6 py-4 font-bold text-sm ${activeTab === 'wallet' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500 hover:text-gray-900'}`}>Payment Methods</button>
         <button onClick={() => setActiveTab('history')} className={`px-6 py-4 font-bold text-sm ${activeTab === 'history' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500 hover:text-gray-900'}`}>Transaction History</button>
      </div>

      {/* Tab Content */}
      {activeTab === 'wallet' && (
         <div className="space-y-6">
            <h3 className="font-black text-xl text-gray-900">Saved Methods</h3>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-gray-200 transition-colors cursor-pointer">
               <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mr-4 border border-gray-100">
                     <CreditCard className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                     <p className="font-bold text-gray-900">Add Credit/Debit Card</p>
                     <p className="text-sm font-medium text-gray-500">Save a card for faster checkout</p>
                  </div>
               </div>
               <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-gray-200 transition-colors cursor-pointer">
               <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4 border border-blue-100">
                     <span className="font-black text-blue-600">UPI</span>
                  </div>
                  <div>
                     <p className="font-bold text-gray-900">Link UPI ID</p>
                     <p className="text-sm font-medium text-gray-500">Pay via GPay, PhonePe, Paytm</p>
                  </div>
               </div>
               <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
         </div>
      )}

      {activeTab === 'history' && (
         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6">
               <History className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-500 font-medium mb-0">Your wallet additions and ride payments will appear here.</p>
         </div>
      )}

    </div>
  );
}

// Minimal placeholder component for ChevronRight to fix rendering
function ChevronRight({ className }) {
   return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"></polyline></svg>;
}
