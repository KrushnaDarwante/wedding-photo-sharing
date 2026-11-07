import React, { useState } from 'react';
import { WeddingProvider, useWedding } from './context/WeddingContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { HowItWorks } from './components/HowItWorks';
import { FeatureGrid } from './components/FeatureGrid';
import { PhotographerBenefits } from './components/PhotographerBenefits';
import { PricingSection } from './components/PricingSection';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { DashboardOverview } from './components/Dashboard/DashboardOverview';
import { DashboardAccessDenied } from './components/Dashboard/DashboardAccessDenied';
import { GuestGalleryView } from './components/GuestGallery/GuestGalleryView';
import { isStudioOwner } from './utils/pureLogic';

function AppContent() {
  const { currentView, photographer, setCurrentView } = useWedding();
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'forgot' }>({
    isOpen: false,
    mode: 'login'
  });

  const isOwnerAuthenticated = Boolean(photographer && isStudioOwner(photographer.id));

  const openAuth = (mode: 'login' | 'forgot' = 'login') => {
    setAuthModalState({ isOpen: true, mode });
  };

  const closeAuth = () => {
    setAuthModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-slate-800 antialiased selection:bg-[#E2D4B7] selection:text-slate-900">
      {/* Top Navbar */}
      <Navbar onOpenAuth={openAuth} />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView.type === 'home' && (
          <>
            <HeroSection onOpenAuth={openAuth} />
            <HowItWorks />
            <FeatureGrid />
            <PhotographerBenefits />
            <PricingSection onOpenAuth={openAuth} />
          </>
        )}

        {currentView.type === 'dashboard' && (
          isOwnerAuthenticated ? (
            <DashboardOverview />
          ) : (
            <DashboardAccessDenied
              onOpenLogin={() => openAuth('login')}
              onReturnHome={() => setCurrentView({ type: 'home' })}
            />
          )
        )}

        {currentView.type === 'guest-gallery' && (
          <GuestGalleryView
            eventSlug={currentView.eventSlug}
            initialPhotoId={currentView.photoId}
          />
        )}
      </main>

      {/* Platform Footer */}
      <Footer onOpenAuth={() => openAuth('login')} />

      {/* Photographer Authentication Modal */}
      <AuthModal
        isOpen={authModalState.isOpen}
        onClose={closeAuth}
        initialMode={authModalState.mode}
      />
    </div>
  );
}

export default function App() {
  return (
    <WeddingProvider>
      <AppContent />
    </WeddingProvider>
  );
}
