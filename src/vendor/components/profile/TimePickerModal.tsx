import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { fonts } from '@/theme/fonts';
import { CrossIcon, ClockIcon } from '../common/Icons';

interface TimePickerModalProps {
  visible: boolean;
  initialTime: string; // Format: "09:00 AM"
  title: string;
  onClose: () => void;
  onSelectTime: (time: string) => void;
}

const HOURS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MINUTES = ['00', '15', '30', '45'];

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  initialTime,
  title,
  onClose,
  onSelectTime,
}) => {
  // Parse initialTime
  const parseParts = (t: string) => {
    const match = (t || '09:00 AM').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return { hour: '09', minute: '00', period: 'AM' };
    const h = String(parseInt(match[1], 10)).padStart(2, '0');
    return { hour: h, minute: match[2], period: match[3].toUpperCase() };
  };

  const initial = parseParts(initialTime);
  const [selectedHour, setSelectedHour] = useState(initial.hour);
  const [selectedMinute, setSelectedMinute] = useState(initial.minute);
  const [selectedPeriod, setSelectedPeriod] = useState(initial.period);

  const formattedTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;

  const handleConfirm = () => {
    onSelectTime(formattedTime);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <ClockIcon size={20} color="#FF5790" />
              <Text style={styles.title}>{title}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose}>
              <CrossIcon size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Large Time Display */}
          <View style={styles.timePreviewBox}>
            <Text style={styles.previewHourMin}>
              {selectedHour}:{selectedMinute}
            </Text>
            <View style={styles.periodBadge}>
              <Text style={styles.periodBadgeText}>{selectedPeriod}</Text>
            </View>
          </View>

          {/* AM / PM Segment */}
          <View style={styles.periodRow}>
            {(['AM', 'PM'] as const).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.periodOption,
                  selectedPeriod === p && styles.periodOptionActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedPeriod(p)}
              >
                <Text
                  style={[
                    styles.periodOptionText,
                    selectedPeriod === p && styles.periodOptionTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hours Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Hour</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {HOURS.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[styles.hourPill, selectedHour === h && styles.hourPillActive]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedHour(h)}
                >
                  <Text
                    style={[
                      styles.hourPillText,
                      selectedHour === h && styles.hourPillTextActive,
                    ]}
                  >
                    {h}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Minutes Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Minute</Text>
            <View style={styles.minutesGrid}>
              {MINUTES.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.minutePill,
                    selectedMinute === m && styles.minutePillActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedMinute(m)}
                >
                  <Text
                    style={[
                      styles.minutePillText,
                      selectedMinute === m && styles.minutePillTextActive,
                    ]}
                  >
                    :{m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.setBtn}
            activeOpacity={0.88}
            onPress={handleConfirm}
          >
            <Text style={styles.setBtnText}>Confirm Time ({formattedTime})</Text>
          </TouchableOpacity>
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
  timePreviewBox: {
    backgroundColor: '#FFF0F5',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#FFB8CF',
  },
  previewHourMin: {
    fontFamily: fonts.raleway.bold,
    fontSize: 34,
    color: '#FF5790',
  },
  periodBadge: {
    backgroundColor: '#FF5790',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  periodBadgeText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  periodRow: {
    flexDirection: 'row',
    gap: 10,
  },
  periodOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
  },
  periodOptionActive: {
    backgroundColor: '#181C1F',
  },
  periodOptionText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#707070',
  },
  periodOptionTextActive: {
    color: '#FFFFFF',
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 12,
    color: '#8E8E93',
  },
  hourPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: '#ECEFF2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  hourPillActive: {
    backgroundColor: '#FF5790',
    borderColor: '#FF5790',
  },
  hourPillText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#181C1F',
  },
  hourPillTextActive: {
    color: '#FFFFFF',
  },
  minutesGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  minutePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: '#ECEFF2',
    alignItems: 'center',
  },
  minutePillActive: {
    backgroundColor: '#FEE8F0',
    borderColor: '#FF5790',
  },
  minutePillText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#181C1F',
  },
  minutePillTextActive: {
    color: '#FF5790',
  },
  setBtn: {
    backgroundColor: '#FF5790',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  setBtnText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
