import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { fonts } from '@/theme/fonts';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { saveCachedAvatar, saveCachedName, clearCachedAvatar } from '@/utils/userAvatarStorage';
import ProfilePhotoPickerModal, { SelectedImage } from '@/components/ProfilePhotoPickerModal';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

// Back Arrow SVG Icon
const BackArrowIcon = ({ size = 22, color = '#181C1F' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Camera Badge Icon
const CameraBadgeIcon = ({ size = 18, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
      stroke={color}
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="13" r="3.5" stroke={color} strokeWidth={2.2} />
  </Svg>
);

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
}) => {
  const { profile, user, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      const currentName =
        profile?.full_name ||
        user?.user_metadata?.full_name ||
        '';
      setName(currentName);
      setImageUri(profile?.image_url || null);
      setImageBase64(undefined);
    }
  }, [visible, profile, user]);

  const handleImageSelected = (image: SelectedImage) => {
    setImageUri(image.uri);
    if (image.base64) {
      setImageBase64(image.base64);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }

    try {
      setIsSaving(true);
      let finalImageUrl: string | null = null;
      if (imageBase64) {
        finalImageUrl = `data:image/jpeg;base64,${imageBase64}`;
      } else if (imageUri) {
        finalImageUrl = imageUri;
      } else {
        finalImageUrl = null;
      }

      await updateProfile({
        full_name: name.trim(),
        image_url: finalImageUrl,
      });

      if (finalImageUrl) {
        await saveCachedAvatar(finalImageUrl);
      } else {
        await clearCachedAvatar();
      }
      await saveCachedName(name.trim());

      setIsSaving(false);
      onClose();
    } catch (err: any) {
      setIsSaving(false);
      Alert.alert('Error', err?.message || 'Failed to update profile. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" />

        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={onClose}
          >
            <BackArrowIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Main Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Big Avatar Section with Camera Badge */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarWrapper}
                activeOpacity={0.85}
                onPress={() => setIsPhotoPickerOpen(true)}
              >
                <Image
                  source={
                    imageUri
                      ? { uri: imageUri }
                      : require('@/assets/png/userImage.png')
                  }
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
                <View style={styles.cameraBadge}>
                  <CameraBadgeIcon />
                </View>
              </TouchableOpacity>
              <Text style={styles.changePhotoText}>Tap photo to change</Text>
            </View>

            {/* Form Inputs */}
            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your Name"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                />
              </View>

              {/* Readonly Info Section */}
              {user?.email ? (
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardLabel}>Email Address</Text>
                  <Text style={styles.infoCardValue}>{user.email}</Text>
                </View>
              ) : null}

              {profile?.phone ? (
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardLabel}>Phone Number</Text>
                  <Text style={styles.infoCardValue}>{profile.phone}</Text>
                </View>
              ) : null}
            </View>
          </ScrollView>

          {/* Bottom Save Button */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.saveButton}
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Camera / Gallery Picker Modal */}
        <ProfilePhotoPickerModal
          visible={isPhotoPickerOpen}
          onClose={() => setIsPhotoPickerOpen(false)}
          onImageSelected={handleImageSelected}
          showRemoveOption={!!imageUri}
          onRemovePhoto={() => {
            setImageUri(null);
            setImageBase64(undefined);
          }}
        />
      </SafeAreaView>
    </Modal>
  );
};

export default EditProfileModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 18,
    color: '#181C1F',
  },
  headerSpacer: {
    width: 40,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  avatarWrapper: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: '#E5EBFC',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 62,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#004CFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 6,
  },
  changePhotoText: {
    fontFamily: fonts.nunito.regular,
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  formSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  textInput: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 16,
    color: '#181C1F',
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 14,
  },
  infoCardLabel: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  infoCardValue: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 15,
    color: '#181C1F',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#202020',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 17,
    color: '#FFFFFF',
  },
});
