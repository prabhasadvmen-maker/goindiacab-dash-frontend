import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Phone, KeyRound, ArrowRight, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PartnerLogin() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.partnerLogin);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/api/partner/auth/send-otp`, { phone });
      if (data.success) {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/api/partner/auth/verify-otp`, { phone, otp });
      if (data.success) {
        login(data.partner, data.token);
        if (data.partner.applicationStatus === 'approved') {
          navigate('/partner/dashboard');
        } else {
          navigate('/partner/onboarding');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f9fc]">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border-t-4 border-[#fa9600]">
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center">
            <img src="/Goindaicab%20logo.png" alt="Goindiacab Logo" className="object-contain w-full h-full" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Partner Portal</h2>
          <p className="text-sm text-gray-500 mt-2">Login or register using your mobile number</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  maxLength="10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fa9600] focus:border-transparent transition-all font-medium text-lg tracking-wide"
                  placeholder="Enter 10 digit number"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#fa9600] hover:bg-[#e68a00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fa9600] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Send OTP <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP sent to +91 {phone}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fa9600] focus:border-transparent transition-all font-medium text-lg tracking-[0.5em] text-center"
                  placeholder="------"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#fa9600] hover:bg-[#e68a00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#fa9600] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
            </button>
            
            <div className="text-center">
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-sm text-[#fa9600] hover:underline font-medium"
              >
                Change mobile number
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
