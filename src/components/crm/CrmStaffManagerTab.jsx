import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Shield, ShieldCheck, Key, Lock, Eye, EyeOff,
  Edit, Trash2, Check, X, RefreshCw, ExternalLink, Briefcase,
  Phone, Mail, CheckCircle2, AlertCircle, Copy, Sparkles, Filter,
  CheckSquare, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';
import { SEED_CRM_ROLES, SEED_CRM_STAFF } from '../../data/crmSeedData.js';

const PERMISSION_CONFIG = [
  { key: 'manage_staff', label: 'Manage Staff Credentials', desc: 'Can provision credentials for department employees' },
  { key: 'manage_roles', label: 'Manage Roles & Designations', desc: 'Can configure subordinate designation permissions' },
  { key: 'view_customers', label: 'View Customer 360', desc: 'Can view customer profiles and pet details' },
  { key: 'manage_customers', label: 'Manage Customers', desc: 'Can add CRM notes and manage customer tags' },
  { key: 'view_leads', label: 'View Leads & Pipeline', desc: 'Can see inquiries, adoption leads, and services' },
  { key: 'manage_leads', label: 'Manage Leads & Pipeline', desc: 'Can update lead stages and deal notes' },
  { key: 'view_orders', label: 'View Shop Orders', desc: 'Can view orders and fulfillment tracking' },
  { key: 'manage_orders', label: 'Manage Orders Liaison', desc: 'Can update shipping flags and customer notes' },
  { key: 'view_bookings', label: 'View Service Bookings', desc: 'Can view pet appointments' },
  { key: 'manage_bookings', label: 'Manage Bookings Dispatch', desc: 'Can coordinate and update booking statuses' },
  { key: 'view_tickets', label: 'View Support Tickets', desc: 'Can view grievances and tickets' },
  { key: 'manage_tickets', label: 'Manage & Resolve Tickets', desc: 'Can reply to tickets and resolve cases' },
  { key: 'manage_tasks', label: 'Manage Tasks', desc: 'Can create and execute workflow tasks' },
  { key: 'view_finance', label: 'View Financial Ledger', desc: 'Can view revenues and payout summaries' },
  { key: 'manage_finance', label: 'Manage Refunds & Approvals', desc: 'Can approve or review refund cases' },
  { key: 'view_providers', label: 'View Service Partners', desc: 'Can view partner directory' },
  { key: 'manage_providers', label: 'Verify Partner KYC', desc: 'Can review medical licenses and documents' },
  { key: 'view_quality', label: 'View Prescriptions & Audits', desc: 'Can view uploaded prescriptions' },
  { key: 'manage_quality', label: 'Verify Rx & Safety Audits', desc: 'Can approve or review prescriptions' },
  { key: 'export_data', label: 'Export Reports & Data', desc: 'Can download operational CSV reports' }
];

const PRESET_ROLE_COLORS = ['#0F2E23', '#0284C7', '#059669', '#10B981', '#8B5CF6', '#EC4899', '#6366F1'];

