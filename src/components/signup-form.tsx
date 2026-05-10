import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Upload, User, Mail, Phone, MapPin, Lock, Briefcase, Calendar, CheckCircle, ArrowRight, ArrowLeft, AlertCircle, Wrench, Home, Sparkles } from 'lucide-react';
import { useData } from '../state/DataContext';
import { DEMO_MODE } from '../config/appMode';
import AuthShell from '../layouts/AuthShell';
import { WEST_BANK_CITIES, WEST_BANK_CITY_AREAS } from '../data/locations';

/**
 * SignUpForm Component
 * 
 * Premium signup experience with Auth Ring visual effect.
 * Multi-step form: Role Selection -> Personal Info -> Location & Security -> Professional (Engineers only)
 * Role selection is REQUIRED - this determines the user type.
 */
export default function SignUpForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, isApiAvailable } = useData();
  
  // Get role from URL query param (e.g., /signup?role=engineer)
  const initialRole = searchParams.get('role') === 'engineer' ? 'engineer' : 
                      searchParams.get('role') === 'customer' ? 'customer' : null;
  
  const [role, setRole] = useState<'customer'|'engineer'|null>(initialRole);
  const [step, setStep] = useState(role ? 1 : 0); // Step 0 = role selection
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '', city: '', area: '', specialization: '', experience: '', cv: '', certificate: ''
  });

  // Validation helpers
  const validateName = (name: string): string | null => {
    if (!name || name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.length > 100) return 'Name must be less than 100 characters';
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone) return null; // Phone is optional
    const cleaned = phone.replace(/[\s-]/g, '');
    if (!/^05[0-9]{8}$/.test(cleaned)) {
      return 'Phone must be 10 digits starting with 05 (e.g., 0591234567)';
    }
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/\d/.test(password)) return 'Password must contain at least one number';
    return null;
  };

  // Update step when role changes
  useEffect(() => {
    if (role && step === 0) {
      setStep(1);
    }
  }, [role, step]);

  const update = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value, ...(key === 'city' ? { area: '' } : {}) }));
    // Clear field error when user starts typing
    if (fieldErrors[key]) {
      setFieldErrors(prev => ({ ...prev, [key]: '', ...(key === 'city' ? { area: '' } : {}) }));
    }
  };

  // Validate current step fields
  const validateStep = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 1) {
      const nameError = validateName(form.name);
      const emailError = validateEmail(form.email);
      const phoneError = validatePhone(form.phone);
      
      if (nameError) errors.name = nameError;
      if (emailError) errors.email = emailError;
      if (phoneError) errors.phone = phoneError;
    }
    
    if (step === 2) {
      if (!form.city || form.city.trim().length < 2) errors.city = 'City is required';
      if (!form.area || form.area.trim().length < 2) errors.area = 'Area is required';
      
      const passwordError = validatePassword(form.password);
      if (passwordError) errors.password = passwordError;
      
      if (form.password !== form.confirm) {
        errors.confirm = 'Passwords do not match';
      }
    }
    
    if (step === 3 && role === 'engineer') {
      if (!form.specialization) errors.specialization = 'Specialization is required';
      if (!form.experience) errors.experience = 'Years of experience is required';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setStep(s => s + 1);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    if (!validateStep()) return;
    if (!role) return;
    
    setLoading(true);
    setError('');

    // Build registration payload - ensure all required fields
    const userData = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: role,
      phone: form.phone ? form.phone.replace(/[\s-]/g, '') : undefined,
      city: form.city?.trim() || undefined,
      area: form.area?.trim() || undefined,
      ...(role === 'engineer' && {
        specialization: form.specialization,
        years_exp: parseInt(form.experience) || 0,
      }),
    };

    // DEBUG LOG (temporary)
    console.log('[REGISTER] Submitting registration:', { ...userData, password: '***' });

    try {
      const result = await register(userData);
      console.log('[REGISTER] Result:', result);
      
      if (result.success) {
        setSubmitted(true);
        
        // Different redirect behavior for customers vs engineers
        if (role === 'customer') {
          // Customers can login immediately
          setTimeout(() => navigate('/customer/dashboard'), 2000);
        } else if (role === 'engineer') {
          // Engineers go to their dashboard (shows pending status)
          setTimeout(() => navigate('/engineer/dashboard'), 2000);
        }
      } else {
        // Parse error message
        const errorMsg = result.error || 'Registration failed. Please try again.';
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('[REGISTER] Error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordMismatch = form.confirm.length > 0 && form.password !== form.confirm;
  const maxSteps = role === 'engineer' ? 3 : 2;
  const areaOptions = form.city ? WEST_BANK_CITY_AREAS[form.city] || [] : [];

  const canProceed = () => {
    if (step === 0) return role !== null;
    if (step === 1) return form.name.length >= 2 && form.email.includes('@');
    if (step === 2) return Boolean(form.city && form.area && !validatePassword(form.password) && form.confirm && !passwordMismatch);
    if (step === 3 && role === 'engineer') return form.specialization && form.experience;
    return true;
  };

  // Progress steps
  const steps = role === 'engineer' 
    ? ['Personal Info', 'Location & Security', 'Professional']
    : ['Personal Info', 'Location & Security'];

  return (
    <AuthShell showLogo={step === 0}>
      {/* Step 0: Header for other steps */}
      {step > 0 && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {role === 'engineer' ? 'Join as Engineer' : 'Create Account'}
          </h2>
          <p className="text-white/60 mt-1">Step {step} of {maxSteps}</p>
        </div>
      )}

      <h2 className="text-2xl font-bold text-white text-center mb-2">Create Your Account</h2>
      <p className="text-white/60 text-center mb-6">
        {role ? `Join FalcoElectrec as ${role === 'customer' ? 'a Customer' : 'an Engineer'}` : 'Choose how you want to use FalcoElectrec'}
      </p>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 bg-error/10 border border-error/30 rounded-xl">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0" />
            <p className="text-sm text-error">{error}</p>
            {form.email && error.toLowerCase().includes('already') && (
              <Link
                to={`/login?email=${encodeURIComponent(form.email.trim().toLowerCase())}`}
                className="ml-auto text-sm font-medium text-gold hover:text-gold-light hover:underline"
              >
                Sign in
              </Link>
            )}
          </div>
        )}

      {/* Debug: Show if using DEMO_MODE or Live API */}
      <div className="mb-6 p-3 rounded-lg text-xs" style={{
        backgroundColor: DEMO_MODE ? '#fee2e2' : '#dcfce7',
        color: DEMO_MODE ? '#991b1b' : '#166534',
        border: `1px solid ${DEMO_MODE ? '#fca5a5' : '#86efac'}`
      }}>
        {DEMO_MODE ? (
          <>⚠️ DEMO MODE: Data will NOT be saved to database</>
        ) : (
          <>✓ LIVE MODE: Data will be saved to database (API: {import.meta.env.VITE_API_URL})</>
        )}
      </div>

      {/* Step 0: Role Selection (REQUIRED) */}
      {step === 0 && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-center text-sm text-white/60 font-medium">
            I want to join as:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Card */}
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`p-5 rounded-xl border-2 transition-all text-left ${
                role === 'customer'
                  ? 'border-brand bg-brand/10 ring-2 ring-brand/30'
                  : 'border-white/10 hover:border-white/30 bg-white/5'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                role === 'customer' ? 'bg-brand text-white' : 'bg-white/10 text-white/60'
              }`}>
                <Home className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white mb-1">Customer</h3>
              <p className="text-xs text-white/50">
                Find and hire verified engineers
              </p>
              {role === 'customer' && (
                <div className="flex items-center gap-1 mt-2 text-brand-light text-xs font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Selected
                </div>
              )}
            </button>

            {/* Engineer Card */}
            <button
              type="button"
              onClick={() => setRole('engineer')}
              className={`p-5 rounded-xl border-2 transition-all text-left ${
                role === 'engineer'
                  ? 'border-gold bg-gold/10 ring-2 ring-gold/30'
                  : 'border-white/10 hover:border-white/30 bg-white/5'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                role === 'engineer' ? 'bg-gold text-slate-900' : 'bg-white/10 text-white/60'
              }`}>
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white mb-1">Engineer</h3>
              <p className="text-xs text-white/50">
                Offer your services & grow
              </p>
              {role === 'engineer' && (
                <div className="flex items-center gap-1 mt-2 text-gold text-xs font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Selected
                </div>
              )}
            </button>
          </div>

          <Button
            type="button"
            className="w-full mt-4 bg-gradient-to-r from-gold to-gold-light text-slate-900 font-semibold hover:from-gold-light hover:to-gold"
            disabled={!role}
            onClick={() => setStep(1)}
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Login Link */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-sm text-white/60">
              Already have an account?{' '}
              <Link to="/login" className="text-gold font-medium hover:text-gold-light transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Progress Steps (only show after role selection) */}
      {step > 0 && role && (
        <div className="mb-6 flex items-center justify-between">
          {steps.map((label, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step > index + 1 
                    ? 'bg-success text-white' 
                    : step === index + 1 
                      ? 'bg-gold text-slate-900' 
                      : 'bg-white/10 text-white/50'
                }`}>
                  {step > index + 1 ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                <span className={`text-[10px] mt-1 ${step >= index + 1 ? 'text-white/80' : 'text-white/40'}`}>
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > index + 1 ? 'bg-success' : 'bg-white/10'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Form (only show after role selection) */}
      {step > 0 && role && (
      <form onSubmit={submit}>
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  required 
                  value={form.name} 
                  onChange={e => update('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                />
              </div>
              {fieldErrors.name && <p className="text-xs text-error mt-1">{fieldErrors.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="email"
                  required 
                  value={form.email} 
                  onChange={e => update('email', e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                />
              </div>
              {fieldErrors.email && <p className="text-xs text-error mt-1">{fieldErrors.email}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  value={form.phone} 
                  onChange={e => update('phone', e.target.value)}
                  placeholder="05XXXXXXXX"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                />
              </div>
              <p className="text-xs text-white/40 mt-1">Palestinian mobile: 10 digits starting with 05</p>
              {fieldErrors.phone && <p className="text-xs text-error mt-1">{fieldErrors.phone}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Location & Security */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <select
                    required 
                    value={form.city} 
                    onChange={e => update('city', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                  >
                    <option value="" className="bg-slate-900">Select city...</option>
                    {WEST_BANK_CITIES.map(city => (
                      <option key={city} value={city} className="bg-slate-900">{city}</option>
                    ))}
                  </select>
                </div>
                {fieldErrors.city && <p className="text-xs text-error mt-1">{fieldErrors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Area</label>
                <select
                  required 
                  value={form.area} 
                  onChange={e => update('area', e.target.value)}
                  disabled={!form.city}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all disabled:opacity-50"
                >
                  <option value="" className="bg-slate-900">
                    {form.city ? 'Select area or village...' : 'Select city first'}
                  </option>
                  {areaOptions.map(area => (
                    <option key={area} value={area} className="bg-slate-900">{area}</option>
                  ))}
                </select>
                {fieldErrors.area && <p className="text-xs text-error mt-1">{fieldErrors.area}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="password"
                  required 
                  value={form.password} 
                  onChange={e => update('password', e.target.value)}
                  placeholder="Min 8 chars, Aa + number"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                />
              </div>
              <p className="text-xs text-white/40 mt-1">Use at least 8 characters with uppercase, lowercase, and a number.</p>
              {fieldErrors.password && <p className="text-xs text-error mt-1">{fieldErrors.password}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="password"
                  required 
                  value={form.confirm} 
                  onChange={e => update('confirm', e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                />
              </div>
              {(fieldErrors.confirm || passwordMismatch) && (
                <p className="text-xs text-error mt-1">{fieldErrors.confirm || 'Passwords do not match'}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Professional (Engineers only) */}
        {step === 3 && role === 'engineer' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Specialization</label>
              <select 
                required 
                value={form.specialization} 
                onChange={e => update('specialization', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
              >
                <option value="" className="bg-slate-900">Select your specialization...</option>
                <option value="Electrical" className="bg-slate-900">Electrical</option>
                <option value="A/C Electrical" className="bg-slate-900">A/C Electrical</option>
                <option value="Low Current" className="bg-slate-900">Low Current</option>
                <option value="Cameras / Networking" className="bg-slate-900">Cameras / Networking</option>
                <option value="Fiber" className="bg-slate-900">Fiber</option>
                <option value="Smart Systems" className="bg-slate-900">Smart Systems</option>
                <option value="Solar" className="bg-slate-900">Solar</option>
                <option value="Special Electrical Works" className="bg-slate-900">Special Electrical Works</option>
              </select>
              {fieldErrors.specialization && <p className="text-xs text-error mt-1">{fieldErrors.specialization}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Years of Experience</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="number"
                  min={0}
                  required 
                  value={form.experience} 
                  onChange={e => update('experience', e.target.value)}
                  placeholder="e.g., 5"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition-all"
                />
              </div>
              {fieldErrors.experience && <p className="text-xs text-error mt-1">{fieldErrors.experience}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-left">
                <Upload className="w-5 h-5 text-white/60 mb-2" />
                <p className="text-sm text-white/80 font-medium">Upload CV</p>
                <p className="text-xs text-white/40">PDF, max 5MB</p>
              </button>
              <button type="button" className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-left">
                <Upload className="w-5 h-5 text-white/60 mb-2" />
                <p className="text-sm text-white/80 font-medium">Certificate</p>
                <p className="text-xs text-white/40">Required</p>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 ? (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setStep(s => s - 1)}
              disabled={loading}
              className="border-white/20 text-white/70 hover:text-white hover:border-white/40"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          ) : step === 1 && !initialRole ? (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => { setStep(0); setRole(null); setFieldErrors({}); }}
              disabled={loading}
              className="border-white/20 text-white/70 hover:text-white hover:border-white/40"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Role
            </Button>
          ) : null}
          
          {step < maxSteps ? (
            <Button 
              type="button" 
              className="flex-1 bg-gradient-to-r from-gold to-gold-light text-slate-900 font-semibold hover:from-gold-light hover:to-gold" 
              onClick={handleNextStep}
              disabled={!canProceed()}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-gold to-gold-light text-slate-900 font-semibold hover:from-gold-light hover:to-gold" 
              disabled={loading}
              loading={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          )}
        </div>

        {/* Success Messages */}
        {submitted && !passwordMismatch && role === 'engineer' && (
          <div className="mt-6 p-4 bg-brand/10 border border-brand/20 rounded-2xl animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <p className="font-semibold text-success">Account Created!</p>
            </div>
            <p className="text-sm text-white/60">
              Your engineer account is pending admin approval. Redirecting...
            </p>
          </div>
        )}
        
        {submitted && !passwordMismatch && role === 'customer' && (
          <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-2xl animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-success" />
              <p className="font-semibold text-success">Account Created!</p>
            </div>
            <p className="text-sm text-white/60">
              Your email is ready for login. Redirecting to your dashboard...
            </p>
          </div>
        )}

        {/* Login Link */}
        {!submitted && (
          <div className="text-center mt-6">
            <p className="text-sm text-white/50">
              Already have an account?{' '}
              <Link
                to={`/login${form.email ? `?email=${encodeURIComponent(form.email.trim().toLowerCase())}` : ''}`}
                className="text-gold font-medium hover:text-gold-light transition-colors hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}
      </form>
      )}
    </AuthShell>
  );
}
