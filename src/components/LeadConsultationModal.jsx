import React, { useState, useEffect } from 'react';
import { X, Heart, Phone, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const LeadConsultationModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [fullName, setFullName] = useState('');
    const [mobileNo, setMobileNo] = useState('');
    const [email, setEmail] = useState('');
    const [state, setState] = useState('Karnataka');
    const [city, setCity] = useState('Bangalore');
    const [requirement, setRequirement] = useState('Pet Buying / Adoption');
    const [mobileError, setMobileError] = useState('');

    const indianStates = [
        'Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Telangana',
        'West Bengal', 'Gujarat', 'Kerala', 'Uttar Pradesh', 'Punjab', 'Rajasthan'
    ];

    const requirementsList = [
        'Pet Buying / Adoption',
        'Pet Hostel / Boarding',
        'Pet Grooming Spa',
        'Pet Walking & Fitness',
        'Pet Transport & Relocation',
        'Pet Insurance',
        'Pet Training & Behavior',
        'Pet Mating & Breeding',
        'Consult A Vet'
    ];

    useEffect(() => {
        // Check session storage to show popup when site opens
        const hasBeenClosed = sessionStorage.getItem('pawora_lead_modal_closed');
        if (!hasBeenClosed) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 700);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem('pawora_lead_modal_closed', 'true');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate Mobile No (Strictly Important)
        const cleanedMobile = mobileNo.replace(/\D/g, '');
        if (!cleanedMobile || cleanedMobile.length < 10) {
            setMobileError('Please enter a valid 10-digit mobile number *');
            toast.error('Mobile Number is required to connect with our Pet Expert!');
            return;
        }

        setMobileError('');
        toast.success(`Thank you ${fullName || 'Pet Lover'}! Our Pet Expert will call ${mobileNo} shortly.`);
        handleClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">

            {/* Semi-transparent Backdrop Overlay */}
            <div
                onClick={handleClose}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            ></div>

            {/* Main Popup Modal Window */}
            <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-purple-100 z-10 animate-in zoom-in-95 duration-200">

                {/* Close Button X */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition cursor-pointer z-20"
                    title="Close Popup"
                >
                    <X size={18} />
                </button>

                {/* Decorative Background Doodles / Header */}
                <div className="pt-8 pb-4 px-6 text-center bg-gradient-to-b from-purple-50/70 to-white relative">

                    {/* Logo Header */}
                    <div className="flex items-center justify-center gap-2 text-[#7c3aed] font-serif font-extrabold text-xl md:text-2xl tracking-wide">
                        <Heart size={22} className="fill-[#7c3aed] text-[#7c3aed]" />
                        <span>INDIA PET HUB</span>
                    </div>

                    <p className="text-xs md:text-sm text-gray-500 font-medium mt-2 max-w-sm mx-auto leading-relaxed">
                        Please fill in the details to connect with our pet expert
                    </p>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="px-6 md:px-8 pb-8 space-y-4">

                    {/* Full Name */}
                    <div>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100 transition bg-gray-50/50 hover:bg-white"
                        />
                    </div>

                    {/* Mobile No (IMPORTANT / REQUIRED FIELD) */}
                    <div className="space-y-1">
                        <div className="relative">
                            <input
                                type="tel"
                                placeholder="Mobile No *"
                                value={mobileNo}
                                onChange={(e) => {
                                    setMobileNo(e.target.value);
                                    if (mobileError) setMobileError('');
                                }}
                                className={`w-full px-4 py-3 border rounded-xl text-xs md:text-sm focus:outline-none transition bg-white pr-24 font-medium ${mobileError
                                        ? 'border-red-500 ring-2 ring-red-100 text-red-900 placeholder-red-400'
                                        : 'border-purple-300 focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100 shadow-sm'
                                    }`}
                                required
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-purple-100 text-[#7c3aed] font-bold text-[10px] uppercase px-2 py-0.5 rounded-md tracking-wider pointer-events-none flex items-center gap-1">
                                <Phone size={10} /> REQUIRED *
                            </span>
                        </div>
                        {mobileError ? (
                            <p className="text-[11px] font-bold text-red-500 pl-1">{mobileError}</p>
                        ) : (
                            <p className="text-[10px] text-gray-400 pl-1 font-semibold flex items-center gap-1">
                                <Sparkles size={10} className="text-[#7c3aed]" />
                                Primary contact field for instant expert callback
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100 transition bg-gray-50/50 hover:bg-white"
                        />
                    </div>

                    {/* State & City Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <select
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                className="w-full px-3 py-3 border border-gray-200 rounded-xl text-xs md:text-sm bg-gray-50/50 hover:bg-white focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100 transition font-medium text-gray-700"
                            >
                                {indianStates.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="City"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100 transition bg-gray-50/50 hover:bg-white"
                            />
                        </div>
                    </div>

                    {/* Requirement */}
                    <div>
                        <select
                            value={requirement}
                            onChange={(e) => setRequirement(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs md:text-sm bg-gray-50/50 hover:bg-white focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-purple-100 transition font-medium text-gray-700"
                        >
                            {requirementsList.map((req) => (
                                <option key={req} value={req}>{req}</option>
                            ))}
                        </select>
                    </div>

                    {/* Submit Button: "Let's Roll" */}
                    <div className="pt-2 flex justify-center">
                        <button
                            type="submit"
                            className="w-48 py-3.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm tracking-wide rounded-xl shadow-lg shadow-purple-200 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                        >
                            Let's Roll
                        </button>
                    </div>

                </form>

            </div>

        </div>
    );
};

export default LeadConsultationModal;
