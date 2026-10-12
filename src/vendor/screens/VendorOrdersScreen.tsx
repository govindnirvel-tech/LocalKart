import React, { useState, useCallback, memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MessageSquare } from 'lucide-react-native';
import { fonts } from '@/theme/fonts';
import {
  SearchIcon,
  FilterIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
} from '../components/common/Icons';

type OrderTab = 'all' | 'incoming' | 'preparing' | 'ready' | 'delivered';

interface VendorOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  itemsCount: number;
  totalAmount: number;
  status: 'incoming' | 'preparing' | 'ready' | 'delivered';
  timeAgo: string;
  distance: string;
  items: Array<{ name: string; qty: number; price: number }>;
}

const INITIAL_ORDERS: VendorOrder[] = [
  {
    id: 'ord-101',
    orderNumber: '#LK-8492',
    customerName: 'Rahul Verma',
    itemsCount: 3,
    totalAmount: 340,
    status: 'incoming',
    timeAgo: '2 mins ago',
    distance: '1.2 km away',
    items: [
      { name: 'Amul Taaza Toned Milk 1L', qty: 2, price: 54 },
      { name: 'Britannia Brown Bread 400g', qty: 1, price: 45 },
      { name: 'Farm Fresh Brown Eggs (Pack of 6)', qty: 1, price: 65 },
    ],
  },
  {
    id: 'ord-102',
    orderNumber: '#LK-8490',
    customerName: 'Pooja Tiwari',
    itemsCount: 2,
    totalAmount: 520,
    status: 'preparing',
    timeAgo: '8 mins ago',
    distance: '2.4 km away',
    items: [
      { name: 'Fortune Sunlite Sunflower Oil 1L', qty: 1, price: 155 },
      { name: 'Aashirvaad Shudh Chakki Atta 5kg', qty: 1, price: 245 },
    ],
  },
  {
    id: 'ord-103',
    orderNumber: '#LK-8488',
    customerName: 'Vikas Dubey',
    itemsCount: 4,
    totalAmount: 185,
    status: 'ready',
    timeAgo: '15 mins ago',
    distance: '0.8 km away',
    items: [
      { name: 'Maggi 2-Minute Noodles 280g', qty: 2, price: 55 },
      { name: 'Lay\'s India\'s Magic Masala 50g', qty: 2, price: 20 },
    ],
  },
  {
    id: 'ord-104',
    orderNumber: '#LK-8481',
    customerName: 'Ananya Deshmukh',
    itemsCount: 1,
    totalAmount: 890,
    status: 'delivered',
    timeAgo: '45 mins ago',
    distance: '1.8 km away',
    items: [
      { name: 'Dettol Antiseptic Liquid 1L', qty: 1, price: 340 },
      { name: 'Surf Excel Matic Liquid 2L', qty: 1, price: 450 },
    ],
  },
];

