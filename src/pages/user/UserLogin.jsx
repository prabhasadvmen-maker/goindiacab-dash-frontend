import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUserAuthStore } from '../../store/userAuthStore';
import { Loader2, ArrowLeft, Smartphone } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function UserLogin() {
  const navigate = useNavigate();
  const { userLogin } = useUserAuthStore();

  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/v1/user/auth/send-otp`, { phone });
      if (data.success) {
        setStep(2);
        setResendTimer(60);
        // Start countdown
        const interval = setInterval(() => {
          setResendTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/v1/user/auth/verify-otp`, { 
        phone, 
        otp: otpValue 
      });

      if (data.success) {
        userLogin(data.user, data.accessToken);
        if (data.nextScreen === 'profile_setup') {
          // If new user needs to set name
          navigate('/user/profile', { replace: true });
        } else {
          navigate('/user/home', { replace: true });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/v1/user/auth/resend-otp`, { phone });
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 mb-4 p-2">
           <img src="/Goindaicab%20logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">
          Book your ride
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Fast, Safe and Affordable
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-blue-900/5 sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-medium">+91</span>
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    maxLength={10}
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="appearance-none block w-full pl-14 pr-3 py-3.5 border border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium transition-shadow"
                    placeholder="Enter your mobile number"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Smartphone className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {error && <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg">{error}</div>}

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-blue-500/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue with Phone'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="flex flex-col items-center">
                <button type="button" onClick={() => setStep(1)} className="self-start text-gray-400 hover:text-gray-700 mb-2 p-1">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Verify Mobile Number</h3>
                <p className="text-sm text-gray-500 mb-6 text-center">
                  We sent a 6-digit code to <br/><span className="font-bold text-gray-800">+91 {phone}</span>
                </p>
                
                <div className="flex justify-center space-x-2 sm:space-x-3 w-full mb-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 bg-gray-50 focus:bg-white transition-all"
                    />
                  ))}
                </div>
              </div>

              {error && <div className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-lg text-center">{error}</div>}

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-blue-500/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || loading}
                  className={cn(
                    "text-sm font-bold transition-colors",
                    resendTimer > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-800"
                  )}
                >
                  {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
             <p className="text-xs text-gray-500">
               By proceeding, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
