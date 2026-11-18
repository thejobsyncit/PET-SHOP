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

const PRESET_ROLE_COLORS = ['#0F2E23', '#0284C7', '#059669', '#D97706', '#10B981', '#8B5CF6', '#EC4899', '#6366F1', '#475569'];

const CrmStaffManagerTab = ({ crmToken }) => {
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
  const [roleDepartment, setRoleDepartment] = useState('Operations');
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
  }, [crmToken]);

  // Staff Form Handlers
  const handleOpenAddStaff = () => {
    setEditingStaffId(null);
    setStaffName('');
    setStaffEmail('');
    setStaffPassword('CrmStaff@123');
    setStaffRole(rolesList[0]?.id || 'crm_role_customer_support');
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
    setRoleColor('#0F2E23');
    setRoleDepartment('Operations');
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
    setRoleColor(role.color || '#0F2E23');
    setRoleDepartment(role.department || 'Operations');
    setRolePermissions(role.permissions || {});
    setShowRoleModal(true);
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
      department: roleDepartment.trim(),
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
          toast.success(`Role "${payload.name}" updated!`);
          setShowRoleModal(false);
          loadData();
        } else {
          toast.error(res?.message || 'Failed to update role.');
        }
      } else {
        const res = await apiRequest('/crm/admin/roles', {
          ...headers,
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (res && res.success) {
          toast.success(`Role "${payload.name}" created!`);
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
    if (role.isSystem) {
      toast.error('Core system managerial roles cannot be deleted.');
      return;
    }
    if (!window.confirm(`Delete role "${role.name}"? Staff assigned to this role must be reassigned first.`)) return;
    try {
      const headers = getReqHeaders();
      const res = await apiRequest(`/crm/admin/roles/${role.id}`, { ...headers, method: 'DELETE' });
      if (res && res.success) {
        toast.success('Role deleted.');
        setRolesList(prev => prev.filter(r => r.id !== role.id));
      } else {
        toast.error(res?.message || 'Failed to delete role.');
      }
    } catch (err) {
      toast.error('Failed to delete role.');
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const filteredStaff = staffList.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.roleName || '').toLowerCase().includes(q) ||
      (s.department || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Role & Staff Command Context */}
      <div className="bg-gradient-to-r from-[#0F2E23] to-[#174837] text-white p-5 rounded-2xl border border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={18} className="text-[#D4AF37]" />
            <span className="text-[10px] font-black tracking-widest uppercase text-[#D4AF37]">
              OPERATIONS HEAD CONTROL DESK
            </span>
          </div>
          <h2 className="text-xl font-serif font-black tracking-tight text-white">
            Departments, Staff Accounts & Role Permissions
          </h2>
          <p className="text-xs text-gray-300 max-w-2xl mt-1">
            As the CRM Admin / Operations Head, you create and provision login credentials for all departmental managers (Customer Support, Service Ops, E-commerce, Finance, Provider Relations, Marketing, Quality, and Tech). Staff log in at <code className="bg-black/30 px-1.5 py-0.5 rounded text-[#D4AF37]">/crm</code> with their assigned access credentials.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleOpenAddStaff}
            className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#c49f27] text-[#071711] font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <UserPlus size={15} /> Provision Staff Account
          </button>
          <button
            type="button"
            onClick={handleOpenAddRole}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 cursor-pointer"
          >
            <Shield size={15} /> Create Role
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-[#0F2E23] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users size={14} /> Staff Accounts ({staffList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-[#0F2E23] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield size={14} /> Department Roles ({rolesList.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff, email, role..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23]"
          />
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* VIEW: STAFF ACCOUNTS */}
      {activeTab === 'staff' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Login Email ID</th>
                  <th className="py-3 px-4">Password</th>
                  <th className="py-3 px-4">Department & Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No staff accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#0F2E23] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {staff.name?.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{staff.name}</span>
                            <span className="text-[10px] text-slate-400">{staff.phone || 'No phone'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-slate-700">
                          <span>{staff.email}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(staff.email, 'Email')}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Copy email"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded w-fit">
                          <span>{staff.password || '••••••••'}</span>
                          {staff.password && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(staff.password, 'Password')}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Copy password"
                            >
                              <Copy size={11} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{staff.roleName}</span>
                          <span className="text-[10px] text-slate-500">{staff.department}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStaffActive(staff)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                            staff.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {staff.isActive !== false ? '● Active' : '○ Deactivated'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {staff.lastLogin ? new Date(staff.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditStaff(staff)}
                            className="p-1.5 text-slate-500 hover:text-[#0F2E23] hover:bg-slate-100 rounded-md transition cursor-pointer"
                            title="Edit staff details / Reset password"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(staff)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                            title="Delete staff account"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: DEPARTMENT ROLES */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rolesList.map((role) => (
            <div
              key={role.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: role.color || '#0F2E23' }}
                    />
                    <h3 className="font-bold text-slate-900 text-sm">{role.name}</h3>
                  </div>
                  {role.isSystem && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      Core Role
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  {role.description || 'No description provided.'}
                </p>

                <div className="bg-slate-50 rounded-lg p-2.5 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Configured Capabilities:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(role.permissions || {})
                      .filter(([_, allowed]) => allowed)
                      .slice(0, 6)
                      .map(([k]) => {
                        const conf = PERMISSION_CONFIG.find(p => p.key === k);
                        return (
                          <span key={k} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                            {conf?.label || k}
                          </span>
                        );
                      })}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{role.staffCount || 0} Staff Assigned</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditRole(role)}
                    className="p-1 hover:text-[#0F2E23] hover:bg-slate-100 rounded transition cursor-pointer"
                    title="Edit role"
                  >
                    <Edit size={13} />
                  </button>
                  {!role.isSystem && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRole(role)}
                      className="p-1 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                      title="Delete role"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: PROVISION / EDIT STAFF ACCOUNT */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-serif font-black text-slate-900 text-lg">
                  {editingStaffId ? 'Edit Staff Credentials' : 'Provision Staff Login Account'}
                </h3>
                <p className="text-xs text-slate-500">
                  Credentials allow staff to authenticate directly at the CRM portal (/crm).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Kavya Menon"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Staff Login Email ID *</label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="e.g. support.mgr@joshpetshub.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23] font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  {editingStaffId ? 'Change Password (leave as-is to keep current)' : 'Account Password *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!editingStaffId}
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="Enter secure password"
                    className="w-full pl-3 pr-9 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Assigned Role *</label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23] bg-white"
                  >
                    {rolesList.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Department</label>
                  <input
                    type="text"
                    value={staffDepartment}
                    onChange={(e) => setStaffDepartment(e.target.value)}
                    placeholder="e.g. Customer Support"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Direct Mobile / Phone</label>
                <input
                  type="text"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  placeholder="e.g. +91 98451 22334"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="activeStaffCheck"
                  checked={staffIsActive}
                  onChange={(e) => setStaffIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#0F2E23] rounded focus:ring-0 cursor-pointer"
                />
                <label htmlFor="activeStaffCheck" className="text-xs text-slate-700 cursor-pointer font-medium">
                  Account is Active (allows staff to log in at /crm)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStaff}
                  className="px-5 py-2 text-xs font-bold bg-[#0F2E23] hover:bg-[#1a4a39] text-white rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingStaff ? <RefreshCw size={13} className="animate-spin" /> : <Check size={14} />}
                  <span>{editingStaffId ? 'Update Account' : 'Provision Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT ROLE */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-serif font-black text-slate-900 text-lg">
                  {editingRoleId ? 'Configure Role' : 'Create Departmental Role'}
                </h3>
                <p className="text-xs text-slate-500">
                  Assign granular feature capabilities and department responsibilities.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Role Title *</label>
                  <input
                    type="text"
                    required
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g. VIP Concierge Manager"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Department</label>
                  <input
                    type="text"
                    value={roleDepartment}
                    onChange={(e) => setRoleDepartment(e.target.value)}
                    placeholder="e.g. Client Services"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Role Description</label>
                <textarea
                  rows="2"
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Outline responsibilities and operational scope..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-2">Badge Color Theme</label>
                <div className="flex items-center gap-2">
                  {PRESET_ROLE_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setRoleColor(c)}
                      className={`w-6 h-6 rounded-full cursor-pointer transition ${roleColor === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-2">
                  Role Capabilities & Workspace Privileges:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-60 overflow-y-auto">
                  {PERMISSION_CONFIG.map(p => (
                    <label key={p.key} className="flex items-start gap-2 p-1.5 hover:bg-white rounded-lg cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={Boolean(rolePermissions[p.key])}
                        onChange={(e) => setRolePermissions(prev => ({ ...prev, [p.key]: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 text-[#0F2E23] rounded focus:ring-0"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block leading-tight">{p.label}</span>
                        <span className="text-[10px] text-slate-400 block">{p.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRole}
                  className="px-5 py-2 text-xs font-bold bg-[#0F2E23] hover:bg-[#1a4a39] text-white rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingRole ? <RefreshCw size={13} className="animate-spin" /> : <Check size={14} />}
                  <span>{editingRoleId ? 'Update Role' : 'Create Role'}</span>
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