const CrmStaffManagerTab = ({ crmToken, crmUser }) => {
  const userDept = (crmUser?.department || '').toLowerCase();
  const userRole = (crmUser?.roleName || '').toLowerCase();
  const userRoleId = crmUser?.roleId || '';
  const userDesigId = crmUser?.designationId || '';

  const isGlobalAdmin = Boolean(
    crmUser &&
    (
      userRoleId === 'crm_role_superadmin' ||
      userRoleId === 'crm_role_admin' ||
      crmUser.email === 'superadmin@joshpetshub.com' ||
      crmUser.email === 'admin@joshpetshub.com' ||
      crmUser.email === 'admin.crm@joshpetshub.com' ||
      userRole === 'super administrator' ||
      userRole === 'admin' ||
      userRole === 'crm admin' ||
      userRole === 'crm admin / operations head' ||
      userRole === 'operations head' ||
      (
        userRoleId === 'crm_role_admin' &&
        (crmUser.isHead || userDesigId === 'desig_ops_head') &&
        (userDept.includes('administration') || userDept.includes('operations'))
      )
    ) &&
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

  const myDepartment = crmUser?.department || 'Customer Support';

  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'roles'
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
      return Array.isArray(cached) && cached.length > 0 ? cached : SEED_CRM_ROLES;
    } catch (_) {
      return SEED_CRM_ROLES;
    }
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
  const [staffDepartment, setStaffDepartment] = useState(myDepartment);
  const [staffIsActive, setStaffIsActive] = useState(true);

  // Role Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [savingRole, setSavingRole] = useState(false);

  // Role Form Fields
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [roleColor, setRoleColor] = useState('#059669');
  const [roleDepartment, setRoleDepartment] = useState(myDepartment);
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
    manage_tasks: true
  });

  // Quick Task Assignment Modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskAssignee, setTaskAssignee] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  const getReqHeaders = () => {
    return crmToken ? { headers: { Authorization: `Bearer ${crmToken}` } } : {};
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = getReqHeaders();
      const [rolesRes, staffRes] = await Promise.all([
        apiRequest('/crm/admin/roles', headers),
        apiRequest('/crm/admin/staff', headers)
      ]);

      if (rolesRes && rolesRes.success && Array.isArray(rolesRes.roles) && rolesRes.roles.length > 0) {
        setRolesList(rolesRes.roles);
        try { localStorage.setItem('joshpetshub_crm_roles', JSON.stringify(rolesRes.roles)); } catch (_) {}
      }
      if (staffRes && staffRes.success && Array.isArray(staffRes.staff) && staffRes.staff.length > 0) {
        setStaffList(staffRes.staff);
        try { localStorage.setItem('joshpetshub_crm_staff', JSON.stringify(staffRes.staff)); } catch (_) {}
      }
    } catch (err) {
      console.warn('Failed to load live CRM admin data, preserving active configuration:', err);
      try {
        const cachedRoles = JSON.parse(localStorage.getItem('joshpetshub_crm_roles') || 'null');
        const cachedStaff = JSON.parse(localStorage.getItem('joshpetshub_crm_staff') || 'null');
        setRolesList(Array.isArray(cachedRoles) && cachedRoles.length > 0 ? cachedRoles : SEED_CRM_ROLES);
        setStaffList(Array.isArray(cachedStaff) && cachedStaff.length > 0 ? cachedStaff : SEED_CRM_STAFF);
      } catch (_) {
        setRolesList(SEED_CRM_ROLES);
        setStaffList(SEED_CRM_STAFF);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [crmToken]);

  // Filter available designations to caller's department if Department Manager
  const availableRolesForCreation = rolesList.filter(r => {
    if (r.status === 'Deprecated') return false;
    if (isGlobalAdmin) return true;
    const deptMatch = (r.department || '').toLowerCase().includes(myDepartment.toLowerCase()) ||
                      myDepartment.toLowerCase().includes((r.department || '').toLowerCase());
    return deptMatch && !r.isHead;
  });

  // Staff Form Handlers
  const handleOpenAddStaff = () => {
    setEditingStaffId(null);
    setStaffName('');
    setStaffEmail('');
    setStaffPassword('CrmStaff@123');
    setStaffRole(availableRolesForCreation[0]?.id || rolesList[0]?.id || '');
    setStaffPhone('');
    setStaffDepartment(myDepartment);
    setStaffIsActive(true);
    setShowPassword(false);
    setShowStaffModal(true);
  };

  const handleOpenEditStaff = (staff) => {
    setEditingStaffId(staff.id);
    setStaffName(staff.name || '');
    setStaffEmail(staff.email || '');
    setStaffPassword(staff.password || '');
    setStaffRole(staff.roleId || rolesList[0]?.id || '');
    setStaffPhone(staff.phone || '');
    setStaffDepartment(staff.department || myDepartment);
    setStaffIsActive(staff.isActive !== false);
    setShowPassword(false);
    setShowStaffModal(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim() || !staffRole) {
      toast.error('Name, Email and Assigned Designation are required.');
      return;
    }

    if (!editingStaffId && !staffPassword.trim()) {
      toast.error('Password is required for new staff accounts.');
      return;
    }

    setSavingStaff(true);
    const payload = {
      name: staffName.trim(),
      email: staffEmail.trim().toLowerCase(),
      password: staffPassword.trim(),
      roleId: staffRole,
      phone: staffPhone.trim(),
      department: isGlobalAdmin ? staffDepartment.trim() : myDepartment,
      isActive: staffIsActive
    };

    try {
      const headers = getReqHeaders();
      if (editingStaffId) {
        const res = await apiRequest(`/crm/admin/staff/${editingStaffId}`, {
          ...headers,
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
          ...headers,
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (res && res.success) {
          toast.success(`🎉 Account created for ${payload.name}! They can now log in at /crm.`);
          setShowStaffModal(false);
          loadData();
        } else {
          toast.error(res?.message || 'Failed to create staff account.');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Error saving staff account.');
    } finally {
      setSavingStaff(false);
    }
  };

  const handleToggleStaffActive = async (staff) => {
    const updated = !staff.isActive;
    try {
      const headers = getReqHeaders();
      const res = await apiRequest(`/crm/admin/staff/${staff.id}`, {
        ...headers,
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
      const headers = getReqHeaders();
      const res = await apiRequest(`/crm/admin/staff/${staff.id}`, { ...headers, method: 'DELETE' });
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
    setRoleDescription('');
    setRoleColor('#059669');
    setRoleDepartment(myDepartment);
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
      manage_tasks: true
    });
    setShowRoleModal(true);
  };

  const handleOpenEditRole = (role) => {
    setEditingRoleId(role.id);
    setRoleName(role.name || '');
    setRoleDescription(role.description || '');
    setRoleColor(role.color || '#059669');
    setRoleDepartment(role.department || myDepartment);
    setRolePermissions(role.permissions || {});
    setShowRoleModal(true);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.error('Designation name is required.');
      return;
    }

    setSavingRole(true);
    const payload = {
      name: roleName.trim(),
      description: roleDescription.trim(),
      color: roleColor,
      department: isGlobalAdmin ? roleDepartment : myDepartment,
      category: 'Employee Designation', // Dept Manager can ONLY create Employee Designations
      permissions: rolePermissions
    };

    try {
      const headers = getReqHeaders();
      if (editingRoleId) {
        const res = await apiRequest(`/crm/admin/roles/${editingRoleId}`, {
          ...headers,
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        if (res && res.success) {
          toast.success(`Designation "${payload.name}" updated!`);
          setShowRoleModal(false);
          loadData();
        } else {
          toast.error(res?.message || 'Failed to update designation.');
        }
      } else {
        const res = await apiRequest('/crm/admin/roles', {
          ...headers,
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (res && res.success) {
          toast.success(`🎉 Subordinate Designation "${payload.name}" created for ${payload.department}!`);
          setShowRoleModal(false);
          loadData();
        } else {
          toast.error(res?.message || 'Failed to create designation.');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Error saving designation.');
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteRole = async (role) => {
    if (role.staffCount > 0) {
      toast.error(`Cannot delete designation. There are ${role.staffCount} staff member(s) assigned.`);
      return;
    }
    if (!window.confirm(`Delete designation "${role.name}"?`)) return;
    try {
      const headers = getReqHeaders();
      const res = await apiRequest(`/crm/admin/roles/${role.id}`, { ...headers, method: 'DELETE' });
      if (res && res.success) {
        toast.success('Designation deleted.');
        setRolesList(prev => prev.filter(r => r.id !== role.id));
      } else {
        toast.error(res?.message || 'Could not delete designation.');
      }
    } catch (err) {
      toast.error('Failed to delete designation.');
    }
  };

  // Quick Task Assignment
  const handleOpenAssignTask = (staff) => {
    setTaskAssignee(staff);
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('Medium');
    setTaskDueDate(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10));
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      toast.error('Task title is required.');
      return;
    }

    setSavingTask(true);
    try {
      const headers = getReqHeaders();
      const res = await apiRequest('/crm/tasks', {
        ...headers,
        method: 'POST',
        body: JSON.stringify({
          title: taskTitle.trim(),
          description: taskDesc.trim(),
          assignedTo: taskAssignee.name,
          assignedToId: taskAssignee.id,
          priority: taskPriority,
          dueDate: taskDueDate,
          department: myDepartment
        })
      });

      if (res && res.success) {
        toast.success(`Task assigned to ${taskAssignee.name}!`);
        setShowTaskModal(false);
      } else {
        toast.error(res?.message || 'Failed to assign task.');
      }
    } catch (err) {
      toast.error(err.message || 'Error assigning task.');
    } finally {
      setSavingTask(false);
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
      s.roleName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesDept = isGlobalAdmin || (
      (s.department || '').toLowerCase().includes(myDepartment.toLowerCase()) ||
      myDepartment.toLowerCase().includes((s.department || '').toLowerCase())
    );

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Department Restricted Header Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-beige/60 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-beige/40 pb-5">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-50 text-primary rounded-xl border border-emerald-200">
              <Users size={22} />
            </span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {myDepartment}
                </span>
                {!isGlobalAdmin && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Restricted Role Authority
                  </span>
                )}
              </div>
              <h3 className="font-serif text-xl font-bold text-primary">
                {isGlobalAdmin ? 'All Department Staff & Roles' : `${myDepartment} Team & Role Management`}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isGlobalAdmin
                  ? 'Universal administrative control across all departments.'
                  : `You have restricted authority to create subordinate designations, provision employee accounts, and assign tasks within ${myDepartment}.`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            {activeTab === 'staff' ? (
              <button
                type="button"
                onClick={handleOpenAddStaff}
                className="btn-primary-premium !py-2 !px-4 !text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <UserPlus size={16} /> ADD DEPARTMENT EMPLOYEE
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenAddRole}
                className="btn-primary-premium !py-2 !px-4 !text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Shield size={16} /> CREATE SUBORDINATE DESIGNATION
              </button>
            )}
          </div>
        </div>

        {/* Tab Controls */}
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
              <span>Department Employees ({filteredStaff.length})</span>
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
              <span>Subordinate Designations ({availableRolesForCreation.length})</span>
            </button>
          </div>

          {!isGlobalAdmin && (
            <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
              <Lock size={13} className="text-emerald-700" />
              <span>Privilege boundaries enforced: Changes cannot exceed your department scope.</span>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: STAFF ACCOUNTS */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-xl shadow-xs border border-beige/60 overflow-hidden">
          <div className="p-5 border-b border-beige/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="font-serif text-lg font-bold text-primary">
                {myDepartment} Staff Accounts
              </h4>
              <p className="text-xs text-gray-500">
                Staff login credentials and status for team members in your department.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by name or role..."
                className="w-full px-3 py-1.5 text-xs border border-beige rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBF9] text-[#7CA085] uppercase tracking-wider text-[10px] font-bold border-b border-beige/40">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Login Email ID</th>
                  <th className="py-3 px-4">Password Credential</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Task Assignment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige/40">
                {filteredStaff.map((staff) => (
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
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border shadow-2xs"
                        style={{
                          backgroundColor: `${staff.roleColor || '#059669'}12`,
                          borderColor: `${staff.roleColor || '#059669'}40`,
                          color: staff.roleColor || '#059669'
                        }}
                      >
                        <Shield size={11} />
                        <span>{staff.roleName || 'CRM Staff'}</span>
                      </span>
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

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenAssignTask(staff)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-bold text-[10px] flex items-center justify-center gap-1 mx-auto cursor-pointer transition"
                      >
                        <CheckSquare size={11} /> Assign Task
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
                ))}

                {filteredStaff.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-400 italic">
                      {searchQuery ? `No employees matching "${searchQuery}"` : 'No employees currently registered in this department.'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {availableRolesForCreation.map((role) => (
            <div key={role.id} className="bg-white rounded-xl shadow-xs border border-beige/60 p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: role.color || '#059669' }}
                    />
                    <div>
                      <h4 className="font-serif text-base font-bold text-primary">{role.name}</h4>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                        {role.department || myDepartment}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditRole(role)}
                      className="p-1 text-gray-500 hover:text-primary hover:bg-gray-100 rounded transition cursor-pointer"
                      title="Edit designation"
                    >
                      <Edit size={14} />
                    </button>
                    {!role.isSystem && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRole(role)}
                        className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                        title="Delete designation"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4">{role.description || 'No description provided.'}</p>

                {/* Permissions Breakdown Badges */}
                <div className="space-y-1.5 border-t border-gray-100 pt-3">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-2">
                    PERMITTED RESPONSIBILITIES:
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
                  Active Employees: <strong className="text-primary">{role.staffCount || 0}</strong>
                </span>
                <span className="text-[10px] uppercase font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                  Subordinate Designation
                </span>
              </div>
            </div>
          ))}
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
                  {editingStaffId ? 'Edit Employee Account' : `Add Employee (${myDepartment})`}
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
              {/* Department Locked Notice */}
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
                <Lock size={14} className="text-emerald-700 shrink-0" />
                <span className="text-[11px] font-semibold">
                  Employee account will be provisioned strictly within <strong>{myDepartment}</strong>.
                </span>
              </div>

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
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs font-medium"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Login Email ID *
                </label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value.toLowerCase())}
                  placeholder="e.g. rahul.supp@joshpetshub.com"
                  className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  {editingStaffId ? 'Reset Password (Leave blank to keep existing)' : 'Login Password *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingStaffId}
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="Enter employee password"
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

              {/* Role Selection (Scoped to Department) */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Subordinate Designation *
                </label>
                <select
                  required
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs font-bold text-primary bg-white"
                >
                  {availableRolesForCreation.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone */}
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
                  {editingRoleId ? 'Edit Subordinate Designation' : `Create Subordinate Designation (${myDepartment})`}
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
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
                <Lock size={14} className="text-emerald-700 shrink-0" />
                <span className="text-[11px] font-semibold">
                  Restricted authority: Designation belongs to <strong>{myDepartment}</strong>. Cannot create Department Head roles or exceed authorized scope.
                </span>
              </div>

              {/* Designation Name */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Designation Title *
                </label>
                <input
                  type="text"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Escalation Specialist"
                  className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs font-bold text-primary"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Operational Responsibilities
                </label>
                <input
                  type="text"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="e.g. Handles Tier-2 escalations and customer resolution"
                  className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              {/* Role Badge Color */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Badge Color
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
                  Configure Permitted Responsibilities
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {PERMISSION_CONFIG.map((p) => {
                    const isChecked = Boolean(rolePermissions[p.key]);
                    return (
                      <div
                        key={p.key}
                        onClick={() => setRolePermissions(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
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
                  {savingRole ? 'SAVING...' : editingRoleId ? 'UPDATE DESIGNATION' : 'CREATE DESIGNATION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QUICK TASK ASSIGNMENT */}
      {showTaskModal && taskAssignee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-beige/60">
            <div className="bg-primary text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CheckSquare size={18} className="text-accent" />
                <h3 className="font-serif text-lg font-bold">Assign Department Task</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                className="text-white/70 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-4 text-xs">
              <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Assignee</span>
                <span className="font-bold text-xs text-primary">{taskAssignee.name}</span>
                <span className="text-[11px] text-gray-500 block">{taskAssignee.roleName} ({myDepartment})</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Follow up on Booking #BK-9842"
                  className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Detailed Instructions
                </label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Specific actions, documents to verify, customer details..."
                  className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs bg-white font-bold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-beige/40">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition cursor-pointer font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={savingTask}
                  className="btn-primary-premium !py-2 !px-6 text-xs flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {savingTask ? 'ASSIGNING...' : 'DISPATCH TASK'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmStaffManagerTab;
