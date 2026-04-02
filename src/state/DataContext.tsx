import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  CustomerRequest, EngineerJob, PortfolioItem, Notification, 
  BlockedUser, Transaction, Review, Engineer, Customer 
} from '../types';
import { features as staticFeatures, services as staticServices } from '../data/services';
import { engineers as staticEngineers } from '../data/engineers';
import { DEMO_MODE } from '../config/appMode';
import {
  authApi,
  servicesApi,
  requestsApi,
  reviewsApi,
  blocksApi,
  notificationsApi,
  financeApi,
  engineerApi,
  adminApi,
  getStoredUser,
  setStoredUser,
  clearAuth,
  checkHealth,
} from '../api/client';

// ============== Types ==============

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'engineer' | 'admin';
  status?: 'active' | 'pending' | 'blocked';
  verification_status?: 'approved' | 'pending' | null;
  city?: string;
  area?: string;
}

interface LoadingState {
  auth: boolean;
  requests: boolean;
  notifications: boolean;
  portfolio: boolean;
  transactions: boolean;
  engineers: boolean;
}

interface DataContextShape {
  // Auth
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  
  // Loading states
  loading: LoadingState;
  isApiAvailable: boolean;
  
  // Requests
  customerRequests: CustomerRequest[];
  addRequest: (req: Omit<CustomerRequest, 'id' | 'createdAt'>) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  resendRequest: (id: string) => Promise<void>;
  acceptRequest: (requestId: string, engineerId: string, engineerName: string) => Promise<void>;
  updateRequestStatus: (id: string, status: CustomerRequest['status']) => void;
  rateRequest: (id: string, rating: number, review: string) => Promise<void>;
  refreshRequests: () => Promise<void>;
  
  // Jobs (engineer view of requests)
  engineerJobs: EngineerJob[];
  markJobCompleted: (id: string) => Promise<void>;
  
  // Portfolio
  portfolio: PortfolioItem[];
  addPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => Promise<void>;
  deletePortfolioItem: (id: string) => Promise<void>;
  refreshPortfolio: () => Promise<void>;
  
  // Blocking
  blockedUsers: BlockedUser[];
  blockUser: (blockedId: string, blockedName: string) => Promise<void>;
  unblockUser: (blockedId: string) => Promise<void>;
  refreshBlocks: () => Promise<void>;
  
  // Notifications
  notifications: Notification[];
  addNotification: (userId: string, message: string) => void;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  
  // Transactions
  transactions: Transaction[];
  refreshTransactions: () => Promise<void>;
  
  // Reviews
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  refreshReviews: () => Promise<void>;
  
  // Engineers (admin view)
  engineers: Engineer[];
  addEngineer: (engineer: Omit<Engineer, 'id' | 'rating' | 'status'>) => void;
  updateEngineerStatus: (id: string, status: Engineer['status']) => Promise<void>;
  deleteEngineer: (id: string) => Promise<void>;
  refreshEngineers: () => Promise<void>;
  
  // Customers (admin view)
  customers: Customer[];
  deleteCustomer: (id: string) => Promise<void>;
  
  // Services/Features
  features: typeof staticFeatures;
  services: typeof staticServices;
}

const DataContext = createContext<DataContextShape | undefined>(undefined);

// ============== Mock Data ==============
const initialRequests: CustomerRequest[] = [
  { id: 'R-1001', type: 'quick', category: 'Electricity', area: 'Hebron - City Center', location: '123 Main St, Hebron', status: 'Pending', createdAt: '2025-11-01', description: 'Lighting issue in living room', customerName: 'Ahmad', customerId: 'C1' },
  { id: 'R-1002', type: 'late', category: 'Plumbing', area: 'Bethlehem - Old City', location: '456 Church St, Bethlehem', status: 'Accepted', createdAt: '2025-11-02', description: 'Leaking faucet', customerName: 'Sara', customerId: 'C2', engineerId: 'E3', engineerName: 'Omar Hasan' },
  { id: 'R-1003', type: 'quick', category: 'A/C Maintenance', area: 'Ramallah - Downtown', location: '789 Plaza Ave, Ramallah', status: 'In Progress', createdAt: '2025-11-03', description: 'AC not cooling', customerName: 'Omar', customerId: 'C3', engineerId: 'E1', engineerName: 'Ahmad Khalil' },
];

