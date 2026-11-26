import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, UserPlus, Shield, ShieldCheck, Key, Lock, Eye, EyeOff,
  Edit, Trash2, Check, X, RefreshCw, ExternalLink, Briefcase,
  Phone, Mail, CheckCircle2, AlertCircle, Copy, Sparkles, Filter,
  Building2, Layers, AlertTriangle, ArrowRight, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';
import { SEED_CRM_ROLES, SEED_CRM_STAFF, SEED_CRM_DEPARTMENTS, SEED_CRM_DESIGNATIONS } from '../../data/crmSeedData.js';

const PERMISSION_CONFIG = [
  { key: 'manage_staff', label: 'Manage Staff Credentials', desc: 'Can create and provision login credentials for other staff' },
  { key: 'manage_roles', label: 'Manage Roles & Permissions', desc: 'Can create and configure departmental role permissions' },
  { key: 'view_customers', label: 'View Customer 360', desc: 'Can view customer profiles, pet details, and contact info' },
  { key: 'manage_customers', label: 'Manage Customers', desc: 'Can add internal CRM notes and edit customer tags' },
  { key: 'view_leads', label: 'View Sales Leads', desc: 'Can see inquiries, adoption leads, and service inquiries' },
  { key: 'manage_leads', label: 'Manage Leads & Pipeline', desc: 'Can update lead stages, deal values, and notes' },
  { key: 'view_orders', label: 'View Shop Orders', desc: 'Can view order transaction histories and tracking statuses' },
  { key: 'manage_orders', label: 'Manage Orders Liaison', desc: 'Can update order customer notes and tracking flags' },
  { key: 'view_bookings', label: 'View Service Bookings', desc: 'Can view appointments for hostels, grooming, training, vet' },
  { key: 'manage_bookings', label: 'Manage Bookings Dispatch', desc: 'Can coordinate and update appointment statuses' },
  { key: 'view_tickets', label: 'View Support Tickets', desc: 'Can view customer support cases and grievances' },
  { key: 'manage_tickets', label: 'Manage & Resolve Tickets', desc: 'Can reply to tickets, change status, and close cases' },
  { key: 'manage_tasks', label: 'Manage Follow-up Tasks', desc: 'Can create and check off customer callback tasks' },
  { key: 'view_finance', label: 'View Financial Ledger', desc: 'Can view platform revenues, payouts, and payment splits' },
  { key: 'manage_finance', label: 'Manage Refunds & Approvals', desc: 'Can approve or reject customer refund requests' },
  { key: 'view_providers', label: 'View Service Partners', desc: 'Can view partner directory and service categories' },
  { key: 'manage_providers', label: 'Verify Partner KYC', desc: 'Can review medical licenses and approve partner accounts' },
  { key: 'view_quality', label: 'View Prescriptions & Audits', desc: 'Can view uploaded prescriptions and safety disputes' },
  { key: 'manage_quality', label: 'Verify Rx & Safety Audits', desc: 'Can approve or reject veterinary prescriptions' },
  { key: 'view_tech', label: 'View System Health & IT', desc: 'Can monitor platform uptime and gateway metrics' },
  { key: 'manage_tech', label: 'Manage IT Incidents', desc: 'Can log and resolve technical incident tickets' },
  { key: 'export_data', label: 'Export Reports & Data', desc: 'Can download operational CSV and ledger data' }
];

const PRESET_ROLE_COLORS = ['#0F2E23', '#0284C7', '#059669', '#10B981', '#8B5CF6', '#EC4899', '#6366F1'];

const DEFAULT_DEPARTMENTS = [
  'CRM Operations & Administration',
  'Customer Support',
  'Service Operations',
  'Finance & Accounts',
  'Provider Relations',
  'Marketing & Growth',
  'Quality & Compliance'
];

