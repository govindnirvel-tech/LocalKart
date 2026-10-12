import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { fonts } from '@/theme/fonts';
import { CrossIcon, AlertCircleIcon, ClockIcon } from '../common/Icons';
import { TemporaryClosureReason } from '../../types/storeProfile';

interface TemporaryClosureModalProps {
  visible: boolean;
  isCurrentlyClosed: boolean;
  currentLabel?: string;
  onClose: () => void;
  onApplyClosure: (reason: TemporaryClosureReason, durationMinutes: number) => void;
  onClearClosure: () => void;
  onApplyOpenOverride: (durationMinutes: number) => void;
}

const REASONS: TemporaryClosureReason[] = [
  'Emergency',
  'Stock Issue',
  'Staff Unavailable',
  'Maintenance',
  'Holiday',
  'Other',
];

const DURATIONS = [
  { label: '30 Minutes', minutes: 30 },
  { label: '1 Hour', minutes: 60 },
  { label: '2 Hours', minutes: 120 },
  { label: 'Rest of Today', minutes: 480 },
];

export const TemporaryClosureModal: React.FC<TemporaryClosureModalProps> = ({
  visible,
  isCurrentlyClosed,
  currentLabel,
  onClose,
  onApplyClosure,
  onClearClosure,
  onApplyOpenOverride,
}) => {
  const [selectedReason, setSelectedReason] = useState<TemporaryClosureReason>('Emergency');
  const [selectedDuration, setSelectedDuration] = useState(60);

  const handleConfirmClose = () => {
    onApplyClosure(selectedReason, selectedDuration);
    onClose();
  };

  const handleOpenNow = () => {
    onApplyOpenOverride(120); // 2 hours override
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <AlertCircleIcon size={22} color="#FF9F1C" />
              <Text style={styles.title}>Emergency Store Controls</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose}>
              <CrossIcon size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {isCurrentlyClosed ? (
            <View style={styles.activeAlertBox}>
              <Text style={styles.activeAlertTitle}>Currently Closed</Text>
              <Text style={styles.activeAlertDesc}>{currentLabel || 'Store is temporarily closed'}</Text>
              <TouchableOpacity
                style={styles.reopenBtn}
                activeOpacity={0.88}
                onPress={() => {
                  onClearClosure();
                  onClose();
                }}
              >
                <Text style={styles.reopenBtnText}>Resume Normal Weekly Schedule</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Temporarily pause orders without modifying your recurring weekly business hours.
              </Text>

              {/* Reason Selector */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Select Reason:</Text>
                <View style={styles.reasonsGrid}>
                  {REASONS.map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.chip,
                        selectedReason === r && styles.chipActive,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedReason(r)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedReason === r && styles.chipTextActive,
                        ]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Duration Selector */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Close Duration:</Text>
                <View style={styles.durationsGrid}>
                  {DURATIONS.map((d) => (
                    <TouchableOpacity
                      key={d.minutes}
                      style={[
                        styles.durPill,
                        selectedDuration === d.minutes && styles.durPillActive,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setSelectedDuration(d.minutes)}
                    >
                      <Text
                        style={[
                          styles.durPillText,
                          selectedDuration === d.minutes && styles.durPillTextActive,
                        ]}
                      >
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                style={styles.closeActionBtn}
                activeOpacity={0.88}
                onPress={handleConfirmClose}
              >
                <Text style={styles.closeActionText}>
                  Close Store for {selectedDuration >= 60 ? `${selectedDuration / 60} Hour(s)` : `${selectedDuration} Mins`}
                </Text>
              </TouchableOpacity>

              {/* Manual Override Button */}
              <TouchableOpacity
                style={styles.overrideBtn}
                activeOpacity={0.8}
                onPress={handleOpenNow}
              >
                <ClockIcon size={16} color="#00B074" />
                <Text style={styles.overrideText}>Open Store Now (2-Hr Override)</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    color: '#181C1F',
  },
  subtitle: {
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  activeAlertBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 8,
  },
  activeAlertTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#C2410C',
  },
  activeAlertDesc: {
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    color: '#7C2D12',
  },
  reopenBtn: {
    backgroundColor: '#00B074',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  reopenBtnText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 12,
    color: '#707070',
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F4F5F7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#FFF0F5',
    borderColor: '#FF5790',
  },
  chipText: {
    fontFamily: fonts.raleway.medium,
    fontSize: 12,
    color: '#707070',
  },
  chipTextActive: {
    fontFamily: fonts.raleway.bold,
    color: '#FF5790',
  },
  durationsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  durPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: '#ECEFF2',
    alignItems: 'center',
  },
  durPillActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF9F1C',
  },
  durPillText: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 11,
    color: '#707070',
  },
  durPillTextActive: {
    fontFamily: fonts.raleway.bold,
    color: '#C2410C',
  },
  closeActionBtn: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  closeActionText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  overrideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  overrideText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 13,
    color: '#00B074',
  },
});
