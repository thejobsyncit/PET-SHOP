import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { login, register, clearAuthError, logout } from '../store/slices/authSlice.js';
import toast from 'react-hot-toast';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isAuthenticated, user, error, loading } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('login');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  useEffect(() => {
    // Clear errors on tab swap
    dispatch(clearAuthError());
  }, [activeTab, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        toast.error('Access Denied: Administrator logins must be processed via the secure Admin Gateway.');
        dispatch(logout());
      } else {
        toast.success(`Welcome back, ${user.name}!`);
        navigate('/account');
      }
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please enter both email and password.');
      return;
    }
    dispatch(login({ email: loginEmail, password: loginPassword }));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      toast.error('Please enter name, email, and password.');
      return;
    }
    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    dispatch(register({ name: regName, email: regEmail, password: regPassword }));
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="bg-white border border-beige p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Toggle tabs */}
        <div className="flex border-b border-beige pb-1 justify-center gap-4">
          <button
            onClick={() => setActiveTab('login')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'login' 
                ? 'text-primary border-b-2 border-primary font-bold' 
                : 'text-gray-400 hover:text-primary'
            }`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'register' 
                ? 'text-primary border-b-2 border-primary font-bold' 
                : 'text-gray-400 hover:text-primary'
            }`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {activeTab === 'login' ? (
          // SIGN IN FORM
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-accent font-bold">WELCOME BACK</span>
              <h2 className="font-serif text-lg font-bold text-primary">Login to Pawora</h2>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-beige text-xs focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="PASSWORD"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-beige text-xs focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-premium py-2.5 text-xs uppercase"
            >
              {loading ? 'AUTHENTICATING...' : 'LOGIN'}
            </button>

            {/* Admin Demo Details box */}
            <div className="bg-sand p-3 border border-beige text-[10px] text-gray-500 leading-relaxed space-y-1">
              <p className="font-semibold text-primary uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck size={12} className="text-accent" /> Developer Demo Credentials
              </p>
              <p><strong>Customer:</strong> customer1@pawora.com / Customer@123</p>
            </div>
          </form>
        ) : (
          // CREATE ACCOUNT FORM
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-accent font-bold">JOIN PAWORA FAMILY</span>
              <h2 className="font-serif text-lg font-bold text-primary">Create Your Profile</h2>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="FULL NAME"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-beige text-xs focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="EMAIL ADDRESS"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-beige text-xs focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="CHOOSE PASSWORD (MIN 6 CHARS)"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-beige text-xs focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-premium py-2.5 text-xs uppercase"
            >
              {loading ? 'REGISTERING...' : 'REGISTER'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default Login;
