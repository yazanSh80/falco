import { Link } from 'react-router-dom';
import Button from './ui/button';
import { FalcoLogo } from './FalcoLogo';
import { Home, Wrench, ArrowRight, Play, CheckCircle, Zap, Shield, Star } from 'lucide-react';

/**
 * Hero Section Component
 * 
 * Purpose: Main landing page hero with premium visual effects.
 * WowCursorBackground (Tubes effect) is provided at the parent LandingPage level.
 * 
 * UX Rule: Hero content sits above the cursor effect (z-index: 2+)
 */
export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center py-12 md:py-20 overflow-hidden">
      {/* Dark overlay for text readability - inherits from parent WowCursorBackground */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0f19]/40 via-transparent to-[#0b0f19]/60" />
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
           }} 
      />
      
      <div className="relative max-w-6xl mx-auto px-4 md:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm 
                          rounded-full text-white/90 text-sm mb-6 border border-white/20">
              <Zap className="w-4 h-4 text-gold" />
              <span>Palestine's Smart Electrical Platform</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              FalcoElectrec —{' '}
              <span className="bg-gradient-to-r from-gold via-amber-400 to-gold bg-clip-text text-transparent">
                Smart Electrical
              </span>{' '}
              Services Platform
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Connect with certified electrical engineers in your area. 
              Request services, compare prices, and get quality work done — all in one platform.
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
              {[
                { icon: CheckCircle, text: 'Verified Engineers' },
                { icon: Shield, text: 'Secure Payments' },
                { icon: Star, text: 'Rated Professionals' },
              ].map((feature) => (
                <span 
                  key={feature.text}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm 
                           rounded-full text-sm text-white/90 border border-white/10"
                >
                  <feature.icon className="w-4 h-4 text-gold" />
                  {feature.text}
                </span>
              ))}
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button asChild variant="gold" size="lg" className="group shadow-lg shadow-gold/20">
                <Link to="/signup?role=customer" className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                className="bg-white/10 backdrop-blur-sm text-white border border-white/30 
                         hover:bg-white/20 hover:border-white/50 shadow-lg"
              >
                <Link to="/customer/late" className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Browse Services
                </Link>
              </Button>
            </div>
            
            {/* Secondary Links */}
            <div className="flex items-center justify-center lg:justify-start gap-6 text-white/60 text-sm">
              <Link to="/signup?role=engineer" className="hover:text-gold transition-colors flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Join as Engineer
              </Link>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <Link to="/login" className="hover:text-gold transition-colors">
                Already have an account? <span className="text-gold font-medium">Sign in</span>
              </Link>
            </div>
          </div>
          
          {/* Right Side - Visual Element */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Main illustration card */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                  <FalcoLogo variant="icon" size="xl" colorMode="gold" />
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/10 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-white">500+</div>
                    <div className="text-white/60 text-sm">Engineers</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-gold">4.9</div>
                    <div className="text-white/60 text-sm">Avg Rating</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-white">10K+</div>
                    <div className="text-white/60 text-sm">Jobs Done</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-400">50+</div>
                    <div className="text-white/60 text-sm">Areas</div>
                  </div>
                </div>
                
                {/* Trust badge */}
                <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                  <Shield className="w-4 h-4 text-gold" />
                  <span>All engineers verified by admin</span>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-gold text-brand-dark rounded-2xl px-4 py-2 
                            shadow-lg font-semibold text-sm animate-bounce">
                🔥 Fast Service
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['A', 'S', 'M'].map((letter, i) => (
                      <div 
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-light 
                                 flex items-center justify-center text-white text-xs font-semibold
                                 border-2 border-white"
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-text-primary">1000+ Users</div>
                    <div className="text-text-muted">Trust FalcoElectrec</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
