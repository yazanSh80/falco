import { Zap, ShieldCheck, Users, CreditCard, Star, Clock } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Fast Requests',
    description: 'Submit service requests in seconds. Get matched with available engineers in your area instantly.',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Engineers',
    description: 'Every engineer is vetted and approved by our admin team. Work with trusted professionals only.',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: Users,
    title: 'Admin Oversight',
    description: 'Platform administrators monitor all activities, handle disputes, and ensure quality service.',
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-50',
  },
  {
    icon: CreditCard,
    title: 'Secure Transactions',
    description: 'Transparent pricing with secure payment tracking. Commission applied only above ₪700.',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-50',
  },
  {
    icon: Star,
    title: 'Reviews & Ratings',
    description: 'Rate your experience and read reviews from other customers. Build trust through feedback.',
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-50',
  },
  {
    icon: Clock,
    title: 'Real-time Updates',
    description: 'Track your request status in real-time. Get notifications at every step of the process.',
    color: 'from-cyan-500 to-sky-500',
    bgColor: 'bg-cyan-50',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-brand/10 text-brand rounded-full text-sm font-medium mb-4">
            Platform Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Everything You Need,{' '}
            <span className="bg-gradient-to-r from-brand to-brand-light bg-clip-text text-transparent">
              All in One Place
            </span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            FalcoElectrec provides a comprehensive platform for electrical services, 
            connecting customers with certified professionals seamlessly.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-white rounded-2xl p-6 shadow-card border border-neutral-100 
                         hover:shadow-xl hover:border-transparent hover:-translate-y-1 
                         transition-all duration-300 overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative">
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg mb-4
                               group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Text */}
                <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-brand transition-colors">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Decorative corner */}
              <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br ${feature.color} 
                             rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-2xl`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
