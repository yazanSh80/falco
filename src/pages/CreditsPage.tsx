/**
 * Credits Page
 * 
 * Purpose: Attribution and licensing information for third-party resources.
 * Required for CC BY-NC-SA licensed effects and academic integrity.
 */

import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Heart, Code, Sparkles, Shield } from 'lucide-react';
import Button from '../components/ui/button';
import { Card, CardTitle, CardDescription } from '../components/ui/card';

export default function CreditsPage() {
  const credits = [
    {
      title: 'Particle Attraction Effect',
      description: 'Interactive particle system that responds to cursor movement, used on the landing page.',
      source: 'threejs-components',
      author: 'Kevin Levron',
      authorUrl: 'https://www.framer.com/marketplace/creator/kevin-levron/',
      license: 'CC BY-NC-SA',
      licenseNote: 'Creative Commons Attribution-NonCommercial-ShareAlike',
      adaptation: 'Adapted for React + TypeScript with custom color scheme and performance optimizations.',
    },
    {
      title: 'Tubes Cursor Effect',
      description: 'Dynamic tubes visualization that follows cursor movement.',
      source: 'threejs-components',
      author: 'Kevin Levron',
      authorUrl: 'https://www.framer.com/marketplace/creator/kevin-levron/',
      license: 'CC BY-NC-SA',
      licenseNote: 'Creative Commons Attribution-NonCommercial-ShareAlike',
      adaptation: 'Adapted for React + TypeScript, used on demo showcase page.',
    },
    {
      title: 'Auth Shell (Ring Animation)',
      description: 'Cinematic dark shell with animated blob/ring effects for login & signup pages.',
      source: 'Custom Implementation',
      author: 'FalcoElectrec Team',
      license: 'MIT',
      adaptation: 'Original CSS animation using conic-gradient rings and backdrop-blur glass-morphism.',
    },
    {
      title: 'WowKPICard (Electric Border)',
      description: 'Premium KPI card with animated SVG turbulence border effect for dashboard highlights.',
      source: 'Custom Implementation',
      author: 'FalcoElectrec Team',
      license: 'MIT',
      adaptation: 'SVG feFilter with animated feTurbulence for dynamic electric border.',
    },
    {
      title: 'WowActionCard (3D Tilt)',
      description: '3D perspective tilt card with spotlight glow that follows cursor movement.',
      source: 'Custom Implementation',
      author: 'FalcoElectrec Team',
      license: 'MIT',
      adaptation: 'Mouse tracking with transform-style: preserve-3d and radial-gradient spotlight.',
    },
    {
      title: 'Effects Toggle System',
      description: 'Global toggle to enable/disable visual effects respecting user preferences.',
      source: 'Custom Implementation',
      author: 'FalcoElectrec Team',
      license: 'MIT',
      adaptation: 'React Context with localStorage persistence and prefers-reduced-motion detection.',
    },
  ];

  const technologies = [
    { name: 'React', url: 'https://react.dev/', license: 'MIT' },
    { name: 'TypeScript', url: 'https://www.typescriptlang.org/', license: 'Apache 2.0' },
    { name: 'Tailwind CSS', url: 'https://tailwindcss.com/', license: 'MIT' },
    { name: 'Vite', url: 'https://vitejs.dev/', license: 'MIT' },
    { name: 'Flask', url: 'https://flask.palletsprojects.com/', license: 'BSD' },
    { name: 'Lucide Icons', url: 'https://lucide.dev/', license: 'ISC' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="text-white/70 hover:text-white mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Credits & Attribution
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            FalcoElectrec is a graduation project by Ahmad SAQER (1210085) at Birzeit University.
            We gratefully acknowledge the following resources and their creators.
          </p>
        </div>

        {/* Visual Effects Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-gold" />
            <h2 className="text-2xl font-semibold text-white">Visual Effects</h2>
          </div>
          
          <div className="grid gap-4">
            {credits.map((credit, index) => (
              <Card key={index} className="bg-white/5 border-white/10">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <CardTitle className="text-white">{credit.title}</CardTitle>
                    <span className="px-2 py-1 text-xs bg-gold/20 text-gold rounded-full">
                      {credit.license}
                    </span>
                  </div>
                  <CardDescription className="text-white/60 mb-4">
                    {credit.description}
                  </CardDescription>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-white/70">
                      <Code className="w-4 h-4 text-brand-light" />
                      <span>Source: {credit.source}</span>
                    </div>
                    
                    {credit.authorUrl ? (
                      <a 
                        href={credit.authorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-brand-light hover:text-brand-accent transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span>Author: {credit.author}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <div className="flex items-center gap-2 text-white/70">
                        <Heart className="w-4 h-4 text-brand-light" />
                        <span>Author: {credit.author}</span>
                      </div>
                    )}
                    
                    {credit.licenseNote && (
                      <div className="flex items-center gap-2 text-white/50 text-xs">
                        <Shield className="w-3 h-3" />
                        <span>{credit.licenseNote}</span>
                      </div>
                    )}
                    
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-white/50 text-xs">
                        <strong>Adaptation:</strong> {credit.adaptation}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Technologies Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-6 h-6 text-brand-light" />
            <h2 className="text-2xl font-semibold text-white">Technologies Used</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {technologies.map((tech, index) => (
              <a
                key={index}
                href={tech.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-brand/30 transition-colors group"
              >
                <span className="text-white font-medium group-hover:text-brand-light transition-colors">
                  {tech.name}
                </span>
                <span className="text-xs text-white/40">{tech.license}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Academic Notice */}
        <section className="mb-12">
          <Card className="bg-gold/10 border-gold/30">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <Shield className="w-8 h-8 text-gold flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gold mb-2">
                    Academic & Non-Commercial Use
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    This project is developed for academic purposes as part of a graduation project 
                    at Birzeit University. Visual effects sourced from third-party creators under 
                    CC BY-NC-SA license are used for non-commercial, educational purposes only. 
                    All attributions are provided in accordance with license requirements.
                  </p>
                  <p className="text-white/50 text-xs mt-3">
                    For any licensing inquiries, please contact the project team.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-white/10">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} FalcoElectrec — Graduation Project
          </p>
          <p className="text-white/30 text-xs mt-2">
            Built with ❤️ by Ahmad SAQER (1210085)
          </p>
        </footer>
      </div>
    </div>
  );
}
