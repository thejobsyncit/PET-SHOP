import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Plus, Search, Filter, CheckCircle2, Clock,
  AlertTriangle, Phone, Mail, User, Send, Check, X, Sparkles, RefreshCw,
  UserCheck, CheckSquare, ArrowRight, Shield, Play, CheckCheck, RotateCcw,
  ChevronRight, Activity, Calendar, Award, FileText, CornerDownRight, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiRequest } from '../../services/api.js';

const CustomerSupportView = ({
  tickets = [],
  onRefresh,
  crmToken,
  crmUser = null,
  tasks = [],
  onRefreshTasks = null
}) => {
  // Navigation Sub-tab: 'tickets' | 'delegation'
  const [subTab, setSubTab] = useState('delegation');

  // -------------------------------------------------------------
  // ROLE DETECTIONS
  // -------------------------------------------------------------
  const isManager = Boolean(
    crmUser?.roleId === 'crm_role_customer_support' ||
    crmUser?.isHead ||
    crmUser?.designationId === 'desig_support_head' ||
    (crmUser?.roleName && crmUser.roleName.toLowerCase().includes('manager')) ||
    (crmUser?.designationName && crmUser.designationName.toLowerCase().includes('manager')) ||
    crmUser?.isCrmAdmin ||
    crmUser?.isSuperAdmin
  );

  const isTeamLead = Boolean(
    !isManager && (
      crmUser?.designationId === 'desig_support_team_lead' ||
      (crmUser?.roleName && crmUser.roleName.toLowerCase().includes('lead')) ||
      (crmUser?.designationName && crmUser.designationName.toLowerCase().includes('lead'))
    )
  );

  const isExecutive = !isManager && !isTeamLead;

  // -------------------------------------------------------------
  // TICKETS STATE
  // -------------------------------------------------------------
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [updatingTicket, setUpdatingTicket] = useState(false);

  // New Ticket Modal
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    subject: '',
    priority: 'Medium',
    category: 'Order Support',
    initialMessage: ''
  });

  // -------------------------------------------------------------
  // TASKS & DELEGATION STATE
  // -------------------------------------------------------------
  const [taskStatusFilter, setTaskStatusFilter] = useState('ALL');
  const [taskSearch, setTaskSearch] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // Modals for Task Hierarchical Flow
  const [showPushModal, setShowPushModal] = useState(false); // Manager pushes to Team Lead
  const [pushForm, setPushForm] = useState({
    title: '',
    description: '',
    category: 'Booking Support',
    priority: 'High',
    customerName: '',
    customerPhone: '',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
  });

  const [delegatingTask, setDelegatingTask] = useState(null); // Team Lead delegates to Executive
  const [delegateTarget, setDelegateTarget] = useState('Customer Support Executive');
  const [delegateTargetId, setDelegateTargetId] = useState('');
  const [delegationNotes, setDelegationNotes] = useState('');

  const [updatingTaskState, setUpdatingTaskState] = useState(null); // Executive marks state + description
  const [newStatus, setNewStatus] = useState('In Progress');
  const [workDescription, setWorkDescription] = useState('');

  const [reopeningTask, setReopeningTask] = useState(null); // Manager requests revision
  const [reopenReasonText, setReopenReasonText] = useState('');

  const getHeaders = () => crmToken ? { headers: { Authorization: `Bearer ${crmToken}` } } : {};

  // Load Department Staff for Live Login & Performance Tracking
  const fetchStaffRoster = async () => {
    if (!crmToken) return;
    setLoadingStaff(true);
    try {
      const res = await apiRequest('/crm/admin/staff', getHeaders());
      if (res?.success && Array.isArray(res.staff)) {
        // Filter strictly to Customer Support roles
        const csStaff = res.staff.filter(s =>
          (s.department || '').toLowerCase().includes('support') ||
          (s.roleName || '').toLowerCase().includes('support') ||
          (s.designationName || '').toLowerCase().includes('support')
        );
        setStaffList(csStaff);
      }
    } catch (err) {
      console.warn('Failed to load CS staff roster:', err?.message);
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchStaffRoster();
  }, [crmToken]);

  // -------------------------------------------------------------
  // TICKETS HANDLERS
  // -------------------------------------------------------------
  const handleUpdateTicketStatus = async (ticketId, nextStatus) => {
    try {
      const res = await apiRequest(`/crm/tickets/${ticketId}`, {
        ...getHeaders(),
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      if (res?.success) {
        toast.success(`Ticket status updated to ${nextStatus}`);
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(prev => ({ ...prev, status: nextStatus }));
        }
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      toast.error('Failed to update ticket status');
    }
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;
    setUpdatingTicket(true);
    try {
      const newMessages = [
        ...(selectedTicket.messages || []),
        {
          id: `msg_${Date.now()}`,
          sender: 'agent',
          senderName: crmUser?.name || 'Customer Support Desk',
          text: replyMessage.trim(),
          timestamp: new Date().toISOString()
        }
      ];

      const res = await apiRequest(`/crm/tickets/${selectedTicket.id}`, {
        ...getHeaders(),
        method: 'PUT',
        body: JSON.stringify({
          messages: newMessages,
          status: 'In Progress'
        })
      });

      if (res?.success) {
        toast.success('Reply transmitted to customer email & SMS!');
        setSelectedTicket(prev => ({ ...prev, messages: newMessages, status: 'In Progress' }));
        setReplyMessage('');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      toast.error('Failed to send response');
    } finally {
      setUpdatingTicket(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicketForm.customerName || !newTicketForm.subject || !newTicketForm.initialMessage) {
      toast.error('Customer name, subject, and message are required.');
      return;
    }

    try {
      const res = await apiRequest('/crm/tickets', {
        ...getHeaders(),
        method: 'POST',
        body: JSON.stringify(newTicketForm)
      });
      if (res?.success) {
        toast.success('Support ticket created successfully!');
        setShowNewTicketModal(false);
        setNewTicketForm({
          customerName: '', customerEmail: '', customerPhone: '',
          subject: '', priority: 'Medium', category: 'Order Support', initialMessage: ''
        });
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      toast.error('Failed to create ticket.');
    }
  };

  // -------------------------------------------------------------
  // HIERARCHICAL TASK WORKFLOW HANDLERS
  // -------------------------------------------------------------

  // 1. Manager Pushes Task to Customer Support Team Lead
  const handlePushTaskToLead = async (e) => {
    e.preventDefault();
    if (!pushForm.title.trim()) {
      toast.error('Task title is required.');
      return;
    }

    try {
      const payload = {
        title: pushForm.title.trim(),
        description: pushForm.description.trim(),
        category: pushForm.category,
        priority: pushForm.priority,
        department: 'Customer Support',
        assignedTo: 'Customer Support Team Lead',
        assignedToId: 'crm_usr_support_lead',
        customerName: pushForm.customerName.trim(),
        customerPhone: pushForm.customerPhone.trim(),
        dueDate: pushForm.dueDate ? new Date(pushForm.dueDate).toISOString() : new Date(Date.now() + 86400000).toISOString()
      };

      const res = await apiRequest('/crm/tasks', {
        ...getHeaders(),
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res?.success) {
        toast.success('Task pushed to Customer Support Team Lead (Arun Patel)!');
        setShowPushModal(false);
        setPushForm({
          title: '',
          description: '',
          category: 'Booking Support',
          priority: 'High',
          customerName: '',
          customerPhone: '',
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
        });
        if (onRefreshTasks) onRefreshTasks();
        fetchStaffRoster();
      } else {
        toast.error(res?.message || 'Failed to push task.');
      }
    } catch (err) {
      toast.error(err.message || 'Error pushing task to Team Lead.');
    }
  };

  // 2. Team Lead Delegates Task to Executive
  const handleDelegateTask = async (e) => {
    e.preventDefault();
    if (!delegatingTask) return;

    try {
      const res = await apiRequest(`/crm/tasks/${delegatingTask.id}/delegate`, {
        ...getHeaders(),
        method: 'PUT',
        body: JSON.stringify({
          assignedTo: delegateTarget,
          assignedToId: delegateTargetId || null,
          delegationNotes: delegationNotes.trim()
        })
      });

      if (res?.success) {
        toast.success(`Task delegated to ${delegateTarget}!`);
        setDelegatingTask(null);
        setDelegationNotes('');
        if (onRefreshTasks) onRefreshTasks();
        fetchStaffRoster();
      } else {
        toast.error(res?.message || 'Failed to delegate task.');
      }
    } catch (err) {
      toast.error(err.message || 'Error delegating task.');
    }
  };

  // 3. Executive / Staff Updates State and Enters Description
  const handleUpdateTaskStateAndDescription = async (e) => {
    e.preventDefault();
    if (!updatingTaskState) return;

    if (!workDescription.trim()) {
      toast.error('Please enter a work description / resolution notes.');
      return;
    }

    try {
      const res = await apiRequest(`/crm/tasks/${updatingTaskState.id}/status`, {
        ...getHeaders(),
        method: 'PUT',
        body: JSON.stringify({
          status: newStatus,
          description: workDescription.trim(),
          employeeNotes: workDescription.trim()
        })
      });

      if (res?.success) {
        toast.success(`Task state updated to "${newStatus}"! Update transmitted to Lead and Manager.`);
        setUpdatingTaskState(null);
        setWorkDescription('');
        if (onRefreshTasks) onRefreshTasks();
        fetchStaffRoster();
      } else {
        toast.error(res?.message || 'Failed to update task state.');
      }
    } catch (err) {
      toast.error(err.message || 'Error updating task.');
    }
  };

  // 4. Manager Approves (Completes) or Reopens Task
  const handleApproveTask = async (task) => {
    try {
      const res = await apiRequest(`/crm/tasks/${task.id}/status`, {
        ...getHeaders(),
        method: 'PUT',
        body: JSON.stringify({
          status: 'Completed',
          remarks: `Approved and verified by ${crmUser?.name || 'Customer Support Manager'}`
        })
      });
      if (res?.success) {
        toast.success(`Task ${task.id} approved and marked Completed!`);
        if (onRefreshTasks) onRefreshTasks();
        fetchStaffRoster();
      } else {
        toast.error(res?.message || 'Failed to approve task.');
      }
    } catch (err) {
      toast.error('Error approving task.');
    }
  };

  const handleReopenTask = async (e) => {
    e.preventDefault();
    if (!reopeningTask) return;
    if (!reopenReasonText.trim()) {
      toast.error('Please enter the revision feedback for the employee.');
      return;
    }

    try {
      const res = await apiRequest(`/crm/tasks/${reopeningTask.id}/status`, {
        ...getHeaders(),
        method: 'PUT',
        body: JSON.stringify({
          status: 'Reopened',
          reopenReason: reopenReasonText.trim()
        })
      });

      if (res?.success) {
        toast.success('Task reopened for revision with employee feedback!');
        setReopeningTask(null);
        setReopenReasonText('');
        if (onRefreshTasks) onRefreshTasks();
        fetchStaffRoster();
      } else {
        toast.error(res?.message || 'Failed to reopen task.');
      }
    } catch (err) {
      toast.error('Error reopening task.');
    }
  };

  // Filter Tasks for Customer Support view
  const customerSupportTasks = tasks.filter(t => {
    const dept = (t.department || '').toLowerCase();
    return dept.includes('support') || dept.includes('customer');
  });

  const filteredTasks = customerSupportTasks.filter(t => {
    const matchesSearch =
      (t.title || '').toLowerCase().includes(taskSearch.toLowerCase()) ||
      (t.id || '').toLowerCase().includes(taskSearch.toLowerCase()) ||
      (t.assignedTo || '').toLowerCase().includes(taskSearch.toLowerCase()) ||
      (t.customerName || '').toLowerCase().includes(taskSearch.toLowerCase());
    const matchesStatus = taskStatusFilter === 'ALL' || (t.status || 'Pending') === taskStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter Tickets
  const filteredTickets = tickets.filter(t => {
    const matchesSearch =
      (t.subject || '').toLowerCase().includes(ticketSearch.toLowerCase()) ||
      (t.customerName || '').toLowerCase().includes(ticketSearch.toLowerCase()) ||
      (t.id || '').toLowerCase().includes(ticketSearch.toLowerCase());
    const matchesStatus = ticketStatusFilter === 'ALL' || t.status === ticketStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const openTicketCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressTicketCount = tickets.filter(t => t.status === 'In Progress').length;

  const pendingTasksCount = customerSupportTasks.filter(t => t.status !== 'Completed' && !t.completed).length;
  const underReviewTasksCount = customerSupportTasks.filter(t => t.status === 'Under Review').length;
  const completedTasksCount = customerSupportTasks.filter(t => t.status === 'Completed' || t.completed).length;

  // Format date helper
  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Not yet recorded';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (_) {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* TOP NAVIGATION SUB-TABS: TICKETS vs HIERARCHICAL TASKS    */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSubTab('delegation')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === 'delegation'
                ? 'bg-[#0284C7] text-white shadow-sm'
                : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <CheckSquare size={15} />
            <span>Hierarchical Tasks & Staff Board</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              subTab === 'delegation' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {customerSupportTasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('tickets')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              subTab === 'tickets'
                ? 'bg-[#0284C7] text-white shadow-sm'
                : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <MessageSquare size={15} />
            <span>Support Tickets & Live Desk</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              subTab === 'tickets' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {openTicketCount} Open
            </span>
          </button>
        </div>

        {/* Role Identity Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-500">Active Role:</span>
            <strong className="text-slate-800 text-[11px]">
              {crmUser?.roleName || crmUser?.designationName || 'Customer Support Staff'}
            </strong>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#0284C7]/10 text-[#0284C7] rounded-md">
            {isManager ? 'Department Head' : isTeamLead ? 'Team Lead' : 'Support Executive'}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: HIERARCHICAL TASK DELEGATION & STAFF BOARD     */}
      {/* ========================================================= */}
      {subTab === 'delegation' && (
        <div className="space-y-6">
          {/* Header Banner & Metrics */}
          <div className="bg-gradient-to-br from-[#0F2E23] via-[#093527] to-[#044230] rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-full bg-[#0284C7]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] rounded-full text-[10px] font-black tracking-wider uppercase">
                    Customer Support Hierarchy Command
                  </span>
                  <span className="text-xs text-slate-300">• 4 Subordinate Active Roles</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-white">
                  Hierarchical Delegation & Staff Tracking Desk
                </h2>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Manager pushes issues to <strong className="text-white">Customer Support Team Lead</strong>, who assigns to specialized Executives. Status and resolution descriptions reflect live across dashboards upon employee submission.
                </p>
              </div>

              {/* Action Button: Push Task (Manager only) */}
              {isManager && (
                <button
                  type="button"
                  onClick={() => setShowPushModal(true)}
                  className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#c29f2f] text-[#071711] font-black text-xs rounded-xl shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Push Task to Team Lead</span>
                </button>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
              <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                  Total Active Cases
                </span>
                <span className="text-2xl font-serif font-black text-white">{customerSupportTasks.length}</span>
              </div>
              <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
                  Pending / In Progress
                </span>
                <span className="text-2xl font-serif font-black text-amber-400">{pendingTasksCount}</span>
              </div>
              <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block mb-1">
                  Awaiting Approval
                </span>
                <span className="text-2xl font-serif font-black text-purple-300">{underReviewTasksCount}</span>
              </div>
              <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block mb-1">
                  Completed & Closed
                </span>
                <span className="text-2xl font-serif font-black text-emerald-400">{completedTasksCount}</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION: EMPLOYEE ACTIVITY, LOGIN TIME & TASK ROSTER      */}
          {/* (Visible to Customer Support Manager & Team Lead)         */}
          {/* ========================================================= */}
          {(isManager || isTeamLead) && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-[#0284C7]" />
                    <h3 className="font-serif font-black text-slate-900 text-sm">
                      {isManager ? 'Customer Support Staff Attendance & Performance Roster' : 'Team Executive Activity & Task Tracker'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Track employee login times, completed vs pending workload, and active duty status.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchStaffRoster}
                  disabled={loadingStaff}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <RefreshCw size={13} className={loadingStaff ? 'animate-spin' : ''} />
                  <span>Refresh Roster</span>
                </button>
              </div>

              {/* Roster Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {staffList.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-xs text-slate-400 italic">
                    Loading Customer Support team roster...
                  </div>
                ) : (
                  staffList.map((emp) => {
                    const isHead = emp.roleId === 'crm_role_customer_support' || emp.roleName?.includes('Manager');
                    const isLead = emp.designationId === 'desig_support_team_lead' || emp.roleName?.includes('Lead');
                    const isMe = emp.email === crmUser?.email;

                    return (
                      <div
                        key={emp.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isMe
                            ? 'bg-sky-50/60 border-[#0284C7] ring-1 ring-[#0284C7]/30 shadow-xs'
                            : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isHead ? 'bg-amber-100 text-amber-800' : isLead ? 'bg-sky-100 text-[#0284C7]' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {emp.name?.charAt(0) || 'E'}
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                {emp.name}
                                {isMe && <span className="text-[9px] bg-[#0284C7] text-white px-1.5 py-0.2 rounded font-mono">YOU</span>}
                              </h4>
                              <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">{emp.email}</span>
                            </div>
                          </div>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active on duty" />
                        </div>

                        {/* Designation Badge */}
                        <div className="mb-3">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isHead
                              ? 'bg-amber-100 text-amber-900'
                              : isLead
                              ? 'bg-sky-100 text-[#0284C7]'
                              : 'bg-slate-200 text-slate-800'
                          }`}>
                            {emp.designationName || emp.roleName || 'Customer Support Staff'}
                          </span>
                        </div>

                        {/* Login Time Display */}
                        <div className="p-2 rounded-lg bg-white border border-slate-200/80 text-[10px] text-slate-600 mb-3 space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-400">
                            <Clock size={11} />
                            <span>Last Active Login:</span>
                          </div>
                          <span className="font-semibold text-slate-800 block truncate">
                            {formatTimeAgo(emp.lastLogin || emp.last_login)}
                          </span>
                        </div>

                        {/* Task Counts: Completed vs Pending */}
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-center">
                          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
                            <span className="text-[9px] font-bold uppercase block">Completed</span>
                            <span className="text-sm font-black">{emp.completedTasks || 0}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800">
                            <span className="text-[9px] font-bold uppercase block">Pending</span>
                            <span className="text-sm font-black">{emp.pendingTasks || 0}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION: TASK WORKFLOW BOARD & STREAM                     */}
          {/* ========================================================= */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {['ALL', 'Pending', 'In Progress', 'Under Review', 'Completed', 'Reopened'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setTaskStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                      taskStatusFilter === st
                        ? 'bg-[#0284C7] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-grow sm:w-64">
                  <input
                    type="text"
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    placeholder="Search task title, ID, assignee..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                  />
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Task Cards List */}
            <div className="p-4 space-y-3.5">
              {filteredTasks.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 italic">
                  No tasks matching the selected filter.
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const status = task.status || (task.completed ? 'Completed' : 'Pending');
                  const isAssignedToMe =
                    (task.assignedTo || '').toLowerCase() === (crmUser?.name || '').toLowerCase() ||
                    (task.assignedTo || '').toLowerCase() === (crmUser?.email || '').toLowerCase() ||
                    (task.assignedTo || '').toLowerCase() === (crmUser?.designationName || '').toLowerCase() ||
                    (task.assignedTo || '').toLowerCase() === (crmUser?.roleName || '').toLowerCase() ||
                    task.assignedToId === crmUser?.id;

                  const canDelegate = isTeamLead && (
                    isAssignedToMe ||
                    task.assignedTo?.includes('Team Lead') ||
                    task.assignedToId === 'crm_usr_support_lead'
                  );

                  return (
                    <div
                      key={task.id}
                      className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all bg-white shadow-2xs space-y-3"
                    >
                      {/* Top Bar: IDs, Status, Priority */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">{task.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : status === 'Under Review'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : status === 'In Progress'
                              ? 'bg-sky-100 text-sky-800 border border-sky-300'
                              : status === 'Reopened'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {status}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {task.category || 'Customer Grievance'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            task.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' :
                            task.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {task.priority || 'Medium'} Priority
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            Due: <strong className="text-slate-700">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Today'}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4 className="font-serif font-black text-slate-900 text-base mb-1">{task.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {task.description || 'No detailed instructions recorded.'}
                        </p>
                      </div>

                      {/* Customer Info (if attached) */}
                      {(task.customerName || task.customerPhone) && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex flex-wrap items-center gap-3">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <User size={12} className="text-[#0284C7]" />
                            <span>Client: {task.customerName || 'Customer'}</span>
                          </span>
                          {task.customerPhone && (
                            <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                              <Phone size={11} /> {task.customerPhone}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Delegation Chain Box */}
                      <div className="p-3 rounded-xl bg-sky-50/40 border border-sky-100 text-xs space-y-1.5">
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px]">
                          <div>
                            <span className="text-slate-400">Pushed by: </span>
                            <strong className="text-slate-800">{task.assignedBy || 'Customer Support Manager'}</strong>
                          </div>
                          {task.delegatedBy && (
                            <div className="flex items-center gap-1 text-[#0284C7]">
                              <CornerDownRight size={12} />
                              <span className="text-slate-400">Delegated by: </span>
                              <strong className="text-[#0284C7]">{task.delegatedBy}</strong>
                            </div>
                          )}
                          <div>
                            <span className="text-slate-400">Currently Handled by: </span>
                            <strong className="text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {task.assignedTo || 'Unassigned'}
                            </strong>
                          </div>
                        </div>

                        {task.delegationNotes && (
                          <div className="pt-1 text-[11px] text-slate-600 italic">
                            <strong>Delegation Guidance:</strong> "{task.delegationNotes}"
                          </div>
                        )}
                      </div>

                      {/* Employee Description / Resolution Notes Box */}
                      {(task.employeeNotes || task.remarks) && (
                        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                            <span>Employee Work Description & Resolution Notes:</span>
                            {task.lastUpdatedBy && (
                              <span className="font-normal lowercase text-slate-500">
                                updated by <strong className="font-bold text-slate-800">{task.lastUpdatedBy}</strong> {task.lastUpdatedAt ? formatTimeAgo(task.lastUpdatedAt) : ''}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap font-medium">
                            {task.employeeNotes || task.remarks}
                          </p>
                        </div>
                      )}

                      {/* Reopen Feedback if Reopened */}
                      {task.reopenReason && status === 'Reopened' && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-0.5">
                          <strong className="font-bold block">Revision Requested by Manager:</strong>
                          <p>{task.reopenReason}</p>
                        </div>
                      )}

                      {/* Action Controls Toolbar */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-400">
                          Created {formatTimeAgo(task.createdAt)}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* 1. Team Lead Action: Delegate to Executive */}
                          {canDelegate && (
                            <button
                              type="button"
                              onClick={() => {
                                setDelegatingTask(task);
                                setDelegateTarget('Customer Support Executive');
                                setDelegateTargetId('crm_usr_support_sub_01');
                                setDelegationNotes('');
                              }}
                              className="px-3.5 py-1.5 bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <CornerDownRight size={13} />
                              <span>Delegate to Executive</span>
                            </button>
                          )}

                          {/* 2. Executive / Assigned Staff Action: Update State & Enter Description */}
                          {(isAssignedToMe || isExecutive || isTeamLead) && status !== 'Completed' && (
                            <button
                              type="button"
                              onClick={() => {
                                setUpdatingTaskState(task);
                                setNewStatus(status === 'Pending' ? 'In Progress' : status === 'In Progress' ? 'Under Review' : status);
                                setWorkDescription(task.employeeNotes || task.remarks || '');
                              }}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <CheckCheck size={13} />
                              <span>Update State & Notes</span>
                            </button>
                          )}

                          {/* 3. Manager Actions: Approve or Reopen */}
                          {isManager && status === 'Under Review' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveTask(task)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                              >
                                <CheckCircle2 size={13} />
                                <span>Approve (Mark Completed)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setReopeningTask(task);
                                  setReopenReasonText('');
                                }}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                              >
                                <RotateCcw size={12} />
                                <span>Request Revisions</span>
                              </button>
                            </>
                          )}

                          {status === 'Completed' && (
                            <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              <CheckCircle2 size={13} /> Completed & Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: CUSTOMER SUPPORT TICKETS & DESK                */}
      {/* ========================================================= */}
      {subTab === 'tickets' && (
        <div className="space-y-6">
          {/* Top KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Open Unassigned Tickets
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-serif font-black text-rose-600">{openTicketCount}</span>
                <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">SLA Active</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Cases In Progress
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-serif font-black text-amber-600">{inProgressTicketCount}</span>
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Active Follow-up</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                CSAT Rating (Satisfaction)
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-serif font-black text-emerald-600">4.9 / 5.0</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">94% Positive</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Avg First Response Time
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-serif font-black text-[#0F2E23]">14 mins</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">-3m vs goal</span>
              </div>
            </div>
          </div>

          {/* Main Ticket Queue Workspace */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Filter bar */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {['ALL', 'Open', 'In Progress', 'Resolved'].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setTicketStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      ticketStatusFilter === st
                        ? 'bg-[#0284C7] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-grow sm:w-64">
                  <input
                    type="text"
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    placeholder="Search ticket subject or customer..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                  />
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(true)}
                  className="px-3.5 py-1.5 bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                >
                  <Plus size={14} /> Log Support Case
                </button>
              </div>
            </div>

            {/* Tickets Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Ticket ID & Subject</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        No tickets found in this view.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map(ticket => (
                      <tr
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className="hover:bg-slate-50/80 transition cursor-pointer group"
                        title="Click to view & reply to ticket"
                      >
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-[11px] font-bold text-slate-400">{ticket.id}</span>
                            <span className="font-bold text-slate-900 group-hover:text-[#0284C7] transition-colors line-clamp-1">{ticket.subject}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-sky-100 text-[#0284C7] font-bold text-[10px] flex items-center justify-center shrink-0">
                              {ticket.customerName?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-800 block">{ticket.customerName}</span>
                              <span className="text-[10px] text-slate-400">{ticket.customerEmail || ticket.customerPhone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ticket.priority === 'Urgent'
                              ? 'bg-rose-100 text-rose-700'
                              : ticket.priority === 'High'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {ticket.priority || 'Medium'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {ticket.category || 'General Support'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ticket.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ticket.status === 'In Progress'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Today'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: PUSH TASK TO TEAM LEAD (CUSTOMER SUPPORT MANAGER) */}
      {/* ========================================================= */}
      {showPushModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-serif font-black text-slate-900 text-base">Push Task to Support Team Lead</h3>
                <p className="text-xs text-slate-500">
                  Assign task directly to <strong>Customer Support Team Lead (Arun Patel)</strong> for distribution.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPushModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePushTaskToLead} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Task Title / Issue Summary *</label>
                <input
                  type="text"
                  required
                  value={pushForm.title}
                  onChange={(e) => setPushForm({ ...pushForm, title: e.target.value })}
                  placeholder="e.g. Expedited Refund & Grievance for Booking #BK-9014"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={pushForm.priority}
                    onChange={(e) => setPushForm({ ...pushForm, priority: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7] bg-white font-medium"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={pushForm.category}
                    onChange={(e) => setPushForm({ ...pushForm, category: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7] bg-white font-medium"
                  >
                    <option value="Booking Support">Booking Support</option>
                    <option value="Order Grievance">Order Grievance</option>
                    <option value="Call Escalation">Call Escalation</option>
                    <option value="Email Grievance">Email Grievance</option>
                    <option value="Pet Transport">Pet Transport</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Customer Name (Optional)</label>
                  <input
                    type="text"
                    value={pushForm.customerName}
                    onChange={(e) => setPushForm({ ...pushForm, customerName: e.target.value })}
                    placeholder="e.g. Dr. Ramesh Iyer"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={pushForm.dueDate}
                    onChange={(e) => setPushForm({ ...pushForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Task Instructions & Directives for Team Lead *</label>
                <textarea
                  rows="3"
                  required
                  value={pushForm.description}
                  onChange={(e) => setPushForm({ ...pushForm, description: e.target.value })}
                  placeholder="Detail the case background, expectations, and assign instructions to Team Lead..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-900 flex items-center gap-2">
                <CornerDownRight size={14} className="shrink-0 text-[#0284C7]" />
                <span>
                  This task will route directly to <strong>Customer Support Team Lead (Arun Patel)</strong>, who will assign it to an executive.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPushModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#0284C7] hover:bg-[#0369a1] text-white rounded-lg shadow-sm transition cursor-pointer"
                >
                  Push Task to Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: DELEGATE TASK TO EXECUTIVE (TEAM LEAD / MANAGER) */}
      {/* ========================================================= */}
      {delegatingTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-serif font-black text-slate-900 text-base">Delegate Task to Executive</h3>
                <span className="font-mono text-xs text-slate-400">{delegatingTask.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setDelegatingTask(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDelegateTask} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Task Summary</span>
                <h4 className="font-bold text-slate-900 mb-1">{delegatingTask.title}</h4>
                <p className="text-slate-600 text-[11px] line-clamp-2">{delegatingTask.description}</p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Select Executive Role *</label>
                <select
                  value={delegateTarget}
                  onChange={(e) => {
                    setDelegateTarget(e.target.value);
                    if (e.target.value === 'Customer Support Executive') setDelegateTargetId('crm_usr_support_sub_01');
                    else if (e.target.value === 'Email Support Executive') setDelegateTargetId('crm_usr_support_email');
                    else if (e.target.value === 'Call Support Executive') setDelegateTargetId('crm_usr_support_call');
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7] bg-white font-semibold"
                >
                  <option value="Customer Support Executive">Customer Support Executive (Neha Bhatt)</option>
                  <option value="Email Support Executive">Email Support Executive (Pooja Sharma)</option>
                  <option value="Call Support Executive">Call Support Executive (Vikram Singh)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Delegation Instructions / Guidance Notes</label>
                <textarea
                  rows="3"
                  value={delegationNotes}
                  onChange={(e) => setDelegationNotes(e.target.value)}
                  placeholder="e.g. Please reach out to customer via phone immediately, verify driver details, and update the resolution state."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDelegatingTask(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#0284C7] hover:bg-[#0369a1] text-white rounded-lg shadow-sm transition cursor-pointer"
                >
                  Confirm Delegation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: UPDATE TASK STATE & ENTER RESOLUTION DESCRIPTION */}
      {/* (Used by Executives & Team Lead to submit work updates)   */}
      {/* ========================================================= */}
      {updatingTaskState && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-serif font-black text-slate-900 text-base">Update Task State & Work Description</h3>
                <span className="font-mono text-xs text-slate-400">{updatingTaskState.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setUpdatingTaskState(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateTaskStateAndDescription} className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Assigned Task</span>
                <h4 className="font-bold text-slate-900">{updatingTaskState.title}</h4>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Select New State *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 bg-white font-bold text-slate-800"
                >
                  <option value="In Progress">In Progress (Currently resolving / investigating)</option>
                  <option value="Under Review">Under Review (Resolution drafted, ready for Lead/Manager review)</option>
                  {(isManager || isTeamLead) && (
                    <option value="Completed">Completed (Final resolution verified & closed)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Work Description & Actions Taken *
                </label>
                <textarea
                  rows="4"
                  required
                  value={workDescription}
                  onChange={(e) => setWorkDescription(e.target.value)}
                  placeholder="Describe exact actions taken (e.g. 'Conducted phone consultation with customer, shared courier live tracking link, confirmed safe delivery. Customer confirmed satisfaction.')..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600 font-normal"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  This update and timestamp will instantly reflect on the Customer Support Team Lead and Manager dashboards.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUpdatingTaskState(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition cursor-pointer"
                >
                  Submit Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: REQUEST REVISIONS / REOPEN (CUSTOMER SUPPORT MGR) */}
      {/* ========================================================= */}
      {reopeningTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif font-black text-slate-900 text-base">Request Revisions on Task</h3>
              <button
                type="button"
                onClick={() => setReopeningTask(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReopenTask} className="space-y-3.5">
              <p className="text-xs text-slate-600">
                Specify what changes or additional actions are required from <strong>{reopeningTask.assignedTo}</strong> before this task can be approved.
              </p>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Revision Guidance & Feedback *</label>
                <textarea
                  rows="3"
                  required
                  value={reopenReasonText}
                  onChange={(e) => setReopenReasonText(e.target.value)}
                  placeholder="e.g. Please verify driver delivery slip and attach confirmation proof."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
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
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition cursor-pointer"
                >
                  Send Revision Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TICKET DETAILS & REPLY MODAL (EXISTING SUPPORT DESK)      */}
      {/* ========================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-slate-400">{selectedTicket.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedTicket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 className="font-serif font-black text-slate-900 text-base">{selectedTicket.subject}</h3>
                <span className="text-xs text-slate-500">
                  Client: <strong className="text-slate-800">{selectedTicket.customerName}</strong> ({selectedTicket.customerEmail || selectedTicket.customerPhone})
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conversation Timeline */}
            <div className="flex-grow overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Customer Opening Note</span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.initialMessage || 'Customer requested assistance with booking / order status.'}
                </p>
              </div>

              {selectedTicket.messages?.map((msg, i) => (
                <div
                  key={msg.id || i}
                  className={`p-3 rounded-lg border max-w-[85%] ${
                    msg.sender === 'agent'
                      ? 'ml-auto bg-[#0284C7] text-white border-[#0284C7]'
                      : 'bg-white text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] opacity-80 mb-1">
                    <span className="font-bold">{msg.senderName || (msg.sender === 'agent' ? 'Support Desk' : 'Customer')}</span>
                    <span>{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Reply Input Box */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Send Response to Customer:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'Resolved')}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle2 size={13} /> Mark Resolved
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'In Progress')}
                    className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    In Progress
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <textarea
                  rows="2"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type official support response..."
                  className="flex-grow p-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                />
                <button
                  type="button"
                  onClick={handleSendReply}
                  disabled={updatingTicket || !replyMessage.trim()}
                  className="px-4 bg-[#0284C7] hover:bg-[#0369a1] text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {updatingTicket ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Reply</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* LOG NEW TICKET MODAL                                      */}
      {/* ========================================================= */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-serif font-black text-slate-900 text-base">Log New Customer Support Case</h3>
              <button
                type="button"
                onClick={() => setShowNewTicketModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newTicketForm.customerName}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, customerName: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={newTicketForm.customerEmail}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, customerEmail: e.target.value })}
                    placeholder="priya@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={newTicketForm.customerPhone}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, customerPhone: e.target.value })}
                    placeholder="+91 98450 99881"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Subject / Issue Summary *</label>
                <input
                  type="text"
                  required
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  placeholder="e.g. Express delivery delay on Royal Canin 15kg"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7] bg-white font-medium"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                    className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7] bg-white font-medium"
                  >
                    <option value="Order Support">Order Support</option>
                    <option value="Service Booking">Service Booking</option>
                    <option value="Prescription Inquiry">Prescription Inquiry</option>
                    <option value="Billing & Refund">Billing & Refund</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Case Details *</label>
                <textarea
                  rows="3"
                  required
                  value={newTicketForm.initialMessage}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, initialMessage: e.target.value })}
                  placeholder="Describe grievance, customer statements, or escalation requirements..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#0284C7] hover:bg-[#0369a1] text-white rounded-lg shadow-sm transition cursor-pointer"
                >
                  Open Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerSupportView;
