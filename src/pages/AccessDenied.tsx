import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useData } from '../state/DataContext';
import { getDashboardPath } from '../components/ProtectedRoute';
import AuthShell from '../layouts/AuthShell';

export default function AccessDenied() {
  const { currentUser } = useData();
  
  const dashboardPath = currentUser ? getDashboardPath(currentUser) : '/';
  
  return (
    <AuthShell>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-error/10 p-6 rounded-full mb-6">
          <ShieldX className="w-16 h-16 text-error" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">403 - Access Denied</h1>
        <p className="text-white/60 mb-8 max-w-md">
          You don't have permission to access this page. 
          {currentUser && (
            <span> Your current role is <strong className="text-gold capitalize">{currentUser.role}</strong>.</span>
          )}
        </p>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Go Back
          </Button>
          
          <Link to={dashboardPath}>
            <Button leftIcon={<Home className="w-4 h-4" />}>
              {currentUser ? 'Go to Dashboard' : 'Go Home'}
            </Button>
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
