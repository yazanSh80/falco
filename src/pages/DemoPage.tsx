/**
 * Demo Page
 * 
 * Purpose: Showcase premium visual effects in isolation.
 * This page demonstrates all WOW effects without cluttering the main UX.
 * 
 * UX Rule: This page is for demonstration purposes only.
 * Effects here are heavier than what's used in production pages.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, Star, Shield, CheckCircle, Sparkles, Eye, EyeOff, Palette } from 'lucide-react';
import Button from '../components/ui/button';
import AttractionBackground from '../components/effects/AttractionBackground';
import { ElectricBorderCard, PointerReactiveCard } from '../components/showcase';
import { useEffectsPreference } from '../utils/effects';

export default function DemoPage() {
  const [showBackground, setShowBackground] = useState(true);
  const [randomColors, setRandomColors] = useState(false);
  const { canUseHeavyEffects, prefersReducedMotion, isMobile } = useEffectsPreference();

  // Random color generator
  const getRandomColors = () => [
    '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
    '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
    '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
    '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
    '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
  ];

  const [colors, setColors] = useState(['#D4AF37', '#136F94', '#1DA3C6', '#F4D675', '#22C55E']);

  const handleRandomColors = () => {
    setRandomColors(true);
    setColors(getRandomColors());
  };

  const handleResetColors = () => {
    setRandomColors(false);
    setColors(['#D4AF37', '#136F94', '#1DA3C6', '#F4D675', '#22C55E']);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effect */}
      {showBackground && (
        <AttractionBackground 
          particleCount={100}
          colors={colors}
          connectionDistance={130}
          attractionRadius={200}
          particleOpacity={0.7}
          lineOpacity={0.2}
        />
      )}
      
      {/* Static fallback background */}
      {!showBackground && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-brand-dark" />
      )}
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/30 to-slate-950/60" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-white/70 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <Link to="/credits">
            <Button variant="outline" className="border-white/20 text-white/70 hover:text-white hover:border-white/40">
              <Sparkles className="w-4 h-4 mr-2" />
              Credits
            </Button>
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ✨ Effects Demo
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Experience the premium visual effects used in FalcoElectrec.
            Move your cursor around to interact with the particles!
          </p>
          
          {/* Capability status */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className={`px-3 py-1 rounded-full text-sm ${canUseHeavyEffects ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
              {canUseHeavyEffects ? '✓ Effects Enabled' : '⚠ Effects Limited'}
            </span>
            {prefersReducedMotion && (
              <span className="px-3 py-1 rounded-full text-sm bg-info/20 text-info">
                Reduced Motion Active
              </span>
            )}
            {isMobile && (
              <span className="px-3 py-1 rounded-full text-sm bg-brand/20 text-brand-light">
                Mobile Device
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <Button 
            variant={showBackground ? 'primary' : 'outline'}
            onClick={() => setShowBackground(!showBackground)}
            className={showBackground ? 'bg-brand' : 'border-white/20 text-white/70'}
          >
            {showBackground ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            {showBackground ? 'Hide Background' : 'Show Background'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleRandomColors}
            className="border-gold/30 text-gold hover:bg-gold/10"
          >
            <Palette className="w-4 h-4 mr-2" />
            Random Colors
          </Button>
          
          {randomColors && (
            <Button 
              variant="ghost"
              onClick={handleResetColors}
              className="text-white/50 hover:text-white"
            >
              Reset Colors
            </Button>
          )}
        </div>

        {/* Showcase Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Electric Border Card */}
          <ElectricBorderCard
            title="Why FalcoElectrec?"
            icon={<Zap className="w-5 h-5" />}
            borderColor="#D4AF37"
          >
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Verified Engineers</p>
                  <p className="text-white/50 text-sm">All engineers go through admin verification</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Star className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Quality Ratings</p>
                  <p className="text-white/50 text-sm">Real customer reviews and ratings</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-brand-light flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Admin Oversight</p>
                  <p className="text-white/50 text-sm">Disputes handled by platform admins</p>
                </div>
              </li>
            </ul>
          </ElectricBorderCard>

          {/* Pointer Reactive Card */}
          <PointerReactiveCard
            title="Interactive Card"
            subtitle="Move your cursor over this card"
            glowColor="#136F94"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-white mb-1">500+</div>
                <div className="text-white/50 text-sm">Engineers</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-gold mb-1">4.9</div>
                <div className="text-white/50 text-sm">Avg Rating</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-white mb-1">10K+</div>
                <div className="text-white/50 text-sm">Jobs Done</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-success mb-1">24/7</div>
                <div className="text-white/50 text-sm">Support</div>
              </div>
            </div>
          </PointerReactiveCard>
        </div>

        {/* Info Section */}
        <div className="text-center text-white/40 text-sm">
          <p className="mb-2">
            These effects automatically disable on mobile devices and when reduced motion is preferred.
          </p>
          <p>
            Effects are sourced under CC BY-NC-SA license. See{' '}
            <Link to="/credits" className="text-brand-light hover:underline">Credits</Link> for attribution.
          </p>
        </div>
      </div>
    </div>
  );
}
