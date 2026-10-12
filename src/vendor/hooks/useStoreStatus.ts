import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { StoreProfileState, StoreStatusResult } from '../types/storeProfile';
import { calculateStoreStatus } from '../utils/storeStatus';

/**
 * Reusable Hook: useStoreStatus (Doc #31.8)
 * Automatically recalculates store status every 30 seconds without requiring manual interaction.
 * Exposes isOpen, status ('open' | 'closed' | 'closing_soon' | 'temporarily_closed'),
 * badgeLabel, statusSubtitle, themeColor, etc.
 */
export function useStoreStatus(
  overrideProfile?: Partial<StoreProfileState>
): StoreStatusResult {
  const reduxStoreProfile = useSelector(
    (state: RootState) => (state as any).vendorStore as StoreProfileState | undefined
  );

  const activeProfile = overrideProfile || reduxStoreProfile || {};

  const [statusResult, setStatusResult] = useState<StoreStatusResult>(() =>
    calculateStoreStatus(activeProfile, new Date())
  );

  useEffect(() => {
    // Initial calculation on mount or profile change
    setStatusResult(calculateStoreStatus(activeProfile, new Date()));

    // Periodic automatic re-check every 30 seconds for seamless minute transitions (e.g., 09:00 PM)
    const timer = setInterval(() => {
      setStatusResult(calculateStoreStatus(activeProfile, new Date()));
    }, 30000);

    return () => clearInterval(timer);
  }, [
    activeProfile.weeklySchedule,
    activeProfile.specialClosures,
    activeProfile.temporaryClosure,
    activeProfile.manualOverride,
    activeProfile.isAccountSuspended,
    activeProfile.isVendorDisabled,
  ]);

  return statusResult;
}
