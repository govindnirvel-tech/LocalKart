import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  PanResponder,
  Animated,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { fonts } from '@/theme/fonts';
import {
  MapPinIcon,
  CrossIcon,
  CompassIcon,
  CheckCircleIcon,
} from '../common/Icons';
import { StoreLocation } from '../../types/storeProfile';

interface StoreMapModalProps {
  visible: boolean;
  initialLocation: StoreLocation;
  deliveryRadiusKm: number;
  onClose: () => void;
  onConfirmLocation: (location: StoreLocation) => void;
}

// Preset Indore hyperlocal hotspots for instant reverse-geocoding simulation
const INDORE_HOTSPOTS = [
  {
    name: 'Vijay Nagar Square',
    address: 'Shop #14, Ground Floor, Vijay Nagar Square, Scheme 54',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452010',
    lat: 22.7533,
    lng: 75.8937,
    accuracy: 4,
  },
  {
    name: 'Rajwada Market',
    address: 'MG Road, Opposite Rajwada Palace, Sarafa Bazar',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452002',
    lat: 22.7196,
    lng: 75.8577,
    accuracy: 5,
  },
  {
    name: 'Palasia Chouraha',
    address: 'AB Road, Near 56 Dukan, Old Palasia',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452001',
    lat: 22.7244,
    lng: 75.8839,
    accuracy: 3,
  },
  {
    name: 'Bhawarkua Square',
    address: 'Tower Square, Bhawarkua Main Road, Vishnupuri',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '452014',
    lat: 22.6938,
    lng: 75.8672,
    accuracy: 6,
  },
];

// Web Mercator projection constants & helpers
const TILE_SIZE = 256;
const TILE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
  Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
};

function project(lat: number, lng: number, zoom: number) {
  const sin = Math.sin((lat * Math.PI) / 180);
  const clampedSin = Math.min(Math.max(sin, -0.9999), 0.9999);
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const y =
    (0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI)) *
    scale;
  return { x, y };
}

function unproject(x: number, y: number, zoom: number) {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return { lat, lng };
}

// Memoized Map Tile Item with auto-fallback
interface MapTileProps {
  x: number;
  y: number;
  z: number;
  left: number;
  top: number;
  mapType: 'roadmap' | 'satellite';
}

const MapTile: React.FC<MapTileProps> = React.memo(
  ({ x, y, z, left, top, mapType }) => {
    const [hasError, setHasError] = useState(false);
    const sub = Math.abs(x + y) % 4;

    let uri = '';
    if (hasError) {
      if (mapType === 'satellite') {
        uri = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
      } else {
        const subLetter = ['a', 'b', 'c', 'd'][sub];
        uri = `https://${subLetter}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}@2x.png`;
      }
    } else {
      const lyrs = mapType === 'satellite' ? 'y' : 'm';
      uri = `https://mt${sub}.google.com/vt/lyrs=${lyrs}&x=${x}&y=${y}&z=${z}`;
    }

    return (
      <FastImage
        source={{
          uri,
          headers: TILE_HEADERS,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable,
        }}
        onError={() => {
          if (!hasError) setHasError(true);
        }}
        style={[
          styles.tileImage,
          {
            left,
            top,
            backgroundColor: mapType === 'satellite' ? '#141E24' : '#E8ECEF',
          },
        ]}
        resizeMode={FastImage.resizeMode.cover}
      />
    );
  }
);

