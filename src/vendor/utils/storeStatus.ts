import {
  StoreProfileState,
  StoreStatusResult,
  DayOfWeek,
  DaySchedule,
} from '../types/storeProfile';

const DAYS_LIST: DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const DAY_NAMES: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

/**
 * Parses time strings like "09:00 AM", "12:30 PM", "08:45 PM" into minutes from midnight (0-1439).
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().toUpperCase();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3];

  if (period === 'PM' && hours < 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Formats minutes from midnight into 12-hour string (e.g. 540 -> "09:00 AM")
 */
export function formatMinutesToTime(minutes: number): string {
  const norm = ((minutes % 1440) + 1440) % 1440;
  let hours = Math.floor(norm / 60);
  const mins = norm % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;

  const padH = hours < 10 ? `0${hours}` : `${hours}`;
  const padM = mins < 10 ? `0${mins}` : `${mins}`;
  return `${padH}:${padM} ${period}`;
}

/**
 * Format a Date object to YYYY-MM-DD
 */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Centralized Store Status Calculator (Doc #31.7, 31.8, 31.9, 31.10, 31.15)
 */
export function calculateStoreStatus(
  profile: Partial<StoreProfileState>,
  referenceDate: Date = new Date()
): StoreStatusResult {
  const weekly = profile.weeklySchedule;
  const currentDayOfWeek = DAYS_LIST[referenceDate.getDay()];
  const todaySchedule: DaySchedule = weekly?.[currentDayOfWeek] || {
    isOpen: true,
    openTime: '09:00 AM',
    closeTime: '09:00 PM',
  };

  // Priority 1: Account Suspended
  if (profile.isAccountSuspended) {
    return {
      isOpen: false,
      status: 'closed',
      badgeLabel: 'SUSPENDED',
      statusSubtitle: 'Account temporarily suspended',
      color: '#FF3B30',
      todaySchedule,
    };
  }

  // Priority 2: Vendor Disabled
  if (profile.isVendorDisabled) {
    return {
      isOpen: false,
      status: 'closed',
      badgeLabel: 'INACTIVE',
      statusSubtitle: 'Merchant account is currently inactive',
      color: '#8E8E93',
      todaySchedule,
    };
  }

  // Priority 3: Special Closures / Holiday
  const todayKey = formatDateKey(referenceDate);
  const holiday = profile.specialClosures?.find((sc) => sc.date === todayKey);
  if (holiday) {
    if (holiday.isFullDay) {
      return {
        isOpen: false,
        status: 'closed',
        badgeLabel: 'HOLIDAY',
        statusSubtitle: `Closed today for ${holiday.name}`,
        color: '#FF3B30',
        todaySchedule,
      };
    } else if (holiday.openTime && holiday.closeTime) {
      const curMins = referenceDate.getHours() * 60 + referenceDate.getMinutes();
      const sOpen = parseTimeToMinutes(holiday.openTime);
      const sClose = parseTimeToMinutes(holiday.closeTime);

      if (curMins >= sOpen && curMins < sClose) {
        const left = sClose - curMins;
        if (left <= 30) {
          return {
            isOpen: true,
            status: 'closing_soon',
            badgeLabel: 'CLOSING SOON',
            statusSubtitle: `Holiday hours: closes in ${left} min`,
            color: '#FF9F1C',
            todaySchedule,
            minutesRemaining: left,
          };
        }
        return {
          isOpen: true,
          status: 'open',
          badgeLabel: 'OPEN',
          statusSubtitle: `Holiday hours: open until ${holiday.closeTime}`,
          color: '#00B074',
          todaySchedule,
        };
      } else {
        return {
          isOpen: false,
          status: 'closed',
          badgeLabel: 'CLOSED',
          statusSubtitle: `Special hours: ${holiday.openTime} – ${holiday.closeTime}`,
          color: '#FF3B30',
          todaySchedule,
        };
      }
    }
  }

  // Priority 4: Manual Temporary Emergency Closure
  if (profile.temporaryClosure?.isActive && profile.temporaryClosure.closedUntil) {
    const expiry = new Date(profile.temporaryClosure.closedUntil).getTime();
    if (referenceDate.getTime() < expiry) {
      const expiryDate = new Date(profile.temporaryClosure.closedUntil);
      const hrs = String(expiryDate.getHours() % 12 || 12).padStart(2, '0');
      const mins = String(expiryDate.getMinutes()).padStart(2, '0');
      const ampm = expiryDate.getHours() >= 12 ? 'PM' : 'AM';
      const reason = profile.temporaryClosure.reason || 'Emergency';

      return {
        isOpen: false,
        status: 'temporarily_closed',
        badgeLabel: 'TEMP CLOSED',
        statusSubtitle: `${reason} closure • Reopens at ${hrs}:${mins} ${ampm}`,
        color: '#FF9F1C',
        todaySchedule,
      };
    }
  }

  // Priority 5: Manual Open Override
  if (profile.manualOverride?.isActive && profile.manualOverride.overrideUntil) {
    const expiry = new Date(profile.manualOverride.overrideUntil).getTime();
    if (referenceDate.getTime() < expiry) {
      const expDate = new Date(profile.manualOverride.overrideUntil);
      const hrs = String(expDate.getHours() % 12 || 12).padStart(2, '0');
      const mins = String(expDate.getMinutes()).padStart(2, '0');
      const ampm = expDate.getHours() >= 12 ? 'PM' : 'AM';

      return {
        isOpen: true,
        status: 'open',
        badgeLabel: 'OPEN',
        statusSubtitle: `Manual open active until ${hrs}:${mins} ${ampm}`,
        color: '#00B074',
        todaySchedule,
      };
    }
  }

  // Priority 6 & 7: Weekly Schedule & Current Time
  const curMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();

  // Helper to find next opening day and time
  const findNextOpening = (): string => {
    if (!weekly) return 'Opens tomorrow at 09:00 AM';
    for (let offset = 1; offset <= 7; offset++) {
      const nextDate = new Date(referenceDate);
      nextDate.setDate(nextDate.getDate() + offset);
      const nextDay = DAYS_LIST[nextDate.getDay()];
      const sched = weekly[nextDay];
      if (sched && sched.isOpen) {
        const dayLabel = offset === 1 ? 'tomorrow' : DAY_NAMES[nextDay];
        return `Opens ${dayLabel} at ${sched.openTime}`;
      }
    }
    return 'Opens next week';
  };

  // If today is marked CLOSED
  if (!todaySchedule.isOpen) {
    const nextOpeningText = findNextOpening();
    return {
      isOpen: false,
      status: 'closed',
      badgeLabel: 'CLOSED',
      statusSubtitle: nextOpeningText,
      color: '#8E8E93',
      todaySchedule,
      nextOpeningText,
    };
  }

  // Primary shift
  const openMins = parseTimeToMinutes(todaySchedule.openTime);
  const closeMins = parseTimeToMinutes(todaySchedule.closeTime);

  // Before primary shift opening
  if (curMinutes < openMins) {
    return {
      isOpen: false,
      status: 'closed',
      badgeLabel: 'CLOSED',
      statusSubtitle: `Opens today at ${todaySchedule.openTime}`,
      color: '#FF3B30',
      todaySchedule,
    };
  }

  // Inside primary shift
  if (curMinutes >= openMins && curMinutes < closeMins) {
    const remaining = closeMins - curMinutes;
    if (remaining <= 30) {
      return {
        isOpen: true,
        status: 'closing_soon',
        badgeLabel: 'CLOSING SOON',
        statusSubtitle: `Closes in ${remaining} min (${todaySchedule.closeTime})`,
        color: '#FF9F1C',
        todaySchedule,
        minutesRemaining: remaining,
      };
    }
    return {
      isOpen: true,
      status: 'open',
      badgeLabel: 'OPEN',
      statusSubtitle: `Open until ${todaySchedule.closeTime}`,
      color: '#00B074',
      todaySchedule,
    };
  }

  // Check optional second shift (split shift)
  if (
    todaySchedule.hasSecondShift &&
    todaySchedule.secondOpenTime &&
    todaySchedule.secondCloseTime
  ) {
    const secOpenMins = parseTimeToMinutes(todaySchedule.secondOpenTime);
    const secCloseMins = parseTimeToMinutes(todaySchedule.secondCloseTime);

    if (curMinutes < secOpenMins) {
      return {
        isOpen: false,
        status: 'closed',
        badgeLabel: 'CLOSED',
        statusSubtitle: `Opens today at ${todaySchedule.secondOpenTime}`,
        color: '#FF3B30',
        todaySchedule,
      };
    }

    if (curMinutes >= secOpenMins && curMinutes < secCloseMins) {
      const remaining = secCloseMins - curMinutes;
      if (remaining <= 30) {
        return {
          isOpen: true,
          status: 'closing_soon',
          badgeLabel: 'CLOSING SOON',
          statusSubtitle: `Closes in ${remaining} min (${todaySchedule.secondCloseTime})`,
          color: '#FF9F1C',
          todaySchedule,
          minutesRemaining: remaining,
        };
      }
      return {
        isOpen: true,
        status: 'open',
        badgeLabel: 'OPEN',
        statusSubtitle: `Open until ${todaySchedule.secondCloseTime}`,
        color: '#00B074',
        todaySchedule,
      };
    }
  }

  // After closing time today -> Closed, find next opening
  const nextOpeningText = findNextOpening();
  return {
    isOpen: false,
    status: 'closed',
    badgeLabel: 'CLOSED',
    statusSubtitle: nextOpeningText,
    color: '#8E8E93',
    todaySchedule,
    nextOpeningText,
  };
}
