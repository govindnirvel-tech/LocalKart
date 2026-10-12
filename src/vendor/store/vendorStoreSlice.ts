import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  StoreProfileState,
  DayOfWeek,
  DaySchedule,
  SpecialClosure,
  TemporaryClosureReason,
  StoreGalleryImage,
  StoreLocation,
  StoreDeliverySettings,
} from '../types/storeProfile';

const initialState: StoreProfileState = {
  storeName: 'Sharma Fresh Mart',
  category: 'Groceries & Daily Needs',
  description:
    'Indore\'s trusted hyperlocal mart for farm-fresh dairy, seasonal vegetables, pantry staples, and bakery goods delivered in 15-20 mins.',
  businessType: 'Individual / Proprietorship',
  logoUri:
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
  coverUri:
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1000&auto=format&fit=crop&q=80',
  gallery: [
    {
      id: 'gal-1',
      uri: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
      label: 'Front Shop Entrance',
      status: 'success',
    },
    {
      id: 'gal-2',
      uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
      label: 'Main Aisles & Shelves',
      status: 'success',
    },
    {
      id: 'gal-3',
      uri: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&auto=format&fit=crop&q=80',
      label: 'Billing & Packing Counter',
      status: 'success',
    },
    {
      id: 'gal-4',
      uri: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&auto=format&fit=crop&q=80',
      label: 'Fresh Produce Section',
      status: 'success',
    },
  ],
  location: {
    latitude: 22.7533,
    longitude: 75.8937,
    address: 'Shop #14, Ground Floor, Vijay Nagar Square, Scheme 54',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452010',
    accuracyMeters: 4,
  },
  deliverySettings: {
    radiusKm: 3,
    minOrderAmount: 99,
    deliveryCharge: 25,
    freeDeliveryThreshold: 249,
  },
  weeklySchedule: {
    monday: { isOpen: true, openTime: '09:00 AM', closeTime: '09:00 PM' },
    tuesday: { isOpen: true, openTime: '09:00 AM', closeTime: '09:00 PM' },
    wednesday: { isOpen: true, openTime: '09:00 AM', closeTime: '09:00 PM' },
    thursday: { isOpen: true, openTime: '09:00 AM', closeTime: '09:00 PM' },
    friday: { isOpen: true, openTime: '09:00 AM', closeTime: '09:00 PM' },
    saturday: { isOpen: true, openTime: '09:00 AM', closeTime: '09:00 PM' },
    sunday: { isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM' },
  },
  specialClosures: [
    {
      id: 'sc-1',
      date: '2026-10-24',
      name: 'Diwali Festival',
      isFullDay: true,
    },
    {
      id: 'sc-2',
      date: '2026-08-15',
      name: 'Independence Day',
      isFullDay: false,
      openTime: '10:00 AM',
      closeTime: '02:00 PM',
    },
  ],
  temporaryClosure: {
    isActive: false,
  },
  manualOverride: {
    isActive: false,
  },
  contactPhone: '+91 98765 43210',
  supportEmail: 'support@sharmafreshmart.in',
  returnPolicy:
    '100% instant refund or replacement for damaged, missing or expired fresh items reported within 2 hours of delivery.',
  cancellationPolicy:
    'Free cancellation within 2 minutes of placing order before the merchant begins grocery preparation.',
  isAccountSuspended: false,
  isVendorDisabled: false,
  timezone: 'Asia/Kolkata',
};

export const vendorStoreSlice = createSlice({
  name: 'vendorStore',
  initialState,
  reducers: {
    updateStoreIdentity: (
      state,
      action: PayloadAction<{
        storeName?: string;
        category?: string;
        description?: string;
        businessType?: string;
      }>
    ) => {
      if (action.payload.storeName !== undefined) state.storeName = action.payload.storeName;
      if (action.payload.category !== undefined) state.category = action.payload.category;
      if (action.payload.description !== undefined) state.description = action.payload.description;
      if (action.payload.businessType !== undefined) state.businessType = action.payload.businessType;
    },
    setLogoUri: (state, action: PayloadAction<string>) => {
      state.logoUri = action.payload;
    },
    removeLogoUri: (state) => {
      state.logoUri = '';
    },
    setCoverUri: (state, action: PayloadAction<string>) => {
      state.coverUri = action.payload;
    },
    removeCoverUri: (state) => {
      state.coverUri = '';
    },
    addGalleryPhoto: (state, action: PayloadAction<StoreGalleryImage>) => {
      state.gallery.unshift(action.payload);
    },
    removeGalleryPhoto: (state, action: PayloadAction<string>) => {
      state.gallery = state.gallery.filter((img) => img.id !== action.payload);
    },
    updateGalleryPhotoStatus: (
      state,
      action: PayloadAction<{ id: string; status: StoreGalleryImage['status']; progress?: number }>
    ) => {
      const target = state.gallery.find((img) => img.id === action.payload.id);
      if (target) {
        target.status = action.payload.status;
        if (action.payload.progress !== undefined) target.progress = action.payload.progress;
      }
    },
    updateStoreLocation: (state, action: PayloadAction<Partial<StoreLocation>>) => {
      state.location = { ...state.location, ...action.payload };
    },
    updateDeliverySettings: (
      state,
      action: PayloadAction<Partial<StoreDeliverySettings>>
    ) => {
      state.deliverySettings = { ...state.deliverySettings, ...action.payload };
    },
    updateDaySchedule: (
      state,
      action: PayloadAction<{ day: DayOfWeek; schedule: Partial<DaySchedule> }>
    ) => {
      const { day, schedule } = action.payload;
      state.weeklySchedule[day] = { ...state.weeklySchedule[day], ...schedule };
    },
    addSpecialClosure: (state, action: PayloadAction<SpecialClosure>) => {
      state.specialClosures.push(action.payload);
    },
    removeSpecialClosure: (state, action: PayloadAction<string>) => {
      state.specialClosures = state.specialClosures.filter((sc) => sc.id !== action.payload);
    },
    setTemporaryClosure: (
      state,
      action: PayloadAction<{
        reason: TemporaryClosureReason;
        durationMinutes: number;
      }>
    ) => {
      const expiry = new Date(Date.now() + action.payload.durationMinutes * 60 * 1000).toISOString();
      state.temporaryClosure = {
        isActive: true,
        reason: action.payload.reason,
        closedUntil: expiry,
        label: `Closed for ${action.payload.durationMinutes >= 60 ? `${action.payload.durationMinutes / 60}h` : `${action.payload.durationMinutes}m`} (${action.payload.reason})`,
      };
      state.manualOverride = { isActive: false };
    },
    clearTemporaryClosure: (state) => {
      state.temporaryClosure = { isActive: false };
    },
    setManualOverride: (
      state,
      action: PayloadAction<{ durationMinutes: number }>
    ) => {
      const expiry = new Date(Date.now() + action.payload.durationMinutes * 60 * 1000).toISOString();
      state.manualOverride = {
        isActive: true,
        overrideUntil: expiry,
      };
      state.temporaryClosure = { isActive: false };
    },
    clearManualOverride: (state) => {
      state.manualOverride = { isActive: false };
    },
    updateContactAndPolicies: (
      state,
      action: PayloadAction<{
        contactPhone?: string;
        supportEmail?: string;
        returnPolicy?: string;
        cancellationPolicy?: string;
      }>
    ) => {
      if (action.payload.contactPhone !== undefined) state.contactPhone = action.payload.contactPhone;
      if (action.payload.supportEmail !== undefined) state.supportEmail = action.payload.supportEmail;
      if (action.payload.returnPolicy !== undefined) state.returnPolicy = action.payload.returnPolicy;
      if (action.payload.cancellationPolicy !== undefined) state.cancellationPolicy = action.payload.cancellationPolicy;
    },
  },
});

export const {
  updateStoreIdentity,
  setLogoUri,
  removeLogoUri,
  setCoverUri,
  removeCoverUri,
  addGalleryPhoto,
  removeGalleryPhoto,
  updateGalleryPhotoStatus,
  updateStoreLocation,
  updateDeliverySettings,
  updateDaySchedule,
  addSpecialClosure,
  removeSpecialClosure,
  setTemporaryClosure,
  clearTemporaryClosure,
  setManualOverride,
  clearManualOverride,
  updateContactAndPolicies,
} = vendorStoreSlice.actions;

export default vendorStoreSlice.reducer;
