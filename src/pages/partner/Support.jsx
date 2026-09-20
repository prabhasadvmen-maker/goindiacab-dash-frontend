import React from 'react';
import { HelpCircle, Phone, Mail, BookOpen, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function PartnerSupport() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Driver Support Center</h2>
          <p className="text-gray-500 mt-1">Get help with your rides, account, or earnings.</p>
        </div>
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
          <HelpCircle className="w-8 h-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Contact Cards */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center group cursor-pointer hover:border-blue-300 transition-colors">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
               <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900">Call Support</h3>
            <p className="text-sm text-gray-500 mt-2 mb-4">Available 24/7 for urgent ride issues.</p>
            <p className="text-lg font-black text-blue-600">1800-GO-INDIA</p>
         </div>

         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center group cursor-pointer hover:border-orange-300 transition-colors">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
               <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900">Email Us</h3>
            <p className="text-sm text-gray-500 mt-2 mb-4">For account, document, or payout queries.</p>
            <p className="text-lg font-black text-orange-600">partners@goindiacab.com</p>
         </div>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-lg flex items-center">
               <BookOpen className="w-5 h-5 text-gray-400 mr-2" /> Frequently Asked Questions
            </h3>
         </div>
         <div className="divide-y divide-gray-100">
            <div className="p-6 hover:bg-gray-50 transition-colors">
               <h4 className="font-bold text-gray-900 text-sm">When do I get my payouts?</h4>
               <p className="text-sm text-gray-600 mt-2">All earnings from Monday to Sunday are processed and credited to your verified bank account by every Tuesday.</p>
            </div>
            <div className="p-6 hover:bg-gray-50 transition-colors">
               <h4 className="font-bold text-gray-900 text-sm">How to update my Bank Account or RC?</h4>
               <p className="text-sm text-gray-600 mt-2">To prevent fraud, core profile details are locked. Please email our support team with your new document photos to update them.</p>
            </div>
            <div className="p-6 hover:bg-gray-50 transition-colors">
               <h4 className="font-bold text-gray-900 text-sm flex items-center"><ShieldAlert className="w-4 h-4 text-red-500 mr-2" /> What to do in an emergency?</h4>
               <p className="text-sm text-gray-600 mt-2">Use the SOS button in your partner app to immediately alert the authorities and our 24/7 incident response team.</p>
            </div>
         </div>
      </div>

    </div>
  );
}
