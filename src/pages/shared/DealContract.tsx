/**
 * Deal Contract Page
 * 
 * Financial agreement page between customer and engineer
 * Features:
 * - Material/equipment cost breakdown
 * - Labor costs
 * - Multi-currency support (ILS, USD, JOD)
 * - Payment timeline
 * - Payment status tracking
 * - Admin viewable from database
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar } from '../../components/ui/avatar';
import { 
  FileText, DollarSign, Package, Wrench, Clock, CheckCircle,
  AlertCircle, ChevronLeft, Download, Printer, Send, Plus,
  Trash2, Calculator, Receipt, CreditCard, Building, User,
  Calendar, MapPin, Phone, Shield, TrendingUp, PieChart
} from 'lucide-react';
import { useData } from '../../state/DataContext';
import { DEMO_MODE } from '../../config/appMode';

// Currency types and conversion rates
type Currency = 'ILS' | 'USD' | 'JOD';

const CURRENCY_CONFIG: Record<Currency, { symbol: string; name: string; nameAr: string; rate: number }> = {
  ILS: { symbol: '₪', name: 'Israeli Shekel', nameAr: 'شيكل', rate: 1 },
  USD: { symbol: '$', name: 'US Dollar', nameAr: 'دولار', rate: 0.27 },
  JOD: { symbol: 'د.أ', name: 'Jordanian Dinar', nameAr: 'دينار', rate: 0.19 }
};

// Types
interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  notes?: string;
}

interface LaborItem {
  id: string;
  description: string;
  hours: number;
  hourlyRate: number;
  total: number;
}

interface PaymentMilestone {
  id: string;
  title: string;
  amount: number;
  percentage: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: string;
}

interface DealContractData {
  id: string;
  contractNumber: string;
  requestId: string;
  requestNumber: string;
  status: 'draft' | 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  
  // Parties
  customer: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  engineer: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    specialization?: string;
  };
  
  // Project details
  project: {
    title: string;
    description: string;
    category: string;
    location: string;
    startDate?: string;
    endDate?: string;
    estimatedDuration: string;
  };
  
  // Financial breakdown
  materials: MaterialItem[];
  labor: LaborItem[];
  
  // Totals
  subtotalMaterials: number;
  subtotalLabor: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  tax: number;
  taxRate: number;
  grandTotal: number;
  
  // Currency
  currency: Currency;
  
  // Payments
  paymentTerms: string;
  paymentMilestones: PaymentMilestone[];
  paidAmount: number;
  remainingAmount: number;
  
  // Notes
  termsAndConditions: string[];
  notes?: string;
  
  // Signatures
  customerSignature?: string;
  engineerSignature?: string;
  signedAt?: string;
}

// Mock contract generator
const generateMockContract = (requestId: string): DealContractData => {
  const materials: MaterialItem[] = [
    { id: 'M1', name: 'أسلاك كهربائية 2.5mm', quantity: 100, unit: 'متر', unitPrice: 3, total: 300 },
    { id: 'M2', name: 'مفاتيح كهربائية', quantity: 10, unit: 'قطعة', unitPrice: 25, total: 250 },
    { id: 'M3', name: 'لوحة توزيع 12 خط', quantity: 1, unit: 'قطعة', unitPrice: 350, total: 350 },
    { id: 'M4', name: 'قواطع كهربائية', quantity: 12, unit: 'قطعة', unitPrice: 45, total: 540 },
    { id: 'M5', name: 'مواسير PVC', quantity: 50, unit: 'متر', unitPrice: 5, total: 250 }
  ];
  
  const labor: LaborItem[] = [
    { id: 'L1', description: 'تمديد الأسلاك الرئيسية', hours: 8, hourlyRate: 50, total: 400 },
    { id: 'L2', description: 'تركيب اللوحة الكهربائية', hours: 4, hourlyRate: 60, total: 240 },
    { id: 'L3', description: 'تركيب المفاتيح والمقابس', hours: 6, hourlyRate: 45, total: 270 },
    { id: 'L4', description: 'فحص واختبار النظام', hours: 2, hourlyRate: 70, total: 140 }
  ];
  
  const subtotalMaterials = materials.reduce((sum, m) => sum + m.total, 0);
  const subtotalLabor = labor.reduce((sum, l) => sum + l.total, 0);
  const subtotal = subtotalMaterials + subtotalLabor;
  const discount = subtotal * 0.05; // 5% discount
  const taxRate = 16;
  const tax = (subtotal - discount) * (taxRate / 100);
  const grandTotal = subtotal - discount + tax;
  
  return {
    id: `DC-${Date.now()}`,
    contractNumber: `CNT-${requestId.replace('R-', '')}-2024`,
    requestId,
    requestNumber: requestId,
    status: 'in_progress',
    createdAt: '2024-11-20',
    updatedAt: new Date().toISOString().split('T')[0],
    
    customer: {
      id: 'C-1',
      name: 'أحمد محمود',
      phone: '0591234567',
      email: 'ahmad@example.com',
      address: 'رام الله - وسط المدينة، شارع الإرسال'
    },
    engineer: {
      id: 'E-1',
      name: 'محمد عطاالله',
      phone: '0597654321',
      email: 'mohammed@falco.ps',
      specialization: 'تمديدات كهربائية'
    },
    
    project: {
      title: 'تمديدات كهربائية منزلية',
      description: 'تمديدات كهربائية كاملة لشقة سكنية جديدة - 3 غرف نوم + صالون + مطبخ + حمامين',
      category: 'تمديدات كهربائية',
      location: 'رام الله - وسط المدينة',
      startDate: '2024-11-25',
      endDate: '2024-12-05',
      estimatedDuration: '10 أيام عمل'
    },
    
    materials,
    labor,
    
    subtotalMaterials,
    subtotalLabor,
    discount,
    discountType: 'percentage',
    tax,
    taxRate,
    grandTotal,
    
    currency: 'ILS',
    
    paymentTerms: 'دفعة مقدمة 30% - دفعة وسط العمل 40% - دفعة نهائية 30%',
    paymentMilestones: [
      {
        id: 'PM1',
        title: 'دفعة مقدمة',
        amount: grandTotal * 0.3,
        percentage: 30,
        dueDate: '2024-11-20',
        status: 'paid',
        paidAt: '2024-11-20'
      },
      {
        id: 'PM2',
        title: 'دفعة منتصف العمل',
        amount: grandTotal * 0.4,
        percentage: 40,
        dueDate: '2024-11-30',
        status: 'pending'
      },
      {
        id: 'PM3',
        title: 'دفعة نهائية',
        amount: grandTotal * 0.3,
        percentage: 30,
        dueDate: '2024-12-05',
        status: 'pending'
      }
    ],
    paidAmount: grandTotal * 0.3,
    remainingAmount: grandTotal * 0.7,
    
    termsAndConditions: [
      'الضمان: سنة واحدة على جميع الأعمال',
      'المواد: ضمان المصنع حسب كل منتج',
      'التعديلات: أي تعديل إضافي يتطلب موافقة الطرفين',
      'الإلغاء: يحق للعميل إلغاء العقد مع دفع تكاليف المواد المستخدمة'
    ],
    notes: 'العمل يبدأ الساعة 8 صباحاً وينتهي 4 مساءً'
  };
};

// Format currency
const formatCurrency = (amount: number, currency: Currency): string => {
  const config = CURRENCY_CONFIG[currency];
  const converted = amount * config.rate;
  return `${config.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Status badge component
const StatusBadge = ({ status }: { status: DealContractData['status'] }) => {
  const config: Record<DealContractData['status'], { variant: 'success' | 'warning' | 'error' | 'info' | 'outline'; label: string }> = {
    draft: { variant: 'outline', label: 'مسودة' },
    pending: { variant: 'warning', label: 'بانتظار الموافقة' },
    accepted: { variant: 'info', label: 'تم القبول' },
    in_progress: { variant: 'info', label: 'قيد التنفيذ' },
    completed: { variant: 'success', label: 'مكتمل' },
    cancelled: { variant: 'error', label: 'ملغي' }
  };
  
  const { variant, label } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
};

// Payment status badge
const PaymentStatusBadge = ({ status }: { status: PaymentMilestone['status'] }) => {
  const config: Record<PaymentMilestone['status'], { variant: 'success' | 'warning' | 'error'; label: string; icon: React.ReactNode }> = {
    paid: { variant: 'success', label: 'مدفوع', icon: <CheckCircle className="w-3 h-3" /> },
    pending: { variant: 'warning', label: 'معلق', icon: <Clock className="w-3 h-3" /> },
    overdue: { variant: 'error', label: 'متأخر', icon: <AlertCircle className="w-3 h-3" /> }
  };
  
  const { variant, label, icon } = config[status];
  return (
    <Badge variant={variant} size="sm">
      {icon}
      <span className="mr-1">{label}</span>
    </Badge>
  );
};

export default function DealContract() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useData();
  
  const [contract, setContract] = useState<DealContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('ILS');
  const [showAllCurrencies, setShowAllCurrencies] = useState(false);

  useEffect(() => {
    const loadContract = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (DEMO_MODE) {
        setContract(generateMockContract(requestId || 'R-1001'));
      }
      
      setLoading(false);
    };
    
    loadContract();
  }, [requestId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <FileText className="w-16 h-16 text-gray-300" />
        <h1 className="text-xl font-bold">العقد غير موجود</h1>
        <Button onClick={() => navigate(-1)}>العودة</Button>
      </div>
    );
  }

  const paidPercentage = (contract.paidAmount / contract.grandTotal) * 100;

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold">عقد مالي</h1>
                <StatusBadge status={contract.status} />
              </div>
              <p className="text-sm text-text-muted">
                رقم العقد: {contract.contractNumber} | طلب رقم: {contract.requestNumber}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              طباعة
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Currency Selector */}
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-sm font-medium">العملة:</span>
              <div className="flex items-center gap-2">
                {(Object.keys(CURRENCY_CONFIG) as Currency[]).map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setSelectedCurrency(curr)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedCurrency === curr
                        ? 'bg-brand text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {CURRENCY_CONFIG[curr].symbol} {CURRENCY_CONFIG[curr].nameAr}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showAllCurrencies}
                  onChange={(e) => setShowAllCurrencies(e.target.checked)}
                  className="rounded"
                />
                عرض جميع العملات
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Parties */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Customer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-brand" />
                الزبون
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-3">
                <Avatar name={contract.customer.name} size="md" />
                <div>
                  <p className="font-semibold">{contract.customer.name}</p>
                  <p className="text-sm text-text-muted">{contract.customer.email}</p>
                </div>
              </div>
              {contract.customer.phone && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Phone className="w-4 h-4" />
                  {contract.customer.phone}
                </div>
              )}
              {contract.customer.address && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <MapPin className="w-4 h-4" />
                  {contract.customer.address}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Engineer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="w-4 h-4 text-brand" />
                المهندس / الفني
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-3">
                <Avatar name={contract.engineer.name} size="md" />
                <div>
                  <p className="font-semibold">{contract.engineer.name}</p>
                  <p className="text-sm text-text-muted">{contract.engineer.specialization}</p>
                </div>
              </div>
              {contract.engineer.phone && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Phone className="w-4 h-4" />
                  {contract.engineer.phone}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand" />
              تفاصيل المشروع
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{contract.project.title}</h3>
              <p className="text-text-secondary mt-1">{contract.project.description}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-text-muted">الفئة</p>
                <p className="font-medium">{contract.project.category}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">الموقع</p>
                <p className="font-medium">{contract.project.location}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">تاريخ البدء</p>
                <p className="font-medium">{contract.project.startDate || 'لم يحدد'}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">المدة المتوقعة</p>
                <p className="font-medium">{contract.project.estimatedDuration}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Materials Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              المواد والمعدات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right font-medium">الصنف</th>
                    <th className="px-4 py-3 text-center font-medium">الكمية</th>
                    <th className="px-4 py-3 text-center font-medium">الوحدة</th>
                    <th className="px-4 py-3 text-center font-medium">سعر الوحدة</th>
                    <th className="px-4 py-3 text-left font-medium">المجموع</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {contract.materials.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-center">{item.unit}</td>
                      <td className="px-4 py-3 text-center">{formatCurrency(item.unitPrice, selectedCurrency)}</td>
                      <td className="px-4 py-3 text-left font-medium">{formatCurrency(item.total, selectedCurrency)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-orange-50">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-left font-semibold">مجموع المواد</td>
                    <td className="px-4 py-3 text-left font-bold text-orange-600">
                      {formatCurrency(contract.subtotalMaterials, selectedCurrency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Labor Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-500" />
              أجور العمل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right font-medium">الوصف</th>
                    <th className="px-4 py-3 text-center font-medium">الساعات</th>
                    <th className="px-4 py-3 text-center font-medium">سعر الساعة</th>
                    <th className="px-4 py-3 text-left font-medium">المجموع</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {contract.labor.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{item.description}</td>
                      <td className="px-4 py-3 text-center">{item.hours}</td>
                      <td className="px-4 py-3 text-center">{formatCurrency(item.hourlyRate, selectedCurrency)}</td>
                      <td className="px-4 py-3 text-left font-medium">{formatCurrency(item.total, selectedCurrency)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-blue-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-left font-semibold">مجموع أجور العمل</td>
                    <td className="px-4 py-3 text-left font-bold text-blue-600">
                      {formatCurrency(contract.subtotalLabor, selectedCurrency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="bg-gradient-to-br from-brand/5 to-gold/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-brand" />
              ملخص مالي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span>مجموع المواد</span>
                  <span className="font-medium">{formatCurrency(contract.subtotalMaterials, selectedCurrency)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>مجموع أجور العمل</span>
                  <span className="font-medium">{formatCurrency(contract.subtotalLabor, selectedCurrency)}</span>
                </div>
                <div className="flex justify-between py-2 border-b text-success">
                  <span>خصم (5%)</span>
                  <span className="font-medium">-{formatCurrency(contract.discount, selectedCurrency)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>ضريبة ({contract.taxRate}%)</span>
                  <span className="font-medium">{formatCurrency(contract.tax, selectedCurrency)}</span>
                </div>
                <div className="flex justify-between py-3 bg-brand/10 rounded-lg px-3 text-lg">
                  <span className="font-bold">المجموع الكلي</span>
                  <span className="font-bold text-brand">{formatCurrency(contract.grandTotal, selectedCurrency)}</span>
                </div>
                
                {/* Show all currencies */}
                {showAllCurrencies && (
                  <div className="mt-4 p-3 bg-white rounded-lg space-y-2">
                    <p className="text-sm font-medium text-text-muted">بجميع العملات:</p>
                    {(Object.keys(CURRENCY_CONFIG) as Currency[]).map((curr) => (
                      <div key={curr} className="flex justify-between text-sm">
                        <span>{CURRENCY_CONFIG[curr].nameAr}</span>
                        <span className="font-medium">{formatCurrency(contract.grandTotal, curr)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Progress */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">حالة الدفع</span>
                    <span className="text-sm text-text-muted">{paidPercentage.toFixed(0)}% مدفوع</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-success to-emerald-400 rounded-full transition-all"
                      style={{ width: `${paidPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-success">مدفوع: {formatCurrency(contract.paidAmount, selectedCurrency)}</span>
                    <span className="text-warning">متبقي: {formatCurrency(contract.remainingAmount, selectedCurrency)}</span>
                  </div>
                </div>

                {/* Payment Milestones */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">جدول الدفعات:</p>
                  {contract.paymentMilestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <div className="flex items-center gap-2">
                        <PaymentStatusBadge status={milestone.status} />
                        <span className="text-sm">{milestone.title} ({milestone.percentage}%)</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(milestone.amount, selectedCurrency)}</p>
                        <p className="text-xs text-text-muted">{milestone.dueDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand" />
              الشروط والأحكام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {contract.termsAndConditions.map((term, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  {term}
                </li>
              ))}
            </ul>
            {contract.notes && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>ملاحظات:</strong> {contract.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <p className="text-sm text-text-muted">
            آخر تحديث: {contract.updatedAt}
          </p>
          <div className="flex gap-2">
            {currentUser?.role === 'customer' && contract.status === 'pending' && (
              <>
                <Button variant="outline">
                  رفض العرض
                </Button>
                <Button variant="primary">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  قبول والمتابعة للدفع
                </Button>
              </>
            )}
            {currentUser?.role === 'engineer' && contract.status === 'draft' && (
              <Button variant="primary">
                <Send className="w-4 h-4 mr-2" />
                إرسال للزبون
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
