import { configureStore, Middleware } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import vendorOnboardingReducer from '@/vendor/store/vendorOnboardingSlice';
import vendorStoreReducer from '@/vendor/store/vendorStoreSlice';
import chatReducer from '@/features/chat/store/chatSlice';
import callReducer from '@/features/call/store/callSlice';

// Dev-only Redux action logger to trace actions that trigger renders
const actionLoggerMiddleware: Middleware = () => (next) => (action: any) => {
  if (__DEV__) {
    console.log(`[Redux Action] ⚡ ${action?.type}`);
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    vendorOnboarding: vendorOnboardingReducer,
    vendorStore: vendorStoreReducer,
    chat: chatReducer,
    call: callReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(__DEV__ ? [actionLoggerMiddleware] : []),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
