import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useData } from '../state/DataContext';
import { AlertCircle, Info, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import AuthShell from '../layouts/AuthShell';

// DEMO ADMIN CONFIG
const ADMIN_DEMO_EMAIL = 'ahmadsaqer818@gmail.com';

/**
 * Get redirect path based on user role and verification status
 */
function getRedirectPath(user: { role: string; verification_status?: string | null }, nextUrl?: string | null): string {
  // If there's a ?next= param and user has correct role, use it
  if (nextUrl) {
    if (nextUrl.startsWith('/admin') && user.role === 'admin') return nextUrl;
    if (nextUrl.startsWith('/engineer') && user.role === 'engineer') return nextUrl;
    if (nextUrl.startsWith('/customer') && user.role === 'customer') return nextUrl;
  }
  
  // Default role-based redirect
  if (user.role === 'admin') return '/admin/dashboard';
  if (user.role === 'engineer') {
    return user.verification_status !== 'approved' ? '/engineer/pending' : '/engineer/dashboard';
  }
  return '/customer/dashboard';
}

/**
 * LoginForm Component
 * 
 * Premium login experience with Auth Ring visual effect.
 * Handles email + password authentication ONLY.
 * Role is determined by backend, NOT selected by user.
 */
export default function LoginForm() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isApiAvailable } = useData();
  
  const nextUrl = searchParams.get('next');
  const registeredRole = searchParams.get('registered');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success && result.user) {
        const redirectPath = getRedirectPath(result.user, nextUrl);
        console.log('[LOGIN] Redirecting to:', redirectPath);
        navigate(redirectPath);
      } else {
        setError(result.error || 'Invalid email or password');
      }
    } catch (err) {
      console.error('[LOGIN] Error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill for demo accounts
  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <AuthShell>
      <h2 className="text-2xl font-bold text-white text-center mb-2">Welcome Back</h2>
      <p className="text-white/60 text-center mb-6">Sign in to your FalcoElectrec account</p>
      
      {/* Demo Mode Notice */}
      {!isApiAvailable && (
        <div className="mb-6 p-4 bg-brand/10 border border-brand/20 rounded-2xl">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-brand-light mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-brand-light">Demo Mode Active</p>
              <p className="text-white/50 mt-1 text-xs">Quick-fill credentials:</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button 
                  type="button"
                  onClick={() => fillDemoAccount('customer@test.com', 'Pass123!')}
                  className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-white/70 transition-all hover:scale-105"
                >
                  Customer
                </button>
                <button 
                  type="button"
                  onClick={() => fillDemoAccount('engineer@test.com', 'Pass123!')}
                  className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-white/70 transition-all hover:scale-105"
                >
                  Engineer
                </button>
                <button 
                  type="button"
                  onClick={() => fillDemoAccount('admin@test.com', 'Pass123!')}
                  className="px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-white/70 transition-all hover:scale-105"
                >
                  Admin
                </button>
                <button 
                  type="button"
                  onClick={() => fillDemoAccount(ADMIN_DEMO_EMAIL, 'saqer123')}
                  className="px-3 py-1.5 text-xs bg-gold/20 border border-gold/30 rounded-full hover:bg-gold/30 text-gold transition-all hover:scale-105 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Super Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-error/10 border border-error/20 rounded-2xl">
          <AlertCircle className="h-5 w-5 text-error flex-shrink-0" />
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      {registeredRole === 'customer' && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-2xl">
          <Info className="h-5 w-5 text-success flex-shrink-0" />
          <p className="text-sm text-white/70">
            Customer account created. Sign in with the same email and password.
          </p>
        </div>
      )}
      
      {/* Login Form */}
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-gold transition-colors" />
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 
                       focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/30 focus:bg-white/[0.07]
                       transition-all duration-300 disabled:opacity-50"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-gold transition-colors" />
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 
                       focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/30 focus:bg-white/[0.07]
                       transition-all duration-300 disabled:opacity-50"
            />
          </div>
        </div>
        
        {/* Submit Button - Gradient with shimmer */}
        <button 
          type="submit" 
          disabled={loading}
          className="relative w-full py-4 rounded-2xl font-semibold text-slate-900 overflow-hidden
                   bg-gradient-to-r from-gold via-amber-400 to-gold bg-[length:200%_100%]
                   hover:bg-[position:100%_0] transition-all duration-500
                   disabled:opacity-50 disabled:cursor-not-allowed
                   shadow-lg shadow-gold/25 hover:shadow-gold/40
                   flex items-center justify-center gap-2 group"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent 
                        translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          
          {loading ? (
            <span className="flex items-center gap-2 relative z-10">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : (
            <span className="flex items-center gap-2 relative z-10">
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </button>
      </form>
      
      {/* Footer Links */}
      <div className="mt-8 text-center space-y-4">
        <p className="text-white/50 text-sm">
          Don't have an account?{' '}
          <Link to="/signup?role=customer" className="text-gold font-medium hover:text-gold-light transition-colors hover:underline">
            Create Customer Account
          </Link>
        </p>
        
        <div className="flex items-center justify-center gap-4 text-xs text-white/30">
          <Link to="/demo" className="hover:text-gold/70 transition-colors flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            View Demo
          </Link>
          <span>•</span>
          <Link to="/credits" className="hover:text-white/50 transition-colors">
            Credits
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
