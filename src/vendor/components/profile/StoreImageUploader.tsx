import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { fonts } from '@/theme/fonts';
import { Trash } from 'lucide-react-native';
import {
  CameraIcon,
  ImageIcon,
  TrashIcon,
  PlusIcon,
  CrossIcon,
  StorefrontIcon,
} from '../common/Icons';
import { StoreGalleryImage } from '../../types/storeProfile';

interface StoreImageUploaderProps {
  logoUri?: string;
  coverUri?: string;
  gallery: StoreGalleryImage[];
  onUpdateLogo: (uri: string) => void;
  onRemoveLogo: () => void;
  onUpdateCover: (uri: string) => void;
  onRemoveCover: () => void;
  onAddGalleryImage: (image: StoreGalleryImage) => void;
  onRemoveGalleryImage: (id: string) => void;
}

const PRESET_GALLERY_PHOTOS = [
  {
    uri: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&auto=format&fit=crop&q=80',
    label: 'Front Shop Entrance',
  },
  {
    uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
    label: 'Main Aisles & Shelves',
  },
  {
    uri: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&auto=format&fit=crop&q=80',
    label: 'Billing & Packing Counter',
  },
  {
    uri: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800&auto=format&fit=crop&q=80',
    label: 'Fresh Produce Section',
  },
];

