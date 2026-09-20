import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUserAuthStore } from '../../store/userAuthStore';
import { MapPin, Navigation, Car, CreditCard, ChevronRight, CheckCircle2, Clock, Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Custom hook for debouncing search input
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function BookCab() {
  const { userToken } = useUserAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [estimates, setEstimates] = useState(null);
  
  const [pickupText, setPickupText] = useState('');
  const [dropoffText, setDropoffText] = useState('');
  
  // Selected Full Objects { lat, lng, address }
  const [pickupData, setPickupData] = useState(null);
  const [dropoffData, setDropoffData] = useState(null);

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  
  const [activeField, setActiveField] = useState(null); // 'pickup' or 'dropoff'
  const [fetchingSuggestions, setFetchingSuggestions] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  const debouncedPickup = useDebounce(pickupText, 400);
  const debouncedDropoff = useDebounce(dropoffText, 400);

  // Fetch suggestions when text changes
  useEffect(() => {
    if (activeField === 'pickup' && debouncedPickup && !pickupData) {
      fetchSuggestions(debouncedPickup, 'pickup');
    } else if (activeField === 'pickup' && !debouncedPickup) {
      setPickupSuggestions([]);
    }
  }, [debouncedPickup, activeField]);

  useEffect(() => {
    if (activeField === 'dropoff' && debouncedDropoff && !dropoffData) {
      fetchSuggestions(debouncedDropoff, 'dropoff');
    } else if (activeField === 'dropoff' && !debouncedDropoff) {
      setDropoffSuggestions([]);
    }
  }, [debouncedDropoff, activeField]);

  const fetchSuggestions = async (input, type) => {
    setFetchingSuggestions(true);
    try {
      const response = await axios.get(`${API_URL}/api/v1/maps/autocomplete?input=${encodeURIComponent(input)}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (response.data.success) {
        if (type === 'pickup') setPickupSuggestions(response.data.data);
        else setDropoffSuggestions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setFetchingSuggestions(false);
    }
  };

  const handleSelectPlace = async (placeId, description, type) => {
    setLoading(true);
    if (type === 'pickup') {
      setPickupText(description);
      setPickupSuggestions([]);
      setActiveField(null);
    } else {
      setDropoffText(description);
      setDropoffSuggestions([]);
      setActiveField(null);
    }

    try {
      const response = await axios.get(`${API_URL}/api/v1/maps/place?placeId=${placeId}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (response.data.success) {
        const details = response.data.data;
        if (type === 'pickup') setPickupData(details);
        else setDropoffData(details);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      alert('Failed to get location details. Please try another place.');
      if (type === 'pickup') { setPickupText(''); setPickupData(null); }
      else { setDropoffText(''); setDropoffData(null); }
    } finally {
      setLoading(false);
    }
  };

  // Reset selected data if user edits the text
  const handleTextChange = (e, type) => {
    if (type === 'pickup') {
      setPickupText(e.target.value);
      setPickupData(null);
      setActiveField('pickup');
    } else {
      setDropoffText(e.target.value);
      setDropoffData(null);
      setActiveField('dropoff');
    }
  };

  const handleEstimateFare = async () => {
    if (!pickupData || !dropoffData) {
      alert('Please select valid pickup and dropoff locations from the suggestions.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/v1/user/operations/estimate-fare`, {
        pickupLat: pickupData.lat,
        pickupLng: pickupData.lng,
        dropoffLat: dropoffData.lat,
        dropoffLng: dropoffData.lng
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      if (response.data.success) {
        setEstimates(response.data);
        setStep(2);
      }
    } catch (error) {
      console.error('Error estimating fare:', error);
      alert('Failed to calculate fare. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = async () => {
    if (!selectedVehicle || !pickupData || !dropoffData) return;

    setLoading(true);
    try {
      const payload = {
        pickup: { address: pickupData.address, lat: pickupData.lat, lng: pickupData.lng },
        dropoff: { address: dropoffData.address, lat: dropoffData.lat, lng: dropoffData.lng },
        vehicleType: selectedVehicle.type,
        estimatedFare: selectedVehicle.estimatedFare,
        distance: estimates.distance,
        duration: estimates.duration,
        paymentMethod
      };

      const response = await axios.post(`${API_URL}/api/v1/user/operations/bookings`, payload, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      if (response.data.success) {
        navigate('/user/bookings');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to book ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-[calc(100vh-80px)] overflow-y-auto">
      
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 px-4">
         <div className={cn("flex flex-col items-center", step >= 1 ? "text-orange-500" : "text-gray-400")}>
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2", step >= 1 ? "bg-orange-100" : "bg-gray-100")}>1</div>
            <span className="text-xs font-bold uppercase">Location</span>
         </div>
         <div className={cn("flex-1 h-1 mx-4 rounded-full", step >= 2 ? "bg-orange-500" : "bg-gray-200")}></div>
         <div className={cn("flex flex-col items-center", step >= 2 ? "text-orange-500" : "text-gray-400")}>
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2", step >= 2 ? "bg-orange-100" : "bg-gray-100")}>2</div>
            <span className="text-xs font-bold uppercase">Vehicle</span>
         </div>
         <div className={cn("flex-1 h-1 mx-4 rounded-full", step >= 3 ? "bg-orange-500" : "bg-gray-200")}></div>
         <div className={cn("flex flex-col items-center", step >= 3 ? "text-orange-500" : "text-gray-400")}>
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2", step >= 3 ? "bg-orange-100" : "bg-gray-100")}>3</div>
            <span className="text-xs font-bold uppercase">Confirm</span>
         </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-visible">
        
        {/* Step 1: Location Selection */}
        {step === 1 && (
          <div className="p-8">
            <h2 className="text-3xl font-black text-gray-900 mb-6">Where to?</h2>
            
            <div className="space-y-6 relative">
              <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-gray-200 z-0"></div>
              
              {/* Pickup Field */}
              <div className="relative z-20">
                <div className="relative flex items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-4 flex-shrink-0 shadow-sm border-2 border-white"></div>
                  <input 
                    type="text" 
                    value={pickupText}
                    onChange={(e) => handleTextChange(e, 'pickup')}
                    onFocus={() => setActiveField('pickup')}
                    placeholder="Search pickup location..." 
                    className="bg-transparent border-none outline-none w-full text-lg font-medium text-gray-900 placeholder:text-gray-400"
                  />
                  {activeField === 'pickup' && fetchingSuggestions && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
                </div>

                {/* Autocomplete Dropdown for Pickup */}
                {activeField === 'pickup' && pickupSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto z-50">
                    {pickupSuggestions.map(place => (
                      <div 
                        key={place.placeId} 
                        onClick={() => handleSelectPlace(place.placeId, place.description, 'pickup')}
                        className="p-4 hover:bg-gray-50 border-b border-gray-50 cursor-pointer flex items-center"
                      >
                        <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                        <div>
                           <p className="font-bold text-gray-900 text-sm">{place.mainText}</p>
                           <p className="text-xs text-gray-500">{place.secondaryText}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropoff Field */}
              <div className="relative z-10">
                <div className="relative flex items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition-all">
                  <div className="w-4 h-4 bg-orange-500 mr-4 flex-shrink-0 shadow-sm border-2 border-white"></div>
                  <input 
                    type="text" 
                    value={dropoffText}
                    onChange={(e) => handleTextChange(e, 'dropoff')}
                    onFocus={() => setActiveField('dropoff')}
                    placeholder="Search dropoff destination..." 
                    className="bg-transparent border-none outline-none w-full text-lg font-medium text-gray-900 placeholder:text-gray-400"
                  />
                  {activeField === 'dropoff' && fetchingSuggestions && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
                </div>

                {/* Autocomplete Dropdown for Dropoff */}
                {activeField === 'dropoff' && dropoffSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto z-50">
                    {dropoffSuggestions.map(place => (
                      <div 
                        key={place.placeId} 
                        onClick={() => handleSelectPlace(place.placeId, place.description, 'dropoff')}
                        className="p-4 hover:bg-gray-50 border-b border-gray-50 cursor-pointer flex items-center"
                      >
                        <MapPin className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                        <div>
                           <p className="font-bold text-gray-900 text-sm">{place.mainText}</p>
                           <p className="text-xs text-gray-500">{place.secondaryText}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleEstimateFare}
              disabled={loading || !pickupData || !dropoffData}
              className="w-full mt-8 bg-black hover:bg-gray-800 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Find Cabs <ChevronRight className="w-6 h-6 ml-2" /></>
              )}
            </button>
            {(!pickupData || !dropoffData) && pickupText && dropoffText && (
               <p className="text-center text-red-500 text-sm mt-3 font-medium">Please select valid locations from the suggestions list.</p>
            )}
          </div>
        )}

        {/* Step 2: Vehicle Selection */}
        {step === 2 && estimates && (
          <div className="p-0">
            <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase">Estimated Route</p>
                <div className="flex items-center mt-1 text-gray-900 font-medium">
                   <Clock className="w-4 h-4 mr-1 text-orange-500"/> {estimates.duration.text} 
                   <span className="mx-2 text-gray-300">|</span> 
                   <Navigation className="w-4 h-4 mr-1 text-blue-500"/> {estimates.distance.text}
                </div>
              </div>
              <button onClick={() => setStep(1)} className="text-sm font-bold text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-xl transition-colors">Edit Route</button>
            </div>

            <div className="p-6 space-y-4">
              <h3 className="text-xl font-black text-gray-900 mb-4">Select a Ride</h3>
              
              {estimates.fares.map((vehicle, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all",
                    selectedVehicle?.type === vehicle.type 
                      ? "border-orange-500 bg-orange-50" 
                      : "border-gray-100 hover:border-gray-300 bg-white"
                  )}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                       <Car className="w-8 h-8 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-gray-900">{vehicle.type}</h4>
                      <p className="text-sm text-gray-500 font-medium">{vehicle.description || `Comfortable ride for ${vehicle.capacity} pax`}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-2xl text-gray-900">₹{vehicle.estimatedFare}</p>
                    {selectedVehicle?.type === vehicle.type && (
                       <CheckCircle2 className="w-5 h-5 text-orange-500 ml-auto mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 pt-0">
               <button 
                onClick={() => setStep(3)}
                disabled={!selectedVehicle}
                className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && selectedVehicle && (
          <div className="p-8">
            <h2 className="text-3xl font-black text-gray-900 mb-6">Confirm Ride</h2>
            
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
               <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                  <div>
                     <p className="text-sm font-bold text-gray-500 uppercase">Vehicle</p>
                     <p className="font-black text-xl text-gray-900">{selectedVehicle.type}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-sm font-bold text-gray-500 uppercase">Total Fare</p>
                     <p className="font-black text-2xl text-gray-900">₹{selectedVehicle.estimatedFare}</p>
                  </div>
               </div>
               
               <div className="space-y-3">
                  <div className="flex items-start">
                     <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 mr-3 flex-shrink-0"></div>
                     <p className="text-gray-900 font-medium text-sm leading-snug">{pickupData.address}</p>
                  </div>
                  <div className="flex items-start">
                     <div className="w-2 h-2 bg-orange-500 mt-1.5 mr-3 flex-shrink-0"></div>
                     <p className="text-gray-900 font-medium text-sm leading-snug">{dropoffData.address}</p>
                  </div>
               </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm">Payment Method</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div 
                  onClick={() => setPaymentMethod('CASH')}
                  className={cn(
                     "p-4 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-colors font-bold",
                     paymentMethod === 'CASH' ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 hover:bg-gray-50 text-gray-600"
                  )}
               >
                  Cash
               </div>
               <div 
                  onClick={() => setPaymentMethod('WALLET')}
                  className={cn(
                     "p-4 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-colors font-bold",
                     paymentMethod === 'WALLET' ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:bg-gray-50 text-gray-600"
                  )}
               >
                  <CreditCard className="w-5 h-5 mr-2"/> Wallet
               </div>
            </div>

            <div className="flex space-x-4">
               <button 
                 onClick={() => setStep(2)}
                 className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-4 rounded-2xl font-bold text-lg transition-colors"
               >
                 Back
               </button>
               <button 
                 onClick={handleBookRide}
                 disabled={loading}
                 className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50 shadow-lg shadow-orange-500/30"
               >
                 {loading ? (
                   <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                 ) : (
                   'Confirm Booking'
                 )}
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
