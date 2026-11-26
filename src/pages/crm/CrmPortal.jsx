import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Briefcase, Users, Target, MessageSquare, Award, CheckSquare, ShoppingBag,
  Calendar, Phone, Mail, MessageCircle, Search, Plus, Filter,
  LogOut, Shield, CheckCircle, Clock, AlertTriangle, ArrowRight,
  ChevronRight, RefreshCw, X, ExternalLink, Sparkles, Send,
  UserCheck, IndianRupee, Tag, FileText, ChevronDown, Check, Lock,
  Stethoscope, Truck, Package, ShieldCheck, Megaphone, BookOpen,
  Bell, CheckCircle2, RotateCcw, Play, CheckCheck, TrendingUp,
  Building, Cookie, Landmark, Trash, Menu
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';
import { setAuthenticatedUser, logout } from '../../store/slices/authSlice.js';

// Department Modular Components
import CrmStaffManagerTab from '../../components/crm/CrmStaffManagerTab.jsx';
import AdminUsersManagerView from '../../components/crm/AdminUsersManagerView.jsx';
import AdminClassifiedsView from '../../components/crm/AdminClassifiedsView.jsx';
import AdminBreederVerificationView from '../../components/crm/AdminBreederVerificationView.jsx';
import AdminEnquiriesView from '../../components/crm/AdminEnquiriesView.jsx';
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
import SuperAdminPlatformWalletView from '../../components/dashboards/SuperAdminPlatformWalletView.jsx';

const CRM_TOKEN_KEY = 'joshpetshub_crm_token';
const CRM_USER_KEY = 'joshpetshub_crm_user';
const COLORS = ['#1D3B2E', '#7CA085', '#C2D3C6', '#A1C0AA', '#DFE5DF'];

// The 7 Active Department Manager Roles + Super Admin (Phase 1 & 2 Aligned)
const PRESET_MANAGERS = [
  { role: 'Super Admin', email: 'superadmin@joshpetshub.com', pass: 'SuperAdmin@123', color: '#D4AF37', dept: 'Executive Command' },
  { role: 'Admin', email: 'admin.crm@joshpetshub.com', pass: 'CrmAdmin@123', color: '#0F2E23', dept: 'Operations & Administration' },
  { role: 'Admin (Master)', email: 'admin@joshpetshub.com', pass: 'Admin@123', color: '#0F2E23', dept: 'Administration' },
  { role: 'Customer Support Manager', email: 'support.mgr@joshpetshub.com', pass: 'CrmSupport@123', color: '#0284C7', dept: 'Customer Support' },
  { role: 'Service Operations Manager', email: 'service.ops@joshpetshub.com', pass: 'CrmOps@123', color: '#059669', dept: 'Service Operations' },
  { role: 'Finance Manager', email: 'finance.mgr@joshpetshub.com', pass: 'CrmFinance@123', color: '#10B981', dept: 'Finance & Accounts' },
  { role: 'Provider Relations Manager', email: 'providers.mgr@joshpetshub.com', pass: 'CrmPartner@123', color: '#8B5CF6', dept: 'Provider Relations' },
  { role: 'Marketing Manager', email: 'marketing.mgr@joshpetshub.com', pass: 'CrmMarketing@123', color: '#EC4899', dept: 'Marketing & Growth' },
  { role: 'Quality & Compliance Manager', email: 'compliance.mgr@joshpetshub.com', pass: 'CrmQuality@123', color: '#6366F1', dept: 'Quality & Compliance' }
];

// Customer Support Department Complete Hierarchy (One-Tap Test Accounts)
const PRESET_SUPPORT_ROSTER = [
  { role: 'Customer Support Manager (Head)', name: 'Kavya Menon', email: 'support.mgr@joshpetshub.com', pass: 'CrmSupport@123', color: '#0284C7' },
  { role: 'Customer Support Team Lead', name: 'Arun Patel', email: 'support.lead@joshpetshub.com', pass: 'CrmTeamLead@123', color: '#0284C7' },
  { role: 'Customer Support Executive', name: 'Neha Bhatt', email: 'support.exec@joshpetshub.com', pass: 'CrmSupportExec@123', color: '#0284C7' },
  { role: 'Email Support Executive', name: 'Pooja Sharma', email: 'email.support@joshpetshub.com', pass: 'CrmEmailExec@123', color: '#0284C7' },
  { role: 'Call Support Executive', name: 'Vikram Singh', email: 'call.support@joshpetshub.com', pass: 'CrmCallExec@123', color: '#0284C7' }
];

