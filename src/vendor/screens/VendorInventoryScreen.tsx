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
import { fonts } from '@/theme/fonts';
import { ChartNoAxesCombined } from 'lucide-react-native';
import { SearchIcon } from '../components/common/Icons';

interface InventoryItem {
  id: string;
  title: string;
  sku: string;
  stockQty: number;
  lowStockThreshold: number;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    title: 'Amul Taaza Toned Fresh Milk 1L',
    sku: 'AML-TZ-1L',
    stockQty: 48,
    lowStockThreshold: 10,
  },
  {
    id: 'inv-2',
    title: 'Britannia 100% Whole Wheat Bread 400g',
    sku: 'BRT-WW-400',
    stockQty: 18,
    lowStockThreshold: 5,
  },
  {
    id: 'inv-3',
    title: 'Farm Fresh Organic Brown Eggs (Pack of 6)',
    sku: 'EGG-ORG-6P',
    stockQty: 4,
    lowStockThreshold: 10,
  },
  {
    id: 'inv-4',
    title: 'Fortune Sunlite Refined Sunflower Oil 1L',
    sku: 'FRT-SUN-1L',
    stockQty: 22,
    lowStockThreshold: 6,
  },
  {
    id: 'inv-5',
    title: 'Aashirvaad Superior MP Shudh Chakki Atta 5kg',
    sku: 'ASH-ATT-5K',
    stockQty: 0,
    lowStockThreshold: 5,
  },
  {
    id: 'inv-6',
    title: 'Maggi 2-Minute Instant Masala Noodles 280g',
    sku: 'MGG-MAS-280',
    stockQty: 35,
    lowStockThreshold: 12,
  },
];

const InventoryCard = memo<{
  item: InventoryItem;
  onUpdateStock: (id: string, delta: number) => void;
}>(({ item, onUpdateStock }) => {
  const isOut = item.stockQty === 0;
  const isLow = item.stockQty > 0 && item.stockQty <= item.lowStockThreshold;

  const handleDecrease = useCallback(() => {
    onUpdateStock(item.id, -1);
  }, [item.id, onUpdateStock]);

  const handleIncrease = useCallback(() => {
    onUpdateStock(item.id, 1);
  }, [item.id, onUpdateStock]);

  return (
    <View style={styles.invCard}>
      <View style={styles.invLeft}>
        <Text style={styles.invTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.invSku}>SKU: {item.sku}</Text>
        {isOut ? (
          <Text style={styles.statusOut}>Out of stock</Text>
        ) : isLow ? (
          <Text style={styles.statusLow}>Low stock alert</Text>
        ) : (
          <Text style={styles.statusIn}>In healthy stock</Text>
        )}
      </View>

      {/* Quick Stepper */}
      <View style={styles.stepperWrap}>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={handleDecrease}
          activeOpacity={0.7}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stockQtyText}>{item.stockQty}</Text>
        <TouchableOpacity
          style={styles.stepBtn}
          onPress={handleIncrease}
          activeOpacity={0.7}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export function VendorInventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [query, setQuery] = useState('');

  const updateStock = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, stockQty: Math.max(0, it.stockQty + delta) } : it
      )
    );
  }, []);

  const keyExtractor = useCallback((item: InventoryItem) => item.id, []);

  const renderInventoryItem = useCallback(
    ({ item }: { item: InventoryItem }) => (
      <InventoryCard item={item} onUpdateStock={updateStock} />
    ),
    [updateStock]
  );

  const filtered = items.filter(
    (i) =>
      query.trim() === '' ||
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      i.sku.toLowerCase().includes(query.toLowerCase())
  );

  const lowStockCount = items.filter(
    (i) => i.stockQty > 0 && i.stockQty <= i.lowStockThreshold
  ).length;
  const outOfStockCount = items.filter((i) => i.stockQty === 0).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
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
            <ChartNoAxesCombined size={20} color="#FF5790" strokeWidth={1.8} />
          </View>
          <Text style={styles.headerTitle}>Real-time Inventory</Text>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total SKUs</Text>
          <Text style={styles.summaryVal}>{items.length}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#FFF8E1', borderColor: '#FFE082' }]}>
          <Text style={styles.summaryLabel}>Low Stock</Text>
          <Text style={[styles.summaryVal, { color: '#FF8F00' }]}>{lowStockCount}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#FEECEF', borderColor: '#FFD6E5' }]}>
          <Text style={styles.summaryLabel}>Out of Stock</Text>
          <Text style={[styles.summaryVal, { color: '#FF3B30' }]}>{outOfStockCount}</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <SearchIcon size={18} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search SKU or item name..."
            placeholderTextColor="#8E8E93"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      {/* Inventory List */}
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderInventoryItem}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={7}
        initialNumToRender={10}
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
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 12,
  },
  summaryLabel: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11.5,
    color: '#707070',
    marginBottom: 4,
  },
  summaryVal: {
    fontFamily: fonts.raleway.bold,
    fontSize: 20,
    color: '#181C1F',
  },
  searchRow: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
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
  listContent: {
    padding: 20,
    gap: 12,
  },
  invCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
  },
  invLeft: {
    flex: 1,
    marginRight: 12,
  },
  invTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#181C1F',
  },
  invSku: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11.5,
    color: '#707070',
    marginTop: 2,
  },
  statusIn: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#17BE5A',
    marginTop: 4,
  },
  statusLow: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#FF8F00',
    marginTop: 4,
  },
  statusOut: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#FF3B30',
    marginTop: 4,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 4,
  },
  stepBtn: {
    width: 32,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 18,
    color: '#181C1F',
  },
  stockQtyText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#181C1F',
    minWidth: 32,
    textAlign: 'center',
  },
});

export default VendorInventoryScreen;
