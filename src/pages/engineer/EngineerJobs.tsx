import { useState } from 'react';
import { useData } from '../../state/DataContext';
import { Card, CardTitle } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import Button from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { MapPin, Star, CheckCircle, Briefcase, Clock, TrendingUp } from 'lucide-react';

export default function EngineerJobs() {
  const { engineerJobs, markJobCompleted, addReview, currentUser, addPortfolioItem } = useData();
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const job = engineerJobs.find(j => j.id === selectedJob);

  const handleMarkCompleted = (jobId: string) => {
    if (window.confirm('Mark this job as completed?')) {
      markJobCompleted(jobId);
      alert('Job marked as completed. Customer will be notified.');
    }
  };

  const handleAddToPortfolio = (job: typeof engineerJobs[0]) => {
    if (job.status === 'Completed') {
      addPortfolioItem({
        title: job.category,
        description: job.description,
        location: job.location,
        image: '',
      });
      alert('Added to portfolio!');
    }
  };

  const handleSubmitReview = () => {
    if (job && rating > 0 && currentUser) {
      addReview({
        fromId: currentUser.id,
        fromName: 'Current Engineer',
        toId: job.customerId,
        toName: job.customerName,
        requestId: job.id,
        rating,
        comment: reviewComment,
      });
      setShowReview(false);
      setRating(0);
      setReviewComment('');
      alert('Review submitted for customer!');
    }
  };

  const inProgressJobs = engineerJobs.filter(j => j.status === 'In Progress').length;
  const completedJobs = engineerJobs.filter(j => j.status === 'Completed').length;

  return (
    <AppShell title="My Requests & Jobs" subtitle="Manage customer requests assigned to you">
      <div className="space-y-6">
        {/* WOW KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <WowKPICard
            title="Total Jobs"
            value={engineerJobs.length}
            subtitle="All time"
            icon={<Briefcase className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="In Progress"
            value={inProgressJobs}
            subtitle="Current"
            icon={<Clock className="w-5 h-5" />}
            accentColor="#f59e0b"
          />
          <WowKPICard
            title="Completed"
            value={completedJobs}
            subtitle="Finished"
            icon={<CheckCircle className="w-5 h-5" />}
            trend="up"
            change={8}
            accentColor="#22c55e"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
        {engineerJobs.length === 0 && (
          <p className="text-slate-400">No jobs yet. Accept quick requests to begin.</p>
        )}
        {engineerJobs.map(j => (
          <Card
            key={j.id}
            className="cursor-pointer hover:border-brand-light transition-colors"
            onClick={() => setSelectedJob(j.id)}
          >
            <div className="flex items-start justify-between">
              <CardTitle>{j.category}</CardTitle>
              <Badge>{j.status}</Badge>
            </div>
            <p className="text-sm text-slate-400 mt-1">{j.description}</p>
            <div className="mt-2 space-y-1 text-xs text-slate-500">
              <p>Customer: {j.customerName}</p>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{j.location}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {job && (
        <Card>
          <CardTitle>Job {job.id} Details</CardTitle>
          <div className="mt-3 space-y-2 text-sm">
            <p><span className="text-slate-400">Category:</span> {job.category}</p>
            <p><span className="text-slate-400">Customer:</span> {job.customerName}</p>
            <p><span className="text-slate-400">Location:</span> {job.location}</p>
            <p><span className="text-slate-400">Description:</span> {job.description}</p>
            <p><span className="text-slate-400">Status:</span> <Badge className="ml-1">{job.status}</Badge></p>
            {job.price && (
              <p><span className="text-slate-400">Price:</span> <span className="text-brand-light font-semibold">{job.price} NIS</span></p>
            )}
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            {job.status === 'In Progress' && (
              <Button size="sm" onClick={() => handleMarkCompleted(job.id)}>
                <CheckCircle className="w-4 h-4 mr-1" /> Mark Completed
              </Button>
            )}
            {job.status === 'Completed' && (
              <>
                <Button size="sm" variant="outline" onClick={() => handleAddToPortfolio(job)}>
                  Add to Portfolio
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowReview(true)}>
                  <Star className="w-4 h-4 mr-1" /> Review Customer
                </Button>
              </>
            )}
          </div>

          {showReview && job.status === 'Completed' && (
            <div className="mt-4 p-4 border border-slate-700 rounded-lg space-y-3">
              <h4 className="font-semibold">Review Customer</h4>
              <div>
                <p className="text-xs text-slate-400 mb-1">Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-colors"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Comment (Optional)</p>
                <Textarea rows={3} value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Share your experience with this customer..." />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSubmitReview} disabled={rating === 0}>Submit Review</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowReview(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </Card>
      )}
      </div>
    </AppShell>
  );
}
