-- ==============================================================================
-- JOSH PETS HUB: CRM MASTER DEPARTMENT & HIERARCHICAL ROLE MANAGEMENT MIGRATION
-- Project: Complete Super Admin & CRM Department Automation
-- Generated for Supabase PostgreSQL: https://supabase.com/dashboard/project/chkaqdokgyppcadfkoce/sql/new
-- ==============================================================================

-- 1. Enable pgcrypto for UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- TABLE 1: crm_departments
-- Defines the 7 primary business departments of Josh Pet Hub
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_departments (
  id TEXT PRIMARY KEY DEFAULT ('dept_' || replace(gen_random_uuid()::text, '-', '')),
  department_name TEXT UNIQUE NOT NULL,
  department_code TEXT UNIQUE NOT NULL,
  description TEXT,
  head_role_id TEXT,
  head_employee_id TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- TABLE 2: crm_designations
-- Master catalog of Department Heads and Subordinate Designations
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_designations (
  id TEXT PRIMARY KEY DEFAULT ('desig_' || replace(gen_random_uuid()::text, '-', '')),
  department_id TEXT REFERENCES public.crm_departments(id) ON DELETE CASCADE,
  department_name TEXT NOT NULL,
  designation_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Employee Designation' CHECK (category IN ('Department Head', 'Employee Designation')),
  reporting_to TEXT,
  is_department_head BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Deprecated')),
  default_permissions JSONB DEFAULT '{}'::jsonb,
  dashboard_config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- TABLE 3: crm_employees
-- Enterprise staff registry mapped to Supabase Auth and CRM roles
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_employees (
  id TEXT PRIMARY KEY DEFAULT ('crm_emp_' || replace(gen_random_uuid()::text, '-', '')),
  auth_user_id UUID,
  employee_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  department_id TEXT REFERENCES public.crm_departments(id) ON DELETE SET NULL,
  department_name TEXT NOT NULL,
  designation_id TEXT REFERENCES public.crm_designations(id) ON DELETE SET NULL,
  designation_name TEXT NOT NULL,
  role_id TEXT,
  reporting_manager_id TEXT,
  employment_status TEXT DEFAULT 'Active' CHECK (employment_status IN ('Active', 'On Leave', 'Suspended', 'Terminated', 'Reassignment Required')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- TABLE 4: crm_permissions
-- Master granular permission dictionary
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_permissions (
  id TEXT PRIMARY KEY DEFAULT ('perm_' || replace(gen_random_uuid()::text, '-', '')),
  permission_key TEXT UNIQUE NOT NULL,
  module_name TEXT NOT NULL,
  action_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- TABLE 5: crm_designation_permissions
-- Fine-grained role permissions with operational record scope
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_designation_permissions (
  id TEXT PRIMARY KEY DEFAULT ('dp_' || replace(gen_random_uuid()::text, '-', '')),
  designation_id TEXT REFERENCES public.crm_designations(id) ON DELETE CASCADE,
  permission_id TEXT REFERENCES public.crm_permissions(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  scope TEXT DEFAULT 'Department' CHECK (scope IN ('Own records', 'Assigned records', 'Assigned team', 'Department', 'Global')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- TABLE 6: crm_tasks (Enhanced with Complete Workflow Lifecycle)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_tasks (
  id TEXT PRIMARY KEY DEFAULT ('tsk_' || replace(gen_random_uuid()::text, '-', '')),
  department_id TEXT,
  department_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'General',
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Under Review', 'Completed', 'Reopened')),
  assigned_by TEXT,
  assigned_by_name TEXT,
  assigned_to TEXT,
  assigned_to_name TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  due_date TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  approved_by TEXT,
  reopen_reason TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- TABLE 7: crm_task_comments
-- Internal task collaboration notes and review feedback
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_task_comments (
  id TEXT PRIMARY KEY DEFAULT ('tc_' || replace(gen_random_uuid()::text, '-', '')),
  task_id TEXT REFERENCES public.crm_tasks(id) ON DELETE CASCADE,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- TABLE 8: crm_task_attachments
-- File attachments and verification documents
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_task_attachments (
  id TEXT PRIMARY KEY DEFAULT ('ta_' || replace(gen_random_uuid()::text, '-', '')),
  task_id TEXT REFERENCES public.crm_tasks(id) ON DELETE CASCADE,
  uploaded_by TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- TABLE 9: crm_task_history
-- Immutable audit trail for task state changes
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_task_history (
  id TEXT PRIMARY KEY DEFAULT ('th_' || replace(gen_random_uuid()::text, '-', '')),
  task_id TEXT REFERENCES public.crm_tasks(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  performed_by TEXT NOT NULL,
  performed_by_name TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- TABLE 10: crm_task_delegations
-- Temporary task delegation across department supervisors
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_task_delegations (
  id TEXT PRIMARY KEY DEFAULT ('td_' || replace(gen_random_uuid()::text, '-', '')),
  department_id TEXT,
  delegated_by TEXT NOT NULL,
  delegated_to TEXT NOT NULL,
  permission_key TEXT NOT NULL,
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Revoked')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- TABLE 11: crm_notifications
-- Real-time notification queue for assignments, reviews & escalations
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_notifications (
  id TEXT PRIMARY KEY DEFAULT ('notif_' || replace(gen_random_uuid()::text, '-', '')),
  recipient_employee_id TEXT NOT NULL,
  recipient_email TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT DEFAULT 'Task' CHECK (notification_type IN ('Task', 'Approval', 'Escalation', 'System', 'Audit')),
  related_entity_type TEXT,
  related_entity_id TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- TABLE 12: crm_audit_logs
-- Comprehensive administrative audit log
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_audit_logs (
  id TEXT PRIMARY KEY DEFAULT ('audit_' || replace(gen_random_uuid()::text, '-', '')),
  actor_user_id TEXT NOT NULL,
  actor_email TEXT,
  actor_name TEXT,
  department_id TEXT,
  department_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- TABLE 13: crm_employee_activity
-- Activity logging for daily productivity and task telemetry
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_employee_activity (
  id TEXT PRIMARY KEY DEFAULT ('act_' || replace(gen_random_uuid()::text, '-', '')),
  employee_id TEXT NOT NULL,
  employee_name TEXT,
  department_id TEXT,
  activity_type TEXT NOT NULL,
  reference_id TEXT,
  activity_description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- TABLE 14: crm_approval_requests
-- Cross-department approval requests (Refunds, Payouts, Policy approvals)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_approval_requests (
  id TEXT PRIMARY KEY DEFAULT ('apr_' || replace(gen_random_uuid()::text, '-', '')),
  department_id TEXT,
  request_type TEXT NOT NULL,
  reference_id TEXT,
  requested_by TEXT NOT NULL,
  requested_by_name TEXT,
  assigned_approver TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  decision_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- TABLE 15: crm_dashboard_preferences
-- Presentation settings per user (does NOT control security)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.crm_dashboard_preferences (
  id TEXT PRIMARY KEY DEFAULT ('pref_' || replace(gen_random_uuid()::text, '-', '')),
  employee_id TEXT UNIQUE NOT NULL,
  dashboard_configuration JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- SEED DATA: 7 DEPARTMENTS
-- ==============================================================================
INSERT INTO public.crm_departments (id, department_name, department_code, description, status)
VALUES
  ('dept_crm_ops', 'CRM Operations & Administration', 'CRM_OPS', 'Central command, customer/provider onboarding oversight, and system coordination.', 'Active'),
  ('dept_support', 'Customer Support', 'CUST_SUPP', 'Customer service grievances, support tickets, booking assistance, and refund reviews.', 'Active'),
  ('dept_service_ops', 'Service Operations', 'SERV_OPS', 'Fulfillment, scheduling, and quality assurance for pet care bookings.', 'Active'),
  ('dept_finance', 'Finance & Accounts', 'FIN_ACC', 'Revenue reconciliation, gateway settlement, provider payouts, and refunds.', 'Active'),
  ('dept_providers', 'Provider Relations', 'PROV_REL', 'Service partner onboarding, KYC document verification, and subscriptions.', 'Active'),
  ('dept_marketing', 'Marketing & Growth', 'MKTG_GRW', 'Campaign creation, promotional coupons, lead management, and growth analytics.', 'Active'),
  ('dept_quality', 'Quality & Compliance', 'QUAL_CMP', 'Service audits, prescription approvals, vendor compliance, and safety standards.', 'Active')
ON CONFLICT (department_name) DO UPDATE SET
  description = EXCLUDED.description,
  department_code = EXCLUDED.department_code;

-- ==============================================================================
-- SEED DATA: 34 DESIGNATIONS (24 Active + 10 Deprecated Per Phase 1)
-- ==============================================================================
INSERT INTO public.crm_designations (id, department_id, department_name, designation_name, slug, category, reporting_to, is_department_head, status, default_permissions)
VALUES
  -- 1. CRM Operations (3 Subordinates + 1 Head)
  ('desig_crm_admin', 'dept_crm_ops', 'CRM Operations & Administration', 'CRM Administrator', 'crm_administrator', 'Employee Designation', 'CRM Admin / Operations Head', false, 'Active', '{"manage_staff": true, "view_customers": true, "manage_customers": true, "view_orders": true, "view_bookings": true, "manage_tasks": true}'::jsonb),
  ('desig_ops_coord', 'dept_crm_ops', 'CRM Operations & Administration', 'Operations Coordinator', 'operations_coordinator', 'Employee Designation', 'CRM Admin / Operations Head', false, 'Active', '{"view_customers": true, "view_orders": true, "view_bookings": true, "manage_tasks": true}'::jsonb),
  ('desig_crm_exec', 'dept_crm_ops', 'CRM Operations & Administration', 'CRM Executive', 'crm_executive', 'Employee Designation', 'CRM Admin / Operations Head', false, 'Active', '{"view_customers": true, "manage_tasks": true}'::jsonb),

  -- 2. Customer Support (4 Subordinates)
  ('desig_snr_supp_exec', 'dept_support', 'Customer Support', 'Senior Support Executive', 'senior_support_executive', 'Employee Designation', 'Customer Support Manager', false, 'Active', '{"view_tickets": true, "manage_tickets": true, "view_customers": true, "manage_tasks": true}'::jsonb),
  ('desig_cust_supp_exec', 'dept_support', 'Customer Support', 'Customer Support Executive', 'customer_support_executive', 'Employee Designation', 'Customer Support Manager', false, 'Active', '{"view_tickets": true, "manage_tickets": true, "view_customers": true, "manage_tasks": true}'::jsonb),
  ('desig_book_supp_exec', 'dept_support', 'Customer Support', 'Booking Support Executive', 'booking_support_executive', 'Employee Designation', 'Customer Support Manager', false, 'Active', '{"view_tickets": true, "manage_tickets": true, "view_bookings": true, "manage_tasks": true}'::jsonb),
  ('desig_ref_supp_exec', 'dept_support', 'Customer Support', 'Refund Support Executive', 'refund_support_executive', 'Employee Designation', 'Customer Support Manager', false, 'Active', '{"view_tickets": true, "manage_tickets": true, "view_orders": true, "manage_tasks": true}'::jsonb),

  -- 3. Service Operations (3 Subordinates)
  ('desig_srv_ops_sup', 'dept_service_ops', 'Service Operations', 'Service Operations Supervisor', 'service_operations_supervisor', 'Employee Designation', 'Service Operations Manager', false, 'Active', '{"view_bookings": true, "manage_bookings": true, "view_providers": true, "manage_tasks": true}'::jsonb),
  ('desig_srv_qual_exec', 'dept_service_ops', 'Service Operations', 'Service Quality Executive', 'service_quality_executive', 'Employee Designation', 'Service Operations Manager', false, 'Active', '{"view_bookings": true, "manage_bookings": true, "view_quality": true, "manage_tasks": true}'::jsonb),
  ('desig_srv_ops_exec', 'dept_service_ops', 'Service Operations', 'Service Operations Executive', 'service_operations_executive', 'Employee Designation', 'Service Operations Manager', false, 'Active', '{"view_bookings": true, "manage_bookings": true, "manage_tasks": true}'::jsonb),

  -- 4. Finance & Accounts (4 Subordinates)
  ('desig_accountant', 'dept_finance', 'Finance & Accounts', 'Accountant', 'accountant', 'Employee Designation', 'Finance Manager', false, 'Active', '{"view_finance": true, "view_orders": true, "manage_tasks": true}'::jsonb),
  ('desig_pay_exec', 'dept_finance', 'Finance & Accounts', 'Payment Executive', 'payment_executive', 'Employee Designation', 'Finance Manager', false, 'Active', '{"view_finance": true, "manage_tasks": true}'::jsonb),
  ('desig_ref_exec', 'dept_finance', 'Finance & Accounts', 'Refund Executive', 'refund_executive', 'Employee Designation', 'Finance Manager', false, 'Active', '{"view_finance": true, "manage_finance": true, "manage_tasks": true}'::jsonb),
  ('desig_payout_exec', 'dept_finance', 'Finance & Accounts', 'Payout Executive', 'payout_executive', 'Employee Designation', 'Finance Manager', false, 'Active', '{"view_finance": true, "view_providers": true, "manage_tasks": true}'::jsonb),

  -- 5. Provider Relations (5 Subordinates)
  ('desig_prov_onboard_exec', 'dept_providers', 'Provider Relations', 'Provider Onboarding Executive', 'provider_onboarding_executive', 'Employee Designation', 'Provider Relations Manager', false, 'Active', '{"view_providers": true, "manage_providers": true, "manage_tasks": true}'::jsonb),
  ('desig_prov_verif_exec', 'dept_providers', 'Provider Relations', 'Provider Verification Executive', 'provider_verification_executive', 'Employee Designation', 'Provider Relations Manager', false, 'Active', '{"view_providers": true, "manage_providers": true, "manage_tasks": true}'::jsonb),
  ('desig_prov_supp_exec', 'dept_providers', 'Provider Relations', 'Provider Support Executive', 'provider_support_executive', 'Employee Designation', 'Provider Relations Manager', false, 'Active', '{"view_providers": true, "view_tickets": true, "manage_tasks": true}'::jsonb),
  ('desig_prov_rel_exec', 'dept_providers', 'Provider Relations', 'Provider Relationship Executive', 'provider_relationship_executive', 'Employee Designation', 'Provider Relations Manager', false, 'Active', '{"view_providers": true, "manage_tasks": true}'::jsonb),
  ('desig_prov_sub_exec', 'dept_providers', 'Provider Relations', 'Provider Subscription Executive', 'provider_subscription_executive', 'Employee Designation', 'Provider Relations Manager', false, 'Active', '{"view_providers": true, "manage_tasks": true}'::jsonb),

  -- 6. Marketing & Growth (1 Subordinate)
  ('desig_mktg_exec', 'dept_marketing', 'Marketing & Growth', 'Digital Marketing Executive', 'digital_marketing_executive', 'Employee Designation', 'Marketing Manager', false, 'Active', '{"view_leads": true, "manage_leads": true, "manage_tasks": true}'::jsonb),

  -- 7. Quality & Compliance (4 Subordinates)
  ('desig_qa_exec', 'dept_quality', 'Quality & Compliance', 'Quality Assurance Executive', 'quality_assurance_executive', 'Employee Designation', 'Quality & Compliance Manager', false, 'Active', '{"view_quality": true, "manage_quality": true, "manage_tasks": true}'::jsonb),
  ('desig_srv_audit_exec', 'dept_quality', 'Quality & Compliance', 'Service Audit Executive', 'service_audit_executive', 'Employee Designation', 'Quality & Compliance Manager', false, 'Active', '{"view_quality": true, "manage_tasks": true}'::jsonb),
  ('desig_doc_verif_exec', 'dept_quality', 'Quality & Compliance', 'Document Verification Executive', 'document_verification_executive', 'Employee Designation', 'Quality & Compliance Manager', false, 'Active', '{"view_quality": true, "manage_quality": true, "manage_tasks": true}'::jsonb),
  ('desig_policy_exec', 'dept_quality', 'Quality & Compliance', 'Policy & Standards Executive', 'policy_standards_executive', 'Employee Designation', 'Quality & Compliance Manager', false, 'Active', '{"view_quality": true, "manage_tasks": true}'::jsonb),

  -- Deprecated / Removed Subordinate Designations (Phase 1)
  ('desig_deprec_dept_sup', 'dept_crm_ops', 'CRM Operations & Administration', 'Department Supervisor', 'department_supervisor', 'Employee Designation', 'CRM Admin', false, 'Deprecated', '{}'::jsonb),
  ('desig_deprec_rep_exec', 'dept_crm_ops', 'CRM Operations & Administration', 'Reporting Executive', 'reporting_executive', 'Employee Designation', 'CRM Admin', false, 'Deprecated', '{}'::jsonb),
  ('desig_deprec_comp_exec', 'dept_support', 'Customer Support', 'Complaint Resolution Executive', 'complaint_resolution_executive', 'Employee Designation', 'Customer Support Manager', false, 'Deprecated', '{}'::jsonb),
  ('desig_deprec_sched_exec', 'dept_service_ops', 'Service Operations', 'Service Scheduling Executive', 'service_scheduling_executive', 'Employee Designation', 'Service Operations Manager', false, 'Deprecated', '{}'::jsonb),
  ('desig_deprec_book_coord', 'dept_service_ops', 'Service Operations', 'Booking Coordinator', 'booking_coordinator', 'Employee Designation', 'Service Operations Manager', false, 'Deprecated', '{}'::jsonb),
  ('desig_deprec_bill_exec', 'dept_finance', 'Finance & Accounts', 'Billing Executive', 'billing_executive', 'Employee Designation', 'Finance Manager', false, 'Deprecated', '{}'::jsonb),
  ('desig_deprec_soc_med', 'dept_marketing', 'Marketing & Growth', 'Social Media Executive', 'social_media_executive', 'Employee Designation', 'Marketing Manager', false, 'Deprecated', '{}'::jsonb),
  ('desig_deprec_seo_exec', 'dept_marketing', 'Marketing & Growth', 'SEO Executive', 'seo_executive', 'Employee Designation', 'Marketing Manager', false, 'Deprecated', '{}'::jsonb),
  ('desig_deprec_email_mkt', 'dept_marketing', 'Marketing & Growth', 'Email Marketing Executive', 'email_marketing_executive', 'Employee Designation', 'Marketing Manager', false, 'Deprecated', '{}'::jsonb),
  ('desig_deprec_content_mkt', 'dept_marketing', 'Marketing & Growth', 'Content Marketing Executive', 'content_marketing_executive', 'Employee Designation', 'Marketing Manager', false, 'Deprecated', '{}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
  designation_name = EXCLUDED.designation_name,
  status = EXCLUDED.status,
  default_permissions = EXCLUDED.default_permissions;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.crm_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_employee_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- Permissive authenticated read and service-role full write policies
CREATE POLICY IF NOT EXISTS "Allow authenticated read crm_departments" ON public.crm_departments FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated read crm_designations" ON public.crm_designations FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated read crm_employees" ON public.crm_employees FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated read crm_tasks" ON public.crm_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated read crm_task_comments" ON public.crm_task_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated read crm_notifications" ON public.crm_notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Allow authenticated read crm_audit_logs" ON public.crm_audit_logs FOR SELECT TO authenticated USING (true);