export const StoreImageUploader: React.FC<StoreImageUploaderProps> = ({
  logoUri,
  coverUri,
  gallery,
  onUpdateLogo,
  onRemoveLogo,
  onUpdateCover,
  onRemoveCover,
  onAddGalleryImage,
  onRemoveGalleryImage,
}) => {
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'logo' | 'cover' | 'gallery'>('gallery');
  const [isUploading, setIsUploading] = useState(false);

  const openPicker = (target: 'logo' | 'cover' | 'gallery') => {
    setPickerTarget(target);
    setPickerModalVisible(true);
  };

  const handlePickFromCamera = async () => {
    setPickerModalVisible(false);
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
      });

      if (result.assets && result.assets[0]?.uri) {
        processSelectedImage(result.assets[0].uri);
      }
    } catch {
      // Fallback preset
      useFallbackPreset();
    }
  };

  const handlePickFromGallery = async () => {
    setPickerModalVisible(false);
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.assets && result.assets[0]?.uri) {
        processSelectedImage(result.assets[0].uri);
      }
    } catch {
      // Fallback preset
      useFallbackPreset();
    }
  };

  const useFallbackPreset = () => {
    const randomPreset =
      PRESET_GALLERY_PHOTOS[Math.floor(Math.random() * PRESET_GALLERY_PHOTOS.length)];
    processSelectedImage(randomPreset.uri, randomPreset.label);
  };

  const processSelectedImage = (uri: string, customLabel?: string) => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      if (pickerTarget === 'logo') {
        onUpdateLogo(uri);
      } else if (pickerTarget === 'cover') {
        onUpdateCover(uri);
      } else {
        const newImg: StoreGalleryImage = {
          id: `gal-${Date.now()}`,
          uri,
          label: customLabel || '',
          status: 'success',
          progress: 100,
        };
        onAddGalleryImage(newImg);
      }
    }, 600);
  };

  return (
    <View style={styles.container}>
      {/* 1. Cover Banner Section */}
      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <Text style={styles.blockTitle}>Store Cover Banner</Text>
          <Text style={styles.blockSubtitle}>Wide 16:9 banner displayed on customer store page</Text>
        </View>

        {coverUri ? (
          <View style={styles.coverWrapper}>
            <FastImage
              source={{
                uri: coverUri,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
              }}
              style={styles.coverImage}
              resizeMode={FastImage.resizeMode.cover}
            />
            <View style={styles.coverOverlayActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.8}
                onPress={() => openPicker('cover')}
              >
                <CameraIcon size={16} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Replace</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                activeOpacity={0.8}
                onPress={onRemoveCover}
              >
                <TrashIcon size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.emptyCoverBox}
            activeOpacity={0.8}
            onPress={() => openPicker('cover')}
          >
            <ImageIcon size={30} color="#FF5790" />
            <Text style={styles.uploadCoverText}>Upload Store Cover Image</Text>
            <Text style={styles.uploadSubText}>PNG, JPG up to 5MB</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Store Logo Section */}
      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <Text style={styles.blockTitle}>Store Brand Logo</Text>
        </View>

        <View style={styles.logoRow}>
          <View style={styles.logoFrame}>
            {logoUri ? (
              <FastImage
                source={{
                  uri: logoUri,
                  priority: FastImage.priority.high,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={styles.logoImg}
                resizeMode={FastImage.resizeMode.cover}
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <StorefrontIcon size={40} color="#FF5790" />
              </View>
            )}
          </View>

          <View style={styles.logoActionCol}>
            <View style={styles.logoBtnsCol}>
              <TouchableOpacity
                style={styles.primaryActionBtn}
                activeOpacity={0.8}
                onPress={() => openPicker('logo')}
              >
                <CameraIcon size={16} color="#FFFFFF" />
                <Text style={styles.primaryActionText}>
                  {logoUri ? 'Replace Logo' : 'Upload Logo'}
                </Text>
              </TouchableOpacity>

              {logoUri ? (
                <TouchableOpacity
                  style={styles.removeActionBtn}
                  activeOpacity={0.8}
                  onPress={onRemoveLogo}
                >
                  <Trash size={16} color="#FFFFFF" strokeWidth={1.8} />
                  <Text style={styles.removeActionText}>Remove Logo</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      {/* 3. Shop Photo Gallery Section (Doc #31.1) */}
      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <Text style={styles.blockTitle}>Gallery</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.galleryScrollView}
          contentContainerStyle={styles.galleryScroll}
        >
          {/* Add Tile */}
          <TouchableOpacity
            style={styles.addGalleryTile}
            activeOpacity={0.8}
            onPress={() => openPicker('gallery')}
          >
            <View style={styles.addIconWrap}>
              <PlusIcon size={20} color="#FF5790" />
            </View>
            <Text style={styles.addTileLabel}>Upload Photo</Text>
          </TouchableOpacity>

          {/* Photo Cards */}
          {gallery.map((item) => (
            <View key={item.id} style={styles.galleryCard}>
              <FastImage
                source={{
                  uri: item.uri,
                  priority: FastImage.priority.normal,
                  cache: FastImage.cacheControl.immutable,
                }}
                style={styles.galleryThumb}
                resizeMode={FastImage.resizeMode.cover}
              />
              <View style={styles.galleryBadgeWrap}>
                <Text style={styles.galleryLabel} numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.galleryDeleteBtn}
                activeOpacity={0.8}
                onPress={() => onRemoveGalleryImage(item.id)}
              >
                <CrossIcon size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Uploading Overlay Indicator */}
      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="#FF5790" />
          <Text style={styles.uploadingText}>Optimizing & Uploading Image...</Text>
        </View>
      )}

      {/* Camera / Gallery Choice Modal */}
      <Modal visible={pickerModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {pickerTarget === 'logo'
                  ? 'Update Brand Logo'
                  : pickerTarget === 'cover'
                  ? 'Update Cover Banner'
                  : 'Add Shop Photo'}
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setPickerModalVisible(false)}
              >
                <CrossIcon size={20} color="#000000" />
              </TouchableOpacity>
            </View>

            <View style={styles.choiceRow}>
              <TouchableOpacity
                style={styles.choiceBox}
                activeOpacity={0.8}
                onPress={handlePickFromCamera}
              >
                <View style={[styles.choiceIconCircle, { backgroundColor: '#FEE8F0' }]}>
                  <CameraIcon size={24} color="#FF5790" />
                </View>
                <Text style={styles.choiceLabel}>Take Photo</Text>
                <Text style={styles.choiceSub}>Open device camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.choiceBox}
                activeOpacity={0.8}
                onPress={handlePickFromGallery}
              >
                <View style={[styles.choiceIconCircle, { backgroundColor: '#EBF2FF' }]}>
                  <ImageIcon size={24} color="#004BFF" />
                </View>
                <Text style={styles.choiceLabel}>Choose Library</Text>
                <Text style={styles.choiceSub}>Select from gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  block: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEFF2',
    overflow: 'hidden',
  },
  blockHeader: {
    marginBottom: 12,
  },
  blockHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  blockTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#181C1F',
  },
  blockSubtitle: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  addPhotoHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    flexShrink: 0,
  },
  addPhotoHeaderText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11.5,
    color: '#FF5790',
  },
  // Cover
  coverWrapper: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlayActions: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(24, 28, 31, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteBtn: {
    backgroundColor: 'rgba(255, 59, 48, 0.85)',
  },
  actionBtnText: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  emptyCoverBox: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F8B4C9',
    borderStyle: 'dashed',
    backgroundColor: '#FFF8FA',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  uploadCoverText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 13,
    color: '#FF5790',
  },
  uploadSubText: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11,
    color: '#8E8E93',
  },
  // Logo
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoFrame: {
    width: 104,
    height: 104,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#ECEFF2',
    backgroundColor: '#FAFBFC',
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE8F0',
  },
  logoActionCol: {
    flex: 1,
    justifyContent: 'center',
  },
  logoBtnsCol: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#FF5790',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: '100%',
  },
  primaryActionText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 13,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  removeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    width: '100%',
  },
  removeActionText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 13,
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  // Gallery
  galleryScrollView: {
    marginHorizontal: -16,
  },
  galleryScroll: {
    paddingHorizontal: 16,
    gap: 12,
    paddingVertical: 4,
  },
  addGalleryTile: {
    width: 110,
    height: 120,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#F8B4C9',
    borderStyle: 'dashed',
    backgroundColor: '#FFF8FA',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTileLabel: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#FF5790',
  },
  galleryCard: {
    width: 130,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: '#ECEFF2',
  },
  galleryThumb: {
    width: '100%',
    height: '100%',
  },
  galleryBadgeWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(24, 28, 31, 0.72)',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  galleryLabel: {
    fontFamily: fonts.raleway.medium,
    fontSize: 10,
    color: '#FFFFFF',
  },
  galleryDeleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 99,
  },
  uploadingText: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 13,
    color: '#181C1F',
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 17,
    color: '#181C1F',
  },
  labelSection: {
    gap: 8,
  },
  labelTitle: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 12,
    color: '#707070',
  },
  labelChip: {
    backgroundColor: '#F4F5F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  labelChipActive: {
    backgroundColor: '#FEE8F0',
    borderWidth: 1,
    borderColor: '#FF5790',
  },
  labelChipText: {
    fontFamily: fonts.raleway.medium,
    fontSize: 12,
    color: '#707070',
  },
  labelChipTextActive: {
    fontFamily: fonts.raleway.bold,
    color: '#FF5790',
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  choiceBox: {
    flex: 1,
    backgroundColor: '#FAFBFC',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF2',
    gap: 6,
  },
  choiceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  choiceLabel: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#181C1F',
  },
  choiceSub: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11,
    color: '#8E8E93',
  },
  presetQuickBtn: {
    backgroundColor: '#FFF0F5',
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFB8CF',
  },
  presetQuickText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 13,
    color: '#FF5790',
  },
});
