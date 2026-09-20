import React from 'react';
import { ShieldCheck, HelpCircle, Phone, Mail, FileText, ExternalLink } from 'lucide-react';

export default function Support() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-[calc(100vh-80px)] overflow-y-auto space-y-8">
      
      <div>
         <h2 className="text-3xl font-black text-gray-900">Support & Help</h2>
         <p className="text-gray-500 font-medium mt-1">We are here to help you 24/7.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Emergency Contact */}
         <div className="bg-red-50 p-8 rounded-3xl border border-red-100 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
               <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="font-black text-red-900 text-xl mb-2">Emergency SOS</h3>
            <p className="text-red-700 font-medium mb-6">In case of any emergency during your ride, tap below to contact police.</p>
            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold w-full transition-colors">
               Call 100
            </button>
         </div>

         <div className="space-y-6">
            <a href="tel:18001234567" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center hover:border-gray-200 transition-colors group">
               <div className="w-12 h-12 bg-gray-50 text-gray-600 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                  <Phone className="w-6 h-6" />
               </div>
               <div>
                  <h4 className="font-bold text-gray-900">Call Support</h4>
                  <p className="text-sm font-medium text-gray-500">1800-123-4567</p>
               </div>
            </a>
            
            <a href="mailto:support@goindiacab.com" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center hover:border-gray-200 transition-colors group">
               <div className="w-12 h-12 bg-gray-50 text-gray-600 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Mail className="w-6 h-6" />
               </div>
               <div>
                  <h4 className="font-bold text-gray-900">Email Us</h4>
                  <p className="text-sm font-medium text-gray-500">support@goindiacab.com</p>
               </div>
            </a>
         </div>
      </div>

      <div>
         <h3 className="font-black text-xl text-gray-900 mb-4">Frequently Asked Questions</h3>
         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {[
               'How do I cancel a ride?',
               'What payment methods are accepted?',
               'How do I report a lost item?',
               'Can I schedule a ride in advance?'
            ].map((q, i) => (
               <div key={i} className="p-6 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors">
                  <span className="font-bold text-gray-700">{q}</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
               </div>
            ))}
         </div>
      </div>

    </div>
  );
}
