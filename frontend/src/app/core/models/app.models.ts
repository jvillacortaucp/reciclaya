import { HttpInterceptorFn } from '@angular/common/http';
import { Route } from '@angular/router';

export interface RouteMeta {
  readonly title: string;
  readonly breadcrumb: string;
  readonly icon?: string;
  readonly permissions?: readonly string[];
  readonly roles?: readonly string[];
}

export interface AppRoute extends Route {
  readonly data?: {
    readonly meta?: RouteMeta;
  };
}

export interface SidebarNavItem {
  readonly label: string;
  readonly group: 'Marketplace' | 'Intelligence' | 'Account';
  readonly icon: string;
  readonly route: string;
  readonly permissions?: readonly string[];
}

export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly message?: string;
}

export interface User {
  readonly id: string;
  readonly email: string;
  readonly fullName: string;
  readonly role: UserRole;
  readonly profileType: 'company' | 'person';
}

export interface CompanyProfile {
  readonly companyName: string;
  readonly taxId: string;
  readonly industry: string;
  readonly verificationStatus: 'pending' | 'verified';
}

export interface NaturalPersonProfile {
  readonly documentId: string;
  readonly phone: string;
  readonly city: string;
}

export interface AuthSession {
  readonly token: string;
  readonly refreshToken: string;
  readonly expiresAt: string;
  readonly user: User;
  readonly permissions: readonly string[];
}

export interface WasteVolume {
  readonly amount: number;
  readonly unit: 'kg' | 'ton';
}

export interface LogisticsInfo {
  readonly pickupAvailable: boolean;
  readonly location: string;
  readonly deliveryWindowDays: number;
}

export interface WasteListing {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly description: string;
  readonly pricePerUnit: number;
  readonly currency: 'PEN' | 'USD';
  readonly volume: WasteVolume;
  readonly sellerName: string;
  readonly createdAt: string;
  readonly tags: readonly string[];
}

export interface ListingDetail extends WasteListing {
  readonly qualityNotes: string;
  readonly logistics: LogisticsInfo;
  readonly images: readonly string[];
}

export interface PurchasePreference {
  readonly id: string;
  readonly material: string;
  readonly monthlyDemand: WasteVolume;
  readonly maxBudget: number;
  readonly location: string;
}

export interface PaymentMethod {
  readonly type: 'transfer' | 'cash' | 'credit';
  readonly label: string;
}

export interface PricingSummary {
  readonly subtotal: number;
  readonly logisticsFee: number;
  readonly taxes: number;
  readonly total: number;
  readonly currency: 'PEN' | 'USD';
}

export interface PreOrder {
  readonly id: string;
  readonly listingId: string;
  readonly buyerId: string;
  readonly quantity: number;
  readonly desiredDate: string;
  readonly status: 'draft' | 'submitted' | 'approved' | 'rejected';
  readonly paymentMethod: PaymentMethod;
  readonly pricing: PricingSummary;
}

export interface Recommendation {
  readonly id: string;
  readonly title: string;
  readonly confidenceScore: number;
  readonly reason: string;
  readonly listingId?: string;
}

export enum UserRole {
  Admin = 'admin',
  Seller = 'seller',
  Buyer = 'buyer'
}

export type AppHttpInterceptor = HttpInterceptorFn;
