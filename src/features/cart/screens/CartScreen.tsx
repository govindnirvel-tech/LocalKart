import React, { useCallback, memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '@/navigation/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateQuantity, removeFromCart, clearCart, CartItem } from '@/store/slices/cartSlice';
import AppImage from '@/components/AppImage';
import { fonts } from '@/theme/fonts';

// Icons
const TrashIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
      stroke="#FF3B30"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EmptyCartIcon = () => (
  <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"
      stroke="#CBD5E1"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 21a1 1 0 100-2 1 1 0 000 2zM20 21a1 1 0 100-2 1 1 0 000 2z"
      fill="#CBD5E1"
    />
  </Svg>
);

const BoltIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="#FFFFFF">
    <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </Svg>
);

const CartItemCard = memo<{
  item: CartItem;
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
}>(({ item, onRemove, onUpdateQty }) => {
  const effectivePrice =
    item.discountPrice != null && item.discountPrice < item.price
      ? item.discountPrice
      : item.price;

  const handleDelete = useCallback(() => {
    onRemove(item.id);
  }, [item.id, onRemove]);

  const handleDecrement = useCallback(() => {
    onUpdateQty(item.id, -1);
  }, [item.id, onUpdateQty]);

  const handleIncrement = useCallback(() => {
    onUpdateQty(item.id, 1);
  }, [item.id, onUpdateQty]);

  return (
    <View style={styles.card}>
      {/* Product Image */}
      <View style={styles.imageWrap}>
        <AppImage
          source={item.image ? { uri: item.image } : require('@/assets/png/onboarding_girl_1.png')}
          style={styles.productImage}
          borderRadius={12}
          resizeMode="cover"
        />
      </View>

      {/* Info */}
      <View style={styles.infoCol}>
        <View style={styles.titleRow}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <TouchableOpacity
            style={styles.deleteBtn}
            activeOpacity={0.7}
            onPress={handleDelete}
          >
            <TrashIcon />
          </TouchableOpacity>
        </View>

        {/* Variant Meta */}
        <Text style={styles.variantText}>
          {item.size ? `Size: ${item.size}` : ''}
          {item.size && item.color ? ' • ' : ''}
          {item.color ? item.color : ''}
        </Text>

        {/* Price & Quantity Stepper */}
        <View style={styles.bottomRow}>
          <Text style={styles.itemPrice}>${(effectivePrice * item.quantity).toFixed(2)}</Text>

          <View style={styles.stepperWrap}>
            <TouchableOpacity
              style={styles.stepBtn}
              activeOpacity={0.7}
              onPress={handleDecrement}
            >
              <Text style={styles.stepText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.stepQty}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.stepBtn}
              activeOpacity={0.7}
              onPress={handleIncrement}
            >
              <Text style={styles.stepText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
});

export default function CartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { items, totalQuantity, totalAmount } = useAppSelector((state) => state.cart);

  const handleCheckout = () => {
    Alert.alert(
      'Proceed to Buy ⚡',
      `Place order for ${totalQuantity} items totalling $${totalAmount.toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Order',
          onPress: () => {
            dispatch(clearCart());
            Alert.alert('Order Placed! 🎉', 'Your local seller has received your order!');
          },
        },
      ]
    );
  };

  const handleRemove = useCallback((id: string) => {
    dispatch(removeFromCart(id));
  }, [dispatch]);

  const handleUpdateQty = useCallback((id: string, delta: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (item.quantity + delta <= 0) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateQuantity({ id, quantity: item.quantity + delta }));
    }
  }, [dispatch, items]);

  const keyExtractor = useCallback((item: CartItem) => item.id, []);

  const renderCartItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <CartItemCard
        item={item}
        onRemove={handleRemove}
        onUpdateQty={handleUpdateQty}
      />
    ),
    [handleRemove, handleUpdateQty]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        <Text style={styles.headerSubtitle}>
          {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {/* Cart Content */}
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyCartIcon />
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySub}>Looks like you haven't added anything to your cart yet.</Text>
          <TouchableOpacity
            style={styles.shopNowBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
          >
            <Text style={styles.shopNowText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contentWrap}>
          <FlatList
            data={items}
            keyExtractor={keyExtractor}
            renderItem={renderCartItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={Platform.OS === 'android'}
            maxToRenderPerBatch={10}
            windowSize={7}
            initialNumToRender={12}
            updateCellsBatchingPeriod={50}
          />

          {/* Bill Summary & Buy Now Bar */}
          <View style={styles.checkoutFooter}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${totalAmount.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Local Fast Delivery (15-30m)</Text>
              <Text style={styles.freeDelivery}>FREE</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalPrice}>${totalAmount.toFixed(2)}</Text>
              </View>

              {/* BUY NOW Button in Cart */}
              <TouchableOpacity
                style={styles.buyNowBtn}
                activeOpacity={0.88}
                onPress={handleCheckout}
              >
                <BoltIcon />
                <Text style={styles.buyNowText}>Buy Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  headerTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 22,
    color: '#181C1F',
  },
  headerSubtitle: {
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    color: '#8E95A5',
  },
  contentWrap: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  imageWrap: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F8',
    overflow: 'hidden',
    marginRight: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#181C1F',
    flex: 1,
    marginRight: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  variantText: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#8E95A5',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    color: '#004CFF',
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F8',
    borderRadius: 10,
    padding: 2,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#181C1F',
    lineHeight: 16,
  },
  stepQty: {
    fontFamily: fonts.raleway.bold,
    fontSize: 13,
    color: '#181C1F',
    paddingHorizontal: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 18,
    color: '#181C1F',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    color: '#8E95A5',
    textAlign: 'center',
    marginBottom: 20,
  },
  shopNowBtn: {
    backgroundColor: '#004CFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shopNowText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  checkoutFooter: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    color: '#6B7280',
  },
  summaryValue: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 13,
    color: '#181C1F',
  },
  freeDelivery: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13,
    color: '#00A854',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEF0F5',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11,
    color: '#8E95A5',
  },
  totalPrice: {
    fontFamily: fonts.raleway.bold,
    fontSize: 22,
    color: '#181C1F',
  },
  buyNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#004CFF',
    paddingHorizontal: 26,
    height: 48,
    borderRadius: 14,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#004CFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buyNowText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});