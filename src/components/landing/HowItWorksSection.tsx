import { ClipboardList, UserCheck, Wrench, Star, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: ClipboardList,
    title: 'Create Request',
    description: 'Customer submits a service request with details and location',
    color: 'from-brand to-brand-light',
  },
  {
    number: '02',
    icon: UserCheck,
    title: 'Engineer Accepts',
    description: 'Verified engineer in your area accepts the job',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    number: '03',
    icon: Wrench,
    title: 'Work Completed',
    description: 'Engineer completes the job professionally',
    color: 'from-amber-500 to-orange-500',
  },
  {
    number: '04',
    icon: Star,
    title: 'Review & Payment',
    description: 'Customer reviews and payment is processed',
    color: 'from-violet-500 to-purple-500',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-gold/20 text-gold-dark rounded-full text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            How It{' '}
            <span className="bg-gradient-to-r from-gold to-amber-500 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Get electrical services in four simple steps. Fast, reliable, and transparent.
          </p>
        </div>

        {/* Steps - Horizontal on desktop */}
        <div className="relative">
          {/* Connection line - desktop only */}
          <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-brand via-emerald-500 via-amber-500 to-violet-500 opacity-20" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative group">
                {/* Step Card */}
                <div className="bg-white rounded-2xl p-6 shadow-card border border-neutral-100 
                              hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
                  {/* Step Number Badge */}
                  <div className={`absolute -top-3 left-6 inline-flex items-center justify-center 
                                  w-8 h-8 rounded-full bg-gradient-to-br ${step.color} 
                                  text-white text-sm font-bold shadow-lg`}>
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${step.color} 
                                 shadow-lg mb-4 mt-3 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector - visible on larger screens between items */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-16 -right-4 z-10 items-center justify-center 
                                w-8 h-8 rounded-full bg-white shadow-md border border-neutral-100">
                    <ArrowRight className="w-4 h-4 text-neutral-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-text-secondary mb-4">
            Ready to get started? Join thousands of satisfied customers.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>500+ Active Engineers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span>10,000+ Jobs Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span>4.9 Average Rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
