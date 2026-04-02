import { WowCursorBackground } from './effects/WowCursorBackground';

export default function AboutUs() {
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
      <div className="relative z-[2] container mx-auto px-4 py-16 max-w-4xl">
        <h2 className="text-4xl font-bold text-white mb-8">
          About <span className="text-[#D4AF37]">FalcoElectrec</span>
        </h2>
        
        <div className="space-y-6">
          <p className="text-lg text-slate-300 leading-relaxed">
            FalcoElectrec is a digital platform for electrical engineering services across Palestine. 
            We bring together customers and qualified engineers / technicians through a mobile-first 
            web experience focused on locality, reliability, and transparency.
          </p>
          
          <p className="text-lg text-slate-300 leading-relaxed">
            The platform combines technology (mobile & web app), economics (monthly subscriptions & 
            commission on high-value projects), and organization (geographical distribution & standardized 
            pricing) to modernize the service market.
          </p>
          
          <div className="mt-12">
            <h3 className="text-2xl font-semibold text-white mb-6">
              Our <span className="text-[#136F94]">Objectives</span>
            </h3>
            <ul className="space-y-4">
              {[
                'Organize the engineering and technical service market.',
                'Enable fast and reliable customer access to services.',
                'Provide structured job opportunities for engineers and technicians.',
                'Ensure transparent and fair pricing.',
                "Promote engineers' achievements through portfolios."
              ].map((objective, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-3 text-slate-300"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#136F94] flex items-center justify-center text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span className="text-lg">{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
