# Daily Engineering Report — November 25, 2026

**Project:** Josh Pets Hub (`PET-SHOP`)  
**Date:** Wednesday, November 25, 2026  
**Status:** All tasks completed, verified, and passing production build (0 errors)

---

## 1. Executive Summary

Today’s engineering operations focused on high-priority admin/CRM refinements, partner and customer support segregation, inventory alert automation, complete catalog and role permissions cleanup, and delivering a centralized subscription plans and pricing management system:

1. **Standalone SuperAdmin Subscription Plans & Pricing Management:** Added a dedicated, robust subscription management suite in the standalone SuperAdmin Dashboard (`/superadmin`, isolated from CRM) to control plan details, base prices, 18% GST calculations, validity periods, and perks for both Pet Parents (Users) and Service Providers.
2. **Removal of Product Catalog from SuperAdmin and CRM:** Cleanly eliminated the Product Catalogue navigation, views, and metrics across both portals, including deleting `AdminProductCatalogView.jsx` (600+ lines).
3. **Removal of "Change Role" Option:** Removed the ability to change user roles in both CRM (`AdminUsersManagerView.jsx`) and SuperAdmin (`SuperAdminDashboard.jsx`), eliminating role dropdown selects from the Registered Users tables.
4. **Low Stock Alert in Product Seller Dashboard:** Engineered an automated low-stock monitoring and alert system in `ProductSellerDashboard.jsx` with real-time badges, low-stock threshold triggers (<= 5 units), restock workflows, and overview KPI cards.
5. **Role-Based Footer Support Email Isolation:** Configured `providerhelp@joshpetshub.com` strictly for service providers and product sellers in `Footer.jsx`, `MainLayout.jsx`, and `Login.jsx`, while strictly ensuring public/customer users only see `care@joshpetshub.com`.
6. **Permanent Announcement Bar:** Removed the dismiss button ("X" close option) from the top announcement bar in `Navbar.jsx` so offers and announcements remain visible at all times.
7. **CRM & SuperAdmin Theme & Architectural Alignment:** Retained the standalone SuperAdmin dashboard while embedding SuperAdmin controls inside the CRM console, unified under the brand executive dark green palette (`#0F2E23`, `#7CA085`).
8. **Production Verification:** All changes were verified with `npm run build` (0 compilation errors) and end-to-end automated Playwright browser tests with full visual screenshot artifacts.

---

## 2. Key Accomplishments & Deliverables

