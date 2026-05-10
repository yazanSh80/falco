import { Link } from 'react-router-dom';
import { FalcoLogo } from '../FalcoLogo';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Shield, ExternalLink, Sparkles, Heart } from 'lucide-react';

const quickLinks = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Services', path: '/customer/late' },
  { name: 'Price List', path: '/customer/price-list' },
  { name: 'Demo ✨', path: '/demo' },
];

const customerLinks = [
  { name: 'Sign Up', path: '/signup?role=customer' },
  { name: 'Login', path: '/login' },
  { name: 'Dashboard', path: '/customer/dashboard' },
  { name: 'My Requests', path: '/customer/requests' },
];

const engineerLinks = [
  { name: 'Join as Engineer', path: '/signup?role=engineer' },
  { name: 'Engineer Portal', path: '/engineer/dashboard' },
  { name: 'Available Jobs', path: '/engineer/requests' },
  { name: 'Subscription', path: '/engineer/subscription' },
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-neutral-900 to-neutral-950 text-white">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <FalcoLogo variant="full" size="lg" colorMode="white" />
            <p className="text-neutral-400 mt-4 mb-6 max-w-sm leading-relaxed">
              FalcoElectrec connects customers with verified electrical engineers across Palestine. 
              Fast, reliable, and transparent service platform.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:info@falcoelectrec.ps" 
                 className="flex items-center gap-3 text-neutral-400 hover:text-gold transition-colors">
                <Mail className="w-4 h-4" />
                <span className="text-sm">info@falcoelectrec.ps</span>
              </a>
              <a href="tel:+970599000000" 
                 className="flex items-center gap-3 text-neutral-400 hover:text-gold transition-colors">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+970 599 000 000</span>
              </a>
              <div className="flex items-center gap-3 text-neutral-400">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Birzeit University, Palestine</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="p-2.5 bg-neutral-800 rounded-lg hover:bg-brand hover:scale-110 
                           transition-all duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-neutral-400 hover:text-gold hover:translate-x-1 
                             inline-flex transition-all duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Customers */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              For Customers
            </h4>
            <ul className="space-y-3">
              {customerLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-neutral-400 hover:text-gold hover:translate-x-1 
                             inline-flex transition-all duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Engineers */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              For Engineers
            </h4>
            <ul className="space-y-3">
              {engineerLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path}
                    className="text-neutral-400 hover:text-gold hover:translate-x-1 
                             inline-flex transition-all duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-neutral-500 text-sm">
              <span>© {currentYear} FalcoElectrec. All rights reserved.</span>
            </div>

            {/* Project Info */}
            <div className="flex items-center gap-4 text-neutral-500 text-xs">
              <span className="flex items-center gap-1.5">
                ENCS5200 — Graduation Project
              </span>
              <span className="w-1 h-1 rounded-full bg-neutral-700" />
              <span>Birzeit University</span>
            </div>

            {/* Admin Access */}
            <div className="flex items-center gap-4">
              <Link 
                to="/credits"
                className="flex items-center gap-2 text-neutral-500 hover:text-gold 
                         transition-colors text-sm group"
              >
                <Heart className="w-3 h-3" />
                <span>Credits</span>
              </Link>
              <Link 
                to="/login?next=/admin/dashboard"
                className="flex items-center gap-2 text-neutral-500 hover:text-gold 
                         transition-colors text-sm group"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Portal</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
