import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Loader2, CheckCircle2, ChevronRight, Upload, LogOut } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PartnerOnboarding() {
  const { partnerUser, partnerToken, partnerLogin, partnerLogout } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // We rely on partnerUser.currentStep from the backend to render the correct view
  const currentStep = partnerUser?.currentStep || 3;

  // Form States (Using a generic state for all forms for brevity)
  const [formData, setFormData] = useState({
    // Step 3
    vehicleNumber: '', vehicleRegistrationYear: '',
    // Step 6
    name: '', email: '', dateOfBirth: '', gender: 'Male', profilePhoto: '',
    // Step 7
    line1: '', line2: '', city: '', state: '', pincode: '',
    // Step 8
    dlNumber: '', dlExpiry: '', dlFront: '', dlBack: '',
    // Step 9
    aadhaarNumber: '', aadhaarFront: '', aadhaarBack: '',
    // Step 10
    panNumber: '', panImage: '',
    // Step 11
    accountNumber: '', ifscCode: '', bankName: '', accountHolderName: '',
    // Step 12
    make: '', model: '', color: '', fuelType: 'Diesel', seatingCapacity: 4, category: 'Mini',
    // Step 13
    rcNumber: '', rcExpiry: '', rcImage: '',
    insNumber: '', insExpiry: '', insImage: '',
    pucNumber: '', pucExpiry: '', pucImage: '',
    // Step 14
    front: '', back: '', left: '', right: '', interior: '',
  });

  const [reviewData, setReviewData] = useState(null);

  // Redirect if approved
  useEffect(() => {
    if (partnerUser?.applicationStatus === 'approved') {
      navigate('/partner/dashboard');
    }
  }, [partnerUser, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [fieldName]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSession = (data) => {
    if (data.success && data.partner) {
      partnerLogin(data.partner, partnerToken);
    }
  };

  const submitAPI = async (method, endpoint, payload) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await axios({
        method,
        url: `${API_URL}/api/partner/onboarding/${endpoint}`,
        data: payload,
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      updateSession(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = (e) => {
    e.preventDefault();
    submitAPI('post', 'vehicle-check', { 
      vehicleNumber: formData.vehicleNumber, 
      vehicleRegistrationYear: formData.vehicleRegistrationYear 
    });
  };

  const handleStep6 = (e) => {
    e.preventDefault();
    submitAPI('put', 'personal-details', { 
      name: formData.name, email: formData.email, dateOfBirth: formData.dateOfBirth, gender: formData.gender, profilePhoto: formData.profilePhoto || 'https://via.placeholder.com/150'
    });
  };

  const handleStep7 = (e) => {
    e.preventDefault();
    submitAPI('put', 'address', { 
      line1: formData.line1, line2: formData.line2, city: formData.city, state: formData.state, pincode: formData.pincode 
    });
  };

  const handleStep8 = (e) => {
    e.preventDefault();
    submitAPI('put', 'driving-licence', { 
      number: formData.dlNumber, expiryDate: formData.dlExpiry, frontImage: formData.dlFront, backImage: formData.dlBack 
    });
  };

  const handleStep9 = (e) => {
    e.preventDefault();
    submitAPI('put', 'aadhaar', { 
      number: formData.aadhaarNumber, frontImage: formData.aadhaarFront, backImage: formData.aadhaarBack 
    });
  };

  const handleStep10 = (e) => {
    e.preventDefault();
    submitAPI('put', 'pan', { 
      number: formData.panNumber, image: formData.panImage 
    });
  };

  const handleStep11 = (e) => {
    e.preventDefault();
    submitAPI('put', 'bank-account', { 
      accountNumber: formData.accountNumber, ifscCode: formData.ifscCode, bankName: formData.bankName, accountHolderName: formData.accountHolderName 
    });
  };

  const handleStep12 = (e) => {
    e.preventDefault();
    submitAPI('put', 'vehicle-details', { 
      make: formData.make, model: formData.model, color: formData.color, fuelType: formData.fuelType, seatingCapacity: formData.seatingCapacity, category: formData.category 
    });
  };

  const handleStep13 = (e) => {
    e.preventDefault();
    submitAPI('put', 'vehicle-documents', { 
      rc: { number: formData.rcNumber, expiryDate: formData.rcExpiry, image: formData.rcImage },
      insurance: { policyNumber: formData.insNumber, expiryDate: formData.insExpiry, image: formData.insImage },
      puc: { certificateNumber: formData.pucNumber, expiryDate: formData.pucExpiry, image: formData.pucImage }
    });
  };

  const handleStep14 = (e) => {
    e.preventDefault();
    submitAPI('put', 'vehicle-photos', { 
      front: formData.front, back: formData.back, left: formData.left, right: formData.right, interior: formData.interior 
    });
  };

  const fetchReview = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/partner/onboarding/review`, {
        headers: { Authorization: `Bearer ${partnerToken}` }
      });
      setReviewData(data.partner);
    } catch (err) {
      setError('Failed to fetch review data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStep === 15) {
      fetchReview();
    }
  }, [currentStep]);

  const handleStep16 = (e) => {
    e.preventDefault();
    // Simulate Payment
    submitAPI('post', 'payment', { 
      transactionId: `TXN${Math.random().toString().slice(2, 12)}` 
    });
  };

  const handleStep18 = (e) => {
    e.preventDefault();
    submitAPI('post', 'submit', {});
  };

  const FileInput = ({ label, field }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#fa9600] transition-colors">
        <div className="space-y-1 text-center">
          {formData[field] ? (
            <div className="text-green-500 font-medium text-sm flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 mr-1" /> Image Uploaded
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600 justify-center">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-[#fa9600] hover:text-[#e68a00] focus-within:outline-none">
                  <span>Upload a file</span>
                  <input type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileUpload(e, field)} required />
                </label>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <img src="/Goindaicab%20logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <h1 className="font-bold text-lg text-gray-800">Partner Onboarding</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            Step {currentStep <= 15 ? currentStep : currentStep === 19 ? 'Done' : 'Review'}
          </span>
          <button onClick={() => { partnerLogout(); navigate('/partner/login'); }} className="text-gray-500 hover:text-red-500 transition-colors" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Form Area */}
      <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-10 border-t-4 border-[#fa9600]">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r">
              {error}
            </div>
          )}

          {currentStep === 3 && (
            <form onSubmit={handleStep3} className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Vehicle Eligibility Check</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                  <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600] focus:border-[#fa9600]" placeholder="UP32AB1234" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Year</label>
                  <input type="number" name="vehicleRegistrationYear" value={formData.vehicleRegistrationYear} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600] focus:border-[#fa9600]" placeholder="2022" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#fa9600] text-white p-3 rounded-lg font-bold hover:bg-[#e68a00] flex justify-center items-center mt-4">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Check Eligibility'}
              </button>
            </form>
          )}

          {currentStep === 6 && (
            <form onSubmit={handleStep6} className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Gender</label><select name="gender" value={formData.gender} onChange={handleChange} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]"><option>Male</option><option>Female</option><option>Other</option></select></div>
              </div>
              <FileInput label="Profile Photo (Selfie)" field="profilePhoto" />
              <button type="submit" disabled={loading} className="w-full bg-[#fa9600] text-white p-3 rounded-lg font-bold flex justify-center items-center">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save & Continue'}</button>
            </form>
          )}

          {currentStep === 7 && (
            <form onSubmit={handleStep7} className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Address Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label><input type="text" name="line1" value={formData.line1} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label><input type="text" name="line2" value={formData.line2} onChange={handleChange} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">City</label><input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">State</label><input type="text" name="state" value={formData.state} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label><input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required pattern="[0-9]{6}" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#fa9600] text-white p-3 rounded-lg font-bold flex justify-center items-center">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save & Continue'}</button>
            </form>
          )}

          {currentStep === 8 && (
            <form onSubmit={handleStep8} className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Driving Licence</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">DL Number</label><input type="text" name="dlNumber" value={formData.dlNumber} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label><input type="date" name="dlExpiry" value={formData.dlExpiry} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <FileInput label="DL Front Image" field="dlFront" />
                <FileInput label="DL Back Image" field="dlBack" />
              </div>
              <button type="submit" disabled={loading || !formData.dlFront || !formData.dlBack} className="w-full bg-[#fa9600] text-white p-3 rounded-lg font-bold flex justify-center items-center disabled:opacity-50">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save & Continue'}</button>
            </form>
          )}

          {currentStep === 9 && (
            <form onSubmit={handleStep9} className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Aadhaar Verification</h2>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label><input type="text" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} required pattern="[0-9]{12}" className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" placeholder="12 Digit Number" /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <FileInput label="Aadhaar Front" field="aadhaarFront" />
                <FileInput label="Aadhaar Back" field="aadhaarBack" />
              </div>
              <button type="submit" disabled={loading || !formData.aadhaarFront || !formData.aadhaarBack} className="w-full bg-[#fa9600] text-white p-3 rounded-lg font-bold flex justify-center items-center disabled:opacity-50">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save & Continue'}</button>
            </form>
          )}

          {currentStep === 10 && (
            <form onSubmit={handleStep10} className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">PAN Card Details</h2>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label><input type="text" name="panNumber" value={formData.panNumber} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600] uppercase" placeholder="ABCDE1234F" /></div>
              <FileInput label="PAN Card Image" field="panImage" />
              <button type="submit" disabled={loading || !formData.panImage} className="w-full bg-[#fa9600] text-white p-3 rounded-lg font-bold flex justify-center items-center disabled:opacity-50">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save & Continue'}</button>
            </form>
          )}

          {currentStep === 11 && (
            <form onSubmit={handleStep11} className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Bank Account Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label><input type="text" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label><input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label><input type="text" name="ifscCode" value={formData.ifscCode} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600] uppercase" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label><input type="text" name="bankName" value={formData.bankName} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#fa9600] text-white p-3 rounded-lg font-bold flex justify-center items-center">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save & Continue'}</button>
            </form>
          )}

          {currentStep === 12 && (
            <form onSubmit={handleStep12} className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Vehicle Specification</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Make (Brand)</label><input type="text" name="make" value={formData.make} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Model</label><input type="text" name="model" value={formData.model} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Color</label><input type="text" name="color" value={formData.color} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label><select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]"><option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Seating Capacity</label><input type="number" name="seatingCapacity" value={formData.seatingCapacity} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select name="category" value={formData.category} onChange={handleChange} className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]"><option>Mini</option><option>Sedan</option><option>SUV</option></select></div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#fa9600] text-white p-3 rounded-lg font-bold flex justify-center items-center">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save & Continue'}</button>
            </form>
          )}

          {currentStep === 13 && (
            <form onSubmit={handleStep13} className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Vehicle Documents</h2>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-lg mb-4 text-gray-700">RC (Registration Certificate)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">RC Number</label><input type="text" name="rcNumber" value={formData.rcNumber} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label><input type="date" name="rcExpiry" value={formData.rcExpiry} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                </div>
                <div className="mt-4"><FileInput label="RC Image" field="rcImage" /></div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-lg mb-4 text-gray-700">Insurance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label><input type="text" name="insNumber" value={formData.insNumber} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label><input type="date" name="insExpiry" value={formData.insExpiry} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                </div>
                <div className="mt-4"><FileInput label="Insurance Image" field="insImage" /></div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-lg mb-4 text-gray-700">PUC (Pollution)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">PUC Number</label><input type="text" name="pucNumber" value={formData.pucNumber} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label><input type="date" name="pucExpiry" value={formData.pucExpiry} onChange={handleChange} required className="w-full border-gray-300 rounded-lg p-2.5 border focus:ring-[#fa9600]" /></div>
                </div>
                <div className="mt-4"><FileInput label="PUC Image" field="pucImage" /></div>
              </div>

              <button type="submit" disabled={loading || !formData.rcImage || !formData.insImage || !formData.pucImage} className="w-full bg-[#fa9600] text-white p-3 rounded-lg font-bold flex justify-center items-center disabled:opacity-50">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save & Continue'}</button>
            </form>
          )}

          {currentStep === 14 && (
            <form onSubmit={handleStep14} className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Vehicle Live Photos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileInput label="Front View (with Number Plate)" field="front" />
                <FileInput label="Back View (with Number Plate)" field="back" />
                <FileInput label="Left Side View" field="left" />
                <FileInput label="Right Side View" field="right" />
                <FileInput label="Interior View" field="interior" />
              </div>
              <button type="submit" disabled={loading || !formData.front || !formData.back || !formData.left || !formData.right || !formData.interior} className="w-full bg-[#fa9600] text-white p-3 rounded-lg font-bold flex justify-center items-center disabled:opacity-50">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save & Continue'}</button>
            </form>
          )}

          {currentStep === 15 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Application Review</h2>
              {loading && !reviewData ? (
                <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-[#fa9600]" /></div>
              ) : reviewData ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-lg text-gray-700">Personal Details</h3>
                    <p className="text-sm text-gray-600 mt-2"><strong>Name:</strong> {reviewData.name}</p>
                    <p className="text-sm text-gray-600"><strong>Phone:</strong> {reviewData.phone}</p>
                    <p className="text-sm text-gray-600"><strong>Email:</strong> {reviewData.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-lg text-gray-700">Vehicle</h3>
                    <p className="text-sm text-gray-600 mt-2"><strong>Number:</strong> {reviewData.vehicleNumber}</p>
                    <p className="text-sm text-gray-600"><strong>Model:</strong> {reviewData.vehicleDetails?.make} {reviewData.vehicleDetails?.model}</p>
                  </div>

                  <form onSubmit={handleStep16}>
                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl text-center mb-6 mt-6">
                      <h3 className="text-xl font-bold text-blue-900 mb-2">Onboarding Fee</h3>
                      <p className="text-3xl font-black text-[#fa9600] mb-2">₹1999</p>
                      <p className="text-sm text-blue-700 mb-6">One-time registration and verification fee.</p>
                      <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold shadow-lg transition-all flex justify-center items-center">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay Securely & Continue'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}
            </div>
          )}

          {/* Note: In backend, recordPayment sets step to 18, so we check for 18 for submit */}
          {currentStep === 18 && (
            <form onSubmit={handleStep18} className="space-y-6 animate-in fade-in duration-300 text-center py-10">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">Your payment of ₹1999 has been recorded. Please submit your application to send it to the admin for review.</p>
              
              <button type="submit" disabled={loading} className="w-full max-w-md mx-auto bg-green-600 text-white p-4 rounded-xl font-bold hover:bg-green-700 flex justify-center items-center shadow-lg transition-all">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Application'}
              </button>
            </form>
          )}

          {currentStep === 19 && (
            <div className="space-y-6 animate-in fade-in duration-300 text-center py-10">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Application Under Review</h2>
              <p className="text-gray-600 max-w-md mx-auto">Thank you for submitting your application. Our team is currently reviewing your documents. We will notify you once it is approved.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
