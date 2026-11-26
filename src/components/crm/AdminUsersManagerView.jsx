import React, { useState, useEffect } from 'react';
import {
  Users, Trash, Search, RefreshCw, Shield, User,
  Mail, Phone, MapPin, Check, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';

const AdminUsersManagerView = ({ crmToken }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const getHeaders = () => crmToken ? { headers: { Authorization: `Bearer ${crmToken}` } } : {};

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/admin/users', getHeaders());
      if (res?.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      console.warn('Failed to load registered users:', err);
      toast.error('Failed to load registered accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [crmToken]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this registered user?')) return;
    try {
      const res = await apiRequest(`/admin/users/${userId}`, {
        ...getHeaders(),
        method: 'DELETE'
      });
      if (res?.success) {
        toast.success('User account deleted.');
        setUsers(prev => prev.filter(u => (u._id || u.id) !== userId));
      } else {
        toast.error(res?.message || 'Failed to delete user.');
      }
    } catch (err) {
      toast.error(err.message || 'Error deleting user.');
    }
  };

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    const matchesSearch =
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || u.mobile || '').toLowerCase().includes(q);

    const matchesRole = roleFilter === 'ALL' || (u.role || '').toUpperCase() === roleFilter.toUpperCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Registered Accounts</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-slate-900">{users.length}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">All Roles</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Pet Parents / Customers</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-indigo-600">
              {users.filter(u => u.role === 'CUSTOMER' || !u.role).length}
            </span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Clients</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Administrators</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-serif font-black text-[#0F2E23]">
              {users.filter(u => u.role === 'ADMIN' || u.role === 'SUPERADMIN').length}
            </span>
            <span className="text-xs font-bold text-[#0F2E23] bg-emerald-50 px-2 py-0.5 rounded-full">Staff</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Registered Accounts Manager</h3>
            <p className="text-xs text-slate-500">Oversee all registered user profiles and maintain account integrity.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, phone..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0F2E23]"
              />
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 cursor-pointer focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="CUSTOMER">Customers Only</option>
              <option value="ADMIN">Admins Only</option>
            </select>

            <button
              type="button"
              onClick={loadUsers}
              className="p-1.5 text-slate-500 hover:text-[#0F2E23] hover:bg-slate-100 rounded-lg transition cursor-pointer"
              title="Refresh Users"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin" /> Loading registered users...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Location & Category</th>
                  <th className="py-3 px-4">Current Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map(u => {
                  const uId = u._id || u.id;
                  const initial = u.name ? u.name.charAt(0).toUpperCase() : 'U';

                  return (
                    <tr key={uId} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#0F2E23] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {initial}
                          </div>
                          <span className="font-bold text-slate-900">{u.name || 'Unnamed'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">{u.email}</td>
                      <td className="py-3 px-4 text-slate-600">{u.phone || u.mobile || 'N/A'}</td>
                      <td className="py-3 px-4 text-slate-500">
                        <span>{u.location || u.city || 'India'}</span>
                        {u.serviceCategory && (
                          <span className="block text-[10px] text-purple-700 font-semibold">{u.serviceCategory}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[9.5px] uppercase ${
                          u.role === 'ADMIN' || u.role === 'SUPERADMIN'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : u.role === 'SERVICE_PROVIDER'
                            ? 'bg-purple-50 text-purple-800 border border-purple-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {u.role || 'CUSTOMER'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(uId)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete User"
                        >
                          <Trash size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersManagerView;
