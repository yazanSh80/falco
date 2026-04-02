import React from 'react';
import clsx from 'clsx';

// Types
export type RequestStatus = 
  | 'pending' 
  | 'approved' 
  | 'in_progress' 
  | 'completed' 
  | 'rejected' 
  | 'cancelled';

interface TimelineStep {
  status: RequestStatus;
  label: string;
  timestamp?: string;
  description?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface StatusTimelineProps {
  currentStatus: RequestStatus;
  steps?: TimelineStep[];
  variant?: 'horizontal' | 'vertical';
  showTimestamps?: boolean;
  className?: string;
}

// Default workflow steps
const defaultSteps: Record<RequestStatus, { label: string; order: number }> = {
  pending: { label: 'Pending', order: 1 },
  approved: { label: 'Approved', order: 2 },
  in_progress: { label: 'In Progress', order: 3 },
  completed: { label: 'Completed', order: 4 },
  rejected: { label: 'Rejected', order: -1 },
  cancelled: { label: 'Cancelled', order: -1 },
};

// Status colors
const statusColors: Record<string, { bg: string; text: string; ring: string }> = {
  completed: { bg: 'bg-success', text: 'text-success', ring: 'ring-success/20' },
  current: { bg: 'bg-brand', text: 'text-brand', ring: 'ring-brand/20' },
  pending: { bg: 'bg-neutral-300', text: 'text-neutral-400', ring: 'ring-neutral-200' },
  rejected: { bg: 'bg-error', text: 'text-error', ring: 'ring-error/20' },
  cancelled: { bg: 'bg-neutral-400', text: 'text-neutral-500', ring: 'ring-neutral-200' },
};

// Icons
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Generate steps from current status
const generateSteps = (currentStatus: RequestStatus): TimelineStep[] => {
  // Handle terminal states
  if (currentStatus === 'rejected' || currentStatus === 'cancelled') {
    return [
      { 
        status: 'pending', 
        label: defaultSteps.pending.label, 
        isCompleted: true, 
        isCurrent: false 
      },
      { 
        status: currentStatus, 
        label: defaultSteps[currentStatus].label, 
        isCompleted: false, 
        isCurrent: true 
      },
    ];
  }

  const currentOrder = defaultSteps[currentStatus].order;
  const normalFlow: RequestStatus[] = ['pending', 'approved', 'in_progress', 'completed'];
  
  return normalFlow.map(status => ({
    status,
    label: defaultSteps[status].label,
    isCompleted: defaultSteps[status].order < currentOrder,
    isCurrent: status === currentStatus,
  }));
};

// Horizontal Timeline
const HorizontalTimeline: React.FC<{
  steps: TimelineStep[];
  showTimestamps: boolean;
}> = ({ steps, showTimestamps }) => (
  <div className="w-full">
    <div className="flex items-center justify-between relative">
      {/* Connection line */}
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-neutral-200" />
      
      {steps.map((step, index) => {
        const isTerminal = step.status === 'rejected' || step.status === 'cancelled';
        let colorKey = 'pending';
        if (step.isCompleted) colorKey = 'completed';
        else if (step.isCurrent) colorKey = isTerminal ? step.status : 'current';
        
        const colors = statusColors[colorKey];
        
        return (
          <div key={step.status} className="flex flex-col items-center relative z-10">
            {/* Step circle */}
            <div className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center ring-4 transition-all duration-300',
              colors.bg,
              colors.ring,
              step.isCurrent && 'scale-110'
            )}>
              {step.isCompleted ? (
                <CheckIcon />
              ) : isTerminal ? (
                <XIcon />
              ) : (
                <span className="text-xs font-bold text-white">{index + 1}</span>
              )}
            </div>
            
            {/* Label */}
            <span className={clsx(
              'mt-2 text-body-sm font-medium whitespace-nowrap',
              step.isCurrent ? colors.text : step.isCompleted ? 'text-text-primary' : 'text-text-muted'
            )}>
              {step.label}
            </span>
            
            {/* Timestamp */}
            {showTimestamps && step.timestamp && (
              <span className="text-tiny text-text-muted mt-0.5">
                {step.timestamp}
              </span>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

// Vertical Timeline
const VerticalTimeline: React.FC<{
  steps: TimelineStep[];
  showTimestamps: boolean;
}> = ({ steps, showTimestamps }) => (
  <div className="space-y-0">
    {steps.map((step, index) => {
      const isLast = index === steps.length - 1;
      const isTerminal = step.status === 'rejected' || step.status === 'cancelled';
      let colorKey = 'pending';
      if (step.isCompleted) colorKey = 'completed';
      else if (step.isCurrent) colorKey = isTerminal ? step.status : 'current';
      
      const colors = statusColors[colorKey];

      return (
        <div key={step.status} className="flex gap-4">
          {/* Left side: indicator and line */}
          <div className="flex flex-col items-center">
            <div className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center ring-4 flex-shrink-0 transition-all duration-300',
              colors.bg,
              colors.ring,
              step.isCurrent && 'scale-110'
            )}>
              {step.isCompleted ? (
                <CheckIcon />
              ) : isTerminal ? (
                <XIcon />
              ) : (
                <span className="text-xs font-bold text-white">{index + 1}</span>
              )}
            </div>
            {!isLast && (
              <div className={clsx(
                'w-0.5 flex-1 min-h-[40px]',
                step.isCompleted ? 'bg-success' : 'bg-neutral-200'
              )} />
            )}
          </div>
          
          {/* Right side: content */}
          <div className={clsx('pb-6', isLast && 'pb-0')}>
            <p className={clsx(
              'font-medium',
              step.isCurrent ? colors.text : step.isCompleted ? 'text-text-primary' : 'text-text-muted'
            )}>
              {step.label}
            </p>
            {showTimestamps && step.timestamp && (
              <p className="text-body-sm text-text-muted mt-0.5">
                {step.timestamp}
              </p>
            )}
            {step.description && (
              <p className="text-body-sm text-text-muted mt-1">
                {step.description}
              </p>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

// Main Component
export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  steps,
  variant = 'horizontal',
  showTimestamps = false,
  className,
}) => {
  const timelineSteps = steps || generateSteps(currentStatus);

  return (
    <div className={clsx('w-full', className)}>
      {variant === 'horizontal' ? (
        <HorizontalTimeline steps={timelineSteps} showTimestamps={showTimestamps} />
      ) : (
        <VerticalTimeline steps={timelineSteps} showTimestamps={showTimestamps} />
      )}
    </div>
  );
};

// Status Badge Component
export const StatusBadge: React.FC<{ status: RequestStatus; className?: string }> = ({ 
  status, 
  className 
}) => {
  const configs: Record<RequestStatus, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-warning/10', text: 'text-warning-dark', label: 'Pending' },
    approved: { bg: 'bg-brand/10', text: 'text-brand', label: 'Approved' },
    in_progress: { bg: 'bg-info/10', text: 'text-info', label: 'In Progress' },
    completed: { bg: 'bg-success/10', text: 'text-success-dark', label: 'Completed' },
    rejected: { bg: 'bg-error/10', text: 'text-error-dark', label: 'Rejected' },
    cancelled: { bg: 'bg-neutral-100', text: 'text-neutral-600', label: 'Cancelled' },
  };

  const config = configs[status];

  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
      config.bg,
      config.text,
      className
    )}>
      <span className={clsx(
        'w-1.5 h-1.5 rounded-full',
        status === 'pending' && 'bg-warning animate-pulse',
        status === 'approved' && 'bg-brand',
        status === 'in_progress' && 'bg-info animate-pulse',
        status === 'completed' && 'bg-success',
        status === 'rejected' && 'bg-error',
        status === 'cancelled' && 'bg-neutral-400',
      )} />
      {config.label}
    </span>
  );
};

export default StatusTimeline;
