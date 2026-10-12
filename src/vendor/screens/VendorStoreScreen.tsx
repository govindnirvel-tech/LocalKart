import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { fonts } from '@/theme/fonts';
import { Settings } from 'lucide-react-native';
import { RootState } from '@/store';
import { RootStackParamList } from '@/navigation/types';
import { setAppMode } from '../store/vendorOnboardingSlice';
import {
  StoreProfileState,
  DayOfWeek,
  DaySchedule,
  SpecialClosure,
  TemporaryClosureReason,
  StoreLocation,
} from '../types/storeProfile';
import {
  updateStoreIdentity,
  setLogoUri,
  removeLogoUri,
  setCoverUri,
  removeCoverUri,
  addGalleryPhoto,
  removeGalleryPhoto,
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
} from '../store/vendorStoreSlice';
import { useStoreStatus } from '../hooks/useStoreStatus';
import {
  StorefrontIcon,
  ShoppingBagIcon,
  MapPinIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  CalendarIcon,
  AlertCircleIcon,
  ClockIcon,
  EditIcon,
  EditPencilIcon,
} from '../components/common/Icons';
import { StoreImageUploader } from '../components/profile/StoreImageUploader';
import { StoreMapModal } from '../components/profile/StoreMapModal';
import { BusinessHoursEditor } from '../components/profile/BusinessHoursEditor';
import { TemporaryClosureModal } from '../components/profile/TemporaryClosureModal';
import { SpecialClosureModal } from '../components/profile/SpecialClosureModal';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PRESET_RADIUS_OPTIONS = [1, 2, 3, 5, 8, 10];

