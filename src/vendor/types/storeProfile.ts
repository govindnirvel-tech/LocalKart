export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface DaySchedule {
  isOpen: boolean;
  openTime: string; // Format: "09:00 AM"
  closeTime: string; // Format: "09:00 PM"
  hasSecondShift?: boolean;
  secondOpenTime?: string; // Format: "05:00 PM"
  secondCloseTime?: string; // Format: "10:00 PM"
}

export type WeeklySchedule = Record<DayOfWeek, DaySchedule>;

export interface SpecialClosure {
  id: string;
  date: string; // "YYYY-MM-DD" e.g. "2026-10-24"
  name: string; // e.g. "Diwali Festival", "Independence Day"
  isFullDay: boolean;
  openTime?: string;
  closeTime?: string;
}

export type TemporaryClosureReason =
  | 'Emergency'
  | 'Stock Issue'
  | 'Staff Unavailable'
  | 'Maintenance'
  | 'Holiday'
  | 'Other';

export interface TemporaryClosure {
  isActive: boolean;
  reason?: TemporaryClosureReason;
  closedUntil?: string; // ISO string e.g. "2026-10-07T22:30:00.000Z"
  label?: string; // e.g. "Closed for 2 hours (Emergency)"
}

export interface ManualOpenOverride {
  isActive: boolean;
  overrideUntil?: string; // ISO string
}

export interface StoreGalleryImage {
  id: string;
  uri: string;
  label: string; // e.g. "Front Shop Photo", "Product Display", "Store Counter"
  status: 'uploading' | 'success' | 'failed';
  progress?: number;
}

export interface StoreLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  accuracyMeters: number;
}

export interface StoreDeliverySettings {
  radiusKm: number;
  minOrderAmount: number;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
}

export interface StoreProfileState {
  storeName: string;
  description: string;
  category: string;
  businessType: string;
  logoUri: string;
  coverUri: string;
  gallery: StoreGalleryImage[];
  location: StoreLocation;
  deliverySettings: StoreDeliverySettings;
  weeklySchedule: WeeklySchedule;
  specialClosures: SpecialClosure[];
  temporaryClosure: TemporaryClosure;
  manualOverride: ManualOpenOverride;
  contactPhone: string;
  supportEmail: string;
  returnPolicy: string;
  cancellationPolicy: string;
  isAccountSuspended: boolean;
  isVendorDisabled: boolean;
  timezone: string;
}

export type StoreOperationalStatus =
  | 'open'
  | 'closed'
  | 'closing_soon'
  | 'temporarily_closed';

export interface StoreStatusResult {
  isOpen: boolean;
  status: StoreOperationalStatus;
  badgeLabel: string; // 'OPEN' | 'CLOSED' | 'CLOSING SOON' | 'TEMP CLOSED'
  statusSubtitle: string; // e.g. 'Open until 9:00 PM', 'Closes in 18 min', 'Opens tomorrow at 9:00 AM'
  color: string; // Hex color for pill/dot
  todaySchedule: DaySchedule;
  nextOpeningText?: string;
  minutesRemaining?: number;
}
