/**
 * Engineer Public Profile Page
 * 
 * A LinkedIn-style public profile page showcasing engineer's:
 * - Professional info and bio
 * - Portfolio/completed projects
 * - Ratings and reviews
 * - Certifications and achievements
 * 
 * Accessible to customers for viewing before hiring
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Avatar } from '../../components/ui/avatar';
import { 
  Star, MapPin, Briefcase, Calendar, Award, CheckCircle, 
  Phone, Mail, Shield, Clock, TrendingUp, Users, Wrench,
  ExternalLink, Share2, MessageCircle, ThumbsUp, Eye,
  ChevronLeft, Download, Verified, Trophy, Target
} from 'lucide-react';
import { useData } from '../../state/DataContext';
import { DEMO_MODE } from '../../config/appMode';

// Types
interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  completedAt: string;
  images: string[];
  clientName?: string;
  testimonial?: string;
  rating?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'award' | 'star' | 'target' | 'verified';
  earnedAt: string;
}

interface PublicEngineerProfile {
  id: string;
  name: string;
  title: string;
  specialization: string;
  bio: string;
  avatar: string;
  city: string;
  area: string;
  experience: number;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  responseRate: number;
  responseTime: string;
  memberSince: string;
  verified: boolean;
  featuredBadge?: string;
  skills: string[];
  certifications: string[];
  portfolio: PortfolioProject[];
  achievements: Achievement[];
  stats: {
    totalEarnings: number;
    repeatClients: number;
    onTimeDelivery: number;
  };
}

// Mock data generator for demo mode
const generateMockProfile = (engineerId: string): PublicEngineerProfile => {
  const names = ['أحمد خليل', 'محمد عطاالله', 'خليل ناصر', 'عمر حسن', 'فاطمة الرشيد'];
  const specializations = ['تمديدات كهربائية', 'أنظمة طاقة شمسية', 'صيانة صناعية', 'تركيبات منزلية', 'فحص وتدقيق'];
  const cities = ['رام الله', 'نابلس', 'الخليل', 'بيت لحم', 'جنين'];
  
  const randomIndex = parseInt(engineerId.replace(/\D/g, '')) % 5 || 0;
  
  return {
    id: engineerId,
    name: names[randomIndex],
    title: 'مهندس كهرباء معتمد',
    specialization: specializations[randomIndex],
    bio: 'مهندس كهرباء ذو خبرة واسعة في مجال التمديدات الكهربائية والصيانة. أقدم خدمات عالية الجودة مع ضمان على جميع الأعمال. حاصل على شهادات معتمدة في السلامة الكهربائية.',
    avatar: '',
    city: cities[randomIndex],
    area: 'وسط المدينة',
    experience: 5 + randomIndex,
    rating: 4.5 + (randomIndex * 0.1),
    reviewCount: 45 + (randomIndex * 12),
    completedJobs: 120 + (randomIndex * 30),
    responseRate: 95 + randomIndex,
    responseTime: 'خلال ساعة',
    memberSince: '2023',
    verified: true,
    featuredBadge: randomIndex === 0 ? 'Top Rated' : randomIndex === 1 ? 'Rising Star' : undefined,
    skills: [
      'تمديدات كهربائية',
      'صيانة أنظمة',
      'تركيب لوحات',
      'كشف أعطال',
      'أنظمة إنذار',
      'إضاءة LED'
    ],
    certifications: [
      'شهادة سلامة كهربائية معتمدة',
      'رخصة مزاولة مهنة',
      'شهادة تدريب طاقة شمسية'
    ],
    portfolio: [
      {
        id: 'P1',
        title: 'تمديدات فيلا سكنية',
        description: 'تمديدات كهربائية كاملة لفيلا من 3 طوابق مع نظام إضاءة ذكي',
        category: 'سكني',
        location: 'رام الله',
        completedAt: '2024-10',
        images: [],
        clientName: 'عائلة محمود',
        testimonial: 'عمل ممتاز واحترافية عالية',
        rating: 5
      },
      {
        id: 'P2',
        title: 'نظام طاقة شمسية',
        description: 'تركيب نظام طاقة شمسية 10 كيلو واط لمنزل',
        category: 'طاقة متجددة',
        location: 'نابلس',
        completedAt: '2024-08',
        images: [],
        clientName: 'أبو سامر',
        testimonial: 'وفر علينا 70% من فاتورة الكهرباء',
        rating: 5
      },
      {
        id: 'P3',
        title: 'صيانة مصنع',
        description: 'صيانة شاملة للنظام الكهربائي في مصنع ألبان',
        category: 'صناعي',
        location: 'الخليل',
        completedAt: '2024-06',
        images: [],
        rating: 4
      }
    ],
    achievements: [
      {
        id: 'A1',
        title: 'أفضل مهندس',
        description: 'حصل على تقييم 5 نجوم من 50+ عميل',
        icon: 'trophy',
        earnedAt: '2024'
      },
      {
        id: 'A2',
        title: 'سرعة الاستجابة',
        description: 'يرد على 95% من الطلبات خلال ساعة',
        icon: 'target',
        earnedAt: '2024'
      },
      {
        id: 'A3',
        title: 'معتمد ومرخص',
        description: 'حاصل على جميع التراخيص المطلوبة',
        icon: 'verified',
        earnedAt: '2023'
      }
    ],
    stats: {
      totalEarnings: 50000 + (randomIndex * 10000),
      repeatClients: 25 + randomIndex * 5,
      onTimeDelivery: 98
    }
  };
};

// Achievement Icon Component
const AchievementIcon = ({ icon }: { icon: Achievement['icon'] }) => {
  const icons = {
    trophy: <Trophy className="w-5 h-5" />,
    award: <Award className="w-5 h-5" />,
    star: <Star className="w-5 h-5" />,
    target: <Target className="w-5 h-5" />,
    verified: <Verified className="w-5 h-5" />
  };
  return icons[icon] || <Award className="w-5 h-5" />;
};

export default function PublicProfile() {
  const { engineerId } = useParams<{ engineerId: string }>();
  const navigate = useNavigate();
  const { engineers } = useData();
  
  const [profile, setProfile] = useState<PublicEngineerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews' | 'about'>('portfolio');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (DEMO_MODE) {
        // Generate mock profile
        setProfile(generateMockProfile(engineerId || 'E-1'));
      } else {
        // TODO: Fetch from API
        const engineer = engineers.find(e => e.id === engineerId);
        if (engineer) {
          setProfile(generateMockProfile(engineer.id));
        }
      }
      
      setLoading(false);
    };
    
    loadProfile();
  }, [engineerId, engineers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">الملف الشخصي غير موجود</h1>
        <Button onClick={() => navigate(-1)}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          العودة
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-brand via-brand-dark to-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/80 hover:text-white mb-6"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            العودة
          </Button>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar name={profile.name} size="xl" />
                {profile.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-success text-white rounded-full p-1">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </div>
              
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold">{profile.name}</h1>
                  {profile.featuredBadge && (
                    <Badge variant="gold" size="sm">
                      <Trophy className="w-3 h-3 mr-1" />
                      {profile.featuredBadge}
                    </Badge>
                  )}
                </div>
                <p className="text-white/80 mt-1">{profile.title}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-white/70">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {profile.experience} سنوات خبرة
                  </span>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="md:ml-auto flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 text-gold fill-gold" />
                  <span className="text-2xl font-bold">{profile.rating.toFixed(1)}</span>
                </div>
                <p className="text-xs text-white/70 mt-1">{profile.reviewCount} تقييم</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 text-center">
                <div className="text-2xl font-bold">{profile.completedJobs}</div>
                <p className="text-xs text-white/70 mt-1">مشروع مكتمل</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 text-center">
                <div className="text-2xl font-bold">{profile.responseRate}%</div>
                <p className="text-xs text-white/70 mt-1">معدل الاستجابة</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button variant="gold" size="lg" onClick={() => navigate('/customer/new-request')}>
              <MessageCircle className="w-4 h-4 mr-2" />
              طلب خدمة
            </Button>
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
              <Share2 className="w-4 h-4 mr-2" />
              مشاركة
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* About Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">نبذة عني</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {profile.bio}
                </p>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">المهارات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="bg-brand/5">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand" />
                  الشهادات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile.certifications.map((cert, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-text-secondary">{cert}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gold" />
                  الإنجازات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gold/10 text-gold">
                      <AchievementIcon icon={achievement.icon} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-text-muted">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-gradient-to-br from-brand/5 to-gold/5">
              <CardContent className="py-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-brand">{profile.stats.repeatClients}</div>
                    <p className="text-xs text-text-muted">عميل متكرر</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success">{profile.stats.onTimeDelivery}%</div>
                    <p className="text-xs text-text-muted">تسليم بالوقت</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b">
              {[
                { id: 'portfolio', label: 'أعمالي', icon: <Briefcase className="w-4 h-4" /> },
                { id: 'reviews', label: 'التقييمات', icon: <Star className="w-4 h-4" /> },
                { id: 'about', label: 'معلومات', icon: <Users className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'border-brand text-brand'
                      : 'border-transparent text-text-muted hover:text-text-primary'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <div className="grid gap-4">
                {profile.portfolio.map((project) => (
                  <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" size="sm">{project.category}</Badge>
                            <span className="text-xs text-text-muted">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {project.completedAt}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold">{project.title}</h3>
                          <p className="text-text-secondary text-sm mt-1">{project.description}</p>
                          
                          <div className="flex items-center gap-2 mt-3 text-sm text-text-muted">
                            <MapPin className="w-4 h-4" />
                            {project.location}
                          </div>
                        </div>
                        
                        {project.rating && (
                          <div className="flex items-center gap-1 bg-gold/10 px-2 py-1 rounded-lg">
                            <Star className="w-4 h-4 text-gold fill-gold" />
                            <span className="font-semibold text-gold-dark">{project.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      {project.testimonial && (
                        <div className="mt-4 p-3 bg-neutral-50 rounded-lg border-r-4 border-brand">
                          <p className="text-sm italic text-text-secondary">"{project.testimonial}"</p>
                          {project.clientName && (
                            <p className="text-xs text-text-muted mt-2">— {project.clientName}</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* Rating Summary */}
                <Card className="bg-gradient-to-r from-gold/5 to-brand/5">
                  <CardContent className="py-6">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-brand">{profile.rating.toFixed(1)}</div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(profile.rating)
                                  ? 'text-gold fill-gold'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-text-muted mt-1">{profile.reviewCount} تقييم</p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center gap-2">
                            <span className="text-sm w-3">{rating}</span>
                            <Star className="w-3 h-3 text-gold fill-gold" />
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gold rounded-full"
                                style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : 10}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Sample Reviews */}
                {[
                  { name: 'أحمد محمود', rating: 5, text: 'عمل ممتاز وسرعة في الإنجاز. أنصح به بشدة!', date: '2024-11-15' },
                  { name: 'سارة حسن', rating: 5, text: 'محترف جداً ويهتم بأدق التفاصيل. شكراً', date: '2024-11-10' },
                  { name: 'عمر خالد', rating: 4, text: 'خدمة جيدة وأسعار معقولة', date: '2024-10-28' }
                ].map((review, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar name={review.name} size="sm" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{review.name}</span>
                            <span className="text-xs text-text-muted">{review.date}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.rating ? 'text-gold fill-gold' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-text-secondary mt-2">{review.text}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>معلومات الاتصال</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brand/10">
                        <MapPin className="w-5 h-5 text-brand" />
                      </div>
                      <div>
                        <p className="text-sm text-text-muted">الموقع</p>
                        <p className="font-medium">{profile.city} - {profile.area}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brand/10">
                        <Clock className="w-5 h-5 text-brand" />
                      </div>
                      <div>
                        <p className="text-sm text-text-muted">وقت الاستجابة</p>
                        <p className="font-medium">{profile.responseTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-brand/10">
                        <Calendar className="w-5 h-5 text-brand" />
                      </div>
                      <div>
                        <p className="text-sm text-text-muted">عضو منذ</p>
                        <p className="font-medium">{profile.memberSince}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>التخصص الرئيسي</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-brand to-brand-dark text-white">
                        <Wrench className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{profile.specialization}</p>
                        <p className="text-sm text-text-muted">{profile.experience} سنوات من الخبرة</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
