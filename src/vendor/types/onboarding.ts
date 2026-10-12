export type BusinessType =
  | 'individual'
  | 'proprietorship'
  | 'partnership'
  | 'llp'
  | 'pvt_ltd';

export type StoreCategory =
  | 'Groceries & Daily Needs'
  | 'Fresh Dairy & Eggs'
  | 'Fruits & Vegetables'
  | 'Pharmacy & Wellness'
  | 'Bakery & Snacks'
  | 'Fashion & Boutique'
  | 'Electronics & Mobile'
  | 'Home & Kitchen';

export interface VendorBusinessData {
  storeName: string;
  businessType: BusinessType;
  category: StoreCategory;
  subCategory?: string;
  description?: string;
  yearOfEstablishment?: string;
  logoUri?: string;
  bannerUri?: string;
}

export interface VendorAddressData {
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  deliveryRadiusKm: number;
  sameForPickup: boolean;
  minOrderAmount: number;
  freeDeliveryThreshold: number;
}

export interface VendorDocumentData {
  panNumber: string;
  panDocName?: string;
  panVerified?: boolean;
  panAgency?: string;
  panExtractedName?: string;
  gstin?: string;
  gstDocName?: string;
  gstVerified?: boolean;
  gstAgency?: string;
  fssaiNumber?: string;
  fssaiDocName?: string;
  fssaiVerified?: boolean;
  fssaiAgency?: string;
  shopLicenseName?: string;
  shopLicenseVerified?: boolean;
  shopLicenseAgency?: string;
}

export interface VendorBankData {
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  upiId?: string;
  chequeDocName?: string;
  pennyDropStatus?: 'SUCCESS' | 'FAILED' | 'PENDING';
  pennyDropUtr?: string;
  pennyDropBeneficiary?: string;
}

export type AppMode = 'customer' | 'vendor';

export type VendorApprovalStatus =
  | 'NOT_STARTED'
  | 'ONBOARDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export type OnboardingVerificationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'rejected';

export interface VendorOnboardingState {
  currentMode: AppMode;
  approvalStatus: VendorApprovalStatus;
  currentStep: number;
  business: VendorBusinessData;
  address: VendorAddressData;
  documents: VendorDocumentData;
  bank: VendorBankData;
  status: OnboardingVerificationStatus;
  termsAccepted: boolean;
  referenceId: string;
}