const CrmAccessManagerView = () => {
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'roles' | 'departments'
  const [staffList, setStaffList] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('joshpetshub_crm_staff') || 'null');
      return Array.isArray(cached) && cached.length > 0 ? cached : SEED_CRM_STAFF;
    } catch (_) {
      return SEED_CRM_STAFF;
    }
  });
  const [rolesList, setRolesList] = useState(() => {
    try {
      const cached = JSON.parse(localStorage.getItem('joshpetshub_crm_roles') || 'null');
      return Array.isArray(cached) && cached.length > 0 ? cached : [...SEED_CRM_ROLES, ...SEED_CRM_DESIGNATIONS];
    } catch (_) {
      return [...SEED_CRM_ROLES, ...SEED_CRM_DESIGNATIONS];
    }
  });
  const [departmentsList, setDepartmentsList] = useState(SEED_CRM_DEPARTMENTS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

  // Staff Modal State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [savingStaff, setSavingStaff] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Staff Form Fields
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffDepartment, setStaffDepartment] = useState('CRM Operations & Administration');
  const [staffIsActive, setStaffIsActive] = useState(true);

  // Role Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [savingRole, setSavingRole] = useState(false);

  // Role Form Fields
  const [roleName, setRoleName] = useState('');
  const [roleDepartment, setRoleDepartment] = useState('CRM Operations & Administration');
  const [roleCategory, setRoleCategory] = useState('Employee Designation'); // 'Department Head' | 'Employee Designation'
  const [roleReportingTo, setRoleReportingTo] = useState('Admin');
  const [roleDescription, setRoleDescription] = useState('');
  const [roleColor, setRoleColor] = useState('#0F2E23');
  const [roleStatus, setRoleStatus] = useState('Active');
  const [rolePermissions, setRolePermissions] = useState({
    view_customers: true,
    manage_customers: false,
    view_leads: true,
    manage_leads: false,
    view_orders: true,
    manage_orders: false,
    view_bookings: true,
    manage_bookings: false,
    view_tickets: true,
    manage_tickets: true,
    manage_tasks: true,
    export_data: false
  });

  // Department Modal State
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptForm, setDeptForm] = useState({ department_name: '', department_code: '', description: '' });
  const [savingDept, setSavingDept] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesRes, staffRes, deptRes] = await Promise.all([
        apiRequest('/crm/admin/roles'),
        apiRequest('/crm/admin/staff'),
        apiRequest('/crm/departments')
      ]);

      if (rolesRes && rolesRes.success && Array.isArray(rolesRes.roles) && rolesRes.roles.length > 0) {
        setRolesList(rolesRes.roles);
        try { localStorage.setItem('joshpetshub_crm_roles', JSON.stringify(rolesRes.roles)); } catch (_) {}
      }
      if (staffRes && staffRes.success && Array.isArray(staffRes.staff) && staffRes.staff.length > 0) {
        setStaffList(staffRes.staff);
        try { localStorage.setItem('joshpetshub_crm_staff', JSON.stringify(staffRes.staff)); } catch (_) {}
      }
      if (deptRes && deptRes.success && Array.isArray(deptRes.departments) && deptRes.departments.length > 0) {
        setDepartmentsList(deptRes.departments);
      }
    } catch (err) {
      console.warn('Failed to load CRM admin data from backend, preserving active configuration:', err);
      try {
        const cachedRoles = JSON.parse(localStorage.getItem('joshpetshub_crm_roles') || 'null');
        const cachedStaff = JSON.parse(localStorage.getItem('joshpetshub_crm_staff') || 'null');
        setRolesList(Array.isArray(cachedRoles) && cachedRoles.length > 0 ? cachedRoles : [...SEED_CRM_ROLES, ...SEED_CRM_DESIGNATIONS]);
        setStaffList(Array.isArray(cachedStaff) && cachedStaff.length > 0 ? cachedStaff : SEED_CRM_STAFF);
      } catch (_) {
        setRolesList([...SEED_CRM_ROLES, ...SEED_CRM_DESIGNATIONS]);
        setStaffList(SEED_CRM_STAFF);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Available departments list combining defaults and any custom departments as clean strings
  const availableDepartments = useMemo(() => {
    const fromDepts = Array.isArray(departmentsList)
      ? departmentsList
          .map(d => {
            if (typeof d === 'string') return d.trim();
            return (d?.department_name || d?.name || '').trim();
          })
          .filter(Boolean)
      : [];
    return Array.from(new Set([...DEFAULT_DEPARTMENTS, ...fromDepts]));
  }, [departmentsList]);

  // Filter designations strictly matching the selected department
  const filteredRolesForStaff = useMemo(() => {
    const nonDeprecated = rolesList.filter(r => r.status !== 'Deprecated');
    if (!staffDepartment) return nonDeprecated;
    const targetDept = staffDepartment.trim().toLowerCase();
    let matches = nonDeprecated.filter(r => (r.department || '').trim().toLowerCase() === targetDept);
    
    // When editing an existing staff member whose role might be legacy/custom, keep it included
    if (staffRole && !matches.some(r => r.id === staffRole)) {
      const currentRoleObj = rolesList.find(r => r.id === staffRole);
      if (currentRoleObj) matches = [currentRoleObj, ...matches];
    }
    return matches.length > 0 ? matches : nonDeprecated;
  }, [rolesList, staffDepartment, staffRole]);

  // Handle department change and auto-sync designation
  const handleStaffDepartmentChange = (newDept) => {
    setStaffDepartment(newDept);
    const targetDept = newDept.trim().toLowerCase();
    const matchingRole = rolesList.find(r => 
      (r.department || '').trim().toLowerCase() === targetDept && 
      r.status !== 'Deprecated'
    );
    if (matchingRole) {
      setStaffRole(matchingRole.id);
    }
  };

  // Staff Form Handlers
  const handleOpenAddStaff = () => {
    setEditingStaffId(null);
    setStaffName('');
    setStaffEmail('');
    setStaffPassword('CrmStaff@123');
    const initialDept = DEFAULT_DEPARTMENTS[0] || 'CRM Operations & Administration';
    setStaffDepartment(initialDept);
    const initialRole = rolesList.find(r => 
      (r.department || '').trim().toLowerCase() === initialDept.toLowerCase() && 
      r.status !== 'Deprecated'
    ) || rolesList[0];
    setStaffRole(initialRole?.id || '');
    setStaffPhone('');
    setStaffIsActive(true);
    setShowStaffModal(true);
  };

  const handleOpenEditStaff = (staff) => {
    setEditingStaffId(staff.id);
    setStaffName(staff.name || '');
    setStaffEmail(staff.email || '');
    setStaffPassword(staff.password || '');
    const dept = staff.department || DEFAULT_DEPARTMENTS[0];
    setStaffDepartment(dept);
    setStaffRole(staff.roleId || staff.role_id || '');
    setStaffPhone(staff.phone || '');
    setStaffIsActive(staff.isActive !== false);
    setShowStaffModal(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim() || (!editingStaffId && !staffPassword.trim())) {
      toast.error('Please fill in all required credentials.');
      return;
    }

    setSavingStaff(true);
    const payload = {
      name: staffName.trim(),
      email: staffEmail.trim().toLowerCase(),
      password: staffPassword.trim(),
      roleId: staffRole,
      department: staffDepartment,
      phone: staffPhone.trim(),
      isActive: staffIsActive
    };

    try {
      if (editingStaffId) {
        const res = await apiRequest(`/crm/admin/staff/${editingStaffId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        if (res && res.success) {
          toast.success(`Staff account for ${payload.name} updated!`);
          setShowStaffModal(false);
          loadData();
        } else {
          toast.error(res?.message || 'Failed to update staff account.');
        }
      } else {
        const res = await apiRequest('/crm/admin/staff', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (res && res.success) {
          toast.success(`🎉 Staff account provisioned for ${payload.name}!`);
          setShowStaffModal(false);
          loadData();
        } else {
          toast.error(res?.message || 'Failed to provision staff account.');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Error saving staff credentials.');
    } finally {
      setSavingStaff(false);
    }
  };

  const handleToggleStaffActive = async (staff) => {
    const updated = !staff.isActive;
    try {
      const res = await apiRequest(`/crm/admin/staff/${staff.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: updated })
      });
      if (res && res.success) {
        setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, isActive: updated } : s));
        toast.success(`Staff member ${staff.name} ${updated ? 'activated' : 'deactivated'}.`);
      }
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleDeleteStaff = async (staff) => {
    if (!window.confirm(`Are you sure you want to delete staff account "${staff.name}" (${staff.email})?`)) return;
    try {
      const res = await apiRequest(`/crm/admin/staff/${staff.id}`, { method: 'DELETE' });
      if (res && res.success) {
        toast.success(`Staff account deleted.`);
        setStaffList(prev => prev.filter(s => s.id !== staff.id));
      } else {
        toast.error(res?.message || 'Could not delete staff.');
      }
    } catch (err) {
      toast.error('Failed to delete staff account.');
    }
  };

  // Role Form Handlers
  const handleOpenAddRole = () => {
    setEditingRoleId(null);
    setRoleName('');
    setRoleDepartment('CRM Operations & Administration');
    setRoleCategory('Employee Designation');
    setRoleReportingTo('Admin');
    setRoleDescription('');
    setRoleColor('#059669');
    setRoleStatus('Active');
    setRolePermissions({
      view_customers: true,
      manage_customers: false,
      view_leads: true,
      manage_leads: false,
      view_orders: true,
      manage_orders: false,
      view_bookings: true,
      manage_bookings: false,
      view_tickets: true,
      manage_tickets: true,
      manage_tasks: true,
      export_data: false
    });
    setShowRoleModal(true);
  };

  const handleOpenEditRole = (role) => {
    setEditingRoleId(role.id);
    setRoleName(role.name || '');
    setRoleDepartment(role.department || 'CRM Operations & Administration');
    setRoleCategory(role.category || (role.isHead ? 'Department Head' : 'Employee Designation'));
    setRoleReportingTo(role.reportingTo || 'Super Administrator');
    setRoleDescription(role.description || '');
    setRoleColor(role.color || '#0F2E23');
    setRoleStatus(role.status || 'Active');
    setRolePermissions({ ...(role.permissions || {}) });
    setShowRoleModal(true);
  };

  const handleTogglePermission = (key) => {
    setRolePermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.error('Role name is required.');
      return;
    }

    setSavingRole(true);
    const payload = {
      name: roleName.trim(),
      department: roleDepartment,
      category: roleCategory,
      reportingTo: roleReportingTo,
      description: roleDescription.trim(),
      color: roleColor,
      status: roleStatus,
      permissions: rolePermissions
    };

    try {
      if (editingRoleId) {
        const res = await apiRequest(`/crm/admin/roles/${editingRoleId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        if (res && res.success) {
          toast.success(`Role "${payload.name}" updated!`);
          setShowRoleModal(false);
          loadData();
        } else {
          toast.error(res?.message || 'Failed to update role.');
        }
      } else {
        const res = await apiRequest('/crm/admin/roles', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (res && res.success) {
          toast.success(`🎉 New Role "${payload.name}" created!`);
          setShowRoleModal(false);
          loadData();
        } else {
          toast.error(res?.message || 'Failed to create role.');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Error saving role.');
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteRole = async (role) => {
    if (role.staffCount > 0) {
      toast.error(`Cannot delete role. There are ${role.staffCount} staff member(s) assigned.`);
      return;
    }
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    try {
      const res = await apiRequest(`/crm/admin/roles/${role.id}`, { method: 'DELETE' });
      if (res && res.success) {
        toast.success('Role deleted.');
        setRolesList(prev => prev.filter(r => r.id !== role.id));
      } else {
        toast.error(res?.message || 'Could not delete role.');
      }
    } catch (err) {
      toast.error('Failed to delete role.');
    }
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (!deptForm.department_name.trim() || !deptForm.department_code.trim()) {
      toast.error('Department Name and Code are required.');
      return;
    }

    setSavingDept(true);
    try {
      const res = await apiRequest('/crm/departments', {
        method: 'POST',
        body: JSON.stringify(deptForm)
      });
      if (res && res.success) {
        toast.success(`Department "${deptForm.department_name}" created!`);
        setShowDeptModal(false);
        setDeptForm({ department_name: '', department_code: '', description: '' });
        loadData();
      } else {
        toast.error(res?.message || 'Failed to create department.');
      }
    } catch (err) {
      toast.error(err.message || 'Error creating department.');
    } finally {
      setSavingDept(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text);
    toast.success(`Copied ${label} to clipboard!`, { icon: '📋' });
  };

  const filteredStaff = staffList.filter(s => {
    const matchesSearch = !searchQuery.trim() || (
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roleName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesDept = selectedDeptFilter === 'All' || (
      (s.department || '').toLowerCase().includes(selectedDeptFilter.toLowerCase()) ||
      selectedDeptFilter.toLowerCase().includes((s.department || '').toLowerCase())
    );

    return matchesSearch && matchesDept;
  });

  const crmAdminAccount = staffList.find(s => s.roleId === 'crm_role_admin' || s.roleName?.toLowerCase().includes('admin'));

  return (
    <div className="space-y-6">
      {/* Super Admin Master Provisioning Card for CRM Admin */}
      <div className="bg-gradient-to-r from-[#0F2E23] to-[#1a4a39] text-white p-6 rounded-2xl border border-emerald-600/30 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck size={18} className="text-[#D4AF37]" />
              <span className="text-[10px] font-black tracking-widest uppercase text-[#D4AF37]">
                SUPER ADMIN HIERARCHICAL ROLE COMMAND
              </span>
            </div>
            <h3 className="text-lg font-serif font-black text-white">
              Super Admin Role Creation & Department Management
            </h3>
            <p className="text-xs text-gray-200 mt-1 max-w-2xl leading-relaxed">
              Super Admin holds universal administrative authority to create and manage all 7 CRM departments, Department Manager roles, subordinate designations, and employee accounts. Department Managers in turn manage subordinate employee designations strictly within their assigned department.
            </p>
          </div>

          <div className="bg-white/10 border border-white/20 p-3.5 rounded-xl flex items-center justify-between gap-4 shrink-0 min-w-[280px]">
            {crmAdminAccount ? (
              <div className="flex-grow">
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] block">Active CRM Operations Head</span>
                <span className="font-bold text-xs text-white block">{crmAdminAccount.name}</span>
                <span className="font-mono text-[11px] text-gray-300 block">{crmAdminAccount.email}</span>
                <button
                  type="button"
                  onClick={() => handleOpenEditStaff(crmAdminAccount)}
                  className="mt-2 text-[11px] font-bold text-[#D4AF37] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Edit size={12} /> Edit / Reset Password →
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleOpenAddStaff}
                className="w-full py-2.5 px-4 bg-[#D4AF37] hover:bg-[#c49f27] text-[#071711] font-bold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer shadow-sm text-center"
              >
                + Provision CRM Admin Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top Banner & Quick Controls Card */}
      <div className="bg-white rounded-xl shadow-xs border border-beige/60 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-beige/40 pb-5">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-50 text-primary rounded-xl border border-emerald-200">
              <Briefcase size={22} />
            </span>
            <div>
              <h3 className="font-serif text-xl font-bold text-primary">
                CRM Staff Access & Hierarchical Roles
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage 7 operational departments, provision department managers and subordinate employee designations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg border border-gray-200 transition cursor-pointer shrink-0"
              title="Refresh staff & roles"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            <a
              href="/crm"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-premium !py-2 !px-3.5 !text-xs gap-1.5 flex items-center hover:bg-emerald-50 text-emerald-900 border-emerald-300 font-bold cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
              title="Launch the standalone CRM Portal in a new tab"
            >
              <ExternalLink size={14} className="text-emerald-700" />
              <span>LAUNCH CRM PORTAL</span>
            </a>

            {activeTab === 'staff' && (
              <button
                type="button"
                onClick={handleOpenAddStaff}
                className="px-4 py-2 bg-[#0F2E23] hover:bg-[#184636] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md shrink-0 whitespace-nowrap active:scale-[0.98]"
              >
                <UserPlus size={15} className="text-amber-400" />
                <span>CREATE EMPLOYEE ACCOUNT</span>
              </button>
            )}
            {activeTab === 'roles' && (
              <button
                type="button"
                onClick={handleOpenAddRole}
                className="px-4 py-2 bg-[#0F2E23] hover:bg-[#184636] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md shrink-0 whitespace-nowrap active:scale-[0.98]"
              >
                <Shield size={15} className="text-amber-400" />
                <span>CREATE ROLE / DESIGNATION</span>
              </button>
            )}
            {activeTab === 'departments' && (
              <button
                type="button"
                onClick={() => setShowDeptModal(true)}
                className="px-4 py-2 bg-[#0F2E23] hover:bg-[#184636] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md shrink-0 whitespace-nowrap active:scale-[0.98]"
              >
                <Building2 size={15} className="text-amber-400" />
                <span>ADD NEW DEPARTMENT</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Navigation Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-5">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('staff')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Users size={14} />
              <span>Employees & Staff ({staffList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roles')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'roles'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <ShieldCheck size={14} />
              <span>Roles & Designations ({rolesList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('departments')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'departments'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Building2 size={14} />
              <span>Departments (7)</span>
            </button>
          </div>

          <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
            <Key size={13} className="text-amber-600" />
            <span>Staff accounts log in at <strong className="font-mono text-primary">/crm</strong> with assigned role limits.</span>
          </div>
        </div>
      </div>

      {/* TAB 1: STAFF ACCOUNTS */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-xl shadow-xs border border-beige/60 overflow-hidden">
          <div className="p-5 border-b border-beige/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="font-serif text-lg font-bold text-primary">CRM Staff Registry & Access Accounts</h4>
              <p className="text-xs text-gray-500">
                Manage employee assignments across the 7 departments with full activation and credential controls.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              {/* Department Filter */}
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-beige rounded-lg focus:outline-none focus:border-primary bg-white text-gray-700 shadow-2xs font-medium"
              >
                <option value="All">All Departments</option>
                {DEFAULT_DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <div className="w-full sm:w-56">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search staff..."
                  className="w-full px-3 py-2 text-xs border border-beige rounded-lg focus:outline-none focus:border-primary shadow-2xs"
                />
              </div>

              <button
                type="button"
                onClick={handleOpenAddStaff}
                className="px-3.5 py-2 bg-[#0F2E23] hover:bg-[#184636] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md whitespace-nowrap active:scale-[0.98]"
              >
                <UserPlus size={15} className="text-amber-400" />
                <span>CREATE EMPLOYEE ACCOUNT</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBF9] text-[#7CA085] uppercase tracking-wider text-[10px] font-bold border-b border-beige/40">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Login Email ID</th>
                  <th className="py-3 px-4">Password Credential</th>
                  <th className="py-3 px-4">Assigned Designation</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/40">
                {filteredStaff.map((staff) => {
                  const isDeprecatedRole = staff.roleId === 'crm_role_ecommerce' || staff.roleId === 'crm_role_technical_support' || staff.needsReassignment;
                  return (
                    <tr key={staff.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-serif font-black flex items-center justify-center text-xs shrink-0 border border-primary/20">
                            {staff.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{staff.name}</span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Phone size={10} /> {staff.phone || 'No phone'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-gray-800 font-medium select-all">{staff.email}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(staff.email, 'Email')}
                            className="text-gray-400 hover:text-primary transition p-0.5 cursor-pointer"
                            title="Copy email ID"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700 select-all border border-gray-200">
                            {staff.password ? (staff.password.length > 20 ? '••••••••' : staff.password) : '••••••••'}
                          </span>
                          {staff.password && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(staff.password, 'Password')}
                              className="text-gray-400 hover:text-primary transition p-0.5 cursor-pointer"
                              title="Copy password credential"
                            >
                              <Copy size={12} />
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border shadow-2xs"
                            style={{
                              backgroundColor: `${staff.roleColor || '#0F2E23'}12`,
                              borderColor: `${staff.roleColor || '#0F2E23'}40`,
                              color: staff.roleColor || '#0F2E23'
                            }}
                          >
                            <Shield size={11} />
                            <span>{staff.roleName || 'CRM Staff'}</span>
                          </span>
                          {isDeprecatedRole && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 text-[9px] font-bold">
                              <AlertTriangle size={10} className="text-amber-600" />
                              Reassignment Required
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-gray-600">
                        {staff.department || 'General'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStaffActive(staff)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                            staff.isActive !== false
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${staff.isActive !== false ? 'bg-emerald-600' : 'bg-gray-400'}`}></span>
                          <span>{staff.isActive !== false ? 'Active' : 'Suspended'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditStaff(staff)}
                            className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-md transition cursor-pointer"
                            title="Edit staff account & reset password"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(staff)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                            title="Delete staff account"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredStaff.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-400 italic">
                      {searchQuery ? `No staff matching "${searchQuery}"` : 'No staff accounts configured in this department.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & DESIGNATIONS */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-beige/60">
            <div>
              <h4 className="font-serif text-base font-bold text-primary">Department Roles & Designations Catalog</h4>
              <p className="text-xs text-gray-500">Super Admin can configure both Department Head roles and Subordinate Designations.</p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddRole}
              className="px-3.5 py-2 bg-[#0F2E23] hover:bg-[#184636] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md whitespace-nowrap active:scale-[0.98]"
            >
              <Plus size={14} className="text-amber-400" /> <span>CREATE DESIGNATION</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {rolesList.map((role) => (
              <div key={role.id} className="bg-white rounded-xl shadow-xs border border-beige/60 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: role.color || '#0F2E23' }}
                      />
                      <div>
                        <h4 className="font-serif text-base font-bold text-primary">{role.name}</h4>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                          {role.department || 'General'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditRole(role)}
                        className="p-1 text-gray-500 hover:text-primary hover:bg-gray-100 rounded transition cursor-pointer"
                        title="Edit role & permissions"
                      >
                        <Edit size={14} />
                      </button>
                      {!role.isSystem && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(role)}
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Delete role"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 my-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      role.isHead || role.category === 'Department Head'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                      {role.isHead || role.category === 'Department Head' ? 'Department Head' : 'Employee Designation'}
                    </span>
                    {role.status === 'Deprecated' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-300">
                        Deprecated
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mb-4">{role.description || 'No description provided.'}</p>

                  {/* Permissions Breakdown Badges */}
                  <div className="space-y-1.5 border-t border-gray-100 pt-3">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-2">
                      ENABLED CAPABILITIES:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      {PERMISSION_CONFIG.map((p) => {
                        const enabled = Boolean(role.permissions?.[p.key]);
                        return (
                          <div
                            key={p.key}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded ${
                              enabled ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-gray-300 line-through'
                            }`}
                          >
                            {enabled ? <Check size={12} className="text-emerald-600 shrink-0" /> : <X size={12} className="text-gray-300 shrink-0" />}
                            <span className="truncate">{p.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 mt-4 flex justify-between items-center text-xs text-gray-500">
                  <span className="font-medium">
                    Assigned Staff: <strong className="text-primary">{role.staffCount || 0} member(s)</strong>
                  </span>
                  {role.isSystem && (
                    <span className="text-[10px] uppercase font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                      System Default
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENTS & ORGANIZATION STRUCTURE */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-xl shadow-xs border border-beige/60 overflow-hidden">
          <div className="p-5 border-b border-beige/40 flex justify-between items-center">
            <div>
              <h4 className="font-serif text-lg font-bold text-primary">Organizational Departments Structure</h4>
              <p className="text-xs text-gray-500">The 7 defined operational branches of the Josh Pet Hub Enterprise CRM.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeptModal(true)}
              className="px-3.5 py-2 bg-[#0F2E23] hover:bg-[#184636] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md whitespace-nowrap active:scale-[0.98]"
            >
              <Building2 size={14} className="text-amber-400" /> <span>ADD DEPARTMENT</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {departmentsList.map((dept, index) => (
              <div key={dept.id || index} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-emerald-300 transition shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] rounded uppercase">
                    {dept.department_code || dept.code || 'DEPT'}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">#0{index + 1}</span>
                </div>
                <h5 className="font-bold text-sm text-primary mb-1">{dept.department_name || dept.name}</h5>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">{dept.description || 'Enterprise department.'}</p>
                <div className="text-[11px] font-semibold text-gray-600 border-t border-gray-200/60 pt-2 flex items-center gap-1">
                  <ShieldCheck size={13} className="text-[#059669]" />
                  <span>Head Role: {dept.headRoleId ? dept.headRoleId.replace('crm_role_', '').replace(/_/g, ' ').toUpperCase() : 'Assigned by Admin'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: PROVISION / EDIT STAFF */}
      {showStaffModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-beige/60">
            <div className="bg-primary text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-accent" />
                <h3 className="font-serif text-lg font-bold">
                  {editingStaffId ? 'Edit Employee Credentials' : 'Provision Employee Account'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="text-white/70 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 space-y-4 text-xs">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs font-medium"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Official Login Email ID *
                  </label>
                  <input
                    type="email"
                    required
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value.toLowerCase())}
                    placeholder="e.g. staff.support@joshpetshub.com"
                    className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  {editingStaffId ? 'Reset Password (Leave as is to keep existing)' : 'Login Password *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingStaffId}
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="Enter secure password"
                    className="w-full pl-3 pr-10 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Department and Role / Designation next to next */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Department *
                  </label>
                  <select
                    required
                    value={staffDepartment}
                    onChange={(e) => handleStaffDepartmentChange(e.target.value)}
                    className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs bg-white font-medium"
                  >
                    {availableDepartments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Assigned Role / Designation *
                  </label>
                  <select
                    required
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value)}
                    className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs font-bold text-primary bg-white"
                  >
                    {filteredRolesForStaff.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  {filteredRolesForStaff.length === 0 && (
                    <p className="text-[10px] text-amber-600 mt-1">
                      No designations in this department.
                    </p>
                  )}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="staffIsActive"
                  checked={staffIsActive}
                  onChange={(e) => setStaffIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="staffIsActive" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Account is Active (Uncheck to temporarily suspend access)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-beige/40">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition cursor-pointer font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={savingStaff}
                  className="btn-primary-premium !py-2 !px-6 text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {savingStaff ? 'SAVING...' : editingStaffId ? 'UPDATE CREDENTIALS' : 'PROVISION ACCOUNT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT CRM ROLE */}
      {showRoleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-beige/60 max-h-[90vh] flex flex-col">
            <div className="bg-primary text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-accent" />
                <h3 className="font-serif text-lg font-bold">
                  {editingRoleId ? 'Edit Role & Designations' : 'Create Department Role / Designation'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="text-white/70 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="p-6 overflow-y-auto space-y-4 text-xs flex-grow">
              {/* Role Name */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Designation / Role Name *
                </label>
                <input
                  type="text"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Senior Support Executive"
                  className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs font-bold text-primary"
                />
              </div>

              {/* Department & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Department *
                  </label>
                  <select
                    value={roleDepartment}
                    onChange={(e) => setRoleDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs font-bold bg-white"
                  >
                    {DEFAULT_DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Role Category *
                  </label>
                  <select
                    value={roleCategory}
                    onChange={(e) => setRoleCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs font-bold bg-white"
                  >
                    <option value="Employee Designation">Employee Designation</option>
                    <option value="Department Head">Department Head</option>
                  </select>
                </div>
              </div>

              {/* Reporting Authority & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Reporting Authority
                  </label>
                  <input
                    type="text"
                    value={roleReportingTo}
                    onChange={(e) => setRoleReportingTo(e.target.value)}
                    placeholder="e.g. Customer Support Manager"
                    className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Role Status
                  </label>
                  <select
                    value={roleStatus}
                    onChange={(e) => setRoleStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Description / Responsibility
                </label>
                <input
                  type="text"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="e.g. Resolves escalations and customer support tickets"
                  className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              {/* Role Badge Color */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Role Badge Color
                </label>
                <div className="flex items-center gap-3">
                  {PRESET_ROLE_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setRoleColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                        roleColor === c ? 'scale-110 ring-2 ring-primary ring-offset-2' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {roleColor === c && <Check size={14} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Permissions Checkbox Grid */}
              <div className="border-t border-gray-100 pt-3">
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Configure Permissions & Capabilities
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {PERMISSION_CONFIG.map((p) => {
                    const isChecked = Boolean(rolePermissions[p.key]);
                    return (
                      <div
                        key={p.key}
                        onClick={() => handleTogglePermission(p.key)}
                        className={`p-2.5 rounded-lg border transition cursor-pointer flex items-start gap-3 ${
                          isChecked ? 'bg-emerald-50/60 border-emerald-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary pointer-events-none"
                        />
                        <div>
                          <span className={`font-bold block ${isChecked ? 'text-emerald-900' : 'text-gray-700'}`}>
                            {p.label}
                          </span>
                          <span className="text-[10px] text-gray-500 leading-tight block">{p.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-beige/40">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition cursor-pointer font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={savingRole}
                  className="btn-primary-premium !py-2 !px-6 text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {savingRole ? 'SAVING...' : editingRoleId ? 'UPDATE ROLE' : 'SAVE ROLE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE DEPARTMENT */}
      {showDeptModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-beige/60">
            <div className="bg-primary text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-accent" />
                <h3 className="font-serif text-lg font-bold">Add New Department</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeptModal(false)}
                className="text-white/70 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.department_name}
                  onChange={(e) => setDeptForm({ ...deptForm, department_name: e.target.value })}
                  placeholder="e.g. Legal & Compliance"
                  className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Department Code *
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.department_code}
                  onChange={(e) => setDeptForm({ ...deptForm, department_code: e.target.value.toUpperCase() })}
                  placeholder="e.g. LEGAL_CMP"
                  className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  placeholder="Purpose and scope of this department..."
                  className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-beige/40">
                <button
                  type="button"
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition cursor-pointer font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={savingDept}
                  className="btn-primary-premium !py-2 !px-6 text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {savingDept ? 'CREATING...' : 'SAVE DEPARTMENT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmAccessManagerView;
