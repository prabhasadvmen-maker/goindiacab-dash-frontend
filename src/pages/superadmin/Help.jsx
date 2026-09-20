import React from 'react';
import { HelpCircle, BookOpen, MessageSquare, ExternalLink, ShieldAlert, Phone } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Help() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Support & Help Center</h2>
          <p className="text-gray-500 mt-1">Documentation, FAQs, and contact for SuperAdmin support.</p>
        </div>
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
          <HelpCircle className="w-8 h-8" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Links */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center group cursor-pointer hover:border-blue-300 transition-colors">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900">System Documentation</h3>
            <p className="text-sm text-gray-500 mt-2">Read the detailed GoIndiaCab platform manual.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center group cursor-pointer hover:border-orange-300 transition-colors">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mx-auto mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900">Contact Developer</h3>
            <p className="text-sm text-gray-500 mt-2">Raise a technical ticket regarding software bugs.</p>
          </div>
        </div>

        {/* FAQs */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-gray-900 text-lg">Frequently Asked Questions</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-6 hover:bg-gray-50 transition-colors">
              <h4 className="text-sm font-bold text-gray-900 flex items-center">
                <ShieldAlert className="w-4 h-4 text-red-500 mr-2" />
                How to resolve a Driver/Partner Dispute?
              </h4>
              <p className="text-sm text-gray-600 mt-2 ml-6">
                Go to the "Partners" tab, locate the driver via Search, click "View Profile", and change their status to "SUSPENDED" pending investigation. Contact them via their listed phone number.
              </p>
            </div>
            <div className="p-6 hover:bg-gray-50 transition-colors">
              <h4 className="text-sm font-bold text-gray-900 flex items-center">
                <Phone className="w-4 h-4 text-green-500 mr-2" />
                Where can I change the Support Phone Number?
              </h4>
              <p className="text-sm text-gray-600 mt-2 ml-6">
                Only a "SuperAdmin" can modify this. If you have the rights, navigate to the "Settings" tab, update the Support Phone field, and click Save.
              </p>
            </div>
            <div className="p-6 hover:bg-gray-50 transition-colors">
              <h4 className="text-sm font-bold text-gray-900 flex items-center">
                <ExternalLink className="w-4 h-4 text-blue-500 mr-2" />
                How are Platform Commissions calculated?
              </h4>
              <p className="text-sm text-gray-600 mt-2 ml-6">
                The global commission rate is applied to the Total Estimated Fare of every "COMPLETED" ride. You can view aggregates in the Finance Dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
