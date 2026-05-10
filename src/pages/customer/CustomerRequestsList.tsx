import { useData } from '../../state/DataContext';
import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { useState, useEffect } from 'react';
import Button from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Star, Trash2, RefreshCw, Ban, MapPin, AlertTriangle, Loader2, CheckCircle, X, List, Clock, Zap, FileText, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { disputesApi, Dispute } from '../../api/client';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';

// Dispute categories
const DISPUTE_CATEGORIES = [
  { value: 'quality', label: 'Poor Quality of Work' },
  { value: 'incomplete', label: 'Work Not Completed' },
  { value: 'overcharge', label: 'Overcharged' },
  { value: 'delay', label: 'Excessive Delay' },
  { value: 'behavior', label: 'Unprofessional Behavior' },
  { value: 'damage', label: 'Property Damage' },
  { value: 'other', label: 'Other Issue' },
];

export default function CustomerRequestsList() {
  const { customerRequests, deleteRequest, resendRequest, blockUser, rateRequest, addReview, currentUser, engineers, isApiAvailable } = useData();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [showRatingForm, setShowRatingForm] = useState(false);
  
  // Complaint state
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintCategory, setComplaintCategory] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintLoading, setComplaintLoading] = useState(false);
  const [complaintError, setComplaintError] = useState('');
  const [complaintSuccess, setComplaintSuccess] = useState(false);
  const [canDispute, setCanDispute] = useState<{ can: boolean; reason?: string; daysLeft?: number } | null>(null);
  const [myDisputes, setMyDisputes] = useState<Dispute[]>([]);

  const req = customerRequests.find(r => r.id === selected);

  // Check if can file dispute when request is selected
  useEffect(() => {
    if (req && req.status === 'Completed' && isApiAvailable) {
      checkCanDispute();
      loadMyDisputes();
    }
  }, [selected, req?.status]);

  const checkCanDispute = async () => {
    if (!req) return;
    try {
      // Extract numeric ID from request ID (e.g., "R-1001" -> 1001)
      const numericId = parseInt(req.id.replace(/\D/g, ''));
      const result = await disputesApi.canDispute(numericId);
      setCanDispute({
        can: result.can_dispute,
        reason: result.reason,
        daysLeft: result.days_remaining
      });
    } catch (err) {
      console.error('Failed to check dispute eligibility:', err);
    }
  };

  const loadMyDisputes = async () => {
    try {
      const result = await disputesApi.getMyDisputes();
      setMyDisputes(result.disputes);
    } catch (err) {
      console.error('Failed to load disputes:', err);
    }
  };

  const handleSubmitComplaint = async () => {
    if (!req || !complaintCategory || !complaintDescription) {
      setComplaintError('Please fill in all fields');
      return;
    }

    setComplaintLoading(true);
    setComplaintError('');

    try {
      const numericId = parseInt(req.id.replace(/\D/g, ''));
      await disputesApi.create({
        request_id: numericId,
        category: complaintCategory,
        description: complaintDescription
      });
      setComplaintSuccess(true);
      setShowComplaintForm(false);
      setComplaintCategory('');
      setComplaintDescription('');
      loadMyDisputes();
      // Reset success after 3 seconds
      setTimeout(() => setComplaintSuccess(false), 3000);
    } catch (err: any) {
      setComplaintError(err.message || 'Failed to submit complaint');
    } finally {
      setComplaintLoading(false);
    }
  };

  // Get existing dispute for this request
  const existingDispute = req ? myDisputes.find(d => d.request_id === parseInt(req.id.replace(/\D/g, ''))) : null;

  // Stats calculations
  const pendingStatuses = ['Pending', 'Submitted', 'Under Review'] as const;
  const activeStatuses = ['Routed', 'Accepted', 'In Progress'] as const;
  const pendingCount = customerRequests.filter(r => pendingStatuses.includes(r.status as typeof pendingStatuses[number])).length;
  const completedCount = customerRequests.filter(r => r.status === 'Completed').length;
  const inProgressCount = customerRequests.filter(r => activeStatuses.includes(r.status as typeof activeStatuses[number])).length;

  const handleDelete = () => {
    if (req && window.confirm('Are you sure you want to cancel this request?')) {
      deleteRequest(req.id);
      setSelected(null);
    }
  };

  const handleResend = () => {
    if (req) {
      resendRequest(req.id);
      alert('Request has been re-sent to engineers in your area.');
    }
  };

  const handleBlock = () => {
    if (req && req.engineerId && req.engineerName && window.confirm(`Block ${req.engineerName}? They will not be suggested to you again.`)) {
      blockUser(req.engineerId, req.engineerName);
      alert(`${req.engineerName} has been blocked.`);
    }
  };

  const handleSubmitRating = () => {
    if (req && rating > 0 && currentUser) {
      rateRequest(req.id, rating, review);
      if (req.engineerId && req.engineerName) {
        addReview({
          fromId: currentUser.id,
          fromName: 'Current User',
          toId: req.engineerId,
          toName: req.engineerName,
          requestId: req.id,
          rating,
          comment: review,
        });
      }
      setShowRatingForm(false);
      alert('Thank you for your feedback!');
    }
  };

  return (
    <AppShell title="My Requests" subtitle="Track and manage your service requests">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <WowKPICard
            title="Total"
            value={customerRequests.length}
            subtitle="Requests"
            icon={<List className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Pending"
            value={pendingCount}
            subtitle="Awaiting"
            icon={<Clock className="w-5 h-5" />}
            trend={pendingCount > 0 ? 'up' : 'neutral'}
            accentColor="#f59e0b"
          />
          <WowKPICard
            title="In Progress"
            value={inProgressCount}
            subtitle="Active"
            icon={<Zap className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Completed"
            value={completedCount}
            subtitle="Done"
            icon={<CheckCircle className="w-5 h-5" />}
            accentColor="#22c55e"
          />
        </div>

        {/* Request List */}
        <div className="grid md:grid-cols-2 gap-4">
        {customerRequests.map(r => (
          <Card key={r.id} className="cursor-pointer hover:border-brand-light transition-colors" onClick={() => setSelected(r.id)}>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{r.id}</CardTitle>
                <CardDescription>{r.category} • {r.type === 'quick' ? 'Be Quickly' : 'Late'}</CardDescription>
              </div>
              <Badge className="mt-0">{r.status}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-2">{r.area}</p>
            <p className="text-xs text-slate-500">Created: {r.createdAt}</p>
          </Card>
        ))}
      </div>

      {req && (
        <Card>
          <CardTitle>Request {req.id} Details</CardTitle>
          <div className="mt-3 space-y-2 text-sm">
            <p><span className="text-slate-400">Type:</span> {req.type === 'quick' ? 'Be Quickly' : 'Late'}</p>
            <p><span className="text-slate-400">Category:</span> {req.category}</p>
            <p><span className="text-slate-400">Area:</span> {req.area}</p>
            <p><span className="text-slate-400">Status:</span> <Badge className="ml-1">{req.status}</Badge></p>
            <p><span className="text-slate-400">Description:</span> {req.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Location:</span>
              <span className="text-slate-300">{req.location}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(req.location)}`, '_blank')}
              >
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
            {req.price && (
              <p><span className="text-slate-400">Price:</span> <span className="text-brand-light font-semibold">{req.price} NIS</span></p>
            )}
            
            {/* Engineer Details Card for Accepted/Completed Requests */}
            {req.engineerId && req.status !== 'Pending' && (() => {
              const engineer = engineers.find(e => e.id === req.engineerId);
              return engineer ? (
                <div className="mt-4 p-4 bg-slate-800/40 border border-slate-700 rounded-lg space-y-3">
                  <h4 className="font-semibold text-brand-light flex items-center gap-2">
                    Assigned Engineer
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">Name</p>
                      <p className="text-slate-200 font-medium">{engineer.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-slate-200 font-medium">{engineer.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Specialization</p>
                      <p className="text-slate-200">{engineer.specialization}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Experience</p>
                      <p className="text-slate-200">{engineer.experience} years</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-slate-400">Service Area</p>
                      <p className="text-slate-200">{engineer.area}</p>
                    </div>
                    {engineer.bio && (
                      <div className="col-span-2">
                        <p className="text-xs text-slate-400">Bio</p>
                        <p className="text-slate-300 text-xs">{engineer.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-2">Engineer: {req.engineerName}</p>
              );
            })()}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {/* View Deal/Contract for accepted requests */}
            {['Accepted', 'In Progress', 'Completed'].includes(req.status) && (
              <Button variant="primary" size="sm" onClick={() => navigate(`/deal/${req.id}`)}>
                <FileText className="w-4 h-4 mr-1" /> عرض العقد المالي
              </Button>
            )}
            
            {/* View Engineer Profile */}
            {req.engineerId && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/engineer/profile/${req.engineerId}`)}>
                <ExternalLink className="w-4 h-4 mr-1" /> ملف المهندس
              </Button>
            )}
            
            {(req.status === 'Pending' || req.status === 'Cancelled') && (
              <>
                <Button variant="outline" size="sm" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-1" /> Cancel Request
                </Button>
                <Button variant="outline" size="sm" onClick={handleResend}>
                  <RefreshCw className="w-4 h-4 mr-1" /> Resend
                </Button>
              </>
            )}
            {req.engineerId && req.status !== 'Cancelled' && (
              <Button variant="outline" size="sm" onClick={handleBlock}>
                <Ban className="w-4 h-4 mr-1" /> Block Engineer
              </Button>
            )}
          </div>

          {/* Rating/Review for Completed */}
          {req.status === 'Completed' && !req.rating && (
            <div className="mt-4 p-4 border border-slate-700 rounded-lg space-y-3">
              <h4 className="font-semibold">Rate This Service</h4>
              {!showRatingForm ? (
                <Button size="sm" onClick={() => setShowRatingForm(true)}>Add Rating & Review</Button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Rating</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="text-2xl transition-colors"
                        >
                          <Star className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Review (Optional)</p>
                    <Textarea rows={3} value={review} onChange={e => setReview(e.target.value)} placeholder="Share your experience..." />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSubmitRating} disabled={rating === 0}>Submit</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowRatingForm(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {req.rating && (
            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Your Rating</h4>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`w-5 h-5 ${star <= req.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
                ))}
              </div>
              {req.review && <p className="text-sm text-slate-300">{req.review}</p>}
            </div>
          )}

          {/* Complaint Section for Completed Requests */}
          {req.status === 'Completed' && (
            <div className="mt-4">
              {/* Show existing dispute if any */}
              {existingDispute && (
                <div className={`p-4 rounded-lg border ${
                  existingDispute.status === 'resolved' ? 'bg-success/10 border-success/30' :
                  existingDispute.status === 'rejected' ? 'bg-error/10 border-error/30' :
                  'bg-warning/10 border-warning/30'
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                      existingDispute.status === 'resolved' ? 'text-success' :
                      existingDispute.status === 'rejected' ? 'text-error' :
                      'text-warning'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">
                        Dispute #{existingDispute.id} - {existingDispute.status.replace('_', ' ').toUpperCase()}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Category: {DISPUTE_CATEGORIES.find(c => c.value === existingDispute.category)?.label || existingDispute.category}
                      </p>
                      <p className="text-sm text-slate-600 mt-2">{existingDispute.description}</p>
                      {existingDispute.resolution_notes && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <p className="text-xs font-medium text-slate-500">Resolution:</p>
                          <p className="text-sm text-slate-600">{existingDispute.resolution_notes}</p>
                          {existingDispute.refund_amount && (
                            <p className="text-sm text-success font-medium mt-1">
                              Refund: {existingDispute.refund_amount} NIS
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Show complaint button or form */}
              {!existingDispute && canDispute?.can && (
                <>
                  {complaintSuccess && (
                    <div className="p-3 bg-success/10 border border-success/30 rounded-lg flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm text-success">Complaint submitted successfully!</span>
                    </div>
                  )}

                  {!showComplaintForm ? (
                    <div className="p-4 border border-dashed border-slate-300 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm text-slate-700">Have an issue?</h4>
                          <p className="text-xs text-slate-500">
                            You can file a complaint within {canDispute.daysLeft || 7} days
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowComplaintForm(true)}
                          className="text-warning border-warning hover:bg-warning/10"
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Open Complaint
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border border-warning/30 bg-warning/5 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-warning flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          File a Complaint
                        </h4>
                        <button onClick={() => setShowComplaintForm(false)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Category *</label>
                        <Select
                          value={complaintCategory}
                          onChange={e => setComplaintCategory(e.target.value)}
                        >
                          <option value="">Select a category...</option>
                          {DISPUTE_CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Description *</label>
                        <Textarea
                          rows={3}
                          value={complaintDescription}
                          onChange={e => setComplaintDescription(e.target.value)}
                          placeholder="Describe the issue in detail..."
                        />
                      </div>

                      {complaintError && (
                        <div className="p-2 bg-error/10 text-error text-sm rounded">
                          {complaintError}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleSubmitComplaint}
                          disabled={complaintLoading || !complaintCategory || !complaintDescription}
                        >
                          {complaintLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Complaint'
                          )}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowComplaintForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Show reason if can't dispute */}
              {!existingDispute && canDispute && !canDispute.can && (
                <div className="p-3 bg-slate-100 rounded-lg">
                  <p className="text-xs text-slate-500">
                    {canDispute.reason === 'Dispute window expired' 
                      ? 'The 7-day window to file a complaint has expired.'
                      : canDispute.reason || 'Unable to file complaint for this request.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
      </div>
    </AppShell>
  );
}