export const StoreMapModal: React.FC<StoreMapModalProps> = ({
  visible,
  initialLocation,
  deliveryRadiusKm,
  onClose,
  onConfirmLocation,
}) => {
  const [selectedHotspot, setSelectedHotspot] = useState<number | null>(0);
  const [currentLoc, setCurrentLoc] = useState<StoreLocation>(initialLocation);
  const [mapCenter, setMapCenter] = useState({
    lat: initialLocation.latitude || 22.7533,
    lng: initialLocation.longitude || 75.8937,
  });
  const [zoom, setZoom] = useState(16);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [viewportSize, setViewportSize] = useState({ width: 390, height: 350 });
  const [isLocating, setIsLocating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Animated drag values
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const pinLift = useRef(new Animated.Value(0)).current;

  // Stable references for pan responder
  const mapCenterRef = useRef(mapCenter);
  mapCenterRef.current = mapCenter;

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const geocodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize location when modal opens
  useEffect(() => {
    if (visible) {
      const lat = initialLocation.latitude || 22.7533;
      const lng = initialLocation.longitude || 75.8937;
      setMapCenter({ lat, lng });
      setCurrentLoc(initialLocation);
      pan.setValue({ x: 0, y: 0 });
    }
  }, [visible, initialLocation, pan]);

  // Reverse geocoding helper with debounce
  const debouncedGeocode = useCallback((lat: number, lng: number) => {
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }

    // Check if near known hotspots
    const match = INDORE_HOTSPOTS.find(h => {
      const dLat = Math.abs(h.lat - lat);
      const dLng = Math.abs(h.lng - lng);
      return dLat < 0.003 && dLng < 0.003;
    });

    if (match) {
      setCurrentLoc(prev => ({
        ...prev,
        address: match.address,
        city: match.city,
        state: match.state,
        pincode: match.pincode,
        accuracyMeters: match.accuracy,
      }));
      return;
    }

    geocodeTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          { headers: { 'User-Agent': 'LocalKartApp/1.0' } }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.address) {
          const road =
            data.address.road ||
            data.address.suburb ||
            data.address.neighbourhood ||
            data.address.commercial ||
            'Shop Location';
          const locality =
            data.address.suburb ||
            data.address.city_district ||
            data.address.neighbourhood ||
            'Indore';
          const city =
            data.address.city ||
            data.address.town ||
            data.address.county ||
            'Indore';
          const state = data.address.state || 'Madhya Pradesh';
          const pincode = data.address.postcode || '452001';

          setCurrentLoc(prev => ({
            ...prev,
            address: `${road}, ${locality}`,
            city,
            state,
            pincode,
            accuracyMeters: 4,
          }));
        }
      } catch {
        // Soft fallback
        setCurrentLoc(prev => ({
          ...prev,
          address: `Location at ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
          city: 'Indore',
          state: 'Madhya Pradesh',
          pincode: '452001',
        }));
      }
    }, 450);
  }, []);

  // Pan Responder for smooth 60fps drag
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
        },
        onPanResponderGrant: () => {
          setIsDragging(true);
          setSelectedHotspot(null);
          Animated.spring(pinLift, {
            toValue: -14,
            useNativeDriver: true,
            friction: 7,
          }).start();
        },
        onPanResponderMove: (_, gestureState) => {
          pan.setValue({ x: gestureState.dx, y: gestureState.dy });
        },
        onPanResponderRelease: (_, gestureState) => {
          setIsDragging(false);
          Animated.spring(pinLift, {
            toValue: 0,
            useNativeDriver: true,
            friction: 6,
          }).start();

          const center = mapCenterRef.current;
          const z = zoomRef.current;
          const curCenterPixel = project(center.lat, center.lng, z);
          const newCenterPixel = {
            x: curCenterPixel.x - gestureState.dx,
            y: curCenterPixel.y - gestureState.dy,
          };
          const newCoords = unproject(newCenterPixel.x, newCenterPixel.y, z);

          pan.setValue({ x: 0, y: 0 });
          const updatedLat = Number(newCoords.lat.toFixed(6));
          const updatedLng = Number(newCoords.lng.toFixed(6));

          setMapCenter({ lat: updatedLat, lng: updatedLng });
          setCurrentLoc(prev => ({
            ...prev,
            latitude: updatedLat,
            longitude: updatedLng,
          }));
          debouncedGeocode(updatedLat, updatedLng);
        },
        onPanResponderTerminate: () => {
          setIsDragging(false);
          Animated.spring(pinLift, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          pan.setValue({ x: 0, y: 0 });
        },
      }),
    [pan, pinLift, debouncedGeocode]
  );

  // Compute 5x5 visible tile matrix around the current center
  const tiles = useMemo(() => {
    const centerPixel = project(mapCenter.lat, mapCenter.lng, zoom);
    const worldOriginX = centerPixel.x - viewportSize.width / 2;
    const worldOriginY = centerPixel.y - viewportSize.height / 2;
    const centerTileX = Math.floor(centerPixel.x / TILE_SIZE);
    const centerTileY = Math.floor(centerPixel.y / TILE_SIZE);

    const maxTile = Math.pow(2, zoom) - 1;
    const result: Array<{
      key: string;
      x: number;
      y: number;
      left: number;
      top: number;
    }> = [];

    // 5x5 grid provides over 400px of drag margin in every direction
    for (let dy = -2; dy <= 2; dy++) {
      const ty = centerTileY + dy;
      if (ty < 0 || ty > maxTile) continue;

      for (let dx = -2; dx <= 2; dx++) {
        let tx = centerTileX + dx;
        // wrap horizontally
        tx = ((tx % (maxTile + 1)) + (maxTile + 1)) % (maxTile + 1);

        const left = (centerTileX + dx) * TILE_SIZE - worldOriginX;
        const top = ty * TILE_SIZE - worldOriginY;

        result.push({
          key: `${zoom}-${tx}-${ty}-${mapType}`,
          x: tx,
          y: ty,
          left,
          top,
        });
      }
    }
    return result;
  }, [mapCenter, zoom, viewportSize, mapType]);

  // Delivery radius overlay size
  const radiusPx = useMemo(() => {
    const metersPerPixel =
      (156543.03392 * Math.cos((mapCenter.lat * Math.PI) / 180)) /
      Math.pow(2, zoom);
    return Math.max(30, (deliveryRadiusKm * 1000) / metersPerPixel);
  }, [mapCenter.lat, zoom, deliveryRadiusKm]);

  // Actions
  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      setSelectedHotspot(0);
      const hotspot = INDORE_HOTSPOTS[0];
      setMapCenter({ lat: hotspot.lat, lng: hotspot.lng });
      setZoom(16);
      pan.setValue({ x: 0, y: 0 });
      setCurrentLoc({
        latitude: hotspot.lat,
        longitude: hotspot.lng,
        address: hotspot.address,
        city: hotspot.city,
        state: hotspot.state,
        pincode: hotspot.pincode,
        accuracyMeters: hotspot.accuracy,
      });
      // Soft pin bounce
      Animated.sequence([
        Animated.timing(pinLift, {
          toValue: -18,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(pinLift, {
          toValue: 0,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    }, 700);
  };

  const handleSelectHotspot = (index: number) => {
    setSelectedHotspot(index);
    const item = INDORE_HOTSPOTS[index];
    setMapCenter({ lat: item.lat, lng: item.lng });
    setZoom(16);
    pan.setValue({ x: 0, y: 0 });
    setCurrentLoc({
      latitude: item.lat,
      longitude: item.lng,
      address: item.address,
      city: item.city,
      state: item.state,
      pincode: item.pincode,
      accuracyMeters: item.accuracy,
    });
    // Soft pin bounce
    Animated.sequence([
      Animated.timing(pinLift, {
        toValue: -14,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(pinLift, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleZoomIn = () => {
    if (zoom < 18) setZoom(z => z + 1);
  };

  const handleZoomOut = () => {
    if (zoom > 13) setZoom(z => z - 1);
  };

  const handleConfirm = () => {
    onConfirmLocation(currentLoc);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" />

        {/* Modal Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeBtn}
            activeOpacity={0.7}
            onPress={onClose}
          >
            <CrossIcon size={20} color="#181C1F" />
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle}>Set Store Location</Text>
            <Text style={styles.topBarSubtitle}>
              Drag map to pinpoint shop location
            </Text>
          </View>
          <TouchableOpacity
            style={styles.gpsTopBtn}
            activeOpacity={0.8}
            onPress={handleUseCurrentLocation}
          >
            <CompassIcon size={18} color="#FF5790" />
          </TouchableOpacity>
        </View>

        {/* Interactive Google Map Viewport */}
        <View
          style={styles.mapViewport}
          onLayout={e => {
            const { width, height } = e.nativeEvent.layout;
            if (width > 0 && height > 0) {
              setViewportSize({ width, height });
            }
          }}
          {...panResponder.panHandlers}
        >
          {/* Animated Map Surface (Follows Touch Gesture) */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                transform: [
                  { translateX: pan.x },
                  { translateY: pan.y },
                ],
              },
            ]}
          >
            {/* Real Street & Satellite Map Tiles */}
            {tiles.map(tile => (
              <MapTile
                key={tile.key}
                x={tile.x}
                y={tile.y}
                z={zoom}
                left={tile.left}
                top={tile.top}
                mapType={mapType}
              />
            ))}

            {/* Delivery Radius Overlay */}
            <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
              <Defs>
                <RadialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#FF5790" stopOpacity="0.28" />
                  <Stop offset="75%" stopColor="#FF5790" stopOpacity="0.10" />
                  <Stop offset="100%" stopColor="#FF5790" stopOpacity="0" />
                </RadialGradient>
              </Defs>
              <Circle
                cx={viewportSize.width / 2}
                cy={viewportSize.height / 2}
                r={radiusPx}
                fill="url(#radarGlow)"
                stroke="#FF5790"
                strokeWidth="1.8"
                strokeDasharray="6,4"
              />
              <Circle
                cx={viewportSize.width / 2}
                cy={viewportSize.height / 2}
                r="6"
                fill="#FF5790"
              />
            </Svg>

            {/* Delivery Radius Tag */}
            {radiusPx > 50 && (
              <View
                style={[
                  styles.radiusPill,
                  {
                    top: Math.max(8, viewportSize.height / 2 - radiusPx - 14),
                    left: viewportSize.width / 2 - 65,
                  },
                ]}
                pointerEvents="none"
              >
                <Text style={styles.radiusPillText}>
                  {deliveryRadiusKm} KM DELIVERY ZONE
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Center Pin Ground Shadow */}
          <Animated.View
            style={[
              styles.pinGroundShadow,
              {
                left: viewportSize.width / 2 - 8,
                top: viewportSize.height / 2 - 4,
                opacity: pinLift.interpolate({
                  inputRange: [-14, 0],
                  outputRange: [0.25, 0.65],
                }),
                transform: [
                  {
                    scale: pinLift.interpolate({
                      inputRange: [-14, 0],
                      outputRange: [0.7, 1],
                    }),
                  },
                ],
              },
            ]}
            pointerEvents="none"
          />

          {/* Center Pin Graphic Hovering on Center Coordinate */}
          <Animated.View
            style={[
              styles.centerPinWrap,
              {
                left: viewportSize.width / 2 - 60,
                top: viewportSize.height / 2 - 58,
                transform: [{ translateY: pinLift }],
              },
            ]}
            pointerEvents="none"
          >
            <View style={styles.pinBubble}>
              <Text style={styles.pinBubbleText}>
                {isDragging ? '📍 Move Pin' : '📍 Shop Location'}
              </Text>
            </View>
            <MapPinIcon size={40} color="#EA4335" />
          </Animated.View>

          {/* Map Layer Switcher (Default vs Satellite) */}
          <View style={styles.layerSelector}>
            <TouchableOpacity
              style={[
                styles.layerBtn,
                mapType === 'roadmap' && styles.layerBtnActive,
              ]}
              activeOpacity={0.8}
              onPress={() => setMapType('roadmap')}
            >
              <Text
                style={[
                  styles.layerBtnText,
                  mapType === 'roadmap' && styles.layerBtnTextActive,
                ]}
              >
                🗺️ Map
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.layerBtn,
                mapType === 'satellite' && styles.layerBtnActive,
              ]}
              activeOpacity={0.8}
              onPress={() => setMapType('satellite')}
            >
              <Text
                style={[
                  styles.layerBtnText,
                  mapType === 'satellite' && styles.layerBtnTextActive,
                ]}
              >
                🛰️ Satellite
              </Text>
            </TouchableOpacity>
          </View>

          {/* Zoom Controls */}
          <View style={styles.zoomControl}>
            <TouchableOpacity
              style={styles.zoomBtn}
              activeOpacity={0.75}
              onPress={handleZoomIn}
            >
              <Text style={styles.zoomBtnText}>+</Text>
            </TouchableOpacity>
            <View style={styles.zoomDivider} />
            <TouchableOpacity
              style={styles.zoomBtn}
              activeOpacity={0.75}
              onPress={handleZoomOut}
            >
              <Text style={styles.zoomBtnText}>−</Text>
            </TouchableOpacity>
          </View>

          {/* Floating Current Location Action Button */}
          <TouchableOpacity
            style={styles.floatingGpsBtn}
            activeOpacity={0.85}
            onPress={handleUseCurrentLocation}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#FF5790" />
            ) : (
              <>
                <CompassIcon size={16} color="#FF5790" />
                <Text style={styles.gpsBtnText}>My Location</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Google Maps Watermark & Accuracy Badge */}
          <View style={styles.mapFooterBadges} pointerEvents="none">
            <View style={styles.googleWatermark}>
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.googleO1}>o</Text>
              <Text style={styles.googleO2}>o</Text>
              <Text style={styles.googleG2}>g</Text>
              <Text style={styles.googleL}>l</Text>
              <Text style={styles.googleE}>e</Text>
              <Text style={styles.googleSuffix}>Maps</Text>
            </View>
            <View style={styles.accuracyTag}>
              <CheckCircleIcon size={12} color="#17BE5A" />
              <Text style={styles.accuracyTagText}>High Precision GPS</Text>
            </View>
          </View>
        </View>

        {/* Bottom Details Sheet */}
        <View style={styles.sheetWrap}>
          {/* Quick Hotspot Selectors */}
          <View style={styles.hotspotsRow}>
            <Text style={styles.hotspotLabel}>Landmarks:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {INDORE_HOTSPOTS.map((h, i) => (
                <TouchableOpacity
                  key={h.name}
                  style={[
                    styles.hotspotChip,
                    selectedHotspot === i && styles.hotspotChipActive,
                  ]}
                  onPress={() => handleSelectHotspot(i)}
                >
                  <Text
                    style={[
                      styles.hotspotChipText,
                      selectedHotspot === i && styles.hotspotChipTextActive,
                    ]}
                  >
                    {h.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Address Preview Card */}
          <View style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <View style={styles.addressIconBox}>
                <MapPinIcon size={20} color="#EA4335" />
              </View>
              <View style={styles.addressMeta}>
                <Text style={styles.addressLine} numberOfLines={2}>
                  {currentLoc.address}
                </Text>
                <Text style={styles.cityPincode}>
                  {currentLoc.city}, {currentLoc.state} — {currentLoc.pincode}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Coordinates Lat / Long */}
            <View style={styles.coordsRow}>
              <View style={styles.coordBox}>
                <Text style={styles.coordKey}>LATITUDE</Text>
                <Text style={styles.coordVal}>
                  {currentLoc.latitude.toFixed(4)}° N
                </Text>
              </View>
              <View style={styles.coordBox}>
                <Text style={styles.coordKey}>LONGITUDE</Text>
                <Text style={styles.coordVal}>
                  {currentLoc.longitude.toFixed(4)}° E
                </Text>
              </View>
              <View style={styles.coordBox}>
                <Text style={styles.coordKey}>RADIUS</Text>
                <Text style={styles.coordValPrimary}>
                  {deliveryRadiusKm} KM ZONE
                </Text>
              </View>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmBtn}
            activeOpacity={0.88}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmBtnText}>Confirm Store Location</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF2',
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: {
    alignItems: 'center',
  },
  topBarTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    color: '#181C1F',
  },
  topBarSubtitle: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#8E8E93',
  },
  gpsTopBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEE8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Map Viewport
  mapViewport: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E8EDF2',
    overflow: 'hidden',
  },
  tileImage: {
    position: 'absolute',
    width: 256,
    height: 256,
  },
  radiusPill: {
    position: 'absolute',
    width: 130,
    backgroundColor: 'rgba(255, 87, 144, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  radiusPillText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  pinGroundShadow: {
    position: 'absolute',
    width: 16,
    height: 7,
    borderRadius: 8,
    backgroundColor: '#000000',
  },
  centerPinWrap: {
    position: 'absolute',
    width: 120,
    alignItems: 'center',
  },
  pinBubble: {
    backgroundColor: '#181C1F',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  pinBubbleText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  // Layer Switcher
  layerSelector: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ECEFF2',
  },
  layerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  layerBtnActive: {
    backgroundColor: '#181C1F',
  },
  layerBtnText: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 11,
    color: '#555555',
  },
  layerBtnTextActive: {
    color: '#FFFFFF',
    fontFamily: fonts.raleway.bold,
  },
  // Zoom Controls
  zoomControl: {
    position: 'absolute',
    right: 14,
    top: 68,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ECEFF2',
    overflow: 'hidden',
  },
  zoomBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomBtnText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 18,
    color: '#181C1F',
    lineHeight: 20,
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#ECEFF2',
  },
  // Floating Actions
  floatingGpsBtn: {
    position: 'absolute',
    bottom: 46,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#ECEFF2',
  },
  gpsBtnText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 12,
    color: '#FF5790',
  },
  // Badges & Watermark
  mapFooterBadges: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  googleWatermark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#D8DCE0',
  },
  googleG: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#4285F4',
  },
  googleO1: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#EA4335',
  },
  googleO2: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#FBBC05',
  },
  googleG2: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#4285F4',
  },
  googleL: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#34A853',
  },
  googleE: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#EA4335',
  },
  googleSuffix: {
    fontFamily: fonts.nunito.bold,
    fontSize: 9,
    color: '#70757A',
    marginLeft: 3,
  },
  accuracyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#D8DCE0',
  },
  accuracyTagText: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 10,
    color: '#181C1F',
  },
  // Sheet
  sheetWrap: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
    gap: 12,
  },
  hotspotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hotspotLabel: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 12,
    color: '#8E8E93',
  },
  hotspotChip: {
    backgroundColor: '#F4F5F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
  },
  hotspotChipActive: {
    backgroundColor: '#FEE8F0',
    borderWidth: 1,
    borderColor: '#FF5790',
  },
  hotspotChipText: {
    fontFamily: fonts.raleway.medium,
    fontSize: 11,
    color: '#707070',
  },
  hotspotChipTextActive: {
    fontFamily: fonts.raleway.bold,
    color: '#FF5790',
  },
  addressCard: {
    backgroundColor: '#FAFBFC',
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: '#ECEFF2',
    gap: 9,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  addressIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEECEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  addressMeta: {
    flex: 1,
  },
  addressLine: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#181C1F',
    lineHeight: 19,
  },
  cityPincode: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#ECEFF2',
  },
  coordsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordBox: {
    alignItems: 'center',
  },
  coordKey: {
    fontFamily: fonts.raleway.bold,
    fontSize: 9,
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  coordVal: {
    fontFamily: fonts.raleway.semiBold,
    fontSize: 11,
    color: '#181C1F',
    marginTop: 1,
  },
  coordValPrimary: {
    fontFamily: fonts.raleway.bold,
    fontSize: 11,
    color: '#FF5790',
    marginTop: 1,
  },
  confirmBtn: {
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
  confirmBtnText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});
