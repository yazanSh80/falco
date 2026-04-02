/**
 * AttractionBackground Component
 * 
 * Purpose: Premium particle attraction effect for landing page background.
 * A canvas-based interactive particle system that responds to cursor movement.
 * 
 * UX Rule: Use ONCE per page only (landing page). Do not stack with other heavy effects.
 * 
 * Performance Notes:
 * - Automatically disabled on mobile/touch devices
 * - Respects prefers-reduced-motion
 * - Uses requestAnimationFrame for smooth 60fps
 * - Cleans up all resources on unmount
 * 
 * Reduced Motion Handling:
 * - Falls back to static gradient background
 * 
 * Attribution/License:
 * - Particle attraction concept inspired by threejs-components (CC BY-NC-SA)
 * - Adapted for React + TypeScript
 * - Non-commercial / academic use only
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useEffectsPreference } from '../../utils/effects';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
  radius: number;
  color: string;
}

interface AttractionBackgroundProps {
  /** Number of particles (default: 80) */
  particleCount?: number;
  /** Colors for particles (default: brand colors) */
  colors?: string[];
  /** Connection line distance (default: 120) */
  connectionDistance?: number;
  /** Mouse attraction radius (default: 150) */
  attractionRadius?: number;
  /** Mouse attraction strength (default: 0.08) */
  attractionStrength?: number;
  /** Return to origin strength (default: 0.02) */
  returnStrength?: number;
  /** Particle opacity (default: 0.6) */
  particleOpacity?: number;
  /** Line opacity (default: 0.15) */
  lineOpacity?: number;
  /** Additional className for container */
  className?: string;
}

const AttractionBackground: React.FC<AttractionBackgroundProps> = ({
  particleCount = 80,
  colors = ['#D4AF37', '#136F94', '#1DA3C6', '#F4D675', '#0F506B'],
  connectionDistance = 120,
  attractionRadius = 150,
  attractionStrength = 0.08,
  returnStrength = 0.02,
  particleOpacity = 0.6,
  lineOpacity = 0.15,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);
  const { canUseHeavyEffects, prefersReducedMotion } = useEffectsPreference();

  // Initialize particles
  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({
        x,
        y,
        vx: 0,
        vy: 0,
        originX: x,
        originY: y,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    particlesRef.current = particles;
  }, [particleCount, colors]);

  // Animation loop
  const animate = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    const particles = particlesRef.current;
    const mouse = mouseRef.current;

    // Update and draw particles
    particles.forEach((particle, i) => {
      // Mouse attraction
      const dx = mouse.x - particle.x;
      const dy = mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < attractionRadius) {
        const force = (attractionRadius - distance) / attractionRadius;
        particle.vx += dx * attractionStrength * force;
        particle.vy += dy * attractionStrength * force;
      }
      
      // Return to origin
      particle.vx += (particle.originX - particle.x) * returnStrength;
      particle.vy += (particle.originY - particle.y) * returnStrength;
      
      // Apply friction
      particle.vx *= 0.95;
      particle.vy *= 0.95;
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particleOpacity;
      ctx.fill();
      
      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j];
        const cdx = particle.x - other.x;
        const cdy = particle.y - other.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        
        if (cdist < connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = particle.color;
          ctx.globalAlpha = lineOpacity * (1 - cdist / connectionDistance);
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });
    
    ctx.globalAlpha = 1;
    animationRef.current = requestAnimationFrame(() => animate(ctx, width, height));
  }, [attractionRadius, attractionStrength, returnStrength, connectionDistance, particleOpacity, lineOpacity]);

  useEffect(() => {
    if (!canUseHeavyEffects || prefersReducedMotion) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };
    
    resize();
    window.addEventListener('resize', resize);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Start animation
    animate(ctx, canvas.width, canvas.height);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationRef.current);
    };
  }, [canUseHeavyEffects, prefersReducedMotion, initParticles, animate]);

  // Fallback gradient for reduced motion or mobile
  if (!canUseHeavyEffects || prefersReducedMotion) {
    return (
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-brand-dark via-brand to-neutral-900 ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${className}`}
      style={{ background: 'linear-gradient(135deg, #0b1220 0%, #0F506B 50%, #0b1220 100%)' }}
      aria-hidden="true"
    />
  );
};

export default AttractionBackground;
