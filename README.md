# PAWORA — Modern Pet Care & Commerce Ecosystem

PAWORA is a full-stack, enterprise-grade pet care platform combining e-commerce, veterinary telehealth, grooming, boarding/hostels, dog walking, pet insurance, ethical breeding, adoption shelters, and an integrated CRM suite.

## 🚀 Quick Start

### 1. Installation
Install root frontend dependencies:
```bash
npm install
```
Install backend dependencies:
```bash
cd server && npm install && cd ..
```

### 2. Development Mode
Run both frontend and backend concurrently:
```bash
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

### 3. Build & Production Preview
```bash
npm run build
npm run preview
```

---

## 📁 Project Architecture & File Structure

The project has been organized with a clean, domain-driven directory structure:
- **`src/components/`**: Divided into `layout/`, `ui/`, and `widgets/` with a central `index.js` barrel.
- **`src/pages/`**: Grouped into `shop/`, `services/`, `pets/`, `blog/`, `dashboards/`, and `crm/`.
- **`src/data/`**: Centralized datasets and catalogues for breeds, locations, and services.
- **`scripts/`**: Maintenance, database fixing, and media automation tools organized under `scripts/maintenance/` and `scripts/media/`.
- **`database/`**: SQL schemas and migration files.
- **`server/`**: Modular MVC Express backend.

👉 For complete architectural diagrams and folder breakdowns, see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).
