import { Link } from 'react-router-dom';
import { Star, MapPin, Award, TrendingUp } from 'lucide-react';

const stats = [
  { value: '500+', label: 'Verified Engineers', icon: Award },
  { value: '10K+', label: 'Jobs Completed', icon: TrendingUp },
  { value: '4.9', label: 'Average Rating', icon: Star },
  { value: '50+', label: 'Service Areas', icon: MapPin },
];

const testimonials = [
  {
    name: 'Ahmad K.',
    role: 'Homeowner',
    location: 'Ramallah',
    text: 'Found a reliable electrician in minutes. The whole process was smooth and professional.',
    rating: 5,
    avatar: 'A',
  },
  {
    name: 'Sara M.',
    role: 'Business Owner',
    location: 'Hebron',
    text: 'Excellent platform for finding vetted engineers. Saved me time and gave me peace of mind.',
    rating: 5,
    avatar: 'S',
  },
  {
    name: 'Mahmoud H.',
    role: 'Engineer',
    location: 'Nablus',
    text: 'Great platform to grow my business. The subscription model is fair and the leads are quality.',
    rating: 5,
    avatar: 'M',
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Stats Grid */}
        <div className="bg-gradient-to-r from-brand via-brand-dark to-brand rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden mb-20">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-gold rounded-full blur-3xl" />
          </div>
          
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl 
                              bg-white/10 backdrop-blur-sm mb-3">
                  <stat.icon className="w-6 h-6 text-gold" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-white/70 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-success/10 text-success rounded-full text-sm font-medium mb-4">
            Trusted by Thousands
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            What Our{' '}
            <span className="bg-gradient-to-r from-success to-emerald-500 bg-clip-text text-transparent">
              Users Say
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.name}
              className="bg-white rounded-2xl p-6 shadow-card border border-neutral-100 
                       hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-text-secondary mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-light 
                              flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-medium text-text-primary text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-text-muted text-xs flex items-center gap-1">
                    <span>{testimonial.role}</span>
                    <span>•</span>
                    <MapPin className="w-3 h-3" />
                    <span>{testimonial.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
