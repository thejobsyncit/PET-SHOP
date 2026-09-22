import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import CrmSidebar from './components/CrmSidebar.jsx';
import CrmHeader from './components/CrmHeader.jsx';
import NewBookingModal from './components/NewBookingModal.jsx';
import PetDetailsModal from './components/PetDetailsModal.jsx';
import QuickReplyModal from './components/QuickReplyModal.jsx';

// Role Dashboards
import SuperAdminDashboardView from './dashboards/SuperAdminDashboardView.jsx';
import OperationsDashboardView from './dashboards/OperationsDashboardView.jsx';
import VetDashboardView from './dashboards/VetDashboardView.jsx';
import GroomingDashboardView from './dashboards/GroomingDashboardView.jsx';
import BoardingDashboardView from './dashboards/BoardingDashboardView.jsx';
import FrontDeskDashboardView from './dashboards/FrontDeskDashboardView.jsx';

// Dedicated Views
import OrgChartView from './views/OrgChartView.jsx';
import BookingsView from './views/BookingsView.jsx';
import PetParentsView from './views/PetParentsView.jsx';
import PetProfilesView from './views/PetProfilesView.jsx';
import MessagesInboxView from './views/MessagesInboxView.jsx';
import AnalyticsReportsView from './views/AnalyticsReportsView.jsx';
import SettingsView from './views/SettingsView.jsx';

import { CRM_ROLES, getCrmState, saveCrmState } from './crmData.js';
import toast from 'react-hot-toast';