const CrmPortal = () => {
  const dispatch = useDispatch();
  const { user: reduxUser, isAuthenticated: reduxAuth } = useSelector((state) => state.auth);

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
  const [crmMarketingDropdownOpen, setCrmMarketingDropdownOpen] = useState(true);

  useEffect(() => {
    if (['announcements', 'coupons', 'blogs'].includes(activeSection)) {
      setCrmMarketingDropdownOpen(true);
    }
  }, [activeSection]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getSectionTitle = (section) => {
    switch (section) {
      case 'overview':
        return 'Operations Command & Executive Metrics';
      case 'wallet':
        return 'Central Platform Wallet & Service Provider Payouts';
      case 'ecommerce':
        return 'Store Orders & Inventory Operations';
      case 'compliance':
        return 'Quality & Vet Rx Compliance Verification';
      case 'listings':
        return 'Pet Classified Listings Moderation';
      case 'studs':
        return 'Breeder & Kennel KCI Validations';
      case 'users':
        return 'Registered Pet Parents & Users';
      case 'providers':
        return 'Service Providers & KYC Verification';
      case 'staff_mgmt':
        return 'CRM Staff Accounts & Access Control';
      case 'enquiries':
        return 'Contact Form Enquiries';
      case 'coupons':
        return 'Offer Codes & Promotional Discounts Manager';
      case 'announcements':
        return 'Header Announcement Bar & Offers Ticker';
      case 'blogs':
        return 'Pet Care Blogs & Articles Manager';
      case 'consents':
        return 'Cookie Consent Audit Logs';
      case 'service_ops':
        return 'Service Bookings & Operations Oversight';
      case 'support':
        return 'Customer Support Desk & Ticket Resolution';
      case 'finance':
        return 'Finance & Accounts Transaction Ledger';
      case 'tech':
        return 'Technical Support & System Health Monitoring';
      case 'customers':
        return 'Customer 360 Records & Profiles';
      case 'leads':
        return 'Lead Pipeline & Opportunity Tracker';
      case 'tickets':
        return 'Support Tickets & Helpdesk Queue';
      case 'tasks':
        return 'Department Workflow Task Queue';
      default:
        return 'CRM Operations Console';
    }
  };

  // Data States
  const [stats, setStats] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [adminCharts, setAdminCharts] = useState(null);
  const [consentsList, setConsentsList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskFilterStatus, setTaskFilterStatus] = useState('All');
  const [loading, setLoading] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Modals & Drawers
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newCustomerNote, setNewCustomerNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '', description: '', customerName: '', customerPhone: '', dueDate: '', priority: 'Medium'
  });

  // Reopen Task Modal
  const [reopeningTask, setReopeningTask] = useState(null);
  const [reopenReasonText, setReopenReasonText] = useState('');

  // Determine Role Permissions & Access Scope
  const userDept = (crmUser?.department || '').toLowerCase();
  const userRole = (crmUser?.roleName || '').toLowerCase();
  const userRoleId = crmUser?.roleId || '';
  const userDesigId = crmUser?.designationId || '';

  // 1. STRICT ISOLATION: Only CRM Operations Head / Super Administrator has full platform access
  const isCrmAdmin = Boolean(
    crmUser &&
    (
      userRoleId === 'crm_role_superadmin' ||
      crmUser.email === 'superadmin@joshpetshub.com' ||
      crmUser.email === 'admin.crm@joshpetshub.com' ||
      crmUser.email === 'admin@joshpetshub.com' ||
      userRole === 'super administrator' ||
      userRole === 'super admin' ||
      userRole === 'admin (master)' ||
      userRole === 'admin' ||
      userRole === 'crm admin / operations head' ||
      userRole === 'operations head' ||
      (
        userRoleId === 'crm_role_admin' &&
        (crmUser.isHead || userDesigId === 'desig_ops_head') &&
        (userDept.includes('operations & administration') || userDept.includes('operations command') || userDept.includes('administration'))
      )
    ) &&
    // Guard against any other department or role being incorrectly marked as platform admin
    !userDept.includes('customer support') &&
    !userDept.includes('service operations') &&
    !userDept.includes('finance') &&
    !userDept.includes('provider') &&
    !userDept.includes('marketing') &&
    !userDept.includes('quality') &&
    !userRole.includes('customer support') &&
    !userRole.includes('service operations') &&
    !userRole.includes('finance') &&
    !userRole.includes('provider relations') &&
    !userRole.includes('marketing') &&
    !userRole.includes('quality')
  );

  // Auto-bridge Redux SuperAdmin into CRM session if already logged into /superadmin
  useEffect(() => {
    if (reduxAuth && reduxUser?.role === 'SUPERADMIN' && (!crmUser || !crmToken)) {
      const superAdminCrmUser = {
        id: reduxUser.id || reduxUser._id || 'superadmin_root',
        name: reduxUser.name || 'Super Administrator',
        email: reduxUser.email || 'superadmin@joshpetshub.com',
        roleName: 'Super Administrator',
        roleId: 'crm_role_superadmin',
        department: 'Operations & Administration',
        isHead: true
      };
      const token = localStorage.getItem('joshpetshub_token') || 'crm-superadmin-token';
      try {
        localStorage.setItem(CRM_TOKEN_KEY, token);
        localStorage.setItem(CRM_USER_KEY, JSON.stringify(superAdminCrmUser));
      } catch (_) { }
      setCrmToken(token);
      setCrmUser(superAdminCrmUser);
    }
  }, [reduxAuth, reduxUser?.role]);

  // Auto-sync CRM SuperAdmin into Redux session so SuperAdminDashboard is always authenticated
  useEffect(() => {
    if (crmUser && isCrmAdmin && (!reduxAuth || reduxUser?.role !== 'SUPERADMIN')) {
      const saUser = {
        id: crmUser.id || 'superadmin_root',
        _id: crmUser.id || 'superadmin_root',
        name: crmUser.name || 'Super Administrator',
        email: crmUser.email || 'superadmin@joshpetshub.com',
        role: 'SUPERADMIN',
        mobile: crmUser.phone || '9876543210',
        businessName: 'JOSH PETS HUB',
        verificationStatus: 'Verified'
      };
      const token = crmToken || localStorage.getItem(CRM_TOKEN_KEY) || 'crm-superadmin-token';
      try {
        localStorage.setItem('joshpetshub_token', token);
        localStorage.setItem('joshpetshub_user', JSON.stringify(saUser));
      } catch (_) { }
      dispatch(setAuthenticatedUser({ token, user: saUser }));
    }
  }, [crmUser, isCrmAdmin, reduxAuth, reduxUser?.role]);

  // 2. Department Manager/Head check (Must NOT be a subordinate employee or lead)
  const isDeptHead = Boolean(
    !isCrmAdmin &&
    (
      userRoleId === 'crm_role_customer_support' ||
      userRoleId === 'crm_role_service_ops' ||
      userRoleId === 'crm_role_finance' ||
      userRoleId === 'crm_role_provider_relations' ||
      userRoleId === 'crm_role_marketing' ||
      userRoleId === 'crm_role_quality_compliance' ||
      userDesigId.endsWith('_head') ||
      (crmUser?.isHead === true && !userRole.includes('lead') && !userRole.includes('executive'))
    )
  );

  // Set default view on user login or role change - ensure only permitted section is active
  useEffect(() => {
    if (crmUser) {
      const items = getNavItems();
      const validSectionIds = items.map(item => item.id);
      if (validSectionIds.length > 0 && !validSectionIds.includes(activeSection)) {
        setActiveSection(validSectionIds[0]);
      }
    }
  }, [crmUser?.id, crmUser?.roleId, crmUser?.department]);

  // Load CRM data on token availability
  useEffect(() => {
    if (crmToken) {
      loadCrmData();
      loadNotifications();
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

      // If SuperAdmin, also fetch executive analytics & cookie consents
      if (isCrmAdmin) {
        try {
          const [adminRes, consentsRes] = await Promise.all([
            apiRequest('/admin/dashboard', { headers }),
            apiRequest('/cookie-consents', { headers })
          ]);
          if (adminRes?.success && adminRes.stats) {
            setAdminStats(adminRes.stats);
            if (adminRes.charts) setAdminCharts(adminRes.charts);
          }
          if (consentsRes?.success && Array.isArray(consentsRes.consents)) {
            setConsentsList(consentsRes.consents);
          }
        } catch (_) { }
      }
    } catch (err) {
      console.warn('CRM data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConsent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cookie consent log?')) return;
    try {
      const res = await apiRequest(`/cookie-consents/${id}`, { method: 'DELETE' });
      if (res?.success) {
        setConsentsList(prev => prev.filter(c => (c.id || c._id || c.session_id || c.sessionId) !== id));
        toast.success('Consent log deleted');
      }
    } catch (_) {
      toast.error('Failed to delete consent log');
    }
  };

  const loadNotifications = async () => {
    if (!crmToken) return;
    try {
      const res = await apiRequest('/crm/notifications', { headers: { Authorization: `Bearer ${crmToken}` } });
      if (res?.success) setNotifications(res.notifications || []);
    } catch (_) { }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await apiRequest('/crm/notifications/mark-all-read', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${crmToken}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (_) { }
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
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword.trim()
        })
      });

      if (res && res.success && res.token && res.user) {
        localStorage.setItem(CRM_TOKEN_KEY, res.token);
        localStorage.setItem(CRM_USER_KEY, JSON.stringify(res.user));
        setCrmToken(res.token);
        setCrmUser(res.user);

        // Auto-sync Redux for SuperAdmin
        if (
          res.user.roleId === 'crm_role_superadmin' ||
          res.user.roleId === 'crm_role_admin' ||
          res.user.email === 'admin@joshpetshub.com' ||
          res.user.email === 'superadmin@joshpetshub.com' ||
          res.user.email === 'admin.crm@joshpetshub.com' ||
          (res.user.roleName && res.user.roleName.toLowerCase().includes('admin'))
        ) {
          const saUser = {
            id: res.user.id || 'superadmin_id',
            _id: res.user.id || 'superadmin_id',
            name: res.user.name || 'JOSH PETS HUB Superadmin',
            email: res.user.email || 'superadmin@joshpetshub.com',
            role: 'SUPERADMIN',
            mobile: res.user.phone || '9876543210',
            businessName: 'JOSH PETS HUB',
            verificationStatus: 'Verified'
          };
          try {
            localStorage.setItem('joshpetshub_token', res.token);
            localStorage.setItem('joshpetshub_user', JSON.stringify(saUser));
          } catch (_) { }
          dispatch(setAuthenticatedUser({ token: res.token, user: saUser }));
        }

        toast.success(res.message || `Welcome, ${res.user.name}!`);
      } else {
        setLoginError(res?.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setLoginError(err.message || 'Unable to connect to CRM gateway. Please try again.');
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
    dispatch(logout());
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
          assignedTo: crmUser?.name || 'Assigned Staff',
          department: crmUser?.department || 'Operations'
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

  // Task Lifecycle Transitions: Pending -> In Progress -> Under Review -> Completed / Reopened
  const handleUpdateTaskStatus = async (task, targetStatus, reasonOrDescription = '') => {
    try {
      const res = await apiRequest(`/crm/tasks/${task.id}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${crmToken}` },
        body: JSON.stringify({
          status: targetStatus,
          reopenReason: targetStatus === 'Reopened' ? reasonOrDescription : undefined,
          description: targetStatus !== 'Reopened' ? reasonOrDescription : undefined,
          employeeNotes: targetStatus !== 'Reopened' ? reasonOrDescription : undefined
        })
      });
      if (res && res.success && res.task) {
        setTasks(prev => prev.map(t => t.id === task.id ? res.task : t));
        toast.success(`Task moved to "${targetStatus}"!`);
        if (reopeningTask) setReopeningTask(null);
      } else {
        toast.error(res?.message || 'Status transition rejected.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update task workflow status.');
    }
  };

  const getNavItems = () => {
    if (!crmUser) return [];

    // 1. ONLY Super Admin and Operations Head have all access functionalities
    if (isCrmAdmin) {
      return [
        { id: 'overview', label: 'Operations Command', icon: <Target size={16} />, highlight: true },
        { id: 'wallet', label: 'Central Wallet & Payouts', icon: <Landmark size={16} /> },
        { id: 'ecommerce', label: 'Store Orders & Inventory', icon: <ShoppingBag size={16} /> },
        { id: 'compliance', label: 'Quality & Rx Compliance', icon: <FileText size={16} /> },
        { id: 'listings', label: 'Classified Listings', icon: <Award size={16} /> },
        { id: 'studs', label: 'Breeder KCI Validations', icon: <ShieldCheck size={16} /> },
        { id: 'users', label: 'Registered Users', icon: <Users size={16} /> },
        { id: 'providers', label: 'Provider Relations & KYC', icon: <Shield size={16} /> },
        { id: 'staff_mgmt', label: 'Staff & Roles Manager', icon: <Briefcase size={16} /> },
        { id: 'enquiries', label: 'Contact Enquiries', icon: <Mail size={16} /> },
        {
          id: 'marketing_group',
          label: 'Marketing & Offers',
          icon: <Sparkles size={16} />,
          isGroup: true,
          children: [
            { id: 'announcements', label: 'Announcement Bar', icon: <Megaphone size={14} /> },
            { id: 'coupons', label: 'Offer Codes & Discounts', icon: <Tag size={14} /> },
            { id: 'blogs', label: 'Pet Care Blogs', icon: <BookOpen size={14} /> }
          ]
        },
        { id: 'consents', label: 'Cookie Consents', icon: <Cookie size={16} /> },
        { id: 'service_ops', label: 'Service Bookings Oversight', icon: <Calendar size={16} /> },
        { id: 'support', label: 'Customer Support Desk', icon: <MessageSquare size={16} /> },
        { id: 'finance', label: 'Finance & Payouts Desk', icon: <IndianRupee size={16} /> },
        { id: 'tech', label: 'Tech Support & Health', icon: <RefreshCw size={16} /> },
        { id: 'customers', label: 'Customer 360 Lookup', icon: <Users size={16} /> },
        { id: 'tasks', label: 'Task Workflow Queue', icon: <CheckSquare size={16} /> }
      ];
    }

    const dept = (crmUser.department || '').toLowerCase();
    const roleId = crmUser.roleId || '';
    const desigId = crmUser.designationId || '';
    const isManager = isDeptHead || Boolean(crmUser.isHead);

    // 2. Customer Support Department
    if (roleId === 'crm_role_customer_support' || dept.includes('customer support') || dept.includes('support')) {
      const isLead = (crmUser.roleName && crmUser.roleName.toLowerCase().includes('lead')) ||
        (crmUser.designationName && crmUser.designationName.toLowerCase().includes('lead'));

      const items = [
        {
          id: 'support',
          label: isManager ? 'Support Desk & Hierarchy Board' : isLead ? 'Team Lead Desk & Delegation' : 'Support Desk & Assigned Tasks',
          icon: <MessageSquare size={16} />
        }
      ];
      if (isManager) {
        items.push({ id: 'staff_mgmt', label: 'Support Team & Roles', icon: <Briefcase size={16} /> });
      }
      items.push({ id: 'customers', label: 'Customer 360 Lookup', icon: <Users size={16} /> });
      items.push({ id: 'tasks', label: isManager ? 'Support Task Workflow' : isLead ? 'Team Delegation Queue' : 'My Support Tasks', icon: <CheckSquare size={16} /> });
      return items;
    }

    // 3. Service Operations Department
    if (roleId === 'crm_role_service_ops' || dept.includes('service operations') || dept.includes('service ops')) {
      const items = [
        { id: 'service_ops', label: 'Service Bookings Oversight', icon: <Calendar size={16} /> }
      ];
      if (isManager) {
        items.push({ id: 'staff_mgmt', label: 'Operations Team & Roles', icon: <Briefcase size={16} /> });
      }
      items.push({ id: 'customers', label: 'Customer 360 Lookup', icon: <Users size={16} /> });
      items.push({ id: 'tasks', label: isManager ? 'Service Task Queue' : 'My Service Tasks', icon: <CheckSquare size={16} /> });
      return items;
    }

    // 4. Finance & Accounts Department
    if (roleId === 'crm_role_finance' || dept.includes('finance') || dept.includes('accounts')) {
      const items = [
        { id: 'finance', label: 'Finance & Payouts Desk', icon: <IndianRupee size={16} /> }
      ];
      if (isManager) {
        items.push({ id: 'staff_mgmt', label: 'Finance Team & Roles', icon: <Briefcase size={16} /> });
      }
      items.push({ id: 'ecommerce', label: 'Store Orders Ledger', icon: <ShoppingBag size={16} /> });
      items.push({ id: 'tasks', label: isManager ? 'Audit & Approval Queue' : 'My Finance Tasks', icon: <CheckSquare size={16} /> });
      return items;
    }

    // 5. Provider Relations Department
    if (roleId === 'crm_role_provider_relations' || dept.includes('provider') || dept.includes('partner')) {
      const items = [
        { id: 'providers', label: 'Partner KYC & Directory', icon: <Shield size={16} /> }
      ];
      if (isManager) {
        items.push({ id: 'staff_mgmt', label: 'Provider Relations Team', icon: <Briefcase size={16} /> });
        items.push({ id: 'service_ops', label: 'Service Bookings Logs', icon: <Calendar size={16} /> });
      }
      items.push({ id: 'tasks', label: isManager ? 'Partner Tasks Queue' : 'My Assigned Tasks', icon: <CheckSquare size={16} /> });
      return items;
    }

    // 6. Marketing & Growth Department
    if (roleId === 'crm_role_marketing' || dept.includes('marketing') || dept.includes('growth')) {
      const items = [
        { id: 'coupons', label: 'Offer Codes & Discounts', icon: <Tag size={16} /> },
        { id: 'announcements', label: 'Announcement Bar', icon: <Megaphone size={16} /> },
        { id: 'blogs', label: 'Pet Care Blogs & Guides', icon: <BookOpen size={16} /> }
      ];
      if (isManager) {
        items.push({ id: 'staff_mgmt', label: 'Marketing Team & Roles', icon: <Briefcase size={16} /> });
        items.push({ id: 'customers', label: 'Customer 360 Segments', icon: <Users size={16} /> });
      }
      items.push({ id: 'tasks', label: isManager ? 'Campaign Tasks Queue' : 'My Marketing Tasks', icon: <CheckSquare size={16} /> });
      return items;
    }

    // 7. Quality & Compliance Department
    if (roleId === 'crm_role_quality_compliance' || dept.includes('quality') || dept.includes('compliance')) {
      const items = [
        { id: 'compliance', label: 'Prescriptions & Safety Audit', icon: <FileText size={16} /> }
      ];
      if (isManager) {
        items.push({ id: 'staff_mgmt', label: 'Quality & Audit Team', icon: <Briefcase size={16} /> });
        items.push({ id: 'support', label: 'Safety Disputes & Cases', icon: <MessageSquare size={16} /> });
      }
      items.push({ id: 'tasks', label: isManager ? 'Inspection Task Queue' : 'My Audit Tasks', icon: <CheckSquare size={16} /> });
      return items;
    }

    // 8. CRM Operations & Administration Subordinates (Non-Admin / Non-Head)
    if (dept.includes('operations') || dept.includes('admin')) {
      const items = [];
      if (desigId === 'desig_crm_admin' || crmUser.roleName?.includes('Administrator')) {
        items.push({ id: 'staff_mgmt', label: 'Staff Accounts Roster', icon: <Briefcase size={16} /> });
      }
      items.push({ id: 'customers', label: 'Customer Records', icon: <Users size={16} /> });
      items.push({ id: 'tasks', label: 'My Assigned Tasks', icon: <CheckSquare size={16} /> });
      return items;
    }

    // Default Fallback for any other subordinate
    return [
      { id: 'customers', label: 'Customer Records', icon: <Users size={16} /> },
      { id: 'tasks', label: 'My Assigned Tasks', icon: <CheckSquare size={16} /> }
    ];
  };

  const unreadNotifsCount = notifications.filter(n => !n.is_read).length;

  const filteredTasks = tasks.filter(t => {
    if (taskFilterStatus === 'All') return true;
    return (t.status || 'Pending') === taskFilterStatus;
  });

  // =========================================================================
  // VIEW 1: AUTHENTICATION GATEWAY (LOGIN)
  // =========================================================================
  if (!crmToken || !crmUser) {
    return (
      <div className="min-h-screen lg:h-screen bg-[#F4F6F4] flex flex-col justify-center items-center p-6 font-sans overflow-y-auto">
        <div className="w-full max-w-xl bg-white border border-[#E3EBE5] p-6 sm:p-8 shadow-md space-y-6 my-auto">
          <div className="text-center space-y-1">
            <span className="text-[9px] uppercase tracking-widest text-[#7CA085] font-bold">JOSH PETS HUB</span>
            <h2 className="font-serif text-2xl font-bold text-primary">Enterprise CRM Gateway</h2>
            <p className="text-xs text-gray-500">Please authenticate with your department staff credentials.</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0 text-red-500" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="STAFF EMAIL ADDRESS"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-[#E3EBE5] text-xs focus:outline-none focus:border-primary"
                />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="PASSWORD"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-[#E3EBE5] text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full btn-premium py-2.5 text-xs font-bold uppercase tracking-widest cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loggingIn ? (
                <>
                  <RefreshCw size={14} className="animate-spin shrink-0" />
                  AUTHENTICATING...
                </>
              ) : (
                'ACCESS CRM CONSOLE'
              )}
            </button>
          </form>

          {/* Quick Access Roster of All 7 Department Managers */}
          <div className="bg-[#F1F6F2] p-4 border border-[#E3EBE5] text-[10px] text-gray-600 leading-relaxed space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-[#7CA085]" /> 7 Department Managers (Test Accounts):
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
              {PRESET_MANAGERS.map(m => (
                <button
                  key={m.email}
                  type="button"
                  onClick={() => quickFillCredential(m.email, m.pass)}
                  className="p-2.5 bg-white hover:bg-[#F9FAF9] border border-[#E3EBE5] rounded text-left transition cursor-pointer flex flex-col justify-between group shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                    <span className="font-bold text-[11px] text-primary group-hover:text-[#7CA085] transition truncate">
                      {m.role}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 block truncate">{m.email}</span>
                </button>
              ))}
            </div>

            {/* Quick Access Roster of Customer Support Hierarchy (5 Roles) */}
            <div className="border-t border-[#E3EBE5] pt-3 space-y-2">
              <span className="font-bold text-[#0284C7] uppercase tracking-wider block">
                Customer Support Roster (Head → Lead → Executives):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {PRESET_SUPPORT_ROSTER.map(cs => (
                  <button
                    key={cs.email}
                    type="button"
                    onClick={() => quickFillCredential(cs.email, cs.pass)}
                    className="p-2 bg-white hover:bg-sky-50/50 border border-[#E3EBE5] rounded text-left transition cursor-pointer flex items-center justify-between group shadow-2xs"
                  >
                    <div className="truncate">
                      <span className="font-bold text-[11px] text-slate-800 group-hover:text-primary block truncate">
                        {cs.name} • <span className="text-gray-500 font-normal">{cs.role}</span>
                      </span>
                      <span className="text-[10px] font-mono text-sky-600/80">{cs.email}</span>
                    </div>
                    <ArrowRight size={13} className="text-sky-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center pt-1">
            <a
              href="/"
              className="text-[10px] text-gray-400 hover:text-primary uppercase tracking-widest font-semibold cursor-pointer"
            >
              ← Back to main site
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
    <div className="min-h-screen lg:h-screen bg-[#F4F6F4] flex flex-col lg:flex-row overflow-hidden font-sans">
      
      {/* 1. LEFT SIDEBAR PANEL (Matching SuperAdmin design) */}
      <aside className="w-full lg:w-72 bg-gradient-to-b from-[#1D3B2E] to-[#0F2E23] text-white flex flex-col shrink-0 border-r border-white/5 shadow-2xl relative z-40 lg:h-screen lg:overflow-y-auto">
        
        {/* Logo & Mobile Toggle */}
        <div className="p-4 lg:p-6 border-b border-[#2E5947]/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="JOSH PETS HUB" className="h-8 w-auto object-contain" />
            <div>
              <span className="text-[9px] uppercase tracking-widest text-[#7CA085] font-bold block">OPERATIONS CRM</span>
              <h1 className="font-serif text-base font-bold tracking-wider text-[#FAFBF9] mt-0.5 whitespace-nowrap">
                JOSH PETS HUB
              </h1>
            </div>
          </div>
          <button 
            type="button"
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-md cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Expandable Navigation & Footer Content */}
        <div className={`flex flex-col flex-grow justify-between p-4 lg:p-6 pt-4 lg:pt-8 transition-all duration-300 ${isMobileMenuOpen ? 'flex' : 'hidden lg:flex'}`}>
          <div className="space-y-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7CA085] px-2 block truncate">
              {crmUser?.roleName?.toUpperCase() || 'OPERATIONS'}
            </span>

            {/* Tab Selection Lists */}
            <nav className="space-y-1">
              {getNavItems().map((item) => {
                if (item.isGroup) {
                  const isGroupActive = item.children.some(child => child.id === activeSection);
                  return (
                    <div key={item.id} className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => setCrmMarketingDropdownOpen(prev => !prev)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-r-md rounded-l-none transition-all duration-300 cursor-pointer ${
                          isGroupActive
                            ? 'bg-white/10 backdrop-blur-md text-white border-l-4 border-accent shadow-sm'
                            : 'text-[#C2D3C6] hover:bg-white/5 hover:text-[#FAFBF9] border-l-4 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown
                          size={15}
                          className={`transition-transform duration-300 text-[#A1C0AA] ${
                            crmMarketingDropdownOpen ? 'rotate-180 text-white' : ''
                          }`}
                        />
                      </button>

                      {crmMarketingDropdownOpen && (
                        <div className="space-y-0.5 py-1 relative before:absolute before:left-5 before:top-1.5 before:bottom-1.5 before:w-[2px] before:bg-white/15">
                          {item.children.map((child) => {
                            const isChildActive = activeSection === child.id;
                            return (
                              <button
                                key={child.id}
                                type="button"
                                onClick={() => {
                                  setActiveSection(child.id);
                                  setIsMobileMenuOpen(false);
                                  requestAnimationFrame(() => {
                                    setTimeout(() => {
                                      const el = document.getElementById('crm-main-content');
                                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }, 50);
                                  });
                                }}
                                className={`w-full flex items-center gap-3 pl-8 pr-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-r-md transition-all duration-200 cursor-pointer text-left ${
                                  isChildActive
                                    ? 'bg-white/15 text-white border-l-4 border-accent shadow-xs'
                                    : 'text-[#C2D3C6] hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                                }`}
                              >
                                {child.icon}
                                <span className="whitespace-nowrap">{child.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setIsMobileMenuOpen(false);
                      requestAnimationFrame(() => {
                        setTimeout(() => {
                          const el = document.getElementById('crm-main-content');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 50);
                      });
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-r-md rounded-l-none transition-all duration-300 cursor-pointer ${
                      activeSection === item.id
                        ? 'bg-white/10 backdrop-blur-md text-white border-l-4 border-accent shadow-sm'
                        : 'text-[#C2D3C6] hover:bg-white/5 hover:text-[#FAFBF9] border-l-4 border-transparent'
                      }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      {item.icon}
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/10 text-[#FAFBF9] border border-white/20 shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footer profile & Logout */}
          <div className="border-t border-[#2E5947] pt-4 mt-8 text-xs space-y-3">
            <div>
              <p className="font-bold text-[#FAFBF9] truncate">{crmUser?.name || 'CRM Staff'}</p>
              <p className="text-[10px] text-[#A1C0AA] truncate">{crmUser?.email}</p>
              <p className="text-[10px] font-semibold text-[#D4AF37] uppercase tracking-wider mt-0.5 truncate">
                {crmUser?.roleName}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-2 border border-[#7CA085]/35 hover:border-red-500 hover:text-red-500 rounded-md text-[10px] tracking-widest uppercase font-bold text-[#7CA085] hover:bg-red-500/10 transition cursor-pointer"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </aside>

      {/* 2. RIGHT VIEW MAIN CONSOLE */}
      <main id="crm-main-content" className="flex-grow flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Top bar Header */}
        <div className="shrink-0 bg-[#F4F6F4] border-b border-[#E3EBE5] px-4 lg:px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-center shadow-xs gap-4 z-20">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#7CA085] font-bold block">
              {crmUser?.department?.toUpperCase() || 'ENTERPRISE CRM'} • {crmUser?.roleName?.toUpperCase()}
            </span>
            <h2 className="font-serif text-3xl text-primary font-bold mt-1">
              {getSectionTitle(activeSection)}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* View Live Site */}
            <a
              href="/?preview=guest"
              target="_blank"
              rel="noopener noreferrer"
              className="w-[142px] h-[54px] border border-[#1c4b3a] rounded hover:bg-[#1c4b3a]/5 text-primary transition-all duration-200 flex items-center justify-center gap-3 px-3 shadow-2xs cursor-pointer select-none shrink-0"
              title="Open public home page without login in a new tab"
            >
              <ExternalLink size={16} className="text-primary shrink-0" />
              <div className="flex flex-col text-left leading-tight font-bold text-[11px] tracking-wider uppercase text-primary">
                <span>VIEW LIVE</span>
                <span>SITE</span>
              </div>
            </a>

            {/* Refresh CRM Data */}
            <button
              type="button"
              onClick={loadCrmData}
              disabled={loading}
              className="w-[142px] h-[54px] border border-[#1c4b3a] rounded hover:bg-[#1c4b3a]/5 text-primary transition-all duration-200 flex items-center justify-center gap-3 px-3 shadow-2xs cursor-pointer select-none shrink-0 disabled:opacity-60"
              title="Refresh live data"
            >
              <RefreshCw size={16} className={`text-primary shrink-0 ${loading ? 'animate-spin' : ''}`} />
              <div className="flex flex-col text-center leading-tight font-bold text-[11px] tracking-wider uppercase text-primary">
                <span>REFRESH</span>
                <span>DATA</span>
              </div>
            </button>

            {/* Notifications Bell Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-[54px] h-[54px] border border-[#1c4b3a] rounded hover:bg-[#1c4b3a]/5 text-primary transition-all duration-200 flex items-center justify-center shadow-2xs cursor-pointer relative"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-[#E3EBE5] z-50 text-slate-800 text-xs overflow-hidden">
                  <div className="p-3 bg-[#F1F6F2] border-b border-[#E3EBE5] flex justify-between items-center">
                    <span className="font-serif font-bold text-primary text-xs">Notifications ({notifications.length})</span>
                    {unreadNotifsCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllNotificationsRead}
                        className="text-[10px] text-primary hover:underline font-bold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-[#E3EBE5]">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 italic text-[11px]">No notifications.</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3 hover:bg-[#F9FAF9] transition ${!n.is_read ? 'bg-[#F1F6F2]/60' : ''}`}>
                          <div className="flex justify-between items-start mb-0.5">
                            <span className="font-bold text-primary">{n.title}</span>
                            <span className="text-[9px] text-gray-400">{new Date(n.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[11px] text-gray-600 leading-tight">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Main Content Area */}
        <div className="flex-grow p-4 lg:p-8 overflow-y-auto min-h-0 space-y-6">
          {/* Access Restriction Guard for Unauthorized Route */}
          {(() => {
            const allowedIds = getNavItems().map(item => item.id);
            if (allowedIds.length > 0 && !allowedIds.includes(activeSection)) {
              return (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm my-8">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Module Access Restricted</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Your role (<strong className="text-slate-800">{crmUser.roleName}</strong>) in the <strong className="text-slate-800">{crmUser.department}</strong> department does not have access to this module.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection(allowedIds[0] || 'tasks')}
                    className="px-4 py-2 bg-[#0F2E23] text-white text-xs font-bold rounded-xl hover:bg-[#1a4a39] transition cursor-pointer"
                  >
                    Go to Authorized Workspace
                  </button>
                </div>
              );
            }
            return null;
          })()}

          {/* SECTION 1: MASTER OVERVIEW (COMMAND CENTER - ADMIN ONLY) */}
          {activeSection === 'overview' && isCrmAdmin && (
            <div className="space-y-6">
              {/* Daily Welcome Header */}
              <div className="bg-gradient-to-r from-[#1D3B2E] to-[#0F2E23] text-white p-6 rounded-2xl border border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#7CA085] block mb-1">
                    OPERATIONS COMMAND CENTER • {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
                  </span>
                  <h2 className="text-2xl font-serif font-bold tracking-tight text-[#FAFBF9]">
                    Welcome back, {crmUser.name}!
                  </h2>
                  <p className="text-xs text-[#C2D3C6] mt-0.5">
                    Role: <strong className="text-[#FAFBF9]">{crmUser.roleName}</strong> • Department: <strong className="text-[#FAFBF9]">{crmUser.department}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSection('tasks')}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-[#FAFBF9] rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <CheckSquare size={14} /> Tasks Queue ({tasks.length})
                  </button>
                </div>
              </div>

              {/* SuperAdmin Executive Summary Metrics (10 Compact Square Cards) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {[
                  {
                    label: 'Total Revenue',
                    value: Number((adminStats?.totalRevenue || 145878)).toLocaleString('en-IN'),
                    isCurrency: true,
                    icon: <TrendingUp size={16} />,
                    iconBg: 'bg-emerald-50 text-emerald-600'
                  },
                  {
                    label: 'Total Orders',
                    value: Number((adminStats?.ordersCount || 8)).toLocaleString('en-IN'),
                    icon: <ShoppingBag size={16} />,
                    iconBg: 'bg-blue-50 text-blue-600'
                  },
                  {
                    label: 'Pet Parents / Users',
                    value: Number((adminStats?.usersCount || 27)).toLocaleString('en-IN'),
                    icon: <Users size={16} />,
                    iconBg: 'bg-purple-50 text-purple-600'
                  },
                  {
                    label: 'Service Providers',
                    value: Number((adminStats?.serviceProvidersCount || 1)).toLocaleString('en-IN'),
                    icon: <Building size={16} />,
                    iconBg: 'bg-indigo-50 text-indigo-600'
                  },
                  {
                    label: 'Pending Orders',
                    value: Number((adminStats?.pendingOrdersCount || 6)).toLocaleString('en-IN'),
                    icon: <Clock size={16} />,
                    iconBg: 'bg-orange-50 text-orange-600'
                  },
                  {
                    label: 'Low Stock Alert',
                    value: Number((adminStats?.lowStockCount || 0)).toLocaleString('en-IN'),
                    icon: <AlertTriangle size={16} />,
                    iconBg: 'bg-rose-50 text-rose-600'
                  },
                  {
                    label: 'New Enquiries',
                    value: Number((adminStats?.enquiriesCount || 6)).toLocaleString('en-IN'),
                    icon: <Mail size={16} />,
                    iconBg: 'bg-indigo-50 text-indigo-600'
                  }
                ].map((c) => (
                  <div
                    key={c.label}
                    className="rounded-2xl aspect-[1.35/1] p-3 sm:p-3.5 flex flex-col justify-between hover:shadow-md transition-all border border-[#E3EBE5] bg-white group shadow-2xs"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[9.5px] uppercase font-bold text-gray-500 tracking-wider w-2/3 leading-tight">{c.label}</span>
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${c.iconBg}`}>
                        {c.icon}
                      </div>
                    </div>
                    <div className="my-auto py-1">
                      <p className="text-xl sm:text-2xl lg:text-3xl font-black font-sans text-primary truncate flex items-baseline tracking-tight lining-nums tabular-nums">
                        {c.isCurrency && (
                          <span className="font-sans font-bold text-lg sm:text-xl mr-1 text-primary inline-block">
                            ₹
                          </span>
                        )}
                        <span className="font-sans font-extrabold lining-nums tabular-nums">{c.value}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[8.5px] uppercase tracking-wider font-bold text-[#7CA085]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7CA085]/60 inline-block"></span>
                      <span>Live Metric</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* SuperAdmin Executive Analytical Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue over time */}
                <div className="lg:col-span-8 bg-white rounded-xl border border-[#E3EBE5] p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#E3EBE5] pb-3">
                    <h3 className="font-serif text-sm font-bold text-primary">Sales Revenue History</h3>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Live Aggregated Orders</span>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={adminCharts?.salesHistory || [
                          { month: '2026-03', revenue: 35000, orders: 12 },
                          { month: '2026-04', revenue: 48000, orders: 18 },
                          { month: '2026-05', revenue: 64000, orders: 25 },
                          { month: '2026-06', revenue: 78000, orders: 30 },
                          { month: '2026-07', revenue: 95000, orders: 42 },
                          { month: '2026-08', revenue: 145878, orders: 8 }
                        ]}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3EBE5" />
                        <XAxis dataKey="month" stroke="#A99B8C" fontSize={10} />
                        <YAxis stroke="#A99B8C" fontSize={10} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" name="Sales (INR)" stroke="#1D3B2E" strokeWidth={2.5} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="orders" name="Order count" stroke="#7CA085" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category distributions */}
                <div className="lg:col-span-4 bg-white rounded-xl border border-[#E3EBE5] p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-[#E3EBE5] pb-3">
                    <h3 className="font-serif text-sm font-bold text-primary">Department Distributions</h3>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">SKU Volume</span>
                  </div>
                  <div className="h-72 flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={adminCharts?.categorySales || [
                            { name: 'Dogs', value: 45000 },
                            { name: 'Birds', value: 12000 },
                            { name: 'Reptiles', value: 28000 },
                            { name: 'Fish', value: 18000 },
                            { name: 'Pharmacy', value: 24000 }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {(adminCharts?.categorySales || [
                            { name: 'Dogs', value: 45000 },
                            { name: 'Birds', value: 12000 },
                            { name: 'Reptiles', value: 28000 },
                            { name: 'Fish', value: 18000 },
                            { name: 'Pharmacy', value: 24000 }
                          ]).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Department Shortcut Cards for CRM Operations Head */}
              {isCrmAdmin && (
                <div className="bg-white p-6 rounded-2xl border border-[#E3EBE5] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-primary text-base">7 Department Operational Consoles</h3>
                      <p className="text-xs text-gray-500">Jump directly into any department manager workspace.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveSection('staff_mgmt')}
                      className="px-3.5 py-2 bg-[#1c4b3a] hover:bg-[#153a2d] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs uppercase tracking-wider"
                    >
                      <Briefcase size={13} /> Manage Staff Credentials
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { id: 'support', title: 'Customer Support', desc: 'Tickets & SLA resolution', icon: <MessageSquare size={16} />, color: '#0284C7' },
                      { id: 'service_ops', title: 'Service Bookings Oversight', desc: 'Appointments & dispute resolution', icon: <Calendar size={16} />, color: '#059669' },
                      { id: 'finance', title: 'Finance & Payouts', desc: 'Reconciliation & settlements', icon: <IndianRupee size={16} />, color: '#10B981' },
                      { id: 'providers', title: 'Provider Relations', desc: 'KYC & partner vetting', icon: <Shield size={16} />, color: '#8B5CF6' },
                      { id: 'coupons', title: 'Marketing & Offers', desc: 'Promos, banners & articles', icon: <Tag size={16} />, color: '#EC4899' },
                      { id: 'compliance', title: 'Quality & Rx Safety', desc: 'Prescription audits & disputes', icon: <FileText size={16} />, color: '#6366F1' },
                      { id: 'ecommerce', title: 'Store Orders Ledger', desc: 'Order fulfillment & inventory', icon: <ShoppingBag size={16} />, color: '#D97706' },
                      { id: 'tech', title: 'Technical Support', desc: 'System health & IT telemetry', icon: <RefreshCw size={16} />, color: '#475569' }
                    ].map(d => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setActiveSection(d.id)}
                        className="p-3.5 bg-[#F1F6F2]/60 hover:bg-[#F1F6F2] rounded-xl border border-[#E3EBE5] text-left transition cursor-pointer flex items-start gap-3 group"
                      >
                        <span className="p-2 rounded-lg text-white shrink-0 mt-0.5 shadow-xs" style={{ backgroundColor: d.color }}>
                          {d.icon}
                        </span>
                        <div>
                          <span className="font-bold text-xs text-primary group-hover:text-primary/80 block">{d.title}</span>
                          <span className="text-[11px] text-gray-500 block">{d.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION: CLASSIFIED LISTINGS (SHIFTED FROM ADMIN) */}
          {activeSection === 'listings' && (
            <AdminClassifiedsView crmToken={crmToken} />
          )}

          {/* SECTION: BREEDER KCI VALIDATIONS (SHIFTED FROM ADMIN) */}
          {activeSection === 'studs' && (
            <AdminBreederVerificationView crmToken={crmToken} />
          )}

          {/* SECTION: REGISTERED USERS (SHIFTED FROM ADMIN) */}
          {activeSection === 'users' && (
            <AdminUsersManagerView crmToken={crmToken} />
          )}

          {/* SECTION: CONTACT ENQUIRIES (SHIFTED FROM ADMIN) */}
          {activeSection === 'enquiries' && (
            <AdminEnquiriesView crmToken={crmToken} />
          )}

          {/* SECTION 2: STAFF & ROLES MANAGER (RESTRICTED TO DEPARTMENT SCOPE) */}
          {activeSection === 'staff_mgmt' && (
            <CrmStaffManagerTab crmToken={crmToken} crmUser={crmUser} />
          )}

          {/* SECTION 3: CUSTOMER SUPPORT DESK & HIERARCHY BOARD */}
          {activeSection === 'support' && (
            <CustomerSupportView
              tickets={tickets}
              onRefresh={loadCrmData}
              crmToken={crmToken}
              crmUser={crmUser}
              tasks={tasks}
              onRefreshTasks={loadCrmData}
            />
          )}

          {/* SECTION 4: SERVICE OPERATIONS */}
          {activeSection === 'service_ops' && (
            <ServiceOperationsView crmToken={crmToken} />
          )}

          {/* SECTION 5: ORDERS LEDGER */}
          {activeSection === 'ecommerce' && (
            <EcommerceManagerView crmToken={crmToken} />
          )}

          {/* SECTION 6: FINANCE & PAYOUTS DESK */}
          {activeSection === 'finance' && (
            <FinanceManagerView crmToken={crmToken} />
          )}

          {/* SECTION: CENTRAL WALLET & SERVICE PROVIDER PAYOUTS */}
          {activeSection === 'wallet' && isCrmAdmin && (
            <div className="space-y-6">
              <SuperAdminPlatformWalletView />
            </div>
          )}

          {/* SECTION 7: PROVIDER RELATIONS & KYC */}
          {activeSection === 'providers' && (
            <ProviderRelationsView crmToken={crmToken} />
          )}

          {/* SECTION 8: MARKETING & PROMOTIONS */}
          {activeSection === 'coupons' && (
            <div className="space-y-4">
              <CouponsManagerView />
            </div>
          )}
          {activeSection === 'announcements' && (
            <div className="space-y-4">
              <AnnouncementsManagerView />
            </div>
          )}
          {activeSection === 'blogs' && (
            <div className="space-y-4">
              <BlogsManagerView />
            </div>
          )}

          {/* SECTION: COOKIE CONSENT LOGS */}
          {activeSection === 'consents' && isCrmAdmin && (
            <div className="bg-white rounded-xl border border-[#E3EBE5] p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E3EBE5] pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary">Cookie Consent Logs</h3>
                  <p className="text-xs text-gray-500">Auditable privacy consent records collected across user sessions.</p>
                </div>
                <span className="text-xs font-bold text-primary bg-[#F1F6F2] border border-[#E3EBE5] px-3 py-1 rounded-full">
                  {consentsList.length} Sessions Logged
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F1F6F2] text-primary font-bold border-b border-[#E3EBE5]">
                      <th className="p-3 uppercase text-[10px] tracking-wider">Session / IP</th>
                      <th className="p-3 uppercase text-[10px] tracking-wider">Preferences</th>
                      <th className="p-3 uppercase text-[10px] tracking-wider">User Agent</th>
                      <th className="p-3 uppercase text-[10px] tracking-wider text-right">Date</th>
                      <th className="p-3 uppercase text-[10px] tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3EBE5]">
                    {consentsList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-400 italic">No cookie consent records found.</td>
                      </tr>
                    ) : (
                      consentsList.map((c) => (
                        <tr key={c.id || c._id || c.session_id || c.sessionId} className="hover:bg-[#F9FAF9] transition">
                          <td className="p-3">
                            <span className="font-bold text-primary block truncate max-w-[150px]">{c.session_id || c.sessionId || 'Session'}</span>
                            <span className="text-[10px] text-gray-400 block">{c.ip_address || c.ip || 'Unknown IP'}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${c.preferences?.essential ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>Essential</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${c.preferences?.functional ? 'bg-sky-50 text-sky-700' : 'bg-gray-100 text-gray-500'}`}>Functional</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${c.preferences?.analytics ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>Analytics</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${c.preferences?.marketing ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>Marketing</span>
                            </div>
                          </td>
                          <td className="p-3 text-gray-600 max-w-[200px] truncate text-[10px]" title={c.user_agent || c.userAgent}>
                            {c.user_agent || c.userAgent || 'Web Client'}
                          </td>
                          <td className="p-3 text-right text-gray-500 font-medium">
                            {(c.created_at || c.createdAt) ? new Date(c.created_at || c.createdAt).toLocaleDateString() : 'Recent'}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteConsent(c.id || c._id || c.session_id || c.sessionId)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete Log"
                            >
                              <Trash size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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
            <div className="bg-white rounded-xl border border-[#E3EBE5] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#E3EBE5] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif font-bold text-primary text-base">Customer 360 Unified Profile Directory</h3>
                  <p className="text-xs text-gray-500">Search registered pet parents, view lifetime orders, and log CRM notes.</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, phone, city..."
                    className="w-full pl-8 pr-3 py-2 text-xs bg-[#F1F6F2] border border-[#E3EBE5] rounded-md focus:outline-none focus:border-primary"
                  />
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F1F6F2] border-b border-[#E3EBE5] text-primary font-bold uppercase tracking-wider text-[10px]">
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
                  <tbody className="divide-y divide-[#E3EBE5] font-medium">
                    {customers
                      .filter(c => {
                        const q = searchQuery.toLowerCase();
                        return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q);
                      })
                      .map(customer => (
                        <tr key={customer.id} className="hover:bg-[#F9FAF9] transition">
                          <td className="py-3 px-4">
                            <span className="font-bold text-primary block">{customer.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{customer.id}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="text-gray-800">{customer.email}</span>
                              <span className="text-[10px] text-gray-400">{customer.phone}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{customer.city}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {customer.pets?.length > 0 ? (
                                customer.pets.map((p, idx) => (
                                  <span key={idx} className="bg-[#F1F6F2] text-primary border border-[#E3EBE5] px-1.5 py-0.5 rounded text-[10px]">
                                    {p.name} ({p.type})
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 italic">None logged</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {customer.ordersCount || 0} Orders • {customer.bookingsCount || 0} Bookings
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-primary">
                            ₹{(customer.totalSpent || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedCustomer(customer)}
                              className="px-3 py-1 border border-[#1c4b3a] hover:bg-[#1c4b3a]/5 text-primary text-xs font-bold rounded transition cursor-pointer"
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

          {/* SECTION 12: TASK MANAGEMENT SYSTEM & WORKFLOW (PHASE 6) */}
          {activeSection === 'tasks' && (
            <div className="bg-white rounded-xl border border-[#E3EBE5] shadow-xs overflow-hidden">
              <div className="p-5 border-b border-[#E3EBE5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif font-bold text-primary text-base">Department Task Workflow & Lifecycle</h3>
                  <p className="text-xs text-gray-500">
                    State Machine: Pending → In Progress → Under Review → Completed / Reopened
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={taskFilterStatus}
                    onChange={(e) => setTaskFilterStatus(e.target.value)}
                    className="px-3 py-1.5 text-xs border border-[#E3EBE5] rounded-md focus:outline-none focus:border-primary bg-white text-gray-700 font-semibold"
                  >
                    <option value="All">All Task Stages</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Completed">Completed</option>
                    <option value="Reopened">Reopened</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setShowNewTaskModal(true)}
                    className="px-4 py-2 bg-[#1c4b3a] hover:bg-[#153a2d] text-white font-bold text-xs uppercase tracking-wider rounded transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus size={14} /> Schedule Task
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs italic">
                    No tasks currently match this status filter.
                  </div>
                ) : (
                  filteredTasks.map(task => {
                    const status = task.status || (task.completed ? 'Completed' : 'Pending');
                    return (
                      <div
                        key={task.id}
                        className="p-4 bg-[#F1F6F2]/40 rounded-xl border border-[#E3EBE5] flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-gray-300 transition shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-400 font-bold">{task.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                              status === 'Under Review' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                                status === 'In Progress' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                  status === 'Reopened' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                                    'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}>
                              {status}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold">
                              {task.department || 'Operations'}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-slate-900">{task.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{task.description || 'No additional instructions provided.'}</p>

                          {task.reopenReason && status === 'Reopened' && (
                            <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-semibold mt-1">
                              <strong>Manager Revision Request:</strong> {task.reopenReason}
                            </div>
                          )}

                          {task.delegationNotes && (
                            <div className="p-2 rounded bg-sky-50 border border-sky-200 text-sky-800 text-[11px] mt-1">
                              <strong>Delegation Instructions ({task.delegatedBy || 'Team Lead'}):</strong> {task.delegationNotes}
                            </div>
                          )}

                          {(task.employeeNotes || task.remarks) && (
                            <div className="p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] mt-1">
                              <strong>Employee Update Description {task.lastUpdatedBy ? `(${task.lastUpdatedBy})` : ''}:</strong> {task.employeeNotes || task.remarks}
                            </div>
                          )}

                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-4 pt-1">
                            <span>Assigned to: <strong className="text-slate-700">{task.assignedTo}</strong></span>
                            <span>Priority: <strong className="text-slate-700">{task.priority || 'Medium'}</strong></span>
                            <span>Due Date: <strong className="text-slate-700">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Today'}</strong></span>
                          </div>
                        </div>

                        {/* Lifecycle Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                          {status === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateTaskStatus(task, 'In Progress')}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                            >
                              <Play size={12} /> Start Task
                            </button>
                          )}

                          {status === 'In Progress' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateTaskStatus(task, 'Under Review')}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                            >
                              <CheckCheck size={13} /> Submit for Review
                            </button>
                          )}

                          {status === 'Under Review' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdateTaskStatus(task, 'Completed')}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                              >
                                <CheckCircle2 size={13} /> Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => { setReopeningTask(task); setReopenReasonText(''); }}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                              >
                                <RotateCcw size={12} /> Reopen
                              </button>
                            </>
                          )}

                          {status === 'Reopened' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateTaskStatus(task, 'In Progress')}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                            >
                              <Play size={12} /> Resume Work
                            </button>
                          )}

                          {status === 'Completed' && (
                            <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle size={13} /> Approved
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* REOPEN TASK MODAL */}
      {reopeningTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif font-black text-slate-900 text-base">Reopen Task for Revisions</h3>
              <button
                type="button"
                onClick={() => setReopeningTask(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Please provide actionable feedback for <strong>{reopeningTask.assignedTo}</strong> on what revisions are required before this task can be approved.
              </p>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Feedback / Reopen Reason *</label>
                <textarea
                  rows={3}
                  required
                  value={reopenReasonText}
                  onChange={(e) => setReopenReasonText(e.target.value)}
                  placeholder="e.g. Please verify customer phone number and attach booking reference..."
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReopeningTask(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!reopenReasonText.trim()}
                  onClick={() => handleUpdateTaskStatus(reopeningTask, 'Reopened', reopenReasonText.trim())}
                  className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  Confirm Reopen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
