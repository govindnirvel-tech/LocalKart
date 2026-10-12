import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  VendorOnboardingState,
  VendorBusinessData,
  VendorAddressData,
  VendorDocumentData,
  VendorBankData,
} from '../types/onboarding';

const initialState: VendorOnboardingState = {
  currentMode: 'customer',
  approvalStatus: 'APPROVED',
  currentStep: 1,
  business: {
    storeName: 'Sharma Fresh Mart',
    businessType: 'individual',
    category: 'Groceries & Daily Needs',
    subCategory: 'Daily Staples & Fruits',
    description: 'Fresh vegetables, dairy, FMCG items delivered in 15-20 mins.',
    yearOfEstablishment: '2021',
    logoUri: undefined,
    bannerUri: undefined,
  },
  address: {
    addressLine1: 'Shop #14, Vijay Nagar Square',
    addressLine2: 'Near Scheme 54 Park',
    landmark: 'Opposite Domino\'s',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452010',
    latitude: 22.7533,
    longitude: 75.8937,
    deliveryRadiusKm: 3,
    sameForPickup: true,
    minOrderAmount: 99,
    freeDeliveryThreshold: 249,
  },
  documents: {
    panNumber: 'ABCDE1234F',
    panDocName: 'pan_card_sharma.pdf',
    gstin: '23ABCDE1234F1Z5',
    gstDocName: 'gst_certificate.pdf',
    fssaiNumber: '11422850000123',
    fssaiDocName: 'fssai_reg.pdf',
    shopLicenseName: 'gumasta_license.pdf',
  },
  bank: {
    accountHolderName: 'Aman Sharma',
    accountNumber: '50100482910481',
    confirmAccountNumber: '50100482910481',
    ifscCode: 'HDFC0001234',
    bankName: 'HDFC Bank',
    branchName: 'Vijay Nagar Indore',
    upiId: 'sharmafresh@hdfcbank',
    chequeDocName: 'cancelled_cheque.jpg',
  },
  status: 'draft',
  termsAccepted: true,
  referenceId: 'LK-VEN-8492',
};

export const vendorOnboardingSlice = createSlice({
  name: 'vendorOnboarding',
  initialState,
  reducers: {
    setAppMode: (state, action: PayloadAction<'customer' | 'vendor'>) => {
      state.currentMode = action.payload;
    },
    setApprovalStatus: (state, action: PayloadAction<VendorOnboardingState['approvalStatus']>) => {
      state.approvalStatus = action.payload;
    },
    startOnboarding: (state) => {
      state.currentMode = 'vendor';
      state.approvalStatus = 'ONBOARDING';
      state.currentStep = 1;
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = Math.max(1, Math.min(5, action.payload));
    },
    nextStep: (state) => {
      if (state.currentStep < 5) {
        state.currentStep += 1;
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    updateBusiness: (state, action: PayloadAction<Partial<VendorBusinessData>>) => {
      state.business = { ...state.business, ...action.payload };
    },
    updateAddress: (state, action: PayloadAction<Partial<VendorAddressData>>) => {
      state.address = { ...state.address, ...action.payload };
    },
    updateDocuments: (state, action: PayloadAction<Partial<VendorDocumentData>>) => {
      state.documents = { ...state.documents, ...action.payload };
    },
    updateBank: (state, action: PayloadAction<Partial<VendorBankData>>) => {
      state.bank = { ...state.bank, ...action.payload };
    },
    setTermsAccepted: (state, action: PayloadAction<boolean>) => {
      state.termsAccepted = action.payload;
    },
    submitVerification: (state) => {
      state.status = 'under_review';
      state.approvalStatus = 'UNDER_REVIEW';
    },
    resetOnboarding: () => initialState,
  },
});

export const {
  setAppMode,
  setApprovalStatus,
  startOnboarding,
  setStep,
  nextStep,
  prevStep,
  updateBusiness,
  updateAddress,
  updateDocuments,
  updateBank,
  setTermsAccepted,
  submitVerification,
  resetOnboarding,
} = vendorOnboardingSlice.actions;

export default vendorOnboardingSlice.reducer;
