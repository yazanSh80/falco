import Hero from '../hero';
import FeaturesSection from './FeaturesSection';
import HowItWorksSection from './HowItWorksSection';
import StatsSection from './StatsSection';
import CTASection from './CTASection';
import Footer from './Footer';
import { WowCursorBackground } from '../effects/WowCursorBackground';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#0b0f19]">
      {/* WOW Cursor Background - ThreeJS Tubes Effect */}
      <WowCursorBackground />
      
      {/* Overlay for content visibility */}
      <div 
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(11,15,25,0.4) 70%, rgba(11,15,25,0.8) 100%)'
        }}
      />

      {/* Main Content */}
      <div className="relative z-[2]">
        {/* Hero Section */}
        <Hero />
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* How It Works Section */}
        <HowItWorksSection />
        
        {/* Stats & Testimonials Section */}
        <StatsSection />
        
        {/* CTA Section */}
        <CTASection />
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
