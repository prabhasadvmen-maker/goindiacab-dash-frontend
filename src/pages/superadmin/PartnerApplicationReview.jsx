import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { CheckCircle, XCircle, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PartnerApplicationReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.superAdminToken) || useAuthStore((state) => state.adminToken);

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Review Actions State
  const [actionType, setActionType] = useState(null); // 'approve', 'reject', 'correction'
  const [rejectionReason, setRejectionReason] = useState('');
  const [correctionNote, setCorrectionNote] = useState('');
  const [correctionFields, setCorrectionFields] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/partner/admin/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setApp(data.partner);
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
      alert('Failed to load application details.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchApplication();
  }, [id]);

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        decision: actionType === 'approve' ? 'approved' : actionType === 'reject' ? 'rejected' : 'correction_required',
      };
      
      if (actionType === 'reject') payload.rejectionReason = rejectionReason;
      if (actionType === 'correction') {
        payload.correctionNote = correctionNote;
        payload.correctionFields = correctionFields.split(',').map(s => s.trim());
      }

      const { data } = await axios.put(
        `${API_URL}/api/partner/admin/review/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setActionType(null);
        fetchApplication();
        // Optional: navigate back automatically if approved/rejected
        if (actionType !== 'correction') {
           setTimeout(() => navigate(-1), 1500);
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error processing review');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-700 border border-green-200 shadow-sm flex items-center"><CheckCircle className="w-4 h-4 mr-2"/> Approved</span>;
      case 'rejected': return <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-700 border border-red-200 shadow-sm flex items-center"><XCircle className="w-4 h-4 mr-2"/> Rejected</span>;
      case 'submitted': return <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 border border-blue-200 shadow-sm">New Submission</span>;
      case 'under_review': return <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-purple-100 text-purple-700 border border-purple-200 shadow-sm flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Under Review</span>;
      case 'correction_required': return <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-orange-100 text-orange-700 border border-orange-200 shadow-sm flex items-center"><AlertCircle className="w-4 h-4 mr-2"/> Correction Needed</span>;
      default: return <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 border border-gray-200 capitalize">{status}</span>;
    }
  };

  const ImageCard = ({ label, src }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <p className="text-sm font-bold text-gray-700 uppercase tracking-wide truncate">{label}</p>
      </div>
      {src && src.length > 10 ? (
        <a href={src} target="_blank" rel="noreferrer" className="block relative w-full h-48 bg-gray-100 overflow-hidden cursor-zoom-in">
          <img src={src} alt={label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
             <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm transition-opacity">View Full Size</span>
          </div>
        </a>
      ) : (
        <div className="w-full h-48 bg-gray-50 flex items-center justify-center">
          <p className="text-gray-400 font-medium text-sm">Not Provided</p>
        </div>
      )}
    </div>
  );

  const SectionTitle = ({ title }) => (
    <div className="flex items-center space-x-2 mb-6">
      <div className="w-2 h-6 bg-[#fa9600] rounded-full"></div>
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    </div>
  );

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#fa9600] mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Loading partner dossier...</p>
      </div>
    );
  }

  if (!app) return null;

  const isPending = ['submitted', 'under_review', 'correction_required'].includes(app.applicationStatus);

  return (
    <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900">{app.name || app.phone}</h1>
            <div className="flex items-center mt-1 space-x-3">
              {getStatusBadge(app.applicationStatus)}
              <span className="text-gray-400 font-medium">|</span>
              <p className="text-gray-500 font-medium text-sm">Application ID: <span className="font-mono text-xs">{app._id}</span></p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {isPending && !actionType && (
            <>
              <button onClick={() => setActionType('reject')} className="px-5 py-2.5 rounded-lg font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors">Reject</button>
              <button onClick={() => setActionType('correction')} className="px-5 py-2.5 rounded-lg font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors">Request Correction</button>
              <button onClick={() => setActionType('approve')} className="px-6 py-2.5 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 shadow-md shadow-green-200 transition-colors flex items-center"><CheckCircle className="w-5 h-5 mr-2"/> Approve Partner</button>
            </>
          )}
        </div>
      </div>

      {isPending && actionType && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleReview}>
            <h4 className="font-bold text-gray-800 mb-4 capitalize text-lg border-b pb-2">Confirm {actionType}</h4>
            
            <div className="max-w-3xl">
              {actionType === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Rejection *</label>
                  <textarea required value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-red-500 focus:border-red-500 p-3 bg-gray-50" rows="3" placeholder="Explain why this application is rejected..."></textarea>
                </div>
              )}

              {actionType === 'correction' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fields to Correct *</label>
                    <input required type="text" value={correctionFields} onChange={(e) => setCorrectionFields(e.target.value)} className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-orange-500 focus:border-orange-500 p-3 bg-gray-50" placeholder="e.g. DL Image, PAN Number" />
                    <p className="text-xs text-gray-500 mt-1">Comma separated</p>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Correction Note</label>
                    <textarea value={correctionNote} onChange={(e) => setCorrectionNote(e.target.value)} className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-orange-500 focus:border-orange-500 p-3 bg-gray-50" rows="3" placeholder="Explain what they need to fix..."></textarea>
                  </div>
                </>
              )}

              {actionType === 'approve' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium">
                    Are you sure you want to approve this partner? They will immediately gain access to the partner dashboard.
                  </div>
              )}
            </div>

            <div className="flex items-center space-x-3 mt-4">
              <button type="submit" disabled={submitting} className={cn(
                "px-8 py-3 text-white font-bold rounded-xl shadow-md transition-all",
                actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                'bg-orange-600 hover:bg-orange-700'
              )}>
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Decision'}
              </button>
              <button type="button" onClick={() => setActionType(null)} className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Information */}
        <div className="xl:col-span-1 space-y-6">
          


          {/* Partner Info Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Profile Overview</h3>
            
            <div className="space-y-4">
              <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contact Details</p>
                <p className="text-gray-800 font-medium">+91 {app.phone}</p>
                <p className="text-gray-600 text-sm mt-0.5">{app.email}</p>
              </div>

              <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Personal</p>
                <p className="text-gray-800 font-medium">{app.gender} • Born {app.dateOfBirth}</p>
              </div>

              <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Address</p>
                <p className="text-gray-800 font-medium text-sm leading-relaxed">
                  {app.address?.line1}, {app.address?.line2 ? `${app.address.line2}, ` : ''}<br/>
                  {app.address?.city}, {app.address?.state} - {app.address?.pincode}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100"><p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Banking</p>
                <p className="text-gray-800 font-medium">{app.bankAccount?.bankName}</p>
                <p className="text-gray-600 text-sm mt-0.5 font-mono">A/C: {app.bankAccount?.accountNumber}</p>
                <p className="text-gray-600 text-sm mt-0.5 font-mono">IFSC: {app.bankAccount?.ifscCode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Documents */}
        <div className="xl:col-span-2 space-y-10">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <SectionTitle title="Vehicle Identity & Specs" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div><p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Reg Number</p><p className="font-black text-xl text-blue-600">{app.vehicleNumber}</p></div>
              <div><p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Make / Model</p><p className="font-bold text-gray-800 text-lg">{app.vehicleDetails?.make} {app.vehicleDetails?.model}</p></div>
              <div><p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Category</p><p className="font-bold text-gray-800 text-lg">{app.vehicleDetails?.category}</p></div>
              <div><p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Fuel / Seats</p><p className="font-bold text-gray-800 text-lg">{app.vehicleDetails?.fuelType} • {app.vehicleDetails?.seatingCapacity}</p></div>
            </div>
          </div>

          <div>
             <SectionTitle title="Partner Identity Documents" />
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ImageCard label={`DL - ${app.drivingLicence?.number}`} src={app.drivingLicence?.frontImage} />
                <ImageCard label={`DL Back`} src={app.drivingLicence?.backImage} />
                <ImageCard label={`Aadhaar - ${app.aadhaar?.number}`} src={app.aadhaar?.frontImage} />
                <ImageCard label={`Aadhaar Back`} src={app.aadhaar?.backImage} />
                <ImageCard label={`PAN - ${app.pan?.number}`} src={app.pan?.image} />
                <ImageCard label="Selfie / Profile" src={app.profilePhoto} />
             </div>
          </div>

          <div>
             <SectionTitle title="Vehicle Documents" />
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ImageCard label={`RC - ${app.vehicleDocuments?.rc?.number}`} src={app.vehicleDocuments?.rc?.image} />
                <ImageCard label={`Insurance`} src={app.vehicleDocuments?.insurance?.image} />
                <ImageCard label={`PUC`} src={app.vehicleDocuments?.puc?.image} />
             </div>
          </div>

          <div>
             <SectionTitle title="Vehicle Live Photos" />
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ImageCard label="Front (With Number Plate)" src={app.vehiclePhotos?.front} />
                <ImageCard label="Back (With Number Plate)" src={app.vehiclePhotos?.back} />
                <ImageCard label="Left Side" src={app.vehiclePhotos?.left} />
                <ImageCard label="Right Side" src={app.vehiclePhotos?.right} />
                <ImageCard label="Interior & Dashboard" src={app.vehiclePhotos?.interior} />
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