const initialCustomers: Customer[] = [
  { id: 'C1', name: 'Ahmad', email: 'ahmad.c@example.com', city: 'Hebron', area: 'City Center' },
  { id: 'C2', name: 'Sara', email: 'sara.c@example.com', city: 'Bethlehem', area: 'Old City' },
  { id: 'C3', name: 'Omar', email: 'omar.c@example.com', city: 'Ramallah', area: 'Downtown' },
];

// ============== Helper: Map API response to frontend types ==============

function mapApiRequest(apiReq: any): CustomerRequest {
  return {
    id: `R-${apiReq.id}`,
    type: apiReq.type,
    category: apiReq.category || apiReq.service?.feature?.name || 'General',
    area: apiReq.location_text?.split(',')[1]?.trim() || 'Unknown',
    location: apiReq.location_text || '',
    status: mapStatus(apiReq.status),
    createdAt: apiReq.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    description: apiReq.description || '',
    customerName: apiReq.customer?.name || 'Customer',
    customerId: `C-${apiReq.customer_id}`,
    engineerId: apiReq.engineer_id ? `E-${apiReq.engineer_id}` : undefined,
    engineerName: apiReq.engineer?.name,
    serviceId: apiReq.service_id ? `S-${apiReq.service_id}` : undefined,
    price: apiReq.price,
    rating: apiReq.review?.rating,
    review: apiReq.review?.text,
  };
}

function mapStatus(apiStatus: string): CustomerRequest['status'] {
  const statusMap: Record<string, CustomerRequest['status']> = {
    'pending': 'Pending',
    'accepted': 'Accepted',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
  };
  return statusMap[apiStatus] || 'Pending';
}

function mapApiEngineer(apiEng: any): Engineer {
  return {
    id: `E-${apiEng.id}`,
    name: apiEng.name || apiEng.user?.name || 'Engineer',
    email: apiEng.email || apiEng.user?.email || '',
    specialization: apiEng.specialization || 'General',
    experience: apiEng.years_experience || apiEng.years_exp || 0,
    city: apiEng.city || apiEng.user?.city || '',
    area: apiEng.area || apiEng.user?.area || '',
    rating: apiEng.avg_rating || apiEng.rating || 0,
    bio: apiEng.bio || '',
    avatar: apiEng.photo_url || '',
    status: apiEng.status || 'pending',
    subscriptionStatus: apiEng.subscription_active ? 'active' : 'expired',
    cv: apiEng.cv_url,
    certificate: apiEng.certificate_url,
  };
}

function mapApiNotification(apiNotif: any): Notification {
  return {
    id: `N-${apiNotif.id}`,
    userId: `U-${apiNotif.user_id}`,
    message: apiNotif.message,
    createdAt: apiNotif.created_at,
    read: apiNotif.read,
  };
}

function mapApiBlock(apiBlock: any): BlockedUser {
  return {
    id: `B-${apiBlock.id}`,
    userId: `U-${apiBlock.blocker_id}`,
    blockedId: `U-${apiBlock.blocked_id}`,
    blockedName: apiBlock.blocked?.name || 'User',
    blockedAt: apiBlock.created_at,
  };
}

function mapApiTransaction(apiTx: any): Transaction {
  return {
    id: `T-${apiTx.id}`,
    requestId: `R-${apiTx.request_id}`,
    customerId: `C-${apiTx.payer_id}`,
    customerName: apiTx.payer?.name || 'Customer',
    engineerId: `E-${apiTx.payee_id}`,
    engineerName: apiTx.payee?.name || 'Engineer',
    service: apiTx.request?.service?.name || 'Service',
    amount: apiTx.gross_amount,
    date: apiTx.created_at?.split('T')[0],
  };
}

