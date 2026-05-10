import { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Select } from '../../components/ui/select';
import { useData } from '../../state/DataContext';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { Star, MessageSquare, TrendingUp, Users } from 'lucide-react';

export default function AdminReviews() {
  const { reviews } = useData();
  const [filter, setFilter] = useState<'all' | 'engineer' | 'customer'>('all');
  const [minRating, setMinRating] = useState(0);

  const filtered = reviews.filter(r => {
    if (minRating > 0 && r.rating < minRating) return false;
    if (filter === 'engineer') return r.toId.startsWith('E');
    if (filter === 'customer') return r.toId.startsWith('C');
    return true;
  });

  const avgRating = filtered.length > 0 
    ? (filtered.reduce((sum, r) => sum + r.rating, 0) / filtered.length).toFixed(1)
    : '0.0';
  const fiveStarCount = filtered.filter(r => r.rating === 5).length;
  const engineerReviews = reviews.filter(r => r.toId.startsWith('E')).length;

  return (
    <AppShell title="Reviews" subtitle="Monitor customer feedback and platform satisfaction">
      <div className="space-y-6">
        {/* WOW KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <WowKPICard
            title="Total Reviews"
            value={reviews.length}
            subtitle="All feedback"
            icon={<MessageSquare className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Average Rating"
            value={avgRating}
            subtitle="Out of 5 stars"
            icon={<Star className="w-5 h-5" />}
            accentColor="#D4AF37"
          />
          <WowKPICard
            title="5-Star Reviews"
            value={fiveStarCount}
            subtitle="Perfect ratings"
            icon={<TrendingUp className="w-5 h-5" />}
            accentColor="#22c55e"
          />
          <WowKPICard
            title="Engineer Reviews"
            value={engineerReviews}
            subtitle="Provider feedback"
            icon={<Users className="w-5 h-5" />}
            accentColor="#f59e0b"
          />
        </div>
        
        <div className="flex gap-3 flex-wrap">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Review Type</label>
          <Select value={filter} onChange={e => setFilter(e.target.value as any)}>
            <option value="all">All Reviews</option>
            <option value="engineer">Customer → Engineer</option>
            <option value="customer">Engineer → Customer</option>
          </Select>
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Min Rating</label>
          <Select value={minRating.toString()} onChange={e => setMinRating(parseInt(e.target.value))}>
            <option value="0">All</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="5">5</option>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-slate-400">No reviews match the filters.</p>
        )}
        {filtered.map(review => (
          <Card key={review.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{review.fromName} → {review.toName}</p>
                <p className="text-xs text-slate-400">Request ID: {review.requestId}</p>
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
                  ))}
                </div>
                {review.comment && (
                  <p className="text-sm text-slate-300 mt-2">{review.comment}</p>
                )}
              </div>
              <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
          </Card>
        ))}
        </div>
      </div>
    </AppShell>
  );
}
