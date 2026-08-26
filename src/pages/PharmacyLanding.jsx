import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, ClipboardList, CheckCircle, ShieldAlert, UploadCloud, Info, ArrowRight, HelpCircle } from 'lucide-react';
import { apiUploadRequest, apiRequest } from '../services/api.js';
import { fetchProducts } from '../store/slices/productSlice.js';
import ProductCard from '../components/ProductCard.jsx';
import toast from 'react-hot-toast';

const PharmacyLanding = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { items: products, loading } = useSelector((state) => state.products);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Form State
  const [patientName, setPatientName] = useState('');
  const [veterinarianName, setVeterinarianName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [customerComments, setCustomerComments] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [newPrescId, setNewPrescId] = useState('');

  // Fetch Pharmacy items on mount
  useEffect(() => {
    dispatch(fetchProducts({ petType: 'pharmacy', limit: 20 }));
  }, [dispatch]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only JPG, JPEG, PNG images or PDF documents are accepted.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to upload a prescription.');
      navigate('/login');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a prescription file to upload.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('patientName', patientName);
    formData.append('veterinarianName', veterinarianName);
    formData.append('clinicName', clinicName);
    formData.append('customerComments', customerComments);
    formData.append('file', selectedFile);

    try {
      const data = await apiUploadRequest('/prescriptions', formData);
      if (data.success) {
        toast.success('Prescription uploaded successfully!');
        setUploadSuccess(true);
        setNewPrescId(data.prescription._id);
        // Clear Form
        setPatientName('');
        setVeterinarianName('');
        setClinicName('');
        setCustomerComments('');
        setSelectedFile(null);
      }
    } catch (err) {
      toast.error(err.message || 'Prescription upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const rxProducts = products.filter(p => p.requiresPrescription);
  const regularSupplements = products.filter(p => !p.requiresPrescription);

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. HEALTHCARE HERO */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden border-b border-beige">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1607619056574-7b8d304b3b86?q=80&w=1200" 
            alt="Pawora Veterinary Pharmacy" 
            className="w-full h-full object-cover filter brightness-[0.6]"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white space-y-4">
          <span className="text-[10px] tracking-widest font-bold text-accent uppercase flex items-center justify-center gap-1">
            <ClipboardList size={12} /> PAWORA RX CLINIC & APOTHECARY
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-secondary">Veterinary Health & Pharmacy</h1>
          <p className="text-xs md:text-sm text-secondary-dark max-w-xl mx-auto leading-relaxed font-light">
            Providing high-purity medical care supplements, joints protection tablets, digestive elixirs, and prescription-only medications.
          </p>
        </div>
      </section>

      {/* 2. MEDICAL ADVISORY MESSAGE */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs flex items-center gap-3">
          <ShieldAlert size={20} className="shrink-0" />
          <p className="leading-relaxed">
            <strong>CRITICAL SAFETY NOTE:</strong> Always follow veterinary guidance when using medicines or supplements. Never exceed dosage regulations. Pawora does not make medical claims, and prescription verification is legally mandatory for Rx-classified items.
          </p>
        </div>
      </section>

      {/* 3. CORE PRESCRIPTION UPLOAD HUB */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* UPLOAD FORM (Left 7 Columns) */}
          <div className="lg:col-span-7 bg-white border border-beige p-6 md:p-8 shadow-sm space-y-6">
            <div className="space-y-2 border-b border-beige pb-4">
              <h2 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                <FileText size={20} className="text-accent" /> Upload Vet Prescription
              </h2>
              <p className="text-xs text-gray-500">
                Purchasing prescription-only items? Upload your slip here. Our in-house pharmacist checks and authorizes your orders in under 2 hours.
              </p>
            </div>

            {uploadSuccess ? (
              <div className="p-8 text-center bg-green-50 border border-green-200 text-green-800 space-y-4">
                <CheckCircle size={48} className="mx-auto text-green-600 animate-bounce" />
                <h3 className="font-serif text-base font-bold">Prescription Uploaded Successfully!</h3>
                <p className="text-xs max-w-md mx-auto leading-relaxed">
                  Your prescription record has been saved under ID <strong>{newPrescId}</strong>. Our medical team is verifying your file. You can now add Rx products to your cart and checkout.
                </p>
                <div className="flex justify-center gap-4 pt-2">
                  <button 
                    onClick={() => setUploadSuccess(false)}
                    className="btn-premium py-2 text-xs"
                  >
                    UPLOAD ANOTHER
                  </button>
                  <button 
                    onClick={() => navigate('/account')}
                    className="btn-secondary-premium py-2 text-xs"
                  >
                    VIEW HISTORY
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitPrescription} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-semibold block">Pet / Patient Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Leo (Golden Retriever)"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 font-semibold block">Veterinarian Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Shruti Sharma"
                      value={veterinarianName}
                      onChange={(e) => setVeterinarianName(e.target.value)}
                      className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold block">Veterinary Clinic Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Max Vets Clinic, Bangalore"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold block">Customer Notes / Medicines List</label>
                  <textarea
                    rows={3}
                    placeholder="Enter any instructions or list the prescription products you wish to order..."
                    value={customerComments}
                    onChange={(e) => setCustomerComments(e.target.value)}
                    className="w-full px-3 py-2 border border-beige text-xs focus:outline-none focus:border-primary"
                  ></textarea>
                </div>

                {/* File Dropzone */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-semibold block">Upload prescription (JPG, PNG, or PDF) *</label>
                  <div className="border-2 border-dashed border-beige bg-gray-50 p-6 text-center hover:border-accent transition duration-300 relative">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="space-y-2 pointer-events-none">
                      <UploadCloud size={32} className="mx-auto text-gray-400" />
                      <p className="text-xs font-semibold text-primary">
                        {selectedFile ? selectedFile.name : 'CLICK TO UPLOAD FILES'}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Max file size: 5MB. Must be a clean scan containing doctor registration stamp.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full btn-premium py-3 text-xs tracking-widest"
                >
                  {uploading ? 'PROCESSING UPLOAD...' : 'SUBMIT FOR VET REVIEW'}
                </button>
              </form>
            )}
          </div>

          {/* PRESCRIPTION WORKFLOW FAQs (Right 5 Columns) */}
          <div className="lg:col-span-5 bg-primary text-secondary p-6 md:p-8 space-y-6">
            <h3 className="font-serif text-base text-accent font-bold border-b border-white/10 pb-3 flex items-center gap-2">
              <Info size={18} /> How Verification Works
            </h3>
            
            <div className="space-y-4 text-xs font-light text-secondary-dark">
              <div className="flex gap-3">
                <span className="w-6 h-6 bg-accent text-primary font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <h4 className="font-bold text-white mb-0.5">Upload Prescription</h4>
                  <p>Upload a clear photo or PDF slip containing your pet\'s details, doctor\'s stamp, and issue date.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 bg-accent text-primary font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <h4 className="font-bold text-white mb-0.5">Vet Pharmacist Reviews</h4>
                  <p>Our licensed staff checks the slip and authorizes the Rx items in your order within 2 hours.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 bg-accent text-primary font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <h4 className="font-bold text-white mb-0.5">Dispatch & Delivery</h4>
                  <p>Once approved, your medical items are carefully packed, labeled, and shipped directly to your door.</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 text-[11px] leading-relaxed text-secondary-dark space-y-2">
              <p className="font-semibold text-white flex items-center gap-1">
                <HelpCircle size={14} className="text-accent" /> Need a Prescription?
              </p>
              <p>
                Consult with our partnered veterinarians online. Set up an e-consultation, get a prescription, and shop instantly.
              </p>
              <a 
                href="https://wa.me/918040123456" 
                target="_blank" 
                className="text-accent font-bold hover:text-white transition flex items-center gap-1 group pt-1"
              >
                BOOK CONSULTATION <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* 4. PRESCRIPTION MEDICINES SECTION (Rx Badge items) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-accent font-bold">PRESCRIPTION DRUGS</span>
          <h2 className="text-xl md:text-2xl font-serif">Veterinary Prescriptions (Rx)</h2>
          <p className="text-xs text-gray-500">Verification is legally mandatory for these therapeutic veterinary medicines.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="bg-white border border-beige h-[380px] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {rxProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* 5. REGULAR HEALTH SUPPLEMENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-accent font-bold">DAILY SUPPLEMENTS</span>
          <h2 className="text-xl md:text-2xl font-serif">Everyday Vitamins & Joint Care</h2>
          <p className="text-xs text-gray-500">Vitamins, minerals, coats enhancers, and digestion syrups (no prescription required).</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="bg-white border border-beige h-[380px] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {regularSupplements.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default PharmacyLanding;
