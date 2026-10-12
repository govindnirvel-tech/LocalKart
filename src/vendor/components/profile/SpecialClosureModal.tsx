import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  ScrollView,
} from 'react-native';
import { fonts } from '@/theme/fonts';
import { CrossIcon, CalendarIcon, TrashIcon, PlusIcon } from '../common/Icons';
import { SpecialClosure } from '../../types/storeProfile';

interface SpecialClosureModalProps {
  visible: boolean;
  specialClosures: SpecialClosure[];
  onClose: () => void;
  onAddClosure: (closure: SpecialClosure) => void;
  onRemoveClosure: (id: string) => void;
}

const PRESET_FESTIVALS = [
  { name: 'Diwali Festival', date: '2026-10-24', isFullDay: true },
  { name: 'Republic Day', date: '2026-01-26', isFullDay: true },
  { name: 'Independence Day', date: '2026-08-15', isFullDay: false, open: '10:00 AM', close: '02:00 PM' },
  { name: 'Holi Celebration', date: '2026-03-25', isFullDay: true },
  { name: 'Christmas Day', date: '2026-12-25', isFullDay: true },
];

export const SpecialClosureModal: React.FC<SpecialClosureModalProps> = ({
  visible,
  specialClosures,
  onClose,
  onAddClosure,
  onRemoveClosure,
}) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('2026-11-04');
  const [isFullDay, setIsFullDay] = useState(true);
  const [openTime, setOpenTime] = useState('10:00 AM');
  const [closeTime, setCloseTime] = useState('02:00 PM');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = () => {
    if (!name.trim()) return;
    const newClosure: SpecialClosure = {
      id: `sc-${Date.now()}`,
      name: name.trim(),
      date,
      isFullDay,
      openTime: isFullDay ? undefined : openTime,
      closeTime: isFullDay ? undefined : closeTime,
    };
    onAddClosure(newClosure);
    setName('');
    setShowAddForm(false);
  };

  const handleSelectPreset = (p: typeof PRESET_FESTIVALS[0]) => {
    setName(p.name);
    setDate(p.date);
    setIsFullDay(p.isFullDay);
    if (!p.isFullDay && p.open && p.close) {
      setOpenTime(p.open);
      setCloseTime(p.close);
    }
    setShowAddForm(true);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <CalendarIcon size={20} color="#FF5790" />
              <Text style={styles.title}>Holidays & Special Closures</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={onClose}>
              <CrossIcon size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            Special schedules take priority over regular weekly timings on configured dates.
          </Text>

          <ScrollView style={styles.scrollList} showsVerticalScrollIndicator={false}>
            {/* Existing Closures */}
            {specialClosures.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No special holidays configured yet.</Text>
              </View>
            ) : (
              specialClosures.map((sc) => (
                <View key={sc.id} style={styles.closureItem}>
                  <View style={styles.closureMeta}>
                    <Text style={styles.closureName}>{sc.name}</Text>
                    <Text style={styles.closureDate}>
                      📅 {sc.date} •{' '}
                      <Text style={{ color: sc.isFullDay ? '#FF3B30' : '#00B074', fontWeight: 'bold' }}>
                        {sc.isFullDay
                          ? 'Closed All Day'
                          : `Special Hours: ${sc.openTime} – ${sc.closeTime}`}
                      </Text>
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.trashBtn}
                    activeOpacity={0.7}
                    onPress={() => onRemoveClosure(sc.id)}
                  >
                    <TrashIcon size={16} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))
            )}

            {/* Quick Presets */}
            <View style={styles.presetsSection}>
              <Text style={styles.presetsTitle}>Quick Add Festivals / National Days:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {PRESET_FESTIVALS.map((p) => (
                  <TouchableOpacity
                    key={p.name}
                    style={styles.presetChip}
                    onPress={() => handleSelectPreset(p)}
                  >
                    <Text style={styles.presetChipText}>+ {p.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Add Custom Form */}
            {showAddForm ? (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Add Holiday / Closure</Text>

                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>Holiday Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Diwali Holiday, Renovation"
                    placeholderTextColor="#8E8E93"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputWrap}>
                  <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2026-10-24"
                    placeholderTextColor="#8E8E93"
                    value={date}
                    onChangeText={setDate}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Full Day Closed</Text>
                  <Switch
                    value={isFullDay}
                    onValueChange={setIsFullDay}
                    trackColor={{ false: '#D1D5DB', true: '#FEE8F0' }}
                    thumbColor={isFullDay ? '#FF5790' : '#9CA3AF'}
                  />
                </View>

                {!isFullDay && (
                  <View style={styles.specialHoursRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Open Time</Text>
                      <TextInput
                        style={styles.input}
                        value={openTime}
                        onChangeText={setOpenTime}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>Close Time</Text>
                      <TextInput
                        style={styles.input}
                        value={closeTime}
                        onChangeText={setCloseTime}
                      />
                    </View>
                  </View>
                )}

                <View style={styles.formBtnsRow}>
                  <TouchableOpacity
                    style={styles.cancelFormBtn}
                    onPress={() => setShowAddForm(false)}
                  >
                    <Text style={styles.cancelFormText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveFormBtn} onPress={handleAdd}>
                    <Text style={styles.saveFormText}>Save Closure</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.showAddBtn}
                activeOpacity={0.8}
                onPress={() => setShowAddForm(true)}
              >
                <PlusIcon size={16} color="#FF5790" />
                <Text style={styles.showAddText}>Add Custom Holiday / Closure</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
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
    maxHeight: '85%',
    gap: 14,
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
    fontSize: 12,
    color: '#8E8E93',
  },
  scrollList: {
    maxHeight: 380,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    color: '#8E8E93',
  },
  closureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFBFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEFF2',
    marginBottom: 8,
  },
  closureMeta: {
    flex: 1,
  },
  closureName: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#181C1F',
  },
  closureDate: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#707070',
    marginTop: 2,
  },
  trashBtn: {
    padding: 8,
  },
  presetsSection: {
    marginVertical: 10,
    gap: 8,
  },
  presetsTitle: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 12,
    color: '#707070',
  },
  presetChip: {
    backgroundColor: '#F4F5F7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
  },
  presetChipText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#181C1F',
  },
  showAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF0F5',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFB8CF',
    marginTop: 10,
  },
  showAddText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 13,
    color: '#FF5790',
  },
  formCard: {
    backgroundColor: '#FAFBFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECEFF2',
    gap: 12,
    marginTop: 10,
  },
  formTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#181C1F',
  },
  inputWrap: {
    gap: 4,
  },
  inputLabel: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 11,
    color: '#707070',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECEFF2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    color: '#181C1F',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 13,
    color: '#181C1F',
  },
  specialHoursRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formBtnsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelFormBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
  },
  cancelFormText: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 13,
    color: '#707070',
  },
  saveFormBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FF5790',
    alignItems: 'center',
  },
  saveFormText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
