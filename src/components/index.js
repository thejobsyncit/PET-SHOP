// ==========================================
// PAWORA Component Registry & Barrel Export
// ==========================================

// Layout Components
export { default as Navbar } from './layout/Navbar.jsx';
export { default as Footer } from './layout/Footer.jsx';
export { default as MegaMenu } from './layout/MegaMenu.jsx';
export { default as CartDrawer } from './layout/CartDrawer.jsx';
export { default as SearchOverlay } from './layout/SearchOverlay.jsx';
export { default as PageLoader } from './layout/PageLoader.jsx';
export { default as ScrollToTop } from './layout/ScrollToTop.jsx';

// UI & Presentation Components
export { default as ProductCard } from './ui/ProductCard.jsx';
export { default as RatingStars } from './ui/RatingStars.jsx';
export { default as ScrollReveal } from './ui/ScrollReveal.jsx';
export { default as ErrorBoundary } from './ui/ErrorBoundary.jsx';
export { default as PetBreedDropdown } from './ui/PetBreedDropdown.jsx';
export { default as ServiceAccessLock, isServicePathLockedForUser } from './ui/ServiceAccessLock.jsx';

// Modals & Interactive Widgets
export { default as CookieConsent } from './widgets/CookieConsent.jsx';
export { default as LeadConsultationModal } from './widgets/LeadConsultationModal.jsx';
export { default as FlyingMacawMessenger } from './widgets/FlyingMacawMessenger.jsx';
export { default as WalkingDogOnLine } from './widgets/WalkingDogOnLine.jsx';
