import React, { useState, useEffect } from 'react';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import Button from '../../components/ui/button';
import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useData } from '../../state/DataContext';
import { recommendationsApi, RecommendedEngineer } from '../../api/client';
import AppShell from '../../layouts/AppShell';
import { 
  Star, Briefcase, MapPin, TrendingUp, User, Loader2, 
  CheckCircle, AlertCircle, Clock, Zap, ChevronRight,
  Award, Users, Sparkles
} from 'lucide-react';

// Badge icon mapping
const badgeIcons: Record<string, React.ReactNode> = {
  star: <Star className="w-3 h-3" />,
  briefcase: <Briefcase className="w-3 h-3" />,
  'map-pin': <MapPin className="w-3 h-3" />,
  'trending-up': <TrendingUp className="w-3 h-3" />,
};

// Badge color variants
const badgeColors: Record<string, 'gold' | 'info' | 'success' | 'warning'> = {
  yellow: 'gold',
  blue: 'info',
  green: 'success',
  purple: 'warning',
};

interface EngineerCardProps {
  engineer: RecommendedEngineer;
  rank: number;
  selected: boolean;
  onSelect: () => void;
}

function EngineerCard({ engineer, rank, selected, onSelect }: EngineerCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div 
      className={`
        relative p-4 rounded-xl border-2 transition-all cursor-pointer
        ${selected 
          ? 'border-brand bg-brand/5 shadow-md' 
          : 'border-slate-200 hover:border-brand/50 hover:shadow-sm bg-white'
        }
      `}
      onClick={onSelect}
    >
      {/* Rank badge */}
      {rank <= 3 && (
        <div className={`
          absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
          ${rank === 1 ? 'bg-gold text-white' : rank === 2 ? 'bg-slate-400 text-white' : 'bg-amber-600 text-white'}
        `}>
          {rank}
        </div>
      )}
      
      {/* Selected checkmark */}
      {selected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand text-white rounded-full flex items-center justify-center">
          <CheckCircle className="w-4 h-4" />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-dark rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
          {engineer.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Name and rating */}
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-800 truncate">{engineer.name}</h4>
            <div className="flex items-center gap-1 text-gold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-medium">{engineer.rating_avg.toFixed(1)}</span>
            </div>
          </div>
          
          {/* Specialization */}
          <p className="text-xs text-slate-500 truncate">{engineer.specialization}</p>
          
          {/* Badges */}
          {engineer.badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {engineer.badges.map((badge, i) => (
                <Badge 
                  key={i} 
                  variant={badgeColors[badge.color] || 'default'}
                  size="sm"
                  className="gap-1"
                >
                  {badgeIcons[badge.icon]}
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Stats row */}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {engineer.jobs_completed} jobs
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {engineer.years_exp}y exp
            </span>
            {engineer.area && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {engineer.area}
              </span>
            )}
          </div>
          
          {/* Score details toggle */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowDetails(!showDetails); }}
            className="text-xs text-brand hover:underline mt-2"
          >
            {showDetails ? 'Hide score details' : 'View score details'}
          </button>
          
          {/* Score breakdown */}
          {showDetails && (
            <div className="mt-2 p-2 bg-slate-50 rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Rating ({engineer.score_breakdown.rating.weight})</span>
                <span className="font-medium">{(engineer.score_breakdown.rating.weighted * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Experience ({engineer.score_breakdown.jobs_completed.weight})</span>
                <span className="font-medium">{(engineer.score_breakdown.jobs_completed.weighted * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Availability ({engineer.score_breakdown.availability.weight})</span>
                <span className="font-medium">{(engineer.score_breakdown.availability.weighted * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                <span className="text-slate-700 font-medium">Total Score</span>
                <span className="font-bold text-brand">{(engineer.score * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Availability indicator */}
      <div className={`
        absolute bottom-2 right-2 flex items-center gap-1 text-xs
        ${engineer.is_available ? 'text-success' : 'text-warning'}
      `}>
        <span className={`w-2 h-2 rounded-full ${engineer.is_available ? 'bg-success' : 'bg-warning'}`} />
        {engineer.is_available ? 'Available' : `${engineer.active_jobs} active`}
      </div>
    </div>
  );
}

export default function CustomerNewRequest() {
  const { currentUser, isApiAvailable } = useData();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedEngineer[]>([]);
  const [selectedEngineer, setSelectedEngineer] = useState<number | null>(null);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    category: '',
    problemType: '',
    description: '',
    location: currentUser?.area || '',
    preferredTime: '',
  });

  // Fetch recommendations when moving to step 2
  useEffect(() => {
    if (step === 2 && isApiAvailable) {
      fetchRecommendations();
    }
  }, [step]);

  const fetchRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const result = await recommendationsApi.getRecommendedEngineers({
        area: form.location,
        limit: 5
      });
      setRecommendations(result.engineers);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      // Don't show error, just no recommendations
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const update = (key: string, value: string) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const nextStep = () => {
    if (step === 1) {
      // Validate step 1
      if (!form.category || !form.problemType || !form.description || !form.location) {
        setError('Please fill in all required fields');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(Math.max(1, step - 1));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AppShell title="Request Submitted" subtitle="Your request has been created successfully">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <CardTitle className="text-success">Request Submitted!</CardTitle>
            <CardDescription className="mt-2">
              Your service request has been created successfully.
              {selectedEngineer && (
                <span className="block mt-1">
                  Your request will be sent to {recommendations.find(e => e.id === selectedEngineer)?.name || 'the selected engineer'} first.
                </span>
            )}
          </CardDescription>
          <Button 
            className="mt-6" 
            onClick={() => { 
              setSubmitted(false); 
              setStep(1); 
              setForm({ category: '', problemType: '', description: '', location: currentUser?.area || '', preferredTime: '' }); 
              setSelectedEngineer(null); 
            }}
          >
            Create Another Request
          </Button>
        </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell 
      title="New Service Request" 
      subtitle={step === 1 ? "Tell us about your electrical issue" : "Choose your preferred engineer"}
    >
      <div className="max-w-3xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-brand' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-brand text-white' : 'bg-slate-200'}`}>
            1
          </div>
          <span className="text-sm font-medium hidden sm:inline">Request Details</span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-brand' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-brand text-white' : 'bg-slate-200'}`}>
            2
          </div>
          <span className="text-sm font-medium hidden sm:inline">Choose Engineer</span>
        </div>
      </div>

      <Card>
        <form onSubmit={submit}>
          {/* Step 1: Request Details */}
          {step === 1 && (
            <>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand" />
                New Service Request
              </CardTitle>
              <CardDescription>Fill in the details of your service request</CardDescription>
              
              <div className="space-y-4 mt-6">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Category *</label>
                  <Select 
                    value={form.category} 
                    onChange={e => update('category', e.target.value)}
                    required
                  >
                    <option value="">Select a category...</option>
                    <option value="power">Power</option>
                    <option value="electronics">Electronics</option>
                    <option value="communications">Communications</option>
                    <option value="computer">Computer Engineering</option>
                    <option value="other">Other</option>
                  </Select>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Problem Type *</label>
                  <Input 
                    placeholder="e.g. Lighting failure, AC repair" 
                    value={form.problemType}
                    onChange={e => update('problemType', e.target.value)}
                    required 
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Description *</label>
                  <Textarea 
                    rows={4} 
                    placeholder="Describe the issue in detail..."
                    value={form.description}
                    onChange={e => update('description', e.target.value)}
                    required 
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Location / Area *</label>
                  <Input 
                    placeholder="e.g. Hebron, Ramallah"
                    value={form.location}
                    onChange={e => update('location', e.target.value)}
                    required 
                  />
                  <p className="text-xs text-slate-400 mt-1">This helps us find nearby engineers</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Preferred Time (optional)</label>
                  <Input 
                    type="datetime-local"
                    value={form.preferredTime}
                    onChange={e => update('preferredTime', e.target.value)}
                  />
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-error/10 text-error rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost">Cancel</Button>
                  <Button type="button" onClick={nextStep}>
                    Continue
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Engineer Selection */}
          {step === 2 && (
            <>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand" />
                Recommended Engineers
              </CardTitle>
              <CardDescription>
                Choose an engineer or skip to send your request to all available engineers
              </CardDescription>
              
              <div className="mt-6">
                {loadingRecommendations ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-brand animate-spin" />
                    <p className="text-sm text-slate-500 mt-2">Finding best engineers for you...</p>
                  </div>
                ) : recommendations.length > 0 ? (
                  <>
                    {/* AI recommendation banner */}
                    <div className="flex items-center gap-3 p-3 bg-brand/5 border border-brand/20 rounded-lg mb-4">
                      <Award className="w-5 h-5 text-brand flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          Smart Recommendations
                        </p>
                        <p className="text-xs text-slate-500">
                          Engineers ranked by rating, experience, and availability
                        </p>
                      </div>
                    </div>
                    
                    {/* Engineer cards */}
                    <div className="grid gap-3">
                      {recommendations.map((engineer, index) => (
                        <EngineerCard
                          key={engineer.id}
                          engineer={engineer}
                          rank={index + 1}
                          selected={selectedEngineer === engineer.id}
                          onSelect={() => setSelectedEngineer(
                            selectedEngineer === engineer.id ? null : engineer.id
                          )}
                        />
                      ))}
                    </div>
                    
                    {/* Skip option */}
                    <div className="mt-4 p-3 border border-dashed border-slate-300 rounded-lg text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedEngineer(null)}
                        className={`text-sm ${!selectedEngineer ? 'text-brand font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        <Users className="w-4 h-4 inline mr-1" />
                        Send to all available engineers instead
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-slate-500 mt-2">
                      No recommended engineers found for your area.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Your request will be sent to all available engineers.
                    </p>
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-error/10 text-error rounded-lg text-sm mt-4">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                
                <div className="flex justify-between gap-3 pt-6 border-t border-slate-100 mt-6">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Request
                        <CheckCircle className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </form>
      </Card>
      </div>
    </AppShell>
  );
}
