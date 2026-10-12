import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { fonts } from '@/theme/fonts';
import { ClockIcon, PlusIcon } from '../common/Icons';
import {
  DayOfWeek,
  DaySchedule,
  WeeklySchedule,
} from '../../types/storeProfile';
import { TimePickerModal } from './TimePickerModal';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface BusinessHoursEditorProps {
  schedule: WeeklySchedule;
  onUpdateDay: (day: DayOfWeek, update: Partial<DaySchedule>) => void;
}

const ORDERED_DAYS: { key: DayOfWeek; label: string; short: string; dayIndex: number }[] = [
  { key: 'monday', label: 'Monday', short: 'Mon', dayIndex: 1 },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue', dayIndex: 2 },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed', dayIndex: 3 },
  { key: 'thursday', label: 'Thursday', short: 'Thu', dayIndex: 4 },
  { key: 'friday', label: 'Friday', short: 'Fri', dayIndex: 5 },
  { key: 'saturday', label: 'Saturday', short: 'Sat', dayIndex: 6 },
  { key: 'sunday', label: 'Sunday', short: 'Sun', dayIndex: 0 },
];

function calculateShiftDuration(openTime: string, closeTime: string): string {
  try {
    const parse = (t: string) => {
      const match = (t || '').match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return null;
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const p = match[3].toUpperCase();
      if (p === 'PM' && h !== 12) h += 12;
      if (p === 'AM' && h === 12) h = 0;
      return h * 60 + m;
    };
    const o = parse(openTime);
    const c = parse(closeTime);
    if (o === null || c === null) return '';
    let diff = c - o;
    if (diff < 0) diff += 24 * 60;
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    if (mins === 0) return `${hrs} hrs`;
    return `${hrs}h ${mins}m`;
  } catch {
    return '';
  }
}

