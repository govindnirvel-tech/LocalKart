import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  Asset,
} from 'react-native-image-picker';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { fonts } from '@/theme/fonts';
import FloatingModal from '@/components/FloatingModal';

export interface SelectedImage {
  uri: string;
  base64?: string;
  type?: string;
  fileName?: string;
}

interface ProfilePhotoPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (image: SelectedImage) => void;
  onRemovePhoto?: () => void;
  showRemoveOption?: boolean;
}

// Camera SVG Icon
const CameraIcon = ({ size = 22, color = '#004CFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth={2} />
  </Svg>
);

// Gallery SVG Icon
const GalleryIcon = ({ size = 22, color = '#004CFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="4"
      ry="4"
      stroke={color}
      strokeWidth={2}
    />
    <Circle cx="8.5" cy="8.5" r="1.5" fill={color} />
    <Path
      d="M21 15l-5-5L5 21"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Trash SVG Icon
const TrashIcon = ({ size = 20, color = '#EF4444' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Close/Cancel SVG Icon
const CancelIcon = ({ size = 20, color = '#FF3B30' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ProfilePhotoPickerModal: React.FC<ProfilePhotoPickerModalProps> = ({
  visible,
  onClose,
  onImageSelected,
  onRemovePhoto,
  showRemoveOption = false,
}) => {
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      return true;
    }
    try {
      const alreadyGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      if (alreadyGranted) {
        return true;
      }

      // Direct system request without custom rationale so official OS dialog pops up
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('[Camera Permission Error]', err);
      return false;
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      onClose();
      // Show our sleek custom MaxAttemptsModal instead of default white alert
      setTimeout(() => {
        setShowPermissionModal(true);
      }, 300);
      return;
    }

    onClose();
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        cameraType: 'front',
        maxWidth: 320,
        maxHeight: 320,
        quality: 0.7,
        includeBase64: true,
        saveToPhotos: false,
      });

      if (result.assets && result.assets.length > 0) {
        const asset: Asset = result.assets[0];
        if (asset.uri) {
          onImageSelected({
            uri: asset.uri,
            base64: asset.base64,
            type: asset.type,
            fileName: asset.fileName,
          });
        }
      }
    } catch (error) {
      console.log('[launchCamera error]', error);
    }
  };

  const handleChooseFromGallery = async () => {
    onClose();
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        maxWidth: 320,
        maxHeight: 320,
        quality: 0.7,
        includeBase64: true,
      });

      if (result.assets && result.assets.length > 0) {
        const asset: Asset = result.assets[0];
        if (asset.uri) {
          onImageSelected({
            uri: asset.uri,
            base64: asset.base64,
            type: asset.type,
            fileName: asset.fileName,
          });
        }
      }
    } catch (error) {
      console.log('[launchImageLibrary error]', error);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />

          <View style={styles.sheetContainer}>
            {/* Top Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Sheet Title */}
            <Text style={styles.sheetTitle}>Profile photo</Text>
            <View style={styles.divider} />

            {/* Option 1: Take Photo */}
            <TouchableOpacity
              style={styles.optionRow}
              activeOpacity={0.7}
              onPress={handleTakePhoto}
            >
              <View style={styles.iconContainer}>
                <CameraIcon />
              </View>
              <Text style={styles.optionText}>Take photo</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Option 2: Choose from Gallery */}
            <TouchableOpacity
              style={styles.optionRow}
              activeOpacity={0.7}
              onPress={handleChooseFromGallery}
            >
              <View style={styles.iconContainer}>
                <GalleryIcon />
              </View>
              <Text style={styles.optionText}>Choose from gallery</Text>
            </TouchableOpacity>

            {/* Option 3: Remove Current Photo (If user already has one) */}
            {showRemoveOption && onRemovePhoto && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.optionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onRemovePhoto();
                  }}
                >
                  <View style={styles.iconContainer}>
                    <TrashIcon size={22} color="#EF4444" />
                  </View>
                  <Text style={[styles.optionText, { color: '#EF4444' }]}>
                    Remove current photo
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.divider} />

            {/* Option 4: Cancel */}
            <TouchableOpacity
              style={styles.optionRow}
              activeOpacity={0.7}
              onPress={onClose}
            >
              <View style={styles.iconContainer}>
                <CancelIcon />
              </View>
              <Text style={[styles.optionText, styles.cancelText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sleek Custom Modal for Permission Notice (Replaces system alert) */}
      <FloatingModal
        visible={showPermissionModal}
        onDismiss={() => setShowPermissionModal(false)}
        message={'Camera permission is required\nto take a profile picture.\nPlease allow camera access.'}
        buttonText="Okay"
      />
    </>
  );
};

export default ProfilePhotoPickerModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 18,
    color: '#181C1F',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: -20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    fontFamily: fonts.raleway.medium,
    fontSize: 16,
    color: '#181C1F',
  },
  cancelText: {
    fontFamily: fonts.raleway.semiBold,
    color: '#FF3B30',
  },
});