export function VendorStoreScreen() {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();

  const storeProfile = useSelector(
    (state: RootState) => (state as any).vendorStore as StoreProfileState
  );

  // Live auto-calculated operational store status (Doc #31.7, 31.8)
  const storeStatus = useStoreStatus();

  // Modals state
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [tempClosureModalVisible, setTempClosureModalVisible] = useState(false);
  const [specialClosureModalVisible, setSpecialClosureModalVisible] = useState(false);

  // Global form edit mode state
  const [isEditing, setIsEditing] = useState(false);

  // Local editable identity fields
  const [storeName, setStoreName] = useState(storeProfile.storeName);
  const [description, setDescription] = useState(storeProfile.description);
  const [category, setCategory] = useState(storeProfile.category);
  const [businessType, setBusinessType] = useState(storeProfile.businessType);

  // Local editable pricing & delivery settings
  const [minOrder, setMinOrder] = useState(String(storeProfile.deliverySettings.minOrderAmount));
  const [deliveryCharge, setDeliveryCharge] = useState(String(storeProfile.deliverySettings.deliveryCharge));
  const [freeDelivery, setFreeDelivery] = useState(String(storeProfile.deliverySettings.freeDeliveryThreshold));

  // Local contact & policy fields
  const [contactPhone, setContactPhone] = useState(storeProfile.contactPhone);
  const [supportEmail, setSupportEmail] = useState(storeProfile.supportEmail);
  const [returnPolicy, setReturnPolicy] = useState(storeProfile.returnPolicy);

  // Sync state if storeProfile changes while not editing
  React.useEffect(() => {
    if (!isEditing) {
      setStoreName(storeProfile.storeName);
      setDescription(storeProfile.description);
      setCategory(storeProfile.category);
      setBusinessType(storeProfile.businessType);
      setMinOrder(String(storeProfile.deliverySettings.minOrderAmount));
      setDeliveryCharge(String(storeProfile.deliverySettings.deliveryCharge));
      setFreeDelivery(String(storeProfile.deliverySettings.freeDeliveryThreshold));
      setContactPhone(storeProfile.contactPhone);
      setSupportEmail(storeProfile.supportEmail);
      setReturnPolicy(storeProfile.returnPolicy);
    }
  }, [storeProfile, isEditing]);

  // Cancel edit mode and restore original profile values
  const handleCancelEdit = () => {
    setStoreName(storeProfile.storeName);
    setDescription(storeProfile.description);
    setCategory(storeProfile.category);
    setBusinessType(storeProfile.businessType);
    setMinOrder(String(storeProfile.deliverySettings.minOrderAmount));
    setDeliveryCharge(String(storeProfile.deliverySettings.deliveryCharge));
    setFreeDelivery(String(storeProfile.deliverySettings.freeDeliveryThreshold));
    setContactPhone(storeProfile.contactPhone);
    setSupportEmail(storeProfile.supportEmail);
    setReturnPolicy(storeProfile.returnPolicy);
    setIsEditing(false);
  };

  // Toast indicator state
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSaveChanges = () => {
    // Save Identity
    dispatch(
      updateStoreIdentity({
        storeName: storeName.trim(),
        description: description.trim(),
        category,
        businessType,
      })
    );

    // Save Delivery Pricing
    dispatch(
      updateDeliverySettings({
        minOrderAmount: parseFloat(minOrder) || 99,
        deliveryCharge: parseFloat(deliveryCharge) || 25,
        freeDeliveryThreshold: parseFloat(freeDelivery) || 249,
      })
    );

    // Save Contact & Policy
    dispatch(
      updateContactAndPolicies({
        contactPhone: contactPhone.trim(),
        supportEmail: supportEmail.trim(),
        returnPolicy: returnPolicy.trim(),
      })
    );

    setIsEditing(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  };

  const handleSelectRadius = (km: number) => {
    dispatch(updateDeliverySettings({ radiusKm: km }));
  };

  const handleUpdateLocation = (loc: StoreLocation) => {
    dispatch(updateStoreLocation(loc));
  };

  const handleSwitchToCustomer = () => {
    dispatch(setAppMode('customer'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header Bar */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: '#FFF0F5',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Settings size={20} color="#FF5790" strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Store Profile & Settings</Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              Physical store identity, map & operating hours
            </Text>
          </View>
        </View>

        {!isEditing ? (
          <TouchableOpacity
            style={styles.editHeaderBtn}
            activeOpacity={0.85}
            onPress={() => setIsEditing(true)}
          >
            <EditPencilIcon size={14} color="#FFFFFF" />
            <Text style={styles.editHeaderBtnText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerEditingBtns}>
            <TouchableOpacity
              style={styles.cancelHeaderBtn}
              activeOpacity={0.85}
              onPress={handleCancelEdit}
            >
              <Text style={styles.cancelHeaderBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveHeaderBtn}
              activeOpacity={0.85}
              onPress={handleSaveChanges}
            >
              <Text style={styles.saveHeaderBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Toast Notification */}
      {showSavedToast && (
        <View style={styles.savedToast}>
          <CheckCircleIcon size={16} color="#FFFFFF" />
          <Text style={styles.savedToastText}>Store profile updated successfully!</Text>
        </View>
      )}

      {/* Editing Mode Banner */}
      {isEditing && (
        <View style={styles.editingModeBanner}>
          <View style={styles.editingModeBannerLeft}>
            <EditPencilIcon size={14} color="#FF5790" />
            <Text style={styles.editingModeBannerText}>
              Edit Mode Active • Form unlocked for changes
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCancelEdit}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.editingModeCancelLink}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Live Automatic Store Operational Status Card (Doc #31.7, 31.8, 31.9, 31.10) */}
        <View style={styles.statusHeroCard}>
          <View style={styles.statusHeroTop}>
            <View style={styles.statusLeft}>
              <View style={styles.statusIndicatorRow}>
                <View style={[styles.statusDot, { backgroundColor: storeStatus.color }]} />
                <Text style={[styles.statusBadgeText, { color: storeStatus.color }]}>
                  {storeStatus.badgeLabel}
                </Text>
              </View>
              <Text style={styles.statusSubtitleText}>{storeStatus.statusSubtitle}</Text>
            </View>

            <TouchableOpacity
              style={styles.emergencyActionBtn}
              activeOpacity={0.8}
              onPress={() => setTempClosureModalVisible(true)}
            >
              <AlertCircleIcon size={14} color="#FF5790" />
              <Text style={styles.emergencyActionText}>Emergency Controls</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.autoStatusBanner}>
            <ClockIcon size={14} color="#00B074" />
            <Text style={styles.autoStatusBannerText}>
              Automatic status active • Auto-opens & closes according to weekly schedule
            </Text>
          </View>
        </View>

        {/* 2. Shop Images: Logo, Cover Banner & Gallery (Doc #31.1) */}
        <StoreImageUploader
          logoUri={storeProfile.logoUri}
          coverUri={storeProfile.coverUri}
          gallery={storeProfile.gallery}
          onUpdateLogo={(uri) => dispatch(setLogoUri(uri))}
          onRemoveLogo={() => dispatch(removeLogoUri())}
          onUpdateCover={(uri) => dispatch(setCoverUri(uri))}
          onRemoveCover={() => dispatch(removeCoverUri())}
          onAddGalleryImage={(img) => dispatch(addGalleryPhoto(img))}
          onRemoveGalleryImage={(id) => dispatch(removeGalleryPhoto(id))}
        />

        {/* 3. Basic Store Identity Fields */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Store Identity & Category</Text>
            {!isEditing && (
              <TouchableOpacity
                style={styles.sectionQuickEditBtn}
                activeOpacity={0.8}
                onPress={() => setIsEditing(true)}
              >
                <EditPencilIcon size={12} color="#FF5790" />
                <Text style={styles.sectionQuickEditText}>Edit Details</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Shop / Store Name *</Text>
            <TextInput
              style={[styles.textInput, !isEditing && styles.textInputLocked]}
              value={storeName}
              onChangeText={setStoreName}
              placeholder="Store Name"
              placeholderTextColor="#8E8E93"
              editable={isEditing}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Primary Category</Text>
            <TextInput
              style={[styles.textInput, !isEditing && styles.textInputLocked]}
              value={category}
              onChangeText={setCategory}
              placeholder="e.g. Groceries & Daily Needs"
              placeholderTextColor="#8E8E93"
              editable={isEditing}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Business Structure</Text>
            <TextInput
              style={[styles.textInput, !isEditing && styles.textInputLocked]}
              value={businessType}
              onChangeText={setBusinessType}
              placeholder="e.g. Individual / Proprietorship"
              placeholderTextColor="#8E8E93"
              editable={isEditing}
            />
          </View>

          <View style={styles.fieldGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.fieldLabel}>Store Description</Text>
              {!isEditing && (
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                  activeOpacity={0.8}
                  onPress={() => setIsEditing(true)}
                >
                  <EditPencilIcon size={11} color="#FF5790" />
                  <Text style={{ fontFamily: fonts.raleway.semiBold, fontSize: 11, color: '#FF5790' }}>
                    Edit Description
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={[
                styles.textInput,
                styles.multilineInput,
                !isEditing && styles.textInputLocked,
              ]}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Brief description of products and fast fulfillment"
              placeholderTextColor="#8E8E93"
              editable={isEditing}
            />
          </View>
        </View>

        {/* 4. Exact Map Location & Coordinates (Doc #31.2, 31.3) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Physical Shop Location</Text>
            <TouchableOpacity
              style={styles.editMapBtn}
              activeOpacity={0.8}
              onPress={() => setMapModalVisible(true)}
            >
              <MapPinIcon size={14} color="#FF5790" />
              <Text style={styles.editMapText}>Set on Map</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.locationSummaryCard}>
            <View style={styles.locIconCircle}>
              <MapPinIcon size={20} color="#FF5790" />
            </View>
            <View style={styles.locMeta}>
              <Text style={styles.locAddress}>{storeProfile.location.address}</Text>
              <Text style={styles.locCity}>
                {storeProfile.location.city}, {storeProfile.location.state} — {storeProfile.location.pincode}
              </Text>
              <View style={styles.coordsBadgeRow}>
                <Text style={styles.coordsBadgeText}>
                  📍 {storeProfile.location.latitude.toFixed(4)}° N, {storeProfile.location.longitude.toFixed(4)}° E
                </Text>
                <Text style={styles.accuracyText}>
                  • ±{storeProfile.location.accuracyMeters}m precision
                </Text>
              </View>
            </View>
          </View>

          {/* Delivery Radius Selector (Doc #31.4) */}
          <View style={styles.radiusBlock}>
            <View style={styles.radiusHeaderRow}>
              <Text style={styles.fieldLabel}>Hyperlocal Delivery Radius</Text>
              <Text style={styles.radiusActiveVal}>
                {storeProfile.deliverySettings.radiusKm} KM (15-20 Mins)
              </Text>
            </View>

            <View style={styles.radiusChipsGrid}>
              {PRESET_RADIUS_OPTIONS.map((km) => (
                <TouchableOpacity
                  key={km}
                  style={[
                    styles.radiusChip,
                    storeProfile.deliverySettings.radiusKm === km && styles.radiusChipActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleSelectRadius(km)}
                >
                  <Text
                    style={[
                      styles.radiusChipText,
                      storeProfile.deliverySettings.radiusKm === km && styles.radiusChipTextActive,
                    ]}
                  >
                    {km} km
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pricing & Free Delivery Thresholds */}
          <View style={styles.pricingRow}>
            <View style={styles.pricingCol}>
              <Text style={styles.pricingLabel}>Min Order (₹)</Text>
              <TextInput
                style={[styles.textInput, !isEditing && styles.textInputLocked]}
                value={minOrder}
                onChangeText={setMinOrder}
                keyboardType="numeric"
                editable={isEditing}
              />
            </View>
            <View style={styles.pricingCol}>
              <Text style={styles.pricingLabel}>Delivery Fee (₹)</Text>
              <TextInput
                style={[styles.textInput, !isEditing && styles.textInputLocked]}
                value={deliveryCharge}
                onChangeText={setDeliveryCharge}
                keyboardType="numeric"
                editable={isEditing}
              />
            </View>
            <View style={styles.pricingCol}>
              <Text style={styles.pricingLabel}>Free Above (₹)</Text>
              <TextInput
                style={[styles.textInput, !isEditing && styles.textInputLocked]}
                value={freeDelivery}
                onChangeText={setFreeDelivery}
                keyboardType="numeric"
                editable={isEditing}
              />
            </View>
          </View>
        </View>

        {/* 5. Weekly Business Hours (Doc #31.5, 31.6, 31.20) */}
        <BusinessHoursEditor
          schedule={storeProfile.weeklySchedule}
          onUpdateDay={(day, sched) =>
            dispatch(updateDaySchedule({ day, schedule: sched }))
          }
        />

        {/* 6. Special Closures & Holidays (Doc #31.12) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Holidays & Special Closures</Text>
              <Text style={styles.sectionSubtitle}>
                {storeProfile.specialClosures.length} holidays configured
              </Text>
            </View>
            <TouchableOpacity
              style={styles.manageHolidaysBtn}
              activeOpacity={0.8}
              onPress={() => setSpecialClosureModalVisible(true)}
            >
              <CalendarIcon size={14} color="#FF5790" />
              <Text style={styles.manageHolidaysText}>Manage</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.closuresList}>
            {storeProfile.specialClosures.map((sc) => (
              <View key={sc.id} style={styles.closureChipRow}>
                <Text style={styles.closureChipName}>{sc.name}</Text>
                <Text style={styles.closureChipDate}>
                  {sc.date} ({sc.isFullDay ? 'Closed' : `${sc.openTime}-${sc.closeTime}`})
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 7. Contact & Support Policies */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Contact & Policies</Text>
            {!isEditing && (
              <TouchableOpacity
                style={styles.sectionQuickEditBtn}
                activeOpacity={0.8}
                onPress={() => setIsEditing(true)}
              >
                <EditPencilIcon size={12} color="#FF5790" />
                <Text style={styles.sectionQuickEditText}>Edit Details</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Merchant Helpline Phone</Text>
            <TextInput
              style={[styles.textInput, !isEditing && styles.textInputLocked]}
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
              editable={isEditing}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Customer Support Email</Text>
            <TextInput
              style={[styles.textInput, !isEditing && styles.textInputLocked]}
              value={supportEmail}
              onChangeText={setSupportEmail}
              keyboardType="email-address"
              editable={isEditing}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Return & Replacement Policy</Text>
            <TextInput
              style={[
                styles.textInput,
                styles.multilineInput,
                !isEditing && styles.textInputLocked,
              ]}
              value={returnPolicy}
              onChangeText={setReturnPolicy}
              multiline
              numberOfLines={2}
              editable={isEditing}
            />
          </View>
        </View>

        {/* 8. Bottom Action Buttons */}
        {!isEditing ? (
          <TouchableOpacity
            style={styles.bottomEditBtn}
            activeOpacity={0.88}
            onPress={() => setIsEditing(true)}
          >
            <EditPencilIcon size={16} color="#FF5790" />
            <Text style={styles.bottomEditBtnText}>Edit Store Details</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.bottomEditingActions}>
            <TouchableOpacity
              style={styles.bottomCancelBtn}
              activeOpacity={0.88}
              onPress={handleCancelEdit}
            >
              <Text style={styles.bottomCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bottomSaveBtn}
              activeOpacity={0.88}
              onPress={handleSaveChanges}
            >
              <Text style={styles.bottomSaveBtnText}>Save Store Changes</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 9. Switch to Customer Mode Card (Doc #28 & #31) */}
        <View style={styles.switchSection}>
          <TouchableOpacity
            style={styles.switchModeCard}
            activeOpacity={0.85}
            onPress={handleSwitchToCustomer}
          >
            <View style={styles.switchIconBox}>
              <ShoppingBagIcon size={22} color="#004BFF" />
            </View>
            <View style={styles.switchMeta}>
              <Text style={styles.switchTitle}>Switch Profile · Customer Mode</Text>
              <Text style={styles.switchDesc}>
                Exit merchant console & shop on LocalKart as a customer
              </Text>
            </View>
            <ChevronRightIcon size={18} color="#004BFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <StoreMapModal
        visible={mapModalVisible}
        initialLocation={storeProfile.location}
        deliveryRadiusKm={storeProfile.deliverySettings.radiusKm}
        onClose={() => setMapModalVisible(false)}
        onConfirmLocation={handleUpdateLocation}
      />

      <TemporaryClosureModal
        visible={tempClosureModalVisible}
        isCurrentlyClosed={storeProfile.temporaryClosure.isActive}
        currentLabel={storeProfile.temporaryClosure.label}
        onClose={() => setTempClosureModalVisible(false)}
        onApplyClosure={(reason, mins) =>
          dispatch(setTemporaryClosure({ reason, durationMinutes: mins }))
        }
        onClearClosure={() => dispatch(clearTemporaryClosure())}
        onApplyOpenOverride={(mins) =>
          dispatch(setManualOverride({ durationMinutes: mins }))
        }
      />

      <SpecialClosureModal
        visible={specialClosureModalVisible}
        specialClosures={storeProfile.specialClosures}
        onClose={() => setSpecialClosureModalVisible(false)}
        onAddClosure={(sc) => dispatch(addSpecialClosure(sc))}
        onRemoveClosure={(id) => dispatch(removeSpecialClosure(id))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF2',
  },
  headerTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 18,
    color: '#181C1F',
  },
  headerSub: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  saveHeaderBtn: {
    backgroundColor: '#FF5790',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
  },
  saveHeaderBtnText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  editHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FF5790',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    shadowColor: '#FF5790',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  editHeaderBtnText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  headerEditingBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelHeaderBtn: {
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E6EA',
  },
  cancelHeaderBtnText: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 13,
    color: '#555A60',
  },
  editingModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF0F5',
    borderWidth: 1,
    borderColor: '#FFD3E2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
  },
  editingModeBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  editingModeBannerText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 12,
    color: '#D81B60',
    flex: 1,
  },
  editingModeCancelLink: {
    fontFamily: fonts.raleway.bold,
    fontSize: 12,
    color: '#8E8E93',
    paddingLeft: 8,
  },
  sectionQuickEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD3E2',
  },
  sectionQuickEditText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#FF5790',
  },
  savedToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00B074',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
  },
  savedToastText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  // Status Hero Card
  statusHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF2',
    gap: 12,
  },
  statusHeroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusLeft: {
    flex: 1,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  statusBadgeText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  statusSubtitleText: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 13,
    color: '#181C1F',
    marginTop: 4,
  },
  emergencyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF0F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFB8CF',
  },
  emergencyActionText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#FF5790',
  },
  autoStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  autoStatusBannerText: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 11,
    color: '#166534',
    flex: 1,
  },
  // Section Cards
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF2',
    gap: 14,
  },
  sectionTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#181C1F',
  },
  sectionSubtitle: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 12,
    color: '#707070',
  },
  textInput: {
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: '#ECEFF2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    color: '#181C1F',
  },
  textInputLocked: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E9ECEF',
    color: '#343A40',
  },
  multilineInput: {
    minHeight: 110,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  // Map Location Block
  editMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  editMapText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#FF5790',
  },
  locationSummaryCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FAFBFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEFF2',
  },
  locIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEE8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  locMeta: {
    flex: 1,
  },
  locAddress: {
    fontFamily: fonts.raleway.bold,
    fontSize: 13,
    color: '#181C1F',
    lineHeight: 18,
  },
  locCity: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  coordsBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  coordsBadgeText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#FF5790',
  },
  accuracyText: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11,
    color: '#17BE5A',
    marginLeft: 4,
  },
  // Radius Block
  radiusBlock: {
    gap: 10,
    marginTop: 4,
  },
  radiusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radiusActiveVal: {
    fontFamily: fonts.nunito.bold,
    fontSize: 12,
    color: '#FF5790',
    includeFontPadding: false,
  },
  radiusChipsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusChip: {
    flex: 1,
    height: 36,
    paddingHorizontal: 2,
    borderRadius: 10,
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: '#ECEFF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusChipActive: {
    backgroundColor: '#FEE8F0',
    borderColor: '#FF5790',
  },
  radiusChipText: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 12,
    color: '#707070',
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  radiusChipTextActive: {
    fontFamily: fonts.nunito.bold,
    color: '#FF5790',
  },
  pricingRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  pricingCol: {
    flex: 1,
  },
  pricingLabel: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 12,
    color: '#707070',
    marginBottom: 4,
  },
  // Closures
  manageHolidaysBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  manageHolidaysText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#FF5790',
  },
  closuresList: {
    gap: 6,
  },
  closureChipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FAFBFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECEFF2',
  },
  closureChipName: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 12,
    color: '#181C1F',
  },
  closureChipDate: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11,
    color: '#707070',
  },
  // Bottom Actions
  bottomEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF0F5',
    borderWidth: 1.5,
    borderColor: '#FF5790',
    borderRadius: 14,
    paddingVertical: 14,
  },
  bottomEditBtnText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#FF5790',
  },
  bottomEditingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  bottomCancelBtn: {
    flex: 1,
    backgroundColor: '#F1F3F5',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E6EA',
  },
  bottomCancelBtnText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#555A60',
  },
  bottomSaveBtn: {
    flex: 2,
    backgroundColor: '#FF5790',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#FF5790',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomSaveBtnText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  // Switch
  switchSection: {
    marginTop: 6,
  },
  switchModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 12,
  },
  switchIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchMeta: {
    flex: 1,
  },
  switchTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#1D4ED8',
  },
  switchDesc: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 16,
  },
});