export const BusinessHoursEditor: React.FC<BusinessHoursEditorProps> = ({
  schedule,
  onUpdateDay,
}) => {
  const todayIndex = new Date().getDay();
  const initialTodayKey =
    ORDERED_DAYS.find((d) => d.dayIndex === todayIndex)?.key || 'monday';

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(initialTodayKey);
  const [showFullWeek, setShowFullWeek] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const [activePicker, setActivePicker] = useState<{
    visible: boolean;
    day: DayOfWeek;
    target: 'open' | 'close' | 'secondOpen' | 'secondClose';
    currentTime: string;
    title: string;
  } | null>(null);

  const activeDayObj = useMemo(
    () => ORDERED_DAYS.find((d) => d.key === selectedDay) || ORDERED_DAYS[0],
    [selectedDay]
  );

  const dayData = schedule[selectedDay] || {
    isOpen: true,
    openTime: '09:00 AM',
    closeTime: '09:00 PM',
  };

  const isOpen = dayData.isOpen !== false;
  const shiftDuration = isOpen
    ? calculateShiftDuration(dayData.openTime, dayData.closeTime)
    : '';

  const openDaysCount = useMemo(() => {
    return ORDERED_DAYS.filter((d) => schedule[d.key]?.isOpen !== false).length;
  }, [schedule]);

  const scheduleSummary = useMemo(() => {
    if (openDaysCount === 7) return 'Open 7 days a week';
    if (openDaysCount === 0) return 'All days currently closed';
    return `${openDaysCount} of 7 days open`;
  }, [openDaysCount]);

  const openTimePicker = (
    day: DayOfWeek,
    target: 'open' | 'close' | 'secondOpen' | 'secondClose',
    currentTime: string,
    dayLabel: string
  ) => {
    const titles = {
      open: `${dayLabel} Opening Time`,
      close: `${dayLabel} Closing Time`,
      secondOpen: `${dayLabel} 2nd Shift Open`,
      secondClose: `${dayLabel} 2nd Shift Close`,
    };
    setActivePicker({
      visible: true,
      day,
      target,
      currentTime,
      title: titles[target],
    });
  };

  const handleTimeSelected = (newTime: string) => {
    if (!activePicker) return;
    const { day, target } = activePicker;

    if (target === 'open') {
      onUpdateDay(day, { openTime: newTime });
    } else if (target === 'close') {
      onUpdateDay(day, { closeTime: newTime });
    } else if (target === 'secondOpen') {
      onUpdateDay(day, { secondOpenTime: newTime });
    } else if (target === 'secondClose') {
      onUpdateDay(day, { secondCloseTime: newTime });
    }
  };

  const handleCopyToAllDays = () => {
    ORDERED_DAYS.forEach(({ key }) => {
      onUpdateDay(key, {
        isOpen: dayData.isOpen,
        openTime: dayData.openTime,
        closeTime: dayData.closeTime,
        hasSecondShift: dayData.hasSecondShift,
        secondOpenTime: dayData.secondOpenTime,
        secondCloseTime: dayData.secondCloseTime,
      });
    });
    setCopyFeedback(`Applied ${activeDayObj.label}'s hours to all 7 days!`);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const handleCopyToWeekdays = () => {
    const weekdays: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    weekdays.forEach((key) => {
      onUpdateDay(key, {
        isOpen: dayData.isOpen,
        openTime: dayData.openTime,
        closeTime: dayData.closeTime,
        hasSecondShift: dayData.hasSecondShift,
        secondOpenTime: dayData.secondOpenTime,
        secondCloseTime: dayData.secondCloseTime,
      });
    });
    setCopyFeedback(`Applied ${activeDayObj.label}'s hours to Mon–Fri!`);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  return (
    <View style={styles.container}>
      {/* 1. Header & Summary Row */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>Weekly Business Hours</Text>
          <View style={styles.summaryBadge}>
            <View
              style={[
                styles.summaryDot,
                { backgroundColor: openDaysCount > 0 ? '#00B074' : '#8E8E93' },
              ]}
            />
            <Text style={styles.summaryText}>{scheduleSummary}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.glanceToggleBtn}
          activeOpacity={0.75}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setShowFullWeek((prev) => !prev);
          }}
        >
          <Text style={styles.glanceToggleText}>
            {showFullWeek ? 'Hide Week' : 'View Week'}
          </Text>
          <Text style={styles.glanceChevron}>{showFullWeek ? '▲' : '▼'}</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Interactive Segmented Day Strip */}
      <View style={styles.daysStrip}>
        {ORDERED_DAYS.map(({ key, short, dayIndex }) => {
          const isSelected = selectedDay === key;
          const isToday = dayIndex === todayIndex;
          const dData = schedule[key] || { isOpen: true };
          const dOpen = dData.isOpen !== false;

          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.dayTab,
                isSelected && styles.dayTabSelected,
                !dOpen && !isSelected && styles.dayTabClosed,
              ]}
              activeOpacity={0.75}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setSelectedDay(key);
              }}
            >
              <Text
                style={[
                  styles.dayTabText,
                  isSelected && styles.dayTabTextSelected,
                  !dOpen && !isSelected && styles.dayTabTextClosed,
                ]}
              >
                {short}
              </Text>

              {/* Status Indicator Dot */}
              <View
                style={[
                  styles.statusDot,
                  isSelected
                    ? dOpen
                      ? styles.statusDotSelectedOpen
                      : styles.statusDotSelectedClosed
                    : dOpen
                    ? styles.statusDotOpen
                    : styles.statusDotClosed,
                ]}
              />

              {/* Today Micro Indicator */}
              {isToday && (
                <View
                  style={[
                    styles.todayMicroPill,
                    isSelected && styles.todayMicroPillSelected,
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 3. Focused Active Day Card */}
      <View style={styles.activeDayCard}>
        {/* Active Day Header */}
        <View style={styles.activeDayHeader}>
          <View style={styles.activeDayTitleWrap}>
            <Text style={styles.activeDayName}>{activeDayObj.label}</Text>
            <View
              style={[
                styles.statusPill,
                isOpen ? styles.statusPillOpen : styles.statusPillClosed,
              ]}
            >
              <View
                style={[
                  styles.statusPillDot,
                  { backgroundColor: isOpen ? '#00B074' : '#8E8E93' },
                ]}
              />
              <Text
                style={[
                  styles.statusPillText,
                  { color: isOpen ? '#00B074' : '#6B7280' },
                ]}
              >
                {isOpen ? 'OPEN' : 'CLOSED'}
              </Text>
            </View>
          </View>

          {/* Toggle Switch */}
          <View style={styles.switchContainer}>
            <Switch
              value={isOpen}
              onValueChange={(val) => onUpdateDay(selectedDay, { isOpen: val })}
              trackColor={{ false: '#E2E6EA', true: '#FEE8F0' }}
              thumbColor={isOpen ? '#FF5790' : '#9CA3AF'}
            />
          </View>
        </View>

        {isOpen ? (
          <View style={styles.activeDayBody}>
            {/* Shift 1 Container */}
            <View style={styles.shiftContainer}>
              <View style={styles.shiftHeaderRow}>
                <Text style={styles.shiftSubLabel}>Operating Shift Hours</Text>
                {shiftDuration ? (
                  <View style={styles.durationCapsule}>
                    <ClockIcon size={11} color="#FF5790" />
                    <Text style={styles.durationCapsuleText}>{shiftDuration}</Text>
                  </View>
                ) : null}
              </View>

              {/* Time Capsules Row */}
              <View style={styles.timeCapsulesRow}>
                {/* Opens At */}
                <TouchableOpacity
                  style={styles.timeCapsule}
                  activeOpacity={0.7}
                  onPress={() =>
                    openTimePicker(
                      selectedDay,
                      'open',
                      dayData.openTime,
                      activeDayObj.label
                    )
                  }
                >
                  <Text style={styles.capsuleTag}>OPENS AT</Text>
                  <View style={styles.capsuleValueRow}>
                    <ClockIcon size={14} color="#FF5790" />
                    <Text style={styles.capsuleValueText}>{dayData.openTime}</Text>
                  </View>
                </TouchableOpacity>

                {/* Arrow */}
                <View style={styles.arrowBetween}>
                  <Text style={styles.arrowText}>→</Text>
                </View>

                {/* Closes At */}
                <TouchableOpacity
                  style={styles.timeCapsule}
                  activeOpacity={0.7}
                  onPress={() =>
                    openTimePicker(
                      selectedDay,
                      'close',
                      dayData.closeTime,
                      activeDayObj.label
                    )
                  }
                >
                  <Text style={styles.capsuleTag}>CLOSES AT</Text>
                  <View style={styles.capsuleValueRow}>
                    <ClockIcon size={14} color="#707070" />
                    <Text style={styles.capsuleValueText}>{dayData.closeTime}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Split Shift / Second Shift */}
            {dayData.hasSecondShift ? (
              <View style={styles.secondShiftBox}>
                <View style={styles.secondShiftHeader}>
                  <Text style={styles.secondShiftTitle}>Shift 2 (Afternoon / Evening)</Text>
                  <TouchableOpacity
                    onPress={() => onUpdateDay(selectedDay, { hasSecondShift: false })}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.removeShiftBtn}>Remove Shift</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.timeCapsulesRow}>
                  <TouchableOpacity
                    style={styles.timeCapsule}
                    activeOpacity={0.7}
                    onPress={() =>
                      openTimePicker(
                        selectedDay,
                        'secondOpen',
                        dayData.secondOpenTime || '05:00 PM',
                        activeDayObj.label
                      )
                    }
                  >
                    <Text style={styles.capsuleTag}>OPENS AT</Text>
                    <View style={styles.capsuleValueRow}>
                      <ClockIcon size={14} color="#FF5790" />
                      <Text style={styles.capsuleValueText}>
                        {dayData.secondOpenTime || '05:00 PM'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.arrowBetween}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.timeCapsule}
                    activeOpacity={0.7}
                    onPress={() =>
                      openTimePicker(
                        selectedDay,
                        'secondClose',
                        dayData.secondCloseTime || '10:00 PM',
                        activeDayObj.label
                      )
                    }
                  >
                    <Text style={styles.capsuleTag}>CLOSES AT</Text>
                    <View style={styles.capsuleValueRow}>
                      <ClockIcon size={14} color="#707070" />
                      <Text style={styles.capsuleValueText}>
                        {dayData.secondCloseTime || '10:00 PM'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addShiftBtn}
                activeOpacity={0.75}
                onPress={() =>
                  onUpdateDay(selectedDay, {
                    hasSecondShift: true,
                    secondOpenTime: '05:00 PM',
                    secondCloseTime: '10:00 PM',
                  })
                }
              >
                <PlusIcon size={13} color="#FF5790" />
                <Text style={styles.addShiftBtnText}>+ Add Split Shift (Break / Evening)</Text>
              </TouchableOpacity>
            )}

            {/* Quick Bulk-Sync Action Chips */}
            <View style={styles.quickSyncBar}>
              <TouchableOpacity
                style={styles.syncChip}
                activeOpacity={0.75}
                onPress={handleCopyToWeekdays}
              >
                <Text style={styles.syncChipIcon}>⚡</Text>
                <Text style={styles.syncChipText}>Apply to Mon–Fri</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.syncChip}
                activeOpacity={0.75}
                onPress={handleCopyToAllDays}
              >
                <Text style={styles.syncChipIcon}>⚡</Text>
                <Text style={styles.syncChipText}>Apply to All 7 Days</Text>
              </TouchableOpacity>
            </View>

            {/* Toast Feedback banner */}
            {copyFeedback ? (
              <View style={styles.feedbackBanner}>
                <Text style={styles.feedbackBannerText}>✓ {copyFeedback}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          /* Closed State Box */
          <View style={styles.closedStateBox}>
            <Text style={styles.closedEmoji}>🌙</Text>
            <Text style={styles.closedStateTitle}>Store Closed on {activeDayObj.label}s</Text>
            <Text style={styles.closedStateSub}>
              Customers cannot place orders during this day.
            </Text>
            <TouchableOpacity
              style={styles.reopenBtn}
              activeOpacity={0.8}
              onPress={() => onUpdateDay(selectedDay, { isOpen: true })}
            >
              <Text style={styles.reopenBtnText}>Open on {activeDayObj.label}s</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 4. Collapsible Full Week At a Glance Matrix */}
      {showFullWeek && (
        <View style={styles.glanceMatrix}>
          <Text style={styles.glanceMatrixTitle}>All 7 Days Schedule Overview</Text>
          {ORDERED_DAYS.map(({ key, label }) => {
            const dData = schedule[key] || {
              isOpen: true,
              openTime: '09:00 AM',
              closeTime: '09:00 PM',
            };
            const dOpen = dData.isOpen !== false;
            const isSelected = selectedDay === key;

            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.glanceRow,
                  isSelected && styles.glanceRowSelected,
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setSelectedDay(key);
                }}
              >
                <View style={styles.glanceDayCol}>
                  <Text
                    style={[
                      styles.glanceDayText,
                      isSelected && styles.glanceDayTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                  {isSelected && (
                    <View style={styles.activeTag}>
                      <Text style={styles.activeTagText}>Active</Text>
                    </View>
                  )}
                </View>

                <View style={styles.glanceHoursCol}>
                  {dOpen ? (
                    <Text style={styles.glanceHoursText}>
                      {dData.openTime} – {dData.closeTime}
                      {dData.hasSecondShift ? ' (+Shift 2)' : ''}
                    </Text>
                  ) : (
                    <Text style={styles.glanceClosedText}>Closed</Text>
                  )}
                </View>

                <View
                  style={[
                    styles.glanceStatusDot,
                    { backgroundColor: dOpen ? '#00B074' : '#D1D5DB' },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Time Picker Modal */}
      {activePicker && (
        <TimePickerModal
          visible={activePicker.visible}
          initialTime={activePicker.currentTime}
          title={activePicker.title}
          onClose={() => setActivePicker(null)}
          onSelectTime={handleTimeSelected}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF2',
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextGroup: {
    gap: 3,
  },
  title: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#181C1F',
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  summaryText: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 12,
    color: '#707070',
  },
  glanceToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECEFF2',
  },
  glanceToggleText: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 11,
    color: '#555A60',
  },
  glanceChevron: {
    fontSize: 9,
    color: '#8E8E93',
  },
  // Day Strip
  daysStrip: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: '#ECEFF2',
    gap: 4,
  },
  dayTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    position: 'relative',
  },
  dayTabSelected: {
    backgroundColor: '#FF5790',
    shadowColor: '#FF5790',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  dayTabClosed: {
    opacity: 0.55,
  },
  dayTabText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#4B5563',
  },
  dayTabTextSelected: {
    color: '#FFFFFF',
  },
  dayTabTextClosed: {
    color: '#9CA3AF',
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  statusDotOpen: {
    backgroundColor: '#00B074',
  },
  statusDotClosed: {
    backgroundColor: '#D1D5DB',
  },
  statusDotSelectedOpen: {
    backgroundColor: '#FFFFFF',
  },
  statusDotSelectedClosed: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  todayMicroPill: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF5790',
  },
  todayMicroPillSelected: {
    backgroundColor: '#FFFFFF',
  },
  // Active Day Card
  activeDayCard: {
    backgroundColor: '#FAFBFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF2',
    gap: 12,
  },
  activeDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeDayTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeDayName: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#181C1F',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusPillOpen: {
    backgroundColor: '#E6F9F0',
  },
  statusPillClosed: {
    backgroundColor: '#F3F4F6',
  },
  statusPillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusPillText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  switchContainer: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  activeDayBody: {
    gap: 12,
  },
  // Shift 1
  shiftContainer: {
    gap: 8,
  },
  shiftHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shiftSubLabel: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 11,
    color: '#707070',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  durationCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE8F0',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  durationCapsuleText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#FF5790',
  },
  timeCapsulesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeCapsule: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEFF2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 3,
  },
  capsuleTag: {
    fontFamily: fonts.nunito.bold,
    fontSize: 10,
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  capsuleValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  capsuleValueText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 13,
    color: '#181C1F',
  },
  arrowBetween: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#8E8E93',
  },
  // Split Shift
  secondShiftBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ECEFF2',
    gap: 8,
  },
  secondShiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondShiftTitle: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 11,
    color: '#707070',
  },
  removeShiftBtn: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 11,
    color: '#FF3B30',
  },
  addShiftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FEE8F0',
    backgroundColor: '#FFF5F8',
    borderRadius: 10,
  },
  addShiftBtnText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#FF5790',
  },
  // Quick Sync Bar
  quickSyncBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  syncChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEFF2',
    paddingVertical: 7,
    borderRadius: 10,
  },
  syncChipIcon: {
    fontSize: 11,
    color: '#FF5790',
  },
  syncChipText: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 11,
    color: '#555A60',
  },
  feedbackBanner: {
    backgroundColor: '#E6F9F0',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  feedbackBannerText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#00B074',
  },
  // Closed State
  closedStateBox: {
    alignItems: 'center',
    paddingVertical: 18,
    gap: 6,
  },
  closedEmoji: {
    fontSize: 26,
    marginBottom: 2,
  },
  closedStateTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#181C1F',
  },
  closedStateSub: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  reopenBtn: {
    marginTop: 6,
    backgroundColor: '#FF5790',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  reopenBtnText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  // Glance Matrix
  glanceMatrix: {
    backgroundColor: '#FAFBFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEFF2',
    gap: 8,
  },
  glanceMatrixTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 12,
    color: '#707070',
    marginBottom: 4,
  },
  glanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  glanceRowSelected: {
    backgroundColor: '#FEE8F0',
  },
  glanceDayCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 90,
  },
  glanceDayText: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 12,
    color: '#181C1F',
  },
  glanceDayTextSelected: {
    fontFamily: fonts.raleway.bold,
    color: '#FF5790',
  },
  activeTag: {
    backgroundColor: '#FF5790',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  activeTagText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 9,
    color: '#FFFFFF',
  },
  glanceHoursCol: {
    flex: 1,
    alignItems: 'center',
  },
  glanceHoursText: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 12,
    color: '#555A60',
  },
  glanceClosedText: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 12,
    color: '#8E8E93',
  },
  glanceStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
});
