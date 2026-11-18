import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Shield, ShieldCheck, Key, Lock, Eye, EyeOff,
  Edit, Trash2, Check, X, RefreshCw, ExternalLink, Briefcase,
  Phone, Mail, CheckCircle2, AlertCircle, Copy, Sparkles, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';

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

const PRESET_ROLE_COLORS = ['#0F2E23', '#0284C7', '#D97706', '#059669', '#7C3AED', '#DB2777', '#DC2626'];

const CrmAccessManagerView = () => {
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'roles'
  const [staffList, setStaffList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [staffDepartment, setStaffDepartment] = useState('Customer Support');
  const [staffIsActive, setStaffIsActive] = useState(true);

  // Role Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [savingRole, setSavingRole] = useState(false);

  // Role Form Fields
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [roleColor, setRoleColor] = useState('#0F2E23');
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesRes, staffRes] = await Promise.all([
        apiRequest('/crm/admin/roles'),
        apiRequest('/crm/admin/staff')
      ]);

      if (rolesRes && rolesRes.success) {
        setRolesList(rolesRes.roles || []);
      }
      if (staffRes && staffRes.success) {
        setStaffList(staffRes.staff || []);
      }
    } catch (err) {
      console.warn('Failed to load CRM admin data:', err);
      toast.error('Failed to load CRM staff & roles configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Staff Form Handlers
  const handleOpenAddStaff = () => {
    setEditingStaffId(null);
    setStaffName('');
    setStaffEmail('');
    setStaffPassword('CrmStaff@123');
    setStaffRole(rolesList[0]?.id || 'crm_role_support');
    setStaffPhone('');
    setStaffDepartment('Customer Support');
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
    setStaffDepartment(staff.department || 'Customer Support');
    setStaffIsActive(staff.isActive !== false);
    setShowPassword(false);
    setShowStaffModal(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim() || !staffRole) {
      toast.error('Name, Email and Assigned Role are required.');
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
      department: staffDepartment.trim(),
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
          toast.success(`🎉 Staff account created for ${payload.name}! They can now log in at /crm.`);
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
    setRoleDescription('');
    setRoleColor('#0F2E23');
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
    setRoleDescription(role.description || '');
    setRoleColor(role.color || '#0F2E23');
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
      description: roleDescription.trim(),
      color: roleColor,
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

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text);
    toast.success(`Copied ${label} to clipboard!`, { icon: '📋' });
  };

  const filteredStaff = staffList.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.roleName?.toLowerCase().includes(q) ||
      s.department?.toLowerCase().includes(q)
    );
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
                SUPER ADMIN MASTER PROVISIONING GATEWAY
              </span>
            </div>
            <h3 className="text-lg font-serif font-black text-white">
              CRM Admin / Operations Head Provisioning
            </h3>
            <p className="text-xs text-gray-200 mt-1 max-w-2xl leading-relaxed">
              As the Super Admin, you provision the <strong>CRM Admin / Operations Head</strong> account. Once given these credentials, the CRM Admin logs in at <code className="bg-black/40 text-[#D4AF37] px-1.5 py-0.5 rounded font-mono">/crm</code> to manage all 8 department managers (Support, Service Ops, E-commerce, Finance, Providers, Marketing, Quality, Tech) and configure their roles.
            </p>
          </div>

          <div className="bg-white/10 border border-white/20 p-3.5 rounded-xl flex items-center justify-between gap-4 shrink-0 min-w-[280px]">
            {crmAdminAccount ? (
              <div className="flex-grow">
                <span className="text-[10px] uppercase font-bold text-[#D4AF37] block">Active CRM Admin</span>
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
                CRM Staff Access & Roles Manager
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Create roles, define permissions, and provision staff email credentials for the dedicated CRM portal.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition cursor-pointer"
              title="Refresh staff & roles"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Prominent link to Launch the Standalone CRM Portal */}
            <a
              href="/crm"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-premium !py-2 !px-4 !text-xs gap-1.5 flex items-center hover:bg-emerald-50 text-emerald-900 border-emerald-300 font-bold cursor-pointer"
              title="Launch the standalone CRM Portal in a new tab"
            >
              <ExternalLink size={14} className="text-emerald-700" />
              <span>LAUNCH CRM PORTAL (/crm)</span>
            </a>

            {activeTab === 'staff' ? (
              <button
                type="button"
                onClick={handleOpenAddStaff}
                className="btn-primary-premium !py-2 !px-4 !text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <UserPlus size={16} /> CREATE STAFF ACCOUNT
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenAddRole}
                className="btn-primary-premium !py-2 !px-4 !text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Shield size={16} /> CREATE NEW ROLE
              </button>
            )}
          </div>
        </div>

        {/* Informational Sub-Banner with Quick Switch */}
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
              <span>Staff Accounts ({staffList.length})</span>
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
              <span>Roles & Permissions ({rolesList.length})</span>
            </button>
          </div>

          <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
            <Key size={13} className="text-amber-600" />
            <span>Staff members log in independently at <strong className="font-mono text-primary">/crm</strong> using the email & password configured below.</span>
          </div>
        </div>
      </div>

      {/* TAB 1: STAFF ACCOUNTS */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-xl shadow-xs border border-beige/60 overflow-hidden">
          <div className="p-5 border-b border-beige/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h4 className="font-serif text-lg font-bold text-primary">Provisioned CRM Staff Accounts</h4>
              <p className="text-xs text-gray-500">
                Staff credentials created here allow members to access the dedicated CRM portal with assigned role limits.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by name, email, role..."
                className="w-full px-3 py-1.5 text-xs border border-beige rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBF9] text-[#7CA085] uppercase tracking-wider text-[10px] font-bold border-b border-beige/40">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Login Email ID</th>
                  <th className="py-3 px-4">Password Credential</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Status</th>
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
                          backgroundColor: `${staff.roleColor || '#0F2E23'}12`,
                          borderColor: `${staff.roleColor || '#0F2E23'}40`,
                          color: staff.roleColor || '#0F2E23'
                        }}
                      >
                        <Shield size={11} />
                        <span>{staff.roleName || 'CRM Staff'}</span>
                      </span>
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
                ))}

                {filteredStaff.length === 0 && !loading && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-400 italic">
                      {searchQuery ? `No staff matching "${searchQuery}"` : 'No staff accounts configured. Click "Create Staff Account" to add the first CRM staff member.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rolesList.map((role) => (
            <div key={role.id} className="bg-white rounded-xl shadow-xs border border-beige/60 p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: role.color || '#0F2E23' }}
                    />
                    <h4 className="font-serif text-base font-bold text-primary">{role.name}</h4>
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
      )}

      {/* MODAL: CREATE / EDIT STAFF MEMBER */}
      {showStaffModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-beige/60 max-h-[90vh] flex flex-col">
            <div className="bg-primary text-white p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-accent" />
                <h3 className="font-serif text-lg font-bold">
                  {editingStaffId ? 'Edit CRM Staff Account' : 'Provision New CRM Staff Account'}
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

            <form onSubmit={handleSaveStaff} className="p-6 overflow-y-auto space-y-4 text-xs flex-grow">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900 text-xs flex items-start gap-2">
                <Key size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Standalone Portal Access</span>
                  <span>These credentials will be used by the staff member to log in directly into the CRM portal at <strong className="font-mono font-bold">/crm</strong>.</span>
                </div>
              </div>

              {/* Name */}
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

              {/* Email (Username) */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Login Email Address (Username) *
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

              {/* Role Selection */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Assigned CRM Role *
                </label>
                <select
                  required
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs font-bold text-primary bg-white"
                >
                  {rolesList.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Determines the sections and capabilities this staff member can access inside the CRM portal.
                </span>
              </div>

              {/* Department & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={staffDepartment}
                    onChange={(e) => setStaffDepartment(e.target.value)}
                    placeholder="e.g. Customer Support"
                    className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs"
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
                  {editingRoleId ? 'Edit CRM Role & Permissions' : 'Create Custom CRM Role'}
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
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. Veterinary Care Consultant"
                  className="w-full px-3 py-2 border border-beige rounded-lg focus:outline-none focus:border-primary text-xs font-bold text-primary"
                />
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
                  placeholder="e.g. Manages tele-vet consultations and pet prescription reviews"
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
    </div>
  );
};

export default CrmAccessManagerView;