export function VendorOrdersScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<OrderTab>('incoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<VendorOrder[]>(INITIAL_ORDERS);

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === 'all' ? true : o.status === activeTab;
    const matchesQuery =
      searchQuery.trim() === '' ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

  const handleUpdateStatus = useCallback(
    (orderId: string, nextStatus: 'preparing' | 'ready' | 'delivered') => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
    },
    []
  );

  const keyExtractor = useCallback((item: VendorOrder) => item.id, []);

  const handleStartChat = useCallback(
    (order: VendorOrder) => {
      navigation.navigate('ChatRoom', {
        title: order.customerName,
        targetUserId: order.id,
      });
    },
    [navigation]
  );

  const renderStatusBadge = (status: VendorOrder['status']) => {
    switch (status) {
      case 'incoming':
        return (
          <View style={[styles.badge, styles.badgeIncoming]}>
            <Text style={styles.badgeTextIncoming}>NEW ORDER</Text>
          </View>
        );
      case 'preparing':
        return (
          <View style={[styles.badge, styles.badgePreparing]}>
            <Text style={styles.badgeTextPreparing}>PREPARING</Text>
          </View>
        );
      case 'ready':
        return (
          <View style={[styles.badge, styles.badgeReady]}>
            <Text style={styles.badgeTextReady}>READY FOR PICKUP</Text>
          </View>
        );
      case 'delivered':
        return (
          <View style={[styles.badge, styles.badgeDelivered]}>
            <Text style={styles.badgeTextDelivered}>DELIVERED</Text>
          </View>
        );
    }
  };

  const renderOrderItem = useCallback(
    ({ item }: { item: VendorOrder }) => (
      <View style={styles.orderCard}>
        {/* Top Card Info */}
        <View style={styles.orderCardHeader}>
          <View>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.customerName}>{item.customerName}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {renderStatusBadge(item.status)}
            <TouchableOpacity
              style={styles.orderChatBtn}
              onPress={() => handleStartChat(item)}
              accessibilityLabel="Chat with Customer"
            >
              <MessageSquare size={16} color="#004BFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Meta Row */}
        <View style={styles.orderMetaRow}>
          <View style={styles.orderMetaItem}>
            <ClockIcon size={14} color="#707070" />
            <Text style={styles.orderMetaText}>{item.timeAgo}</Text>
          </View>
          <Text style={styles.metaDot}>•</Text>
          <View style={styles.orderMetaItem}>
            <TruckIcon size={14} color="#707070" />
            <Text style={styles.orderMetaText}>{item.distance}</Text>
          </View>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.orderAmountText}>₹{item.totalAmount}</Text>
        </View>

        {/* Item List */}
        <View style={styles.itemsWrapper}>
          {item.items.map((it, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemQty}>{it.qty}x</Text>
              <Text style={styles.itemName} numberOfLines={1}>
                {it.name}
              </Text>
              <Text style={styles.itemPrice}>₹{it.price * it.qty}</Text>
            </View>
          ))}
        </View>

        {/* Order Actions */}
        <View style={styles.cardActionRow}>
          {item.status === 'incoming' && (
            <>
              <TouchableOpacity
                style={styles.actionButtonSecondary}
                activeOpacity={0.8}
              >
                <Text style={styles.actionBtnTextSecondary}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButtonPrimary}
                activeOpacity={0.8}
                onPress={() => handleUpdateStatus(item.id, 'preparing')}
              >
                <Text style={styles.actionBtnTextPrimary}>Accept & Prepare</Text>
              </TouchableOpacity>
            </>
          )}

          {item.status === 'preparing' && (
            <TouchableOpacity
              style={styles.actionButtonPrimary}
              activeOpacity={0.8}
              onPress={() => handleUpdateStatus(item.id, 'ready')}
            >
              <Text style={styles.actionBtnTextPrimary}>Mark Ready for Rider</Text>
            </TouchableOpacity>
          )}

          {item.status === 'ready' && (
            <TouchableOpacity
              style={[styles.actionButtonPrimary, { backgroundColor: '#17BE5A' }]}
              activeOpacity={0.8}
              onPress={() => handleUpdateStatus(item.id, 'delivered')}
            >
              <CheckCircleIcon size={16} color="#FFFFFF" />
              <Text style={styles.actionBtnTextPrimary}>Handed to Rider</Text>
            </TouchableOpacity>
          )}

          {item.status === 'delivered' && (
            <View style={styles.deliveredSummary}>
              <CheckCircleIcon size={16} color="#17BE5A" />
              <Text style={styles.deliveredText}>Delivered successfully</Text>
            </View>
          )}
        </View>
      </View>
    ),
    [handleStartChat, handleUpdateStatus]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Store Orders</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>AUTO-RECEIVE ON</Text>
          </View>
          <TouchableOpacity
            style={styles.headerChatBtn}
            onPress={() => navigation.navigate('ChatList')}
            accessibilityLabel="Customer Messages"
          >
            <MessageSquare size={18} color="#FF5790" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <SearchIcon size={18} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search order ID or customer name..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
          <FilterIcon size={18} color="#181C1F" />
        </TouchableOpacity>
      </View>

      {/* Tabs Row */}
      <View style={styles.tabBar}>
        {(
          [
            { key: 'incoming', label: 'Incoming' },
            { key: 'preparing', label: 'Preparing' },
            { key: 'ready', label: 'Ready' },
            { key: 'delivered', label: 'Delivered' },
            { key: 'all', label: 'All' },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.key;
          const count = orders.filter((o) =>
            tab.key === 'all' ? true : o.status === tab.key
          ).length;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              activeOpacity={0.8}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[styles.tabText, isActive && styles.tabTextActive]}
              >
                {tab.label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.tabBadge,
                    isActive && styles.tabBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      isActive && styles.tabBadgeTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Order List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={keyExtractor}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📦</Text>
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptySub}>
              {activeTab === 'incoming'
                ? 'No incoming orders right now. When customers place an order, it will appear here.'
                : `There are currently no orders in "${activeTab}" status.`}
            </Text>
          </View>
        }
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  headerTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 20,
    color: '#181C1F',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8FBF0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#17BE5A',
  },
  liveText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 10,
    color: '#17BE5A',
    letterSpacing: 0.5,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    color: '#181C1F',
    padding: 0,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F5F6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
    gap: 6,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F5F6F8',
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: '#FFF0F5',
    borderWidth: 1,
    borderColor: '#FFD6E5',
  },
  tabText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 12.5,
    color: '#707070',
  },
  tabTextActive: {
    color: '#FF5790',
  },
  tabBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  tabBadgeActive: {
    backgroundColor: '#FF5790',
  },
  tabBadgeText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 10,
    color: '#707070',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 20,
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderChatBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EBF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerChatBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF0F5',
    borderWidth: 1,
    borderColor: '#FFD6E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderNumber: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#181C1F',
    includeFontPadding: false,
  },
  customerName: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12.5,
    color: '#707070',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeIncoming: {
    backgroundColor: '#FFF0F5',
  },
  badgeTextIncoming: {
    fontFamily: fonts.nunito.bold,
    fontSize: 10,
    color: '#FF5790',
    includeFontPadding: false,
  },
  badgePreparing: {
    backgroundColor: '#FFF8E1',
  },
  badgeTextPreparing: {
    fontFamily: fonts.nunito.bold,
    fontSize: 10,
    color: '#FF8F00',
    includeFontPadding: false,
  },
  badgeReady: {
    backgroundColor: '#EEF3FF',
  },
  badgeTextReady: {
    fontFamily: fonts.nunito.bold,
    fontSize: 10,
    color: '#004BFF',
    includeFontPadding: false,
  },
  badgeDelivered: {
    backgroundColor: '#E8FBF0',
  },
  badgeTextDelivered: {
    fontFamily: fonts.nunito.bold,
    fontSize: 10,
    color: '#17BE5A',
    includeFontPadding: false,
  },
  orderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F6F8',
    marginBottom: 12,
  },
  orderMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderMetaText: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11.5,
    color: '#707070',
  },
  metaDot: {
    color: '#D1D5DB',
  },
  orderAmountText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#181C1F',
    marginLeft: 'auto',
    includeFontPadding: false,
  },
  itemsWrapper: {
    gap: 6,
    marginBottom: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQty: {
    fontFamily: fonts.nunito.bold,
    fontSize: 12,
    color: '#FF5790',
    width: 24,
    includeFontPadding: false,
  },
  itemName: {
    flex: 1,
    fontFamily: fonts.nunito.regular,
    fontSize: 12.5,
    color: '#26292E',
  },
  itemPrice: {
    fontFamily: fonts.nunito.semiBold,
    fontSize: 12,
    color: '#707070',
  },
  cardActionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 8,
  },
  actionButtonPrimary: {
    flex: 1,
    height: 42,
    backgroundColor: '#FF5790',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnTextPrimary: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  actionButtonSecondary: {
    width: 90,
    height: 42,
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnTextSecondary: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13,
    color: '#707070',
  },
  deliveredSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  deliveredText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13,
    color: '#17BE5A',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 17,
    color: '#181C1F',
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: fonts.nunito.regular,
    fontSize: 13,
    color: '#707070',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default VendorOrdersScreen;