export default function PetCrmApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRoleParam = searchParams.get('role');
  const initialTabParam = searchParams.get('tab') || 'dashboard';

  // State
  const [currentRole, setCurrentRole] = useState(() => {
    if (initialRoleParam && CRM_ROLES[initialRoleParam]) {
      return CRM_ROLES[initialRoleParam];
    }
    return CRM_ROLES.SUPER_ADMIN;
  });

  const [activeTab, setActiveTab] = useState(initialTabParam);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Persistent CRM Data
  const [crmData, setCrmData] = useState(getCrmState);

  // Modals
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [replyMessage, setReplyMessage] = useState(null);

  // Sync state to local storage
  useEffect(() => {
    saveCrmState(crmData);
  }, [crmData]);

  // Update query params when role or tab changes
  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    setSearchParams({ role: newRole.id, tab: activeTab });
    toast.success(`Active Workspace: ${newRole.name}`, {
      icon: '🛡️',
      style: { background: '#0F241C', color: '#6EE7B7' }
    });
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ role: currentRole.id, tab: newTab });
  };

  // State handlers
  const handleAddBooking = (newBooking) => {
    setCrmData(prev => ({
      ...prev,
      appointments: [newBooking, ...prev.appointments]
    }));
  };

  const handleResolveAlert = (alertId) => {
    setCrmData(prev => ({
      ...prev,
      alerts: prev.alerts.filter(a => a.id !== alertId)
    }));
    toast.success('Alert resolved and marked complete');
  };

  const handleToggleTask = (taskId) => {
    setCrmData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
  };

  const handleAddTask = (newTask) => {
    setCrmData(prev => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));
    toast.success('New task added to board');
  };

  const handleReplyMessage = (msgId, replyText) => {
    setCrmData(prev => ({
      ...prev,
      messages: prev.messages.map(m => m.id === msgId ? { ...m, replied: true } : m)
    }));
  };

  const handleUpdateStatus = (aptId, newStatus) => {
    setCrmData(prev => ({
      ...prev,
      appointments: prev.appointments.map(a => a.id === aptId ? { ...a, status: newStatus } : a)
    }));
  };

  const handleApproveRestock = (inventoryId) => {
    setCrmData(prev => ({
      ...prev,
      inventory: prev.inventory.map(item => 
        item.id === inventoryId ? { ...item, stock: item.stock + 10, status: 'Restocked' } : item
      )
    }));
  };

  const handleSelectPet = (petInfo) => {
    // Look up in pets database or format from appointment
    const found = crmData.pets.find(p => p.name.toLowerCase() === (petInfo.petName || petInfo.name || '').toLowerCase());
    if (found) {
      setSelectedPet(found);
    } else {
      setSelectedPet({
        id: `pet-${Date.now()}`,
        name: petInfo.petName || petInfo.name || 'Pet Patient',
        type: petInfo.petType || 'Dog',
        breed: petInfo.petBreed || 'Breed',
        age: '3 Years',
        weight: '22 kg',
        gender: 'Adult',
        parentName: petInfo.parentName || 'Client',
        parentPhone: petInfo.parentPhone || '+91 98840 00000',
        allergies: petInfo.notes || 'None recorded',
        temperament: 'Friendly and well-mannered',
        dietNotes: 'Standard adult nutrition plan',
        vaccinations: [
          { name: 'Core Vaccine (DHPP / FVRCP)', date: '2025-10-10', validUntil: '2026-10-10', status: 'Valid' },
          { name: 'Rabies Booster', date: '2026-01-15', validUntil: '2027-01-15', status: 'Valid' }
        ],
        groomingNotes: petInfo.notes || 'Regular coat grooming schedule',
        avatarEmoji: petInfo.petAvatar || '🐾'
      });
    }
  };

  // Render content based on active tab and current role
  const renderMainContent = () => {
    // If user clicked specific tab in sidebar:
    if (activeTab === 'orgchart') {
      return (
        <OrgChartView 
          currentRole={currentRole}
          onSelectRole={(role) => {
            handleRoleChange(role);
            handleTabChange('dashboard');
          }}
        />
      );
    }
    if (activeTab === 'bookings') {
      return (
        <BookingsView 
          appointments={crmData.appointments}
          onOpenNewBooking={() => setShowBookingModal(true)}
          onUpdateStatus={handleUpdateStatus}
          onSelectPet={handleSelectPet}
        />
      );
    }
    if (activeTab === 'parents') {
      return (
        <PetParentsView 
          parents={crmData.parents}
          onOpenMessage={(parent) => handleTabChange('messages')}
        />
      );
    }
    if (activeTab === 'pets') {
      return (
        <PetProfilesView 
          pets={crmData.pets}
          onSelectPet={handleSelectPet}
        />
      );
    }
    if (activeTab === 'grooming') {
      return (
        <GroomingDashboardView 
          appointments={crmData.appointments}
          onSelectPet={handleSelectPet}
        />
      );
    }
    if (activeTab === 'boarding') {
      return (
        <BoardingDashboardView 
          suites={crmData.suites}
          onSelectPet={handleSelectPet}
        />
      );
    }
    if (activeTab === 'vet') {
      return (
        <VetDashboardView 
          appointments={crmData.appointments}
          pets={crmData.pets}
          onSelectPet={handleSelectPet}
        />
      );
    }
    if (activeTab === 'messages') {
      return (
        <MessagesInboxView 
          messages={crmData.messages}
          onReplyMessage={handleReplyMessage}
        />
      );
    }
    if (activeTab === 'reports') {
      return <AnalyticsReportsView />;
    }
    if (activeTab === 'settings') {
      return <SettingsView currentRole={currentRole} />;
    }

    // Default: 'dashboard' -> Renders the custom tailored dashboard for the currently selected role!
    switch (currentRole.id) {
      case 'OPERATIONS_MANAGER':
        return (
          <OperationsDashboardView 
            staff={crmData.staff}
            inventory={crmData.inventory}
            onApproveRestock={handleApproveRestock}
            tasks={crmData.tasks}
            onToggleTask={handleToggleTask}
          />
        );
      case 'VETERINARIAN':
        return (
          <VetDashboardView 
            appointments={crmData.appointments}
            pets={crmData.pets}
            onSelectPet={handleSelectPet}
          />
        );
      case 'GROOMING_LEAD':
        return (
          <GroomingDashboardView 
            appointments={crmData.appointments}
            onSelectPet={handleSelectPet}
          />
        );
      case 'BOARDING_SUPERVISOR':
        return (
          <BoardingDashboardView 
            suites={crmData.suites}
            onSelectPet={handleSelectPet}
          />
        );
      case 'FRONT_DESK':
        return (
          <FrontDeskDashboardView 
            appointments={crmData.appointments}
            onOpenNewBooking={() => setShowBookingModal(true)}
            onOpenInbox={() => handleTabChange('messages')}
            onReplyMessage={(msg) => setReplyMessage(msg)}
            messages={crmData.messages}
            onUpdateAppointmentStatus={handleUpdateStatus}
          />
        );
      case 'SUPER_ADMIN':
      default:
        return (
          <SuperAdminDashboardView 
            appointments={crmData.appointments}
            alerts={crmData.alerts}
            tasks={crmData.tasks}
            messages={crmData.messages}
            onOpenNewBooking={() => setShowBookingModal(true)}
            onOpenOrgChart={() => handleTabChange('orgchart')}
            onResolveAlert={handleResolveAlert}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onOpenInbox={() => handleTabChange('messages')}
            onReplyMessage={(msg) => setReplyMessage(msg)}
            onSelectPet={handleSelectPet}
            onUpdateAppointmentStatus={handleUpdateStatus}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070D0C] text-slate-100 flex font-sans antialiased overflow-x-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* Sleek Dark Sidebar */}
      <CrmSidebar 
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        currentRole={currentRole}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        {/* Top Header */}
        <CrmHeader 
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          onOpenNewBooking={() => setShowBookingModal(true)}
          onOpenOrgChart={() => handleTabChange('orgchart')}
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          alertsCount={crmData.alerts.length}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
        />

        {/* Workspace Body */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {renderMainContent()}
        </main>
      </div>

      {/* Interactive Modals */}
      <NewBookingModal 
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onAddBooking={handleAddBooking}
        staffList={crmData.staff}
      />

      <PetDetailsModal 
        pet={selectedPet}
        onClose={() => setSelectedPet(null)}
      />

      <QuickReplyModal 
        isOpen={!!replyMessage}
        onClose={() => setReplyMessage(null)}
        message={replyMessage}
        onSendReply={handleReplyMessage}
      />
    </div>
  );
}
