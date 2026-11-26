import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * AdminDashboard:
 * The separate admin page has been retired and completely shifted into the CRM Portal (/crm).
 * This component seamlessly redirects all admin access requests to /crm.
 */
const AdminDashboard = () => {
  return <Navigate to="/crm" replace />;
};

export default AdminDashboard;
