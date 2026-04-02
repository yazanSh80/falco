/**
 * Demo Mode Badge Component
 * 
 * Shows when admin pages are using mock data
 * Disappears when DEMO_MODE is disabled
 */

import { Badge } from '../../components/ui/badge';
import { DEMO_MODE } from '../../services/admin';
import { AlertCircle } from 'lucide-react';

export default function DemoModeBadge() {
  if (!DEMO_MODE) return null;

  return (
    <div className="fixed top-20 right-4 z-50">
      <Badge variant="warning" className="flex items-center gap-2 shadow-lg">
        <AlertCircle className="w-3 h-3" />
        Demo Data
      </Badge>
    </div>
  );
}
