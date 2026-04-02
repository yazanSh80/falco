import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import Button from '../../components/ui/button';
import { FalcoLogo } from '../../components/FalcoLogo';
import { useData } from '../../state/DataContext';
import AuthShell from '../../layouts/AuthShell';
import { Clock, CheckCircle, FileText, LogOut, Mail, Phone } from 'lucide-react';

/**
 * EngineerPending Page
 * 
 * Shown to engineers who have registered but are awaiting admin approval.
 * Prevents confusion by clearly communicating the pending status.
 */
export default function EngineerPending() {
  const navigate = useNavigate();
  const { logout, currentUser } = useData();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AuthShell>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <Card className="max-w-lg w-full text-center py-12 px-8 animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <FalcoLogo variant="icon" size="xl" colorMode="brand" />
        </div>

        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center">
            <Clock className="w-10 h-10 text-warning animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-h2 text-text-primary mb-2">
          Account Under Review
        </h1>

        {/* Welcome Message */}
        {currentUser && (
          <p className="text-body text-text-secondary mb-4">
            Welcome, <span className="font-semibold text-text-primary">{currentUser.name}</span>!
          </p>
        )}

        {/* Description */}
        <p className="text-body text-text-muted mb-8">
          Your engineer account is currently being reviewed by our admin team.
          We'll notify you once your account has been approved.
        </p>

        {/* Timeline */}
        <div className="bg-neutral-50 rounded-xl p-6 mb-8">
          <h3 className="text-body-sm font-semibold text-text-primary mb-4 flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            What Happens Next
          </h3>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-body-sm font-medium text-text-primary">Registration Complete</p>
                <p className="text-caption text-text-muted">Your application has been submitted</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-warning flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-body-sm font-medium text-text-primary">Admin Review</p>
                <p className="text-caption text-text-muted">Expected time: up to 48 hours</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-neutral-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-body-sm font-medium text-text-muted">Account Approved</p>
                <p className="text-caption text-text-muted">Start accepting service requests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expected Time */}
        <div className="flex items-center justify-center gap-2 text-body-sm text-warning bg-warning/10 rounded-lg py-3 px-4 mb-6">
          <Clock className="w-4 h-4" />
          <span>Expected approval time: <strong>up to 48 hours</strong></span>
        </div>

        {/* Contact Info */}
        <div className="text-caption text-text-muted mb-8">
          <p className="mb-2">Have questions about your application?</p>
          <div className="flex items-center justify-center gap-4">
            <a href="mailto:support@falcoelectrec.com" className="flex items-center gap-1 text-brand hover:underline">
              <Mail className="w-3 h-3" />
              support@falcoelectrec.com
            </a>
            <span className="text-neutral-300">|</span>
            <a href="tel:+970599000000" className="flex items-center gap-1 text-brand hover:underline">
              <Phone className="w-3 h-3" />
              059-900-0000
            </a>
          </div>
        </div>

        {/* Logout Button */}
        <Button 
          variant="outline" 
          onClick={handleLogout}
          leftIcon={<LogOut className="w-4 h-4" />}
          className="w-full"
        >
          Logout
        </Button>
        </Card>
      </div>
    </AuthShell>
  );
}