function mapApiReview(apiRev: any): Review {
  return {
    id: `RV-${apiRev.id}`,
    fromId: `U-${apiRev.reviewer_id}`,
    fromName: apiRev.reviewer?.name || 'User',
    toId: `U-${apiRev.reviewee_id}`,
    toName: apiRev.reviewee?.name || 'User',
    requestId: `R-${apiRev.request_id}`,
    rating: apiRev.rating,
    comment: apiRev.text || '',
    createdAt: apiRev.created_at,
  };
}

function mapApiPortfolio(apiItem: any): PortfolioItem {
  return {
    id: `P-${apiItem.id}`,
    title: apiItem.title,
    description: apiItem.description || '',
    location: apiItem.location || '',
    image: apiItem.image_url || '',
  };
}

// ============== Provider ==============

export const DataProvider = ({ children }: { children: ReactNode }) => {
  // Core state
  const [isApiAvailable, setIsApiAvailable] = useState(false);
  const [loading, setLoading] = useState<LoadingState>({
    auth: true,
    requests: false,
    notifications: false,
    portfolio: false,
    transactions: false,
    engineers: false,
  });
  
  // User state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Data state
  const [customerRequests, setCustomerRequests] = useState<CustomerRequest[]>(initialRequests);
  const [engineerJobs, setEngineerJobs] = useState<EngineerJob[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([
    { id: 'P-1', title: 'Apartment Wiring', description: 'Complete rewiring and panel upgrade', location: 'Hebron', image: '' }
  ]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'N1', userId: 'C1', message: 'Your request has been created', createdAt: '2025-11-01', read: false }
  ]);
  const [unreadCount, setUnreadCount] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'T1', requestId: 'R-1002', customerId: 'C2', customerName: 'Sara', engineerId: 'E3', engineerName: 'Omar Hasan', service: 'Pipe Leak Repair', amount: 120, date: '2025-11-02' }
  ]);
  const [reviews, setReviews] = useState<Review[]>([
    { id: 'RV1', fromId: 'C2', fromName: 'Sara', toId: 'E3', toName: 'Omar Hasan', requestId: 'R-1002', rating: 5, comment: 'Excellent work!', createdAt: '2025-11-02' }
  ]);
  const [engineers, setEngineers] = useState<Engineer[]>(staticEngineers);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  // ============== Check API Health & Init Auth ==============
  
  useEffect(() => {
    const init = async () => {
      // Check API availability
      const apiUp = await checkHealth();
      setIsApiAvailable(apiUp);
      
      // Try to restore session from stored user
      const storedUser = getStoredUser();
      if (storedUser && apiUp) {
        try {
          const { user } = await authApi.getMe();
          setCurrentUser({
            id: `U-${user.id}`,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            verification_status: user.verification_status,
            city: user.city,
            area: user.area,
          });
        } catch {
          // Token expired, clear auth
          clearAuth();
        }
      } else if (storedUser) {
        // API not available, use stored user (offline mode)
        setCurrentUser({
          id: storedUser.id ? `U-${storedUser.id}` : 'U-local',
          name: storedUser.name,
          email: storedUser.email,
          role: storedUser.role,
          status: storedUser.status,
          verification_status: storedUser.verification_status,
        });
      }
      
      setLoading(prev => ({ ...prev, auth: false }));
    };
    
    init();
  }, []);

  // ============== Auth Functions ==============

  const login = useCallback(async (email: string, password: string) => {
    if (!isApiAvailable) {
      // Mock login for development - includes demo admin
      const mockUsers = [
        { id: 'C1', email: 'customer@test.com', password: 'Pass123!', role: 'customer' as const, name: 'Test Customer', status: 'active' as const, verification_status: null },
        { id: 'E1', email: 'engineer@test.com', password: 'Pass123!', role: 'engineer' as const, name: 'Test Engineer', status: 'active' as const, verification_status: 'approved' as const },
        { id: 'E2', email: 'engineer.pending@test.com', password: 'Pass123!', role: 'engineer' as const, name: 'Pending Engineer', status: 'pending' as const, verification_status: 'pending' as const },
        { id: 'A1', email: 'admin@test.com', password: 'Pass123!', role: 'admin' as const, name: 'Test Admin', status: 'active' as const, verification_status: null },
        // Demo admin account as per requirements
        { id: 'A2', email: 'admin@falco.local', password: 'Admin@12345', role: 'admin' as const, name: 'Super Admin', status: 'active' as const, verification_status: null },
        // Predefined Demo Admin Account - Ahmad Saqer (Super Admin)
        { id: 'A3', email: 'ahmadsaqer818@gmail.com', password: 'saqer123', role: 'admin' as const, name: 'Ahmad Saqer', status: 'active' as const, verification_status: null },
      ];
      const user = mockUsers.find(u => u.email === email && u.password === password);
      if (user) {
        const userData = { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          status: user.status,
          verification_status: user.verification_status
        };
        setCurrentUser(userData);
        // PERSIST to localStorage for session survival on refresh
        setStoredUser(userData);
        console.log('[LOGIN] Mock user logged in & persisted:', userData);
        return { success: true, user: userData };
      }
      return { success: false, error: 'Invalid credentials' };
    }
    
    try {
      const { user } = await authApi.login(email, password);
      const userData = {
        id: `U-${user.id}`,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        verification_status: user.verification_status,
        city: user.city,
        area: user.area,
      };
      setCurrentUser(userData);
      // DEBUG LOG (temporary)
      console.log('[LOGIN] API user logged in:', userData);
      return { success: true, user: userData };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  }, [isApiAvailable]);

  const logout = useCallback(async () => {
    if (isApiAvailable) {
      try {
        await authApi.logout();
      } catch {
        // Ignore logout errors
      }
    }
    clearAuth();
    setCurrentUser(null);
    // Reset to initial state
    setCustomerRequests(initialRequests);
    setEngineerJobs([]);
    setNotifications([]);
    setBlockedUsers([]);
  }, [isApiAvailable]);

  const register = useCallback(async (userData: any) => {
    // DEMO MODE: Simulate registration without API call
    if (DEMO_MODE || !isApiAvailable) {
      console.log('[REGISTER] Demo mode - simulating registration:', userData);
      
      // Generate unique ID
      const uniqueId = `U-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      if (userData.role === 'engineer') {
        // Create engineer profile in demo mode
        const newEngineer: Engineer = {
          id: uniqueId.replace('U-', 'E-'),
          name: userData.name,
          email: userData.email,
          specialization: userData.specialization || 'General',
          experience: userData.years_exp || 0,
          city: userData.city || '',
          area: userData.area || '',
          rating: 0,
          bio: '',
          avatar: '',
          status: 'pending', // Engineers start as pending for admin approval
          subscriptionStatus: 'expired',
          cv: 'demo_cv.pdf',
          certificate: 'demo_certificate.pdf',
        };
        
        // Add to engineers list
        setEngineers(prev => [...prev, newEngineer]);
        
        // Set current user with pending status
        const newUser = {
          id: uniqueId,
          name: userData.name,
          email: userData.email,
          role: 'engineer' as const,
          status: 'pending' as const,
          verification_status: 'pending' as const,
          city: userData.city,
          area: userData.area,
        };
        setCurrentUser(newUser);
        setStoredUser(newUser);
        
        console.log('[REGISTER] Demo engineer created:', newEngineer);
        return { success: true, message: 'Account created successfully. Pending admin approval.' };
      } else {
        // Create customer in demo mode
        const newCustomer: Customer = {
          id: uniqueId.replace('U-', 'C-'),
          name: userData.name,
          email: userData.email,
          city: userData.city || '',
          area: userData.area || '',
        };
        
        // Add to customers list
        setCustomers(prev => [...prev, newCustomer]);
        
        // Set current user (customers are auto-approved)
        const newUser = {
          id: uniqueId,
          name: userData.name,
          email: userData.email,
          role: 'customer' as const,
          status: 'active' as const,
          verification_status: null,
          city: userData.city,
          area: userData.area,
        };
        setCurrentUser(newUser);
        setStoredUser(newUser);
        
        console.log('[REGISTER] Demo customer created:', newCustomer);
        return { success: true };
      }
    }
    
    // Real API registration
    try {
      const response = await authApi.register(userData);
      if (response.access_token && response.user) {
        setCurrentUser({
          id: `U-${response.user.id}`,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
        });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  }, [isApiAvailable]);

  // ============== Requests Functions ==============

  const refreshRequests = useCallback(async () => {
    if (!isApiAvailable) return;
    
    setLoading(prev => ({ ...prev, requests: true }));
    try {
      const { requests } = await requestsApi.getAll();
      setCustomerRequests(requests.map(mapApiRequest));
      
      // Also update engineer jobs from accepted requests
      if (currentUser?.role === 'engineer') {
        const myJobs = requests
          .filter((r: any) => r.engineer_id && mapStatus(r.status) !== 'Cancelled')
          .map((r: any): EngineerJob => ({
            id: `R-${r.id}`,
            category: r.category || r.service?.feature?.name || 'General',
            description: r.description,
            status: mapStatus(r.status) === 'Completed' ? 'Completed' : 'In Progress',
            customerId: `C-${r.customer_id}`,
            customerName: r.customer?.name || 'Customer',
            location: r.location_text || '',
            price: r.price,
          }));
        setEngineerJobs(myJobs);
      }
    } catch (err) {
      console.error('Failed to refresh requests:', err);
    } finally {
      setLoading(prev => ({ ...prev, requests: false }));
    }
  }, [isApiAvailable, currentUser]);

  const addRequest = useCallback(async (req: Omit<CustomerRequest, 'id' | 'createdAt'>) => {
    if (!isApiAvailable) {
      // Fallback to local state
      const newReq: CustomerRequest = {
        ...req,
        id: 'R-' + (1000 + customerRequests.length + 1),
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCustomerRequests(prev => [...prev, newReq]);
      return;
    }
    
    try {
      await requestsApi.create({
        type: req.type,
        category: req.category,
        description: req.description,
        location_text: req.location,
      });
      await refreshRequests();
    } catch (err) {
      console.error('Failed to create request:', err);
      throw err;
    }
  }, [isApiAvailable, customerRequests.length, refreshRequests]);

  const deleteRequest = useCallback(async (id: string) => {
    const numericId = parseInt(id.replace('R-', ''));
    
    if (!isApiAvailable || isNaN(numericId)) {
      setCustomerRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Cancelled' as const } : r));
      return;
    }
    
    try {
      await requestsApi.cancel(numericId);
      await refreshRequests();
    } catch (err) {
      console.error('Failed to cancel request:', err);
    }
  }, [isApiAvailable, refreshRequests]);

  const resendRequest = useCallback(async (id: string) => {
    const numericId = parseInt(id.replace('R-', ''));
    
    if (!isApiAvailable || isNaN(numericId)) {
      setCustomerRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Pending' as const, engineerId: undefined, engineerName: undefined } : r));
      return;
    }
    
    try {
      await requestsApi.resend(numericId);
      await refreshRequests();
    } catch (err) {
      console.error('Failed to resend request:', err);
    }
  }, [isApiAvailable, refreshRequests]);

  const acceptRequest = useCallback(async (requestId: string, engineerId: string, engineerName: string) => {
    const numericId = parseInt(requestId.replace('R-', ''));
    
    if (!isApiAvailable || isNaN(numericId)) {
      setCustomerRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: 'Accepted' as const, engineerId, engineerName } : r
      ));
      const req = customerRequests.find(r => r.id === requestId);
      if (req) {
        setEngineerJobs(prev => [...prev, {
          id: req.id,
          category: req.category,
          description: req.description,
          status: 'In Progress',
          customerId: req.customerId,
          customerName: req.customerName,
          location: req.location,
        }]);
      }
      return;
    }
    
    try {
      await requestsApi.accept(numericId);
      await refreshRequests();
    } catch (err) {
      console.error('Failed to accept request:', err);
      throw err;
    }
  }, [isApiAvailable, customerRequests, refreshRequests]);

  const updateRequestStatus = useCallback((id: string, status: CustomerRequest['status']) => {
    setCustomerRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (status === 'Completed') {
      setEngineerJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'Completed' } : j));
    }
  }, []);

  const rateRequest = useCallback(async (id: string, rating: number, review: string) => {
    const numericId = parseInt(id.replace('R-', ''));
    
    setCustomerRequests(prev => prev.map(r => r.id === id ? { ...r, rating, review } : r));
    
    if (isApiAvailable && !isNaN(numericId)) {
      try {
        await reviewsApi.create({ request_id: numericId, rating, text: review });
      } catch (err) {
        console.error('Failed to submit review:', err);
      }
    }
  }, [isApiAvailable]);

  const markJobCompleted = useCallback(async (id: string) => {
    const numericId = parseInt(id.replace('R-', ''));
    
    if (!isApiAvailable || isNaN(numericId)) {
      setEngineerJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'Completed' as const } : j));
      setCustomerRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Completed' as const } : r));
      return;
    }
    
    try {
      await requestsApi.complete(numericId);
      await refreshRequests();
    } catch (err) {
      console.error('Failed to complete job:', err);
    }
  }, [isApiAvailable, refreshRequests]);

  // ============== Portfolio Functions ==============

  const refreshPortfolio = useCallback(async () => {
    if (!isApiAvailable || currentUser?.role !== 'engineer') return;
    
    setLoading(prev => ({ ...prev, portfolio: true }));
    try {
      const { portfolio: items } = await engineerApi.getPortfolio();
      setPortfolio(items.map(mapApiPortfolio));
    } catch (err) {
      console.error('Failed to refresh portfolio:', err);
    } finally {
      setLoading(prev => ({ ...prev, portfolio: false }));
    }
  }, [isApiAvailable, currentUser]);

  const addPortfolioItem = useCallback(async (item: Omit<PortfolioItem, 'id'>) => {
    if (!isApiAvailable) {
      setPortfolio(prev => [...prev, { ...item, id: 'P-' + (prev.length + 1) }]);
      return;
    }
    
    try {
      await engineerApi.addPortfolioItem({
        title: item.title,
        description: item.description,
        location: item.location,
        image_url: item.image,
      });
      await refreshPortfolio();
    } catch (err) {
      console.error('Failed to add portfolio item:', err);
    }
  }, [isApiAvailable, refreshPortfolio]);

  const deletePortfolioItem = useCallback(async (id: string) => {
    const numericId = parseInt(id.replace('P-', ''));
    
    if (!isApiAvailable || isNaN(numericId)) {
      setPortfolio(prev => prev.filter(p => p.id !== id));
      return;
    }
    
    try {
      await engineerApi.deletePortfolioItem(numericId);
      await refreshPortfolio();
    } catch (err) {
      console.error('Failed to delete portfolio item:', err);
    }
  }, [isApiAvailable, refreshPortfolio]);

  // ============== Block Functions ==============

  const refreshBlocks = useCallback(async () => {
    if (!isApiAvailable) return;
    
    try {
      const { blocks } = await blocksApi.getAll();
      setBlockedUsers(blocks.map(mapApiBlock));
    } catch (err) {
      console.error('Failed to refresh blocks:', err);
    }
  }, [isApiAvailable]);

  const blockUser = useCallback(async (blockedId: string, blockedName: string) => {
    const numericId = parseInt(blockedId.replace(/[A-Z]-/, ''));
    
    if (!isApiAvailable || isNaN(numericId)) {
      if (!currentUser) return;
      const newBlock: BlockedUser = {
        id: 'B-' + (blockedUsers.length + 1),
        userId: currentUser.id,
        blockedId,
        blockedName,
        blockedAt: new Date().toISOString(),
      };
      setBlockedUsers(prev => [...prev, newBlock]);
      return;
    }
    
    try {
      await blocksApi.create(numericId);
      await refreshBlocks();
    } catch (err) {
      console.error('Failed to block user:', err);
    }
  }, [isApiAvailable, currentUser, blockedUsers.length, refreshBlocks]);

  const unblockUser = useCallback(async (blockedId: string) => {
    const numericId = parseInt(blockedId.replace(/[A-Z]-/, ''));
    
    if (!isApiAvailable || isNaN(numericId)) {
      if (!currentUser) return;
      setBlockedUsers(prev => prev.filter(b => !(b.userId === currentUser.id && b.blockedId === blockedId)));
      return;
    }
    
    try {
      await blocksApi.unblockUser(numericId);
      await refreshBlocks();
    } catch (err) {
      console.error('Failed to unblock user:', err);
    }
  }, [isApiAvailable, currentUser, refreshBlocks]);

  // ============== Notification Functions ==============

  const refreshNotifications = useCallback(async () => {
    if (!isApiAvailable) return;
    
    setLoading(prev => ({ ...prev, notifications: true }));
    try {
      const { notifications: notifs, unread_count } = await notificationsApi.getAll();
      setNotifications(notifs.map(mapApiNotification));
      setUnreadCount(unread_count);
    } catch (err) {
      console.error('Failed to refresh notifications:', err);
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  }, [isApiAvailable]);

  const addNotification = useCallback((userId: string, message: string) => {
    const newNotif: Notification = {
      id: 'N-' + (notifications.length + 1),
      userId,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [...prev, newNotif]);
    setUnreadCount(prev => prev + 1);
  }, [notifications.length]);

  const markNotificationRead = useCallback(async (id: string) => {
    const numericId = parseInt(id.replace('N-', ''));
    
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    if (isApiAvailable && !isNaN(numericId)) {
      try {
        await notificationsApi.markRead(numericId);
      } catch (err) {
        console.error('Failed to mark notification read:', err);
      }
    }
  }, [isApiAvailable]);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    
    if (isApiAvailable) {
      try {
        await notificationsApi.markAllRead();
      } catch (err) {
        console.error('Failed to mark all notifications read:', err);
      }
    }
  }, [isApiAvailable]);

  // ============== Transaction Functions ==============

  const refreshTransactions = useCallback(async () => {
    if (!isApiAvailable || !currentUser) return;
    
    setLoading(prev => ({ ...prev, transactions: true }));
    try {
      let txData: any[] = [];
      if (currentUser.role === 'customer') {
        const data = await financeApi.getCustomerFinance();
        txData = data.transactions || [];
      } else if (currentUser.role === 'engineer') {
        const data = await financeApi.getEngineerFinance();
        txData = data.transactions || [];
      } else {
        const data = await financeApi.getAdminSummary();
        txData = data.recent_transactions || [];
      }
      setTransactions(txData.map(mapApiTransaction));
    } catch (err) {
      console.error('Failed to refresh transactions:', err);
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  }, [isApiAvailable, currentUser]);

  // ============== Review Functions ==============

  const refreshReviews = useCallback(async () => {
    if (!isApiAvailable) return;
    
    try {
      const { reviews: revs } = await reviewsApi.getByUser();
      setReviews(revs.map(mapApiReview));
    } catch (err) {
      console.error('Failed to refresh reviews:', err);
    }
  }, [isApiAvailable]);

  const addReview = useCallback(async (review: Omit<Review, 'id' | 'createdAt'>) => {
    const requestNumId = parseInt(review.requestId.replace('R-', ''));
    
    if (!isApiAvailable || isNaN(requestNumId)) {
      const newReview: Review = {
        ...review,
        id: 'RV-' + (reviews.length + 1),
        createdAt: new Date().toISOString(),
      };
      setReviews(prev => [...prev, newReview]);
      return;
    }
    
    try {
      await reviewsApi.create({
        request_id: requestNumId,
        rating: review.rating,
        text: review.comment,
      });
      await refreshReviews();
    } catch (err) {
      console.error('Failed to add review:', err);
    }
  }, [isApiAvailable, reviews.length, refreshReviews]);

  // ============== Engineer Functions (Admin) ==============

  const refreshEngineers = useCallback(async () => {
    if (!isApiAvailable || currentUser?.role !== 'admin') return;
    
    setLoading(prev => ({ ...prev, engineers: true }));
    try {
      const { users } = await adminApi.getUsers({ role: 'engineer' });
      setEngineers(users.map(mapApiEngineer));
    } catch (err) {
      console.error('Failed to refresh engineers:', err);
    } finally {
      setLoading(prev => ({ ...prev, engineers: false }));
    }
  }, [isApiAvailable, currentUser]);

  const addEngineer = useCallback((engineer: Omit<Engineer, 'id' | 'rating' | 'status'>) => {
    const newEngineer: Engineer = {
      ...engineer,
      id: 'E-' + (engineers.length + 1),
      rating: 0,
      status: 'pending',
    };
    setEngineers(prev => [...prev, newEngineer]);
  }, [engineers.length]);

  const updateEngineerStatus = useCallback(async (id: string, status: Engineer['status']) => {
    const numericId = parseInt(id.replace('E-', ''));
    
    if (!isApiAvailable || isNaN(numericId)) {
      setEngineers(prev => prev.map(e => e.id === id ? { ...e, status } : e));
      return;
    }
    
    try {
      if (status === 'accepted') {
        await adminApi.acceptEngineer(numericId);
      } else if (status === 'rejected') {
        await adminApi.rejectEngineer(numericId);
      }
      await refreshEngineers();
    } catch (err) {
      console.error('Failed to update engineer status:', err);
    }
  }, [isApiAvailable, refreshEngineers]);

  const deleteEngineer = useCallback(async (id: string) => {
    const numericId = parseInt(id.replace('E-', ''));
    
    if (!isApiAvailable || isNaN(numericId)) {
      setEngineers(prev => prev.filter(e => e.id !== id));
      return;
    }
    
    try {
      await adminApi.deleteUser(numericId);
      await refreshEngineers();
    } catch (err) {
      console.error('Failed to delete engineer:', err);
    }
  }, [isApiAvailable, refreshEngineers]);

  // ============== Customer Functions (Admin) ==============

  const deleteCustomer = useCallback(async (id: string) => {
    const numericId = parseInt(id.replace('C-', ''));
    
    if (!isApiAvailable || isNaN(numericId)) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      return;
    }
    
    try {
      await adminApi.deleteUser(numericId);
      const { users } = await adminApi.getUsers({ role: 'customer' });
      setCustomers(users.map((u: any) => ({
        id: `C-${u.id}`,
        name: u.name,
        email: u.email,
        city: u.city || '',
        area: u.area || '',
      })));
    } catch (err) {
      console.error('Failed to delete customer:', err);
    }
  }, [isApiAvailable]);

  // ============== Auto-refresh on user change ==============

  useEffect(() => {
    if (currentUser && isApiAvailable) {
      refreshRequests();
      refreshNotifications();
      refreshBlocks();
      
      if (currentUser.role === 'engineer') {
        refreshPortfolio();
      }
      if (currentUser.role === 'admin') {
        refreshEngineers();
      }
    }
  }, [currentUser, isApiAvailable, refreshRequests, refreshNotifications, refreshBlocks, refreshPortfolio, refreshEngineers]);

  // ============== Context Value ==============

  return (
    <DataContext.Provider value={{
      // Auth
      currentUser,
      setCurrentUser,
      login,
      logout,
      register,
      
      // Loading
      loading,
      isApiAvailable,
      
      // Requests
      customerRequests,
      addRequest,
      deleteRequest,
      resendRequest,
      acceptRequest,
      updateRequestStatus,
      rateRequest,
      refreshRequests,
      
      // Jobs
      engineerJobs,
      markJobCompleted,
      
      // Portfolio
      portfolio,
      addPortfolioItem,
      deletePortfolioItem,
      refreshPortfolio,
      
      // Blocks
      blockedUsers,
      blockUser,
      unblockUser,
      refreshBlocks,
      
      // Notifications
      notifications,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      unreadCount,
      refreshNotifications,
      
      // Transactions
      transactions,
      refreshTransactions,
      
      // Reviews
      reviews,
      addReview,
      refreshReviews,
      
      // Engineers
      engineers,
      addEngineer,
      updateEngineerStatus,
      deleteEngineer,
      refreshEngineers,
      
      // Customers
      customers,
      deleteCustomer,
      
      // Static data
      features: staticFeatures,
      services: staticServices,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
