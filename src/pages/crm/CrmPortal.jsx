import React, { useState, useEffect } from 'react';
import {
  Briefcase, Users, Target, MessageSquare, CheckSquare, ShoppingBag,
  Calendar, Phone, Mail, MessageCircle, Search, Plus, Filter,
  LogOut, Shield, CheckCircle, Clock, AlertTriangle, ArrowRight,
  ChevronRight, RefreshCw, X, ExternalLink, Sparkles, Send,
  UserCheck, DollarSign, Tag, FileText, ChevronDown, Check, Lock,
  Stethoscope, Truck, Package, ShieldCheck, Megaphone, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';

// Department Modular Components
import CrmStaffManagerTab from '../../components/crm/CrmStaffManagerTab.jsx';
import CustomerSupportView from '../../components/crm/CustomerSupportView.jsx';
import ServiceOperationsView from '../../components/crm/ServiceOperationsView.jsx';
import EcommerceManagerView from '../../components/crm/EcommerceManagerView.jsx';
import FinanceManagerView from '../../components/crm/FinanceManagerView.jsx';
import ProviderRelationsView from '../../components/crm/ProviderRelationsView.jsx';
import MarketingManagerView from '../../components/crm/MarketingManagerView.jsx';
import QualityComplianceView from '../../components/crm/QualityComplianceView.jsx';
import TechnicalSupportView from '../../components/crm/TechnicalSupportView.jsx';
import AnnouncementsManagerView from '../../components/dashboards/AnnouncementsManagerView.jsx';
import CouponsManagerView from '../../components/dashboards/CouponsManagerView.jsx';
import BlogsManagerView from '../../components/dashboards/BlogsManagerView.jsx';

const CRM_TOKEN_KEY = 'joshpetshub_crm_token';
const CRM_USER_KEY = 'joshpetshub_crm_user';

// The 9 Primary Department Manager Roles
const PRESET_MANAGERS = [
  { role: 'CRM Admin / Operations Head', email: 'admin.crm@joshpetshub.com', pass: 'CrmAdmin@123', color: '#0F2E23', dept: 'Operations & Admin' },
  { role: 'Customer Support Manager', email: 'support.mgr@joshpetshub.com', pass: 'CrmSupport@123', color: '#0284C7', dept: 'Customer Support' },
  { role: 'Service Operations Manager', email: 'service.ops@joshpetshub.com', pass: 'CrmOps@123', color: '#059669', dept: 'Service Operations' },
  { role: 'E-commerce Manager', email: 'ecommerce.mgr@joshpetshub.com', pass: 'CrmEcom@123', color: '#D97706', dept: 'E-commerce & Store' },
  { role: 'Finance Manager', email: 'finance.mgr@joshpetshub.com', pass: 'CrmFinance@123', color: '#10B981', dept: 'Finance & Accounts' },
  { role: 'Provider Relations Manager', email: 'providers.mgr@joshpetshub.com', pass: 'CrmPartner@123', color: '#8B5CF6', dept: 'Provider Relations' },
  { role: 'Marketing Manager', email: 'marketing.mgr@joshpetshub.com', pass: 'CrmMarketing@123', color: '#EC4899', dept: 'Marketing & Growth' },
  { role: 'Quality & Compliance Manager', email: 'compliance.mgr@joshpetshub.com', pass: 'CrmQuality@123', color: '#6366F1', dept: 'Quality & Safety' },
  { role: 'Technical Support Manager', email: 'tech.support@joshpetshub.com', pass: 'CrmTech@123', color: '#475569', dept: 'IT & Tech Support' }
];

const CrmPortal = () => {
  // Authentication State
  const [crmToken, setCrmToken] = useState(() => {
    try { return localStorage.getItem(CRM_TOKEN_KEY) || null; } catch { return null; }
  });
  const [crmUser, setCrmUser] = useState(() => {
    try {
      const u = localStorage.getItem(CRM_USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  });

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active CRM Navigation Section
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals & Drawers
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomerNote, setNewCustomerNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '', description: '', customerName: '', customerPhone: '', dueDate: '', priority: 'Medium'
  });

  // Determine Role Permissions & Default View
  const isCrmAdmin =
    crmUser?.roleId === 'crm_role_admin' ||
    crmUser?.roleId === 'crm_role_superadmin' ||
    crmUser?.roleName?.toLowerCase().includes('admin') ||
    crmUser?.roleName?.toLowerCase().includes('operations head') ||
    crmUser?.permissions?.manage_staff === true;

  // Set default view on user login based on their role
  useEffect(() => {
    if (crmUser) {
      const roleId = crmUser.roleId || '';
      if (roleId === 'crm_role_customer_support') setActiveSection('support');
      else if (roleId === 'crm_role_service_ops') setActiveSection('service_ops');
      else if (roleId === 'crm_role_ecommerce') setActiveSection('ecommerce');
      else if (roleId === 'crm_role_finance') setActiveSection('finance');
      else if (roleId === 'crm_role_provider_relations') setActiveSection('providers');
      else if (roleId === 'crm_role_marketing') setActiveSection('coupons');
      else if (roleId === 'crm_role_quality_compliance') setActiveSection('compliance');
      else if (roleId === 'crm_role_technical_support') setActiveSection('tech');
      else setActiveSection('overview');
    }
  }, [crmUser?.roleId]);

  // Load CRM data on token availability
  useEffect(() => {
    if (crmToken) {
      loadCrmData();
    }
  }, [crmToken]);

  const loadCrmData = async () => {
    setLoading(true);
    try {
      const headers = crmToken ? { Authorization: `Bearer ${crmToken}` } : {};
      const [statsRes, custRes, leadsRes, ticketsRes, tasksRes] = await Promise.all([
        apiRequest('/crm/dashboard', { headers }),
        apiRequest('/crm/customers', { headers }),
        apiRequest('/crm/leads', { headers }),
        apiRequest('/crm/tickets', { headers }),
        apiRequest('/crm/tasks', { headers })
      ]);

      if (statsRes?.success) setStats(statsRes.stats);
      if (custRes?.success) setCustomers(custRes.customers || []);
      if (leadsRes?.success) setLeads(leadsRes.leads || []);
      if (ticketsRes?.success) setTickets(ticketsRes.tickets || []);
      if (tasksRes?.success) setTasks(tasksRes.tasks || []);
    } catch (err) {
      console.warn('CRM data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both email and password.');
      return;
    }

    setLoggingIn(true);
    setLoginError('');

    try {
      const res = await apiRequest('/crm/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword.trim() })
      });

      if (res && res.success && res.token && res.user) {
        localStorage.setItem(CRM_TOKEN_KEY, res.token);
        localStorage.setItem(CRM_USER_KEY, JSON.stringify(res.user));
        setCrmToken(res.token);
        setCrmUser(res.user);

        // Immediately set view matching logged in role
        const rId = res.user.roleId || '';
        if (rId === 'crm_role_customer_support') setActiveSection('support');
        else if (rId === 'crm_role_service_ops') setActiveSection('service_ops');
        else if (rId === 'crm_role_ecommerce') setActiveSection('ecommerce');
        else if (rId === 'crm_role_finance') setActiveSection('finance');
        else if (rId === 'crm_role_provider_relations') setActiveSection('providers');
        else if (rId === 'crm_role_marketing') setActiveSection('coupons');
        else if (rId === 'crm_role_quality_compliance') setActiveSection('compliance');
        else if (rId === 'crm_role_technical_support') setActiveSection('tech');
        else setActiveSection('overview');

        toast.success(res.message || `Welcome, ${res.user.name}!`);
      } else {
        setLoginError(res?.message || 'Invalid CRM staff credentials.');
      }
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(CRM_TOKEN_KEY);
    localStorage.removeItem(CRM_USER_KEY);
    setCrmToken(null);
    setCrmUser(null);
    setActiveSection('overview');
    toast('Logged out of CRM Portal', { icon: '👋' });
  };

  const quickFillCredential = (email, pass) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError('');
  };

  // Customer Note Handler
  const handleAddCustomerNote = async () => {
    if (!newCustomerNote.trim() || !selectedCustomer) return;
    setAddingNote(true);
    try {
      const res = await apiRequest(`/crm/customers/${selectedCustomer.id}/notes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${crmToken}` },
        body: JSON.stringify({ note: newCustomerNote.trim(), authorName: crmUser?.name || 'CRM Staff' })
      });
      if (res && res.success && res.note) {
        const updatedNotes = [res.note, ...(selectedCustomer.crmNotes || [])];
        setSelectedCustomer({ ...selectedCustomer, crmNotes: updatedNotes });
        setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, crmNotes: updatedNotes } : c));
        setNewCustomerNote('');
        toast.success('Note logged to customer record!');
      }
    } catch (err) {
      toast.error('Failed to log note.');
    } finally {
      setAddingNote(false);
    }
  };

  // Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) {
      toast.error('Task title is required.');
      return;
    }

    try {
      const res = await apiRequest('/crm/tasks', {
        method: 'POST',
        headers: { Authorization: `Bearer ${crmToken}` },
        body: JSON.stringify({
          ...newTaskForm,
          assignedTo: crmUser?.name || 'Assigned Staff'
        })
      });
      if (res && res.success && res.task) {
        setTasks(prev => [res.task, ...prev]);
        setShowNewTaskModal(false);
        setNewTaskForm({ title: '', description: '', customerName: '', customerPhone: '', dueDate: '', priority: 'Medium' });
        toast.success('Task scheduled successfully!');
      }
    } catch (err) {
      toast.error('Failed to create task.');
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const res = await apiRequest(`/crm/tasks/${task.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${crmToken}` },
        body: JSON.stringify({ completed: !task.completed })
      });
      if (res && res.success) {
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !task.completed } : t));
        toast.success(task.completed ? 'Task reopened' : 'Task marked completed!');
      }
    } catch (err) {
      toast.error('Failed to update task.');
    }
  };

  // Get Dynamic Role-Based Sidebar Navigation Items
  const getNavItems = () => {
    if (!crmUser) return [];

    if (isCrmAdmin) {
      return [
        { id: 'overview', label: 'Operations Command', icon: <Target size={16} /> },
        { id: 'staff_mgmt', label: 'Staff & Roles Manager', icon: <Briefcase size={16} />, highlight: true },
        { id: 'support', label: 'Customer Support Desk', icon: <MessageSquare size={16} /> },
        { id: 'service_ops', label: 'Service Operations', icon: <Calendar size={16} /> },
        { id: 'ecommerce', label: 'Store Orders & Inventory', icon: <ShoppingBag size={16} /> },
        { id: 'finance', label: 'Finance & Refunds Desk', icon: <DollarSign size={16} /> },
        { id: 'providers', label: 'Provider Relations & KYC', icon: <Shield size={16} /> },
        { id: 'coupons', label: 'Offer Codes & Discounts', icon: <Tag size={16} /> },
        { id: 'announcements', label: 'Announcement Bar', icon: <Megaphone size={16} /> },
        { id: 'blogs', label: 'Pet Care Blogs', icon: <BookOpen size={16} /> },
        { id: 'compliance', label: 'Quality & Rx Compliance', icon: <FileText size={16} /> },
        { id: 'tech', label: 'Tech Support & Health', icon: <RefreshCw size={16} /> },
        { id: 'customers', label: 'Customer 360 Lookup', icon: <Users size={16} /> },
        { id: 'tasks', label: 'Follow-ups & Tasks', icon: <CheckSquare size={16} /> }
      ];
    }

    const roleId = crmUser.roleId || '';
    if (roleId === 'crm_role_customer_support') {
      return [
        { id: 'support', label: 'Customer Support Desk', icon: <MessageSquare size={16} /> },
        { id: 'customers', label: 'Customer 360 Lookup', icon: <Users size={16} /> },
        { id: 'tasks', label: 'Support Follow-ups', icon: <CheckSquare size={16} /> }
      ];
    }
    if (roleId === 'crm_role_service_ops') {
      return [
        { id: 'service_ops', label: 'Service Bookings Dispatch', icon: <Calendar size={16} /> },
        { id: 'customers', label: 'Customer 360 Lookup', icon: <Users size={16} /> },
        { id: 'tasks', label: 'Service Follow-ups', icon: <CheckSquare size={16} /> }
      ];
    }
    if (roleId === 'crm_role_ecommerce') {
      return [
        { id: 'ecommerce', label: 'Store Orders & Inventory', icon: <ShoppingBag size={16} /> },
        { id: 'customers', label: 'Customer Directory', icon: <Users size={16} /> },
        { id: 'tasks', label: 'Fulfillment Tasks', icon: <CheckSquare size={16} /> }
      ];
    }
    if (roleId === 'crm_role_finance') {
      return [
        { id: 'finance', label: 'Finance & Refunds Desk', icon: <DollarSign size={16} /> },
        { id: 'ecommerce', label: 'Store Orders Ledger', icon: <ShoppingBag size={16} /> },
        { id: 'tasks', label: 'Financial Audit Tasks', icon: <CheckSquare size={16} /> }
      ];
    }
    if (roleId === 'crm_role_provider_relations') {
      return [
        { id: 'providers', label: 'Partner KYC & Directory', icon: <Shield size={16} /> },
        { id: 'service_ops', label: 'Service Bookings Logs', icon: <Calendar size={16} /> },
        { id: 'tasks', label: 'Partner Outreach Tasks', icon: <CheckSquare size={16} /> }
      ];
    }
    if (roleId === 'crm_role_marketing') {
      return [
        { id: 'coupons', label: 'Offer Codes & Discounts', icon: <Tag size={16} /> },
        { id: 'announcements', label: 'Announcement Bar', icon: <Megaphone size={16} /> },
        { id: 'blogs', label: 'Pet Care Blogs & Guides', icon: <BookOpen size={16} /> },
        { id: 'customers', label: 'Customer 360 Segments', icon: <Users size={16} /> },
        { id: 'tasks', label: 'Outreach Follow-ups', icon: <CheckSquare size={16} /> }
      ];
    }
    if (roleId === 'crm_role_quality_compliance') {
      return [
        { id: 'compliance', label: 'Prescriptions & Safety Audit', icon: <FileText size={16} /> },
        { id: 'support', label: 'Safety Disputes & Cases', icon: <MessageSquare size={16} /> },
        { id: 'customers', label: 'Customer 360 Lookup', icon: <Users size={16} /> }
      ];
    }
    if (roleId === 'crm_role_technical_support') {
      return [
        { id: 'tech', label: 'Platform Health & IT Tickets', icon: <RefreshCw size={16} /> },
        { id: 'support', label: 'User Technical Reports', icon: <MessageSquare size={16} /> },
        { id: 'tasks', label: 'System Maintenance Tasks', icon: <CheckSquare size={16} /> }
      ];
    }

    return [
      { id: 'overview', label: 'Dashboard & KPIs', icon: <Target size={16} /> },
      { id: 'customers', label: 'Customer 360', icon: <Users size={16} /> },
      { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={16} /> }
    ];
  };

  // =========================================================================
  // VIEW 1: AUTHENTICATION GATEWAY (LOGIN)
  // =========================================================================
  if (!crmToken || !crmUser) {
    return (
      <div className="min-h-screen bg-[#071711] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-2xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F2E23] to-[#1c5541] border border-[#D4AF37]/30 shadow-xl mb-1">
              <Briefcase className="text-[#D4AF37]" size={26} />
            </div>
            <span className="text-[10px] font-black tracking-[0.25em] text-[#D4AF37] uppercase block">
              ENTERPRISE OPERATIONS PORTAL
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-white">
              Josh Pets Hub CRM
            </h1>
            <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
              Secure client relationship management for staff and departmental managers.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Staff Email ID
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. admin.crm@joshpetshub.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] font-mono transition"
                  />
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] font-mono transition"
                  />
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3 bg-[#D4AF37] hover:bg-[#c49f27] text-[#071711] font-bold text-xs uppercase tracking-wider rounded-xl transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50"
              >
                {loggingIn ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <span>SIGN IN TO CRM</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Quick Access Roster of All 9 Department Managers */}
            <div className="border-t border-white/15 pt-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block text-center">
                QUICK ACCESS TO 9 DEPARTMENT MANAGERS (TAP TO FILL CREDENTIALS):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {PRESET_MANAGERS.map(m => (
                  <button
                    key={m.email}
                    type="button"
                    onClick={() => quickFillCredential(m.email, m.pass)}
                    className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-left transition cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                      <span className="font-bold text-[11px] text-white group-hover:text-[#D4AF37] transition truncate">
                        {m.role}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 block truncate">{m.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] text-gray-400">
            <span>CRM Admin account credentials are provisioned in the </span>
            <a href="/superadmin" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] hover:underline font-bold">
              Super Admin Dashboard →
            </a>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FULL ENTERPRISE CRM CONSOLE
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F4F6F4] flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-[#071711] text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-[#071711] flex items-center justify-center font-bold shadow-sm">
            <Briefcase size={16} />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] block leading-tight">
              ENTERPRISE CRM
            </span>
            <h1 className="font-serif font-black text-base text-white tracking-tight leading-tight">
              Josh Pets Hub
            </h1>
          </div>
        </div>

        {/* User Info & Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadCrmData}
            disabled={loading}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            title="Refresh CRM data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* Staff Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 sm:border-l border-white/15">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#071711] font-serif font-black flex items-center justify-center text-xs shrink-0 shadow-sm">
              {crmUser.name?.charAt(0) || 'S'}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-bold text-white block leading-tight">{crmUser.name}</span>
              <span className="text-[10px] text-[#D4AF37] font-semibold">{crmUser.roleName || 'CRM Staff'}</span>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer ml-1"
            title="Log out of CRM"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main CRM Workspace (Sidebar + Workspace) */}
      <div className="flex-grow flex min-h-0 overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-[#0A1F17] text-gray-300 shrink-0 border-r border-white/10 p-4 space-y-4 hidden md:flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#7CA085] px-3 block">
              {crmUser.roleName?.toUpperCase() || 'OPERATIONS CONSOLE'}
            </span>

            <nav className="space-y-1">
              {getNavItems().map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition cursor-pointer ${
                    activeSection === item.id
                      ? 'bg-[#D4AF37] text-[#071711] shadow-md shadow-[#D4AF37]/20 font-black'
                      : item.highlight
                      ? 'bg-emerald-950/60 border border-emerald-700/50 text-[#D4AF37] hover:bg-emerald-900/60'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Department Footer Badge */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] text-gray-300">
            <span className="text-[10px] uppercase font-bold text-[#D4AF37] block">Department</span>
            <span className="font-bold text-white block truncate">{crmUser.department || 'Operations'}</span>
            <span className="text-[10px] text-gray-400 font-mono truncate block mt-0.5">{crmUser.email}</span>
          </div>
        </aside>

        {/* Dynamic Content Workspace */}
        <main className="flex-grow p-4 sm:p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          {/* SECTION 1: MASTER OVERVIEW (COMMAND CENTER) */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Daily Welcome Header */}
              <div className="bg-gradient-to-r from-[#0F2E23] to-[#1a4a39] text-white p-5 rounded-2xl border border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] block mb-1">
                    OPERATIONS COMMAND CENTER • {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
                  </span>
                  <h2 className="text-xl font-serif font-black tracking-tight text-white">
                    Welcome back, {crmUser.name}!
                  </h2>
                  <p className="text-xs text-gray-300 mt-0.5">
                    Role: <strong className="text-[#D4AF37]">{crmUser.roleName}</strong> • Platform operations, departmental staff, and customer cases are synchronized.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection('support')}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare size={14} /> Open Cases ({stats?.openTickets || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSection('tasks')}
                    className="px-3.5 py-2 bg-[#D4AF37] hover:bg-[#c49f27] text-[#071711] rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <CheckSquare size={14} /> Today's Tasks ({stats?.pendingTasks || 0})
                  </button>
                </div>
              </div>

              {/* Operations KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Customers</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-serif font-black text-slate-900">{stats?.totalCustomers || 9}</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Gross Platform Volume</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-serif font-black text-emerald-600">
                      ₹{(stats?.totalRevenue || 20277).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Reconciled</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Open Support Cases</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-serif font-black text-rose-600">{stats?.openTickets || 3}</span>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">Needs attention</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">System Uptime</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-serif font-black text-[#0F2E23]">{stats?.systemUptime || '99.98%'}</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Operational</span>
                  </div>
                </div>
              </div>

              {/* Department Shortcut Quick-Jump Cards (For CRM Admin) */}
              {isCrmAdmin && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">9 Department Operational Consoles</h3>
                      <p className="text-xs text-slate-500">Jump directly into any department manager workspace.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection('staff_mgmt')}
                      className="px-3 py-1.5 bg-[#0F2E23] hover:bg-[#1a4a39] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Briefcase size={13} /> Manage Staff Credentials
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { id: 'support', title: 'Customer Support', desc: 'Tickets & SLA resolution', icon: <MessageSquare size={16} />, color: '#0284C7' },
                      { id: 'service_ops', title: 'Service Operations', desc: 'Bookings & slot dispatch', icon: <Calendar size={16} />, color: '#059669' },
                      { id: 'ecommerce', title: 'E-commerce & Store', desc: 'Order fulfillment & inventory', icon: <ShoppingBag size={16} />, color: '#D97706' },
                      { id: 'finance', title: 'Finance & Refunds', desc: 'Reconciliation & payouts', icon: <DollarSign size={16} />, color: '#10B981' },
                      { id: 'providers', title: 'Provider Relations', desc: 'KYC & partner vetting', icon: <Shield size={16} />, color: '#8B5CF6' },
                      { id: 'coupons', title: 'Marketing & Offers', desc: 'Promos, banners & articles', icon: <Tag size={16} />, color: '#EC4899' },
                      { id: 'compliance', title: 'Quality & Rx Safety', desc: 'Prescription audits & disputes', icon: <FileText size={16} />, color: '#6366F1' },
                      { id: 'tech', title: 'Technical Support', desc: 'System health & IT bugs', icon: <RefreshCw size={16} />, color: '#475569' }
                    ].map(d => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setActiveSection(d.id)}
                        className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 text-left transition cursor-pointer flex items-start gap-3 group"
                      >
                        <span className="p-2 rounded-lg text-white shrink-0 mt-0.5 shadow-xs" style={{ backgroundColor: d.color }}>
                          {d.icon}
                        </span>
                        <div>
                          <span className="font-bold text-xs text-slate-800 group-hover:text-slate-900 block">{d.title}</span>
                          <span className="text-[11px] text-slate-400 block">{d.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity: Tickets & Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Recent Customer Inquiries</h3>
                    <button
                      type="button"
                      onClick={() => setActiveSection('support')}
                      className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tickets.slice(0, 3).map(t => (
                      <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800 text-xs block">{t.subject}</span>
                          <span className="text-[11px] text-slate-500">{t.customerName} • {t.category}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Today's Callback Tasks</h3>
                    <button
                      type="button"
                      onClick={() => setActiveSection('tasks')}
                      className="text-xs font-bold text-[#0F2E23] hover:underline cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tasks.slice(0, 3).map(task => (
                      <div key={task.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTask(task)}
                            className="w-4 h-4 text-[#0F2E23] rounded focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <span className={`font-bold text-xs block ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {task.title}
                            </span>
                            <span className="text-[10px] text-slate-400">Client: {task.customerName || 'General'}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Due today'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: STAFF & ROLES MANAGER (ADMIN ONLY) */}
          {activeSection === 'staff_mgmt' && isCrmAdmin && (
            <CrmStaffManagerTab crmToken={crmToken} />
          )}

          {/* SECTION 3: CUSTOMER SUPPORT DESK */}
          {activeSection === 'support' && (
            <CustomerSupportView tickets={tickets} onRefresh={loadCrmData} crmToken={crmToken} />
          )}

          {/* SECTION 4: SERVICE OPERATIONS */}
          {activeSection === 'service_ops' && (
            <ServiceOperationsView crmToken={crmToken} />
          )}

          {/* SECTION 5: E-COMMERCE & STORE ORDERS */}
          {activeSection === 'ecommerce' && (
            <EcommerceManagerView crmToken={crmToken} />
          )}

          {/* SECTION 6: FINANCE & REFUNDS */}
          {activeSection === 'finance' && (
            <FinanceManagerView crmToken={crmToken} />
          )}

          {/* SECTION 7: PROVIDER RELATIONS & KYC */}
          {activeSection === 'providers' && (
            <ProviderRelationsView crmToken={crmToken} />
          )}

          {/* SECTION 8: MARKETING HUB */}
          {activeSection === 'marketing' && (
            <MarketingManagerView crmToken={crmToken} />
          )}

          {/* SECTION 8B: OFFER CODES & DISCOUNTS */}
          {activeSection === 'coupons' && (
            <div className="space-y-4">
              <CouponsManagerView />
            </div>
          )}

          {/* SECTION 8C: ANNOUNCEMENT BAR TICKER */}
          {activeSection === 'announcements' && (
            <div className="space-y-4">
              <AnnouncementsManagerView />
            </div>
          )}

          {/* SECTION 8D: PET CARE BLOGS & GUIDES */}
          {activeSection === 'blogs' && (
            <div className="space-y-4">
              <BlogsManagerView />
            </div>
          )}

          {/* SECTION 9: QUALITY & PRESCRIPTION COMPLIANCE */}
          {activeSection === 'compliance' && (
            <QualityComplianceView crmToken={crmToken} />
          )}

          {/* SECTION 10: TECHNICAL SUPPORT & HEALTH */}
          {activeSection === 'tech' && (
            <TechnicalSupportView crmToken={crmToken} />
          )}

          {/* SECTION 11: CUSTOMER 360 DIRECTORY */}
          {activeSection === 'customers' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Customer 360 Unified Profile Directory</h3>
                  <p className="text-xs text-slate-500">Search registered pet parents, view lifetime orders, and log CRM notes.</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, phone, city..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23]"
                  />
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">City</th>
                      <th className="py-3 px-4">Pet Family</th>
                      <th className="py-3 px-4">Orders & Bookings</th>
                      <th className="py-3 px-4">Total Spent</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {customers
                      .filter(c => {
                        const q = searchQuery.toLowerCase();
                        return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q);
                      })
                      .map(customer => (
                        <tr key={customer.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{customer.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{customer.id}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="text-slate-800">{customer.email}</span>
                              <span className="text-[10px] text-slate-400">{customer.phone}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{customer.city}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {customer.pets?.length > 0 ? (
                                customer.pets.map((p, idx) => (
                                  <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                                    {p.name} ({p.type})
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 italic">None logged</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {customer.ordersCount || 0} Orders • {customer.bookingsCount || 0} Bookings
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            ₹{(customer.totalSpent || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedCustomer(customer)}
                              className="px-2.5 py-1 bg-[#0F2E23]/10 hover:bg-[#0F2E23] hover:text-white text-[#0F2E23] text-xs font-bold rounded-lg transition cursor-pointer"
                            >
                              Profile & Notes
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 12: TASKS & REMINDERS */}
          {activeSection === 'tasks' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Operational Task Callbacks & Checklists</h3>
                  <p className="text-xs text-slate-500">Track pending customer callbacks, verification steps, and operational follow-ups.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(true)}
                  className="px-4 py-2 bg-[#0F2E23] hover:bg-[#1a4a39] text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus size={14} /> Schedule Task
                </button>
              </div>

              <div className="p-4 space-y-2.5">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No pending tasks scheduled.
                  </div>
                ) : (
                  tasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between hover:border-slate-300 transition"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleTask(task)}
                          className="w-4 h-4 text-[#0F2E23] rounded focus:ring-0 cursor-pointer"
                        />
                        <div>
                          <span className={`font-bold text-xs block ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {task.title}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {task.description || 'No extra notes'} • Assigned to: <strong className="text-slate-700">{task.assignedTo}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          task.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {task.priority || 'Medium'}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CUSTOMER 360 PROFILE & NOTE MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Customer 360 Record</span>
                <h3 className="font-serif font-black text-slate-900 text-base">{selectedCustomer.name}</h3>
                <span className="text-xs text-slate-500">{selectedCustomer.email} • {selectedCustomer.phone}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3.5 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-[10px] block">Location</span>
                  <strong className="text-slate-800">{selectedCustomer.city || 'Bangalore'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Lifetime Value</span>
                  <strong className="text-emerald-600 font-mono">₹{(selectedCustomer.totalSpent || 0).toLocaleString()}</strong>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800 block mb-1">Internal CRM Interaction Notes</span>
                <div className="space-y-2 max-h-40 overflow-y-auto bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {selectedCustomer.crmNotes?.length > 0 ? (
                    selectedCustomer.crmNotes.map((n, i) => (
                      <div key={i} className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                          <strong className="text-slate-700">{n.authorName}</strong>
                          <span>{new Date(n.timestamp || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{n.note}</p>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400 italic block py-2 text-center">No notes logged yet.</span>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 block">Add New Coordinator Note</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCustomerNote}
                    onChange={(e) => setNewCustomerNote(e.target.value)}
                    placeholder="e.g. Pet parent prefers weekend grooming appointments..."
                    className="flex-grow px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23]"
                  />
                  <button
                    type="button"
                    disabled={addingNote || !newCustomerNote.trim()}
                    onClick={handleAddCustomerNote}
                    className="px-4 py-2 bg-[#0F2E23] hover:bg-[#1a4a39] text-white font-bold text-xs rounded-lg transition cursor-pointer disabled:opacity-50"
                  >
                    {addingNote ? 'Saving...' : 'Add Note'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE TASK MODAL */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif font-black text-slate-900 text-base">Schedule Operational Task</h3>
              <button
                type="button"
                onClick={() => setShowNewTaskModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  placeholder="e.g. Call Priya Sharma for express delivery confirmation"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Client Name</label>
                <input
                  type="text"
                  value={newTaskForm.customerName}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, customerName: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23] bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskForm.dueDate}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23] bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#0F2E23] hover:bg-[#1a4a39] text-white rounded-lg shadow-sm transition cursor-pointer"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmPortal;
