export type RequestType = 'quick' | 'late';
export type RequestStatus = 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled';

export interface CustomerRequest {
  id: string;
  type: RequestType;
  category: string;
  area: string;
  location: string;
  status: RequestStatus;
  createdAt: string;
  description: string;
  customerName: string;
  customerId: string;
  engineerId?: string;
  engineerName?: string;
  serviceId?: string; // Links to Service.id for price consistency
  price?: number;
  rating?: number;
  review?: string;
}

export interface EngineerJob {
  id: string;
  category: string;
  description: string;
  status: 'In Progress' | 'Completed';
  customerId: string;
  customerName: string;
  location: string;
  price?: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  location: string;
  image: string;
}

export interface Service {
  id: string;
  featureId: string;
  name: string;
  price: number;
  engineerId: string;
  engineerName: string;
  description: string;
}

export interface Feature {
  id: string;
  name: string;
  icon: string;
}

export interface Engineer {
  id: string;
  name: string;
  email: string;
  specialization: string;
  experience: number;
  city: string;
  area: string;
  rating: number;
  bio: string;
  avatar: string;
  status: 'pending' | 'accepted' | 'rejected';
  subscriptionStatus?: 'active' | 'expired';
  cv?: string;
  certificate?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  city: string;
  area: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface BlockedUser {
  id: string;
  userId: string;
  blockedId: string;
  blockedName: string;
  blockedAt: string;
}

export interface Transaction {
  id: string;
  requestId: string;
  customerId: string;
  customerName: string;
  engineerId: string;
  engineerName: string;
  service: string;
  amount: number;
  date: string;
}

export interface Review {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  requestId: string;
  rating: number;
  comment: string;
  createdAt: string;
}
