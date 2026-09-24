# PAWORA Pet Care Ecosystem — Architecture & File Structure

This document outlines the organized, modular directory structure for the PAWORA pet care platform.

---

## High-Level Architecture Overview

```
PET-SHOP/
├── database/               # SQL schemas, database setup & migration files
├── public/                 # Static public assets (favicons, banners, logos)
├── scripts/                # Data maintenance, fix utilities, and media processing
│   ├── maintenance/        # Database & catalog repair/patch scripts
│   └── media/              # Background removal and image auditing tools
├── server/                 # Express REST API backend (MVC architecture)
│   ├── config/             # Environment, DB, and Cloudinary configuration
│   ├── controllers/        # Request handlers & domain logic
│   ├── data/               # Seed datasets and server-side fixtures
│   ├── middleware/         # Auth, error handling, and rate limiting
│   ├── models/             # Data schemas (Supabase / MongoDB)
│   ├── routes/             # Express API route endpoints
│   ├── scripts/            # Server seed scripts
│   ├── services/           # External service integrations (Razorpay, Firebase)
│   ├── uploads/            # Temporary local file uploads
│   └── utils/              # Helper functions & cryptographic utilities
└── src/                    # Frontend React 19 application (Vite + TailwindCSS)
    ├── assets/             # Bundled image & SVG assets
    ├── components/         # Modular, reusable React components
    │   ├── layout/         # Header, Footer, Navigation, Modals, Drawer
    │   ├── ui/             # Core UI atoms/molecules (Cards, Stars, Loaders)
    │   ├── widgets/        # Interactive floating widgets and cookie consent
    │   └── index.js        # Central component registry barrel export
    ├── data/               # Static mock data & breed registries
    │   └── index.js        # Central data barrel export
    ├── layouts/            # Page shell layouts (MainLayout)
    ├── lib/                # Third-party SDK initializations (Supabase)
    ├── pages/              # Domain-categorized page views
    │   ├── blog/           # Educational content & pet care articles
    │   ├── crm/            # Enterprise Pet Care CRM Suite
    │   ├── dashboards/     # User, Admin & Service Provider Dashboards
    │   │   └── providers/  # Niche provider dashboards (Vet, Grooming, etc.)
    │   │       └── content/# Provider dashboard modular view content
    │   ├── pets/           # Adoption shelters, breeding, & classifieds
    │   ├── services/       # Service booking pages (Hostel, Vet, Training)
    │   ├── shop/           # Marketplace, pharmacy, cart, & checkout
    │   └── index.js        # Central page registry barrel export
    ├── services/           # Frontend API client and HTTP request helpers
    ├── store/              # Redux Toolkit centralized state management
    │   └── slices/         # Feature-specific state slices (auth, cart, etc.)
    └── utils/              # Client-side helper functions & storage wrappers
```

---

## Detailed Directory Guide

### 1. `src/components/`
Components are organized into three clear, single-responsibility categories:

| Folder | Components | Description |
| :--- | :--- | :--- |
| **`layout/`** | `Navbar.jsx`, `Footer.jsx`, `CartDrawer.jsx`, `SearchOverlay.jsx`, `MegaMenu.jsx`, `PageLoader.jsx`, `ScrollToTop.jsx` | Navigation bars, drawer menus, sticky elements, and global structural components. |
| **`ui/`** | `ProductCard.jsx`, `RatingStars.jsx`, `ScrollReveal.jsx`, `ErrorBoundary.jsx`, `PetBreedDropdown.jsx`, `ServiceAccessLock.jsx` | Reusable UI atoms and presentation components. |
| **`widgets/`** | `CookieConsent.jsx`, `LeadConsultationModal.jsx`, `FlyingMacawMessenger.jsx`, `WalkingDogOnLine.jsx` | Interactive feature modals, popups, and floating animated helpers. |
| **`index.js`** | Barrel export | Allows clean imports: `import { Navbar, ProductCard } from '@/components'` |

---

### 2. `src/pages/`
Pages are organized cleanly by business domain instead of a flat list:

| Folder / File | Pages | Purpose |
| :--- | :--- | :--- |
| **`dashboards/`** | `AccountDashboard.jsx`, `AdminDashboard.jsx`, `SuperAdminDashboard.jsx`, `ServiceProviderDashboard.jsx` | User account settings and admin command centers. |
| **`dashboards/providers/`** | `BreedingProviderDashboard.jsx`, `GroomingProviderDashboard.jsx`, `HostelProviderDashboard.jsx`, `InsuranceProviderDashboard.jsx`, `PetAdoptionDashboard.jsx`, `PetSellerDashboard.jsx`, `TrainingProviderDashboard.jsx`, `TransportProviderDashboard.jsx`, `VetProviderDashboard.jsx`, `WalkingProviderDashboard.jsx` | Specialized dashboards for each registered pet service provider. |
| **`dashboards/providers/content/`** | `GroomingProviderContent.jsx`, `HostelProviderContent.jsx`, `TrainingProviderContent.jsx`, `TransportProviderContent.jsx`, `VetProviderContent.jsx` | Modular tab content views rendered inside provider dashboards. |
| **`services/`** | `ServiceBooking.jsx`, `GroomingServices.jsx`, `HostelServices.jsx`, `WalkingServices.jsx`, `PetTransport.jsx`, `PetTraining.jsx`, `PetInsurance.jsx`, `VeterinaryServices.jsx` | Consumer-facing service landing and booking forms. |
| **`shop/`** | `Shop.jsx`, `ProductDetails.jsx`, `Checkout.jsx`, `Wishlist.jsx`, `PharmacyLanding.jsx` | E-commerce catalog, product display, cart, and pharmacy checkout. |
| **`pets/`** | `PetClassifieds.jsx`, `AdoptionShelter.jsx`, `AdoptionPetDetail.jsx`, `BreedingDirectory.jsx` | Pet listings, rescue adoptions, and certified breeding directories. |
| **`blog/`** | `BlogHub.jsx`, `BlogDetail.jsx` | Editorial pet care guides and wellness articles. |
| **`crm/`** | `PetCrmApp.jsx`, `views/`, `dashboards/`, `components/` | Complete enterprise CRM suite for clinics, salons, and daycare. |
| **Core Pages** | `Home.jsx`, `About.jsx`, `Contact.jsx`, `Login.jsx`, `ChatConsole.jsx`, `NotFound.jsx` | Top-level entry points and static pages. |
| **`index.js`** | Barrel export | Allows clean imports: `import { Home, Shop } from '@/pages'` |

---

### 3. Path Aliases (`@/`)
Vite and your IDE are configured with the `@` alias pointing directly to `src/`:
```javascript
// Clean & readable imports anywhere in the application
import { Navbar, Footer } from '@/components';
import { apiRequest } from '@/services/api.js';
import { store } from '@/store';
```

---

### 4. `scripts/`
All loose maintenance and utility scripts have been moved out of the root folder:
- **`scripts/maintenance/`**: Database fixes, catalog updates, price corrections, and schema patches.
- **`scripts/media/`**: Python (`rembg`) and PowerShell tools for background removal and CDN image validation.
- See `scripts/README.md` for individual script descriptions.

---

### 5. `database/`
Contains `supabase_schema.sql` defining database schemas, relational tables, and row-level security (RLS) policies.