### 2.1 Standalone SuperAdmin Subscription Plans & Pricing Management
- **Target File:** [SuperAdminDashboard.jsx](file:///c:/Users/soory/PET-SHOP/src/pages/dashboards/SuperAdminDashboard.jsx), [SuperAdminSubscriptionPlansView.jsx](file:///c:/Users/soory/PET-SHOP/src/components/dashboards/SuperAdminSubscriptionPlansView.jsx), [subscriptionPlanService.js](file:///c:/Users/soory/PET-SHOP/src/services/subscriptionPlanService.js)
- **Backend Endpoints:** [subscriptionRoutes.js](file:///c:/Users/soory/PET-SHOP/server/routes/subscriptionRoutes.js), [subscriptionController.js](file:///c:/Users/soory/PET-SHOP/server/controllers/subscriptionController.js), [subscription_plans.json](file:///c:/Users/soory/PET-SHOP/server/data/subscription_plans.json)
- **Features Implemented:**
  - Added a dedicated top-level **"Subscription Plans"** navigation tab (`CreditCard` icon) in the SuperAdmin sidebar.
  - **Audience Segmentation:** Filter between `All Plans`, `User & Customer Passes (Pet Parents)`, and `Service Provider Plans (Partners)`.
  - **Executive KPI Cards:** Live active plans count, user pass price spectrum, provider partner tiers, and 18% digital services GST rule.
  - **Plan Cards:** Display base price, live 18% GST calculation, total payable amount, validity label, badges (`★ VIP MOST RECOMMENDED`, `Yearly Best Value`), description, and bulleted perks.
  - **⚡ Quick Price Edit Modal:** Instant 1-click base price modification with live tax and total preview.
  - **✏️ Full Edit Details Modal:** Edit plan name, audience, price, validity (months & label), badge, popular flag, active status, description, and feature list.
  - **➕ Add New Plan Modal:** Create brand-new subscription tiers for either Pet Parents or Service Providers.
  - **🔄 Status Toggle & Delete:** Enable/disable plans or delete obsolete tiers.
  - **🔁 Factory Reset:** Restore default system tiers with one click.
  - **Dynamic Client Sync:** Integrated with [SubscriptionModal.jsx](file:///c:/Users/soory/PET-SHOP/src/components/widgets/SubscriptionModal.jsx) and [ServicePackageAccessModal.jsx](file:///c:/Users/soory/PET-SHOP/src/components/widgets/ServicePackageAccessModal.jsx) so checkout order prices update in real-time.

---

### 2.2 Removal of "Change Role" Option
- **Target Files:** [AdminUsersManagerView.jsx](file:///c:/Users/soory/PET-SHOP/src/components/crm/AdminUsersManagerView.jsx), [SuperAdminDashboard.jsx](file:///c:/Users/soory/PET-SHOP/src/pages/dashboards/SuperAdminDashboard.jsx)
- **Details:**
  - Removed `<th className="py-3 px-4">Change Role</th>` column header from CRM Registered Users.
  - Removed `<th className="p-4 uppercase tracking-wider text-[10px] text-center">Change Role</th>` from SuperAdmin Registered Users.
  - Removed the role `<select>` dropdown from each user row in both tables.
  - Removed `handleUpdateRole` and `handleUpdateUserRole` functions.
  - Verified with Playwright: 0 role dropdown select elements remain in the DOM.

---

### 2.3 Removal of Product Catalog from SuperAdmin and CRM
- **Target Files:** [CrmPortal.jsx](file:///c:/Users/soory/PET-SHOP/src/pages/crm/CrmPortal.jsx), [SuperAdminDashboard.jsx](file:///c:/Users/soory/PET-SHOP/src/pages/dashboards/SuperAdminDashboard.jsx)
- **Deleted File:** `src/components/crm/AdminProductCatalogView.jsx` (601 lines)
- **Details:**
  - Removed `{ id: 'products', label: 'Product Catalogue', icon: <Layers size={16} /> }` navigation button from CRM sidebar.
  - Removed `case 'products'` section title and active view container.
  - Deleted `AdminProductCatalogView.jsx` and removed unused `Layers` icon imports.
  - Cleaned up inventory SKU overview cards (`Total SKU Count`, `Products Sold`, `Unsold Products`) from both CRM and SuperAdmin executive overviews.

---

### 2.4 Low Stock Alert in Product Seller Dashboard
- **Target File:** [ProductSellerDashboard.jsx](file:///c:/Users/soory/PET-SHOP/src/pages/dashboards/providers/ProductSellerDashboard.jsx)
- **Details:**
  - Added low stock detection (stock <= 5 units).
  - Added a **"Low Stock Alert"** metric card to the seller's main KPI overview.
  - Added a dedicated **"Low Stock Alerts"** quick filter and tab with direct restock modals.
  - Added visual warning indicators and stock badges (`In Stock`, `Low Stock Warning`, `Out of Stock`).

---

### 2.5 Role-Based Provider Email Support Isolation
- **Target Files:** [Footer.jsx](file:///c:/Users/soory/PET-SHOP/src/components/layout/Footer.jsx), [MainLayout.jsx](file:///c:/Users/soory/PET-SHOP/src/layouts/MainLayout.jsx), [Login.jsx](file:///c:/Users/soory/PET-SHOP/src/pages/Login.jsx)
- **Details:**
  - Dedicated support email `providerhelp@joshpetshub.com` for service providers and product sellers.
  - Displayed in footer only when logged in as a provider or on provider portals.
  - Public customer footer strictly displays `care@joshpetshub.com`.
  - Verified complete isolation across user roles with automated browser tests.

---

### 2.6 Permanent Announcement Bar
- **Target File:** [Navbar.jsx](file:///c:/Users/soory/PET-SHOP/src/components/layout/Navbar.jsx)
- **Details:**
  - Removed the dismiss button ("X" icon) and dismiss state handler from the top promotional banner so announcement offers remain consistently visible.

---

## 3. Verification & Testing Matrix

| Component / Feature | Test Target | Test Type | Result |
| :--- | :--- | :--- | :--- |
| **Production Build** | Full application (`vite build`) | Compilation & Bundle Size | **Pass (0 Errors in 6.10s)** |
| **Subscription Plan Manager** | `/superadmin` -> `Subscription Plans` | Automated Playwright | **Pass** (All plans, modals, & pricing functional) |
| **No Change Role Option** | CRM & SuperAdmin Users Tables | Automated Playwright | **Pass** (0 select dropdowns found) |
| **Product Catalog Removal** | CRM & SuperAdmin Nav / Views | Automated Playwright | **Pass** (Zero catalog remnants) |
| **Low Stock Alert Center** | `/seller/dashboard` | Automated Playwright | **Pass** (Alert badges, restock modal working) |
| **Footer Email Isolation** | Public Customer vs Provider Footer | Automated Playwright | **Pass** (Strict isolation verified) |
| **Express Backend** | Port `5001` | API Route Integration | **Operational** |
| **Frontend Dev Server** | Port `5173` | Live UI Interaction | **Operational** |

---

## 4. Visual Artifacts Captured Today

- **SuperAdmin Subscription Plans Overview:** [superadmin_subscription_plans_overview.png](file:///C:/Users/soory/.gemini/antigravity/brain/c42de5fb-93bb-4aa9-ae04-7c84d6d9fd3a/superadmin_subscription_plans_overview.png)
- **SuperAdmin User Passes Tab:** [superadmin_user_subscription_plans.png](file:///C:/Users/soory/.gemini/antigravity/brain/c42de5fb-93bb-4aa9-ae04-7c84d6d9fd3a/superadmin_user_subscription_plans.png)
- **SuperAdmin Quick Price Modal:** [superadmin_quick_price_modal.png](file:///C:/Users/soory/.gemini/antigravity/brain/c42de5fb-93bb-4aa9-ae04-7c84d6d9fd3a/superadmin_quick_price_modal.png)
- **SuperAdmin Full Plan Edit Modal:** [superadmin_edit_plan_modal.png](file:///C:/Users/soory/.gemini/antigravity/brain/c42de5fb-93bb-4aa9-ae04-7c84d6d9fd3a/superadmin_edit_plan_modal.png)
- **CRM Registered Users (No Change Role):** [crm_registered_users_no_changerole.png](file:///C:/Users/soory/.gemini/antigravity/brain/c42de5fb-93bb-4aa9-ae04-7c84d6d9fd3a/crm_registered_users_no_changerole.png)
- **SuperAdmin Users (No Change Role):** [superadmin_users_no_changerole.png](file:///C:/Users/soory/.gemini/antigravity/brain/c42de5fb-93bb-4aa9-ae04-7c84d6d9fd3a/superadmin_users_no_changerole.png)
- **CRM Nav (Without Product Catalog):** [crm_nav_without_catalog.png](file:///C:/Users/soory/.gemini/antigravity/brain/c42de5fb-93bb-4aa9-ae04-7c84d6d9fd3a/crm_nav_without_catalog.png)
- **Provider Footer (`providerhelp@joshpetshub.com`):** [service_provider_footer_verified.png](file:///C:/Users/soory/.gemini/antigravity/brain/c42de5fb-93bb-4aa9-ae04-7c84d6d9fd3a/service_provider_footer_verified.png)
- **Customer Footer (`care@joshpetshub.com`):** [regular_user_footer_verified.png](file:///C:/Users/soory/.gemini/antigravity/brain/c42de5fb-93bb-4aa9-ae04-7c84d6d9fd3a/regular_user_footer_verified.png)
- **Product Seller Low Stock Alerts:** [product_seller_low_stock_center.png](file:///C:/Users/soory/.gemini/antigravity/brain/c42de5fb-93bb-4aa9-ae04-7c84d6d9fd3a/product_seller_low_stock_center.png)

