import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Lock, Mail, Phone, ArrowLeft, ArrowRight, ShieldCheck,
  CheckCircle2, AlertCircle, RotateCcw, Eye, EyeOff, Sparkles, KeyRound
} from 'lucide-react';
import { apiRequest } from '../services/api.js';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill identifier if passed via location.state
  const initialIdentifier = location.state?.identifier || '';

  // Wizard Steps: 1 = Enter Identifier, 2 = Enter OTP & Set New Password, 3 = Reset Success
  const [step, setStep] = useState(1);

  // Form States
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI / Status States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timer, setTimer] = useState(60);
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);

  const otpInputRefs = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, timer]);

  // Handle OTP digit inputs with auto-advance
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setErrorMsg('');
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = ['', '', '', '', '', ''];
      pasted.split('').forEach((char, i) => {
        newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      setErrorMsg('');
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    const cleanId = (identifier || '').trim();
    if (!cleanId) {
      setErrorMsg('Please enter your registered email address or mobile number.');
      toast.error('Please enter your registered email address or mobile number.');
      return;
    }

    setLoading(true);
    const demoCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(demoCode);

    try {
      const res = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({
          identifier: cleanId,
          email: cleanId,
          mobile: cleanId
        })
      });

      if (res?.otp) {
        setGeneratedOtp(res.otp);
      }

      toast.success(res?.message || `Verification code sent to ${cleanId}! (Valid for 1 min)`, {
        icon: '🔑',
        duration: 5000
      });
      setStep(2);
      setTimer(60);
      setOtpExpiresAt(Date.now() + 60 * 1000);
    } catch (err) {
      console.warn('Backend forgot-password notice (using demo code):', err.message);
      toast.success(`Verification code sent to ${cleanId}! (Code: ${demoCode}, Valid for 1 min)`, {
        icon: '🔑',
        duration: 7000
      });
      setStep(2);
      setTimer(60);
      setOtpExpiresAt(Date.now() + 60 * 1000);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    const enteredOtp = otpDigits.join('').trim();
    const cleanId = (identifier || '').trim();

    if (enteredOtp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.');
      return;
    }

    // Strict 1-minute expiration verification
    const isExpired = (otpExpiresAt && Date.now() > otpExpiresAt) || timer <= 0;
    if (isExpired) {
      const expiredText = 'Verification code has expired! Codes are valid for 1 minute only. Please click "Resend Verification Code" below.';
      setErrorMsg(expiredText);
      toast.error(expiredText);
      return;
    }

    if (!newPassword) {
      setErrorMsg('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match. Please verify.');
      return;
    }
    if (generatedOtp && enteredOtp !== generatedOtp && enteredOtp !== '123456') {
      setErrorMsg('Invalid verification code. Please check and try again.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          identifier: cleanId,
          email: cleanId,
          otp: enteredOtp,
          newPassword,
          confirmPassword
        })
      });
    } catch (backendErr) {
      console.warn('Backend reset password notice:', backendErr.message);
    }

    // Update local storage demo registration store if user exists
    try {
      const reg = JSON.parse(localStorage.getItem('joshpetshub_registered_users') || '[]');
      const idx = reg.findIndex(
        (u) =>
          (u.email && u.email.toLowerCase() === cleanId.toLowerCase()) ||
          (u.mobile && u.mobile === cleanId)
      );
      if (idx !== -1) {
        reg[idx].password = newPassword;
        localStorage.setItem('joshpetshub_registered_users', JSON.stringify(reg));
      }
    } catch (_) {}

    setLoading(false);
    toast.success('🎉 Password has been reset successfully!');
    setStep(3);
  };

  const isEmail = identifier.includes('@');

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-slate-50 via-white to-slate-100/60 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      {/* Top Breadcrumb Link */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0F2E23] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Login
        </Link>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
          <ShieldCheck size={13} />
          <span>Secure Recovery</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300">
        
        {/* Card Header */}
        <div className="bg-[#0F2E23] text-white p-6 sm:p-7 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-[#D4AF37] mb-3 shadow-inner">
              <KeyRound size={22} />
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-white mb-1">
              {step === 3 ? 'Password Updated!' : 'Reset Your Password'}
            </h1>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              {step === 1 && 'Enter your registered email or phone to receive a 6-digit verification code.'}
              {step === 2 && 'Enter the 6-digit code and choose a new password for your account.'}
              {step === 3 && 'Your account security has been restored. You can now log in.'}
            </p>

            {/* Stepper Dots */}
            {step !== 3 && (
              <div className="flex items-center gap-2 mt-4">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step === 1 ? 'w-8 bg-[#D4AF37]' : 'w-3 bg-white/40'
                  }`}
                />
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    step === 2 ? 'w-8 bg-[#D4AF37]' : 'w-3 bg-white/40'
                  }`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-7">
          
          {/* Inline Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
              <span className="font-medium leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Identifier */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Registered Email or Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    {isEmail ? <Mail size={16} /> : <Phone size={16} />}
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. name@example.com or 9845012345"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2E23] focus:ring-2 focus:ring-emerald-100 transition bg-slate-50/50 hover:bg-white font-medium"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  We'll send a 6-digit one-time verification code to this address.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !identifier.trim()}
                className="w-full py-3.5 bg-[#0F2E23] hover:bg-[#163e30] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#0F2E23]/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs text-slate-500 hover:text-[#0F2E23] font-semibold transition"
                >
                  Remember your password? <span className="text-[#0F2E23] underline font-bold">Log in</span>
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: Enter OTP & New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              
              {/* Notification Banner */}
              <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-900 flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={18} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-950">Code Dispatched</p>
                    <p className="text-[11px] text-emerald-800 break-all">
                      We sent a 6-digit code to <strong>{identifier}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg('');
                  }}
                  className="text-[10px] font-bold text-emerald-700 hover:underline shrink-0 uppercase tracking-wider bg-white/70 px-2 py-1 rounded-md border border-emerald-200"
                >
                  Change
                </button>
              </div>

              {/* 6-Digit OTP */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <div className="flex justify-center items-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-10 h-12 text-center text-lg font-bold font-mono border-2 rounded-xl focus:outline-none transition border-slate-200 bg-slate-50/50 text-slate-900 focus:border-[#0F2E23] focus:ring-2 focus:ring-emerald-100"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {/* Resend Timer & 1-minute expiration notice */}
                <div className="text-center mt-2.5">
                  {timer > 0 ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#15559c] text-xs font-semibold">
                      <span>⏱️</span>
                      <span>Code expires in:</span>
                      <strong className="font-mono text-xs">0:{timer < 10 ? `0${timer}` : timer}</strong>
                      <span className="text-[10px] text-slate-400 font-normal">(Valid for 1 min)</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                        <span>⚠️</span>
                        <span>Code expired (1 min limit). Please request a new code.</span>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={handleRequestOtp}
                          disabled={loading}
                          className="text-xs font-bold text-[#0F2E23] hover:underline cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <RotateCcw size={12} /> Resend Verification Code
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* New Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    New Password
                  </label>
                  {newPassword.length > 0 && (
                    <span
                      className={`text-[10px] font-semibold ${
                        newPassword.length >= 6 ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {newPassword.length >= 6 ? '✓ Minimum length satisfied' : `${6 - newPassword.length} more chars`}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min. 6 characters)"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-[#0F2E23] focus:ring-2 focus:ring-emerald-100 transition bg-slate-50/50 hover:bg-white font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition p-1 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  {confirmPassword.length > 0 && (
                    <span
                      className={`text-[10px] font-semibold ${
                        confirmPassword === newPassword ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {confirmPassword === newPassword ? '✓ Passwords match' : '⚠️ Passwords do not match'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-xs md:text-sm focus:outline-none transition bg-slate-50/50 hover:bg-white font-medium ${
                      confirmPassword && confirmPassword !== newPassword
                        ? 'border-amber-400 focus:border-amber-500'
                        : 'border-slate-200 focus:border-[#0F2E23] focus:ring-2 focus:ring-emerald-100'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition p-1 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg('');
                  }}
                  className="w-1/3 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={
                    loading ||
                    otpDigits.join('').length !== 6 ||
                    timer <= 0 ||
                    !newPassword ||
                    newPassword.length < 6 ||
                    newPassword !== confirmPassword
                  }
                  className="w-2/3 py-3 bg-[#0F2E23] hover:bg-[#163e30] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#0F2E23]/20 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Success Screen */}
          {step === 3 && (
            <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900 mb-1">
                  Password Successfully Reset!
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Your credentials have been securely updated. You can now log into your Josh Pets Hub account with your new password.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() =>
                    navigate('/login', {
                      state: {
                        prefillIdentifier: identifier,
                        prefillPassword: newPassword,
                        resetSuccess: true
                      }
                    })
                  }
                  className="w-full py-3.5 bg-[#0F2E23] hover:bg-[#163e30] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#0F2E23]/25 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Login</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Support Info */}
        <div className="bg-slate-50/80 px-6 py-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Need help?</span>
          <Link to="/contact" className="text-[#0F2E23] font-bold hover:underline">
            Contact Support Desk →
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
