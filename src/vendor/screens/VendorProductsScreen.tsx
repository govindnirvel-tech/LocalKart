import React, { useState, useCallback, memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Switch,
  Modal,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts } from '@/theme/fonts';
import { PackagePlus } from 'lucide-react-native';
import {
  SearchIcon,
  PlusIcon,
  FilterIcon,
  ChevronRightIcon,
} from '../components/common/Icons';

interface VendorProduct {
  id: string;
  title: string;
  category: string;
  price: number;
  discountPrice?: number;
  stockQty: number;
  isActive: boolean;
  sku: string;
}

const INITIAL_PRODUCTS: VendorProduct[] = [
  {
    id: 'vp-1',
    title: 'Amul Taaza Toned Fresh Milk 1L',
    category: 'Dairy',
    price: 54,
    stockQty: 48,
    isActive: true,
    sku: 'AML-TZ-1L',
  },
  {
    id: 'vp-2',
    title: 'Britannia 100% Whole Wheat Bread 400g',
    category: 'Bakery',
    price: 45,
    discountPrice: 42,
    stockQty: 18,
    isActive: true,
    sku: 'BRT-WW-400',
  },
  {
    id: 'vp-3',
    title: 'Farm Fresh Organic Brown Eggs (Pack of 6)',
    category: 'Dairy',
    price: 70,
    discountPrice: 65,
    stockQty: 4, // low stock
    isActive: true,
    sku: 'EGG-ORG-6P',
  },
  {
    id: 'vp-4',
    title: 'Fortune Sunlite Refined Sunflower Oil 1L',
    category: 'Oils & Ghee',
    price: 165,
    discountPrice: 155,
    stockQty: 22,
    isActive: true,
    sku: 'FRT-SUN-1L',
  },
  {
    id: 'vp-5',
    title: 'Aashirvaad Superior MP Shudh Chakki Atta 5kg',
    category: 'Atta & Flours',
    price: 260,
    discountPrice: 245,
    stockQty: 0, // out of stock
    isActive: false,
    sku: 'ASH-ATT-5K',
  },
  {
    id: 'vp-6',
    title: 'Maggi 2-Minute Instant Masala Noodles 280g',
    category: 'Snacks',
    price: 60,
    discountPrice: 55,
    stockQty: 35,
    isActive: true,
    sku: 'MGG-MAS-280',
  },
];

const CATEGORIES = ['All', 'Dairy', 'Bakery', 'Oils & Ghee', 'Atta & Flours', 'Snacks'];

export function VendorProductsScreen() {
  const [products, setProducts] = useState<VendorProduct[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New product form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Dairy');
  const [newPrice, setNewPrice] = useState('');
  const [newDiscountPrice, setNewDiscountPrice] = useState('');
  const [newStock, setNewStock] = useState('');

  const toggleProductActive = useCallback((id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  }, []);

  const keyExtractor = useCallback((item: VendorProduct) => item.id, []);

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCategory === 'All' ? true : p.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleAddProduct = () => {
    if (!newTitle.trim() || !newPrice.trim()) return;

    const newProd: VendorProduct = {
      id: `vp-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      price: parseFloat(newPrice) || 0,
      discountPrice: newDiscountPrice ? parseFloat(newDiscountPrice) : undefined,
      stockQty: parseInt(newStock, 10) || 10,
      isActive: true,
      sku: `LK-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setProducts([newProd, ...products]);
    setNewTitle('');
    setNewPrice('');
    setNewDiscountPrice('');
    setNewStock('');
    setIsAddModalOpen(false);
  };

  const renderProductItem = useCallback(
    ({ item }: { item: VendorProduct }) => {
      const isLowStock = item.stockQty > 0 && item.stockQty <= 5;
      const isOutOfStock = item.stockQty === 0;

      return (
        <View style={styles.productCard}>
          <View style={styles.productTopRow}>
            {/* Avatar Icon / Box */}
            <View style={styles.productImageBox}>
              <Text style={{ fontSize: 24 }}>📦</Text>
            </View>

            {/* Details */}
            <View style={styles.productDetails}>
              <View style={styles.titleSwitchRow}>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Switch
                  value={item.isActive}
                  onValueChange={() => toggleProductActive(item.id)}
                  trackColor={{ false: '#D1D5DB', true: '#FEE8F0' }}
                  thumbColor={item.isActive ? '#FF5790' : '#9CA3AF'}
                />
              </View>

              <Text style={styles.productSkuCategory}>
                {item.sku} • {item.category}
              </Text>

              {/* Price & Stock badges */}
              <View style={styles.priceStockRow}>
                <View style={styles.priceWrap}>
                  <Text style={styles.productPrice}>
                    ₹{item.discountPrice ?? item.price}
                  </Text>
                  {item.discountPrice && (
                    <Text style={styles.originalPrice}>₹{item.price}</Text>
                  )}
                </View>

                {/* Stock status pill */}
                {isOutOfStock ? (
                  <View style={[styles.stockPill, styles.stockPillOut]}>
                    <Text style={styles.stockTextOut}>Out of Stock</Text>
                  </View>
                ) : isLowStock ? (
                  <View style={[styles.stockPill, styles.stockPillLow]}>
                    <Text style={styles.stockTextLow}>
                      Only {item.stockQty} Left
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.stockPill, styles.stockPillIn]}>
                    <Text style={styles.stockTextIn}>{item.stockQty} in stock</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      );
    },
    [toggleProductActive]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Products Catalog</Text>
          <Text style={styles.headerSubtitle}>
            {products.length} items listed
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addProductBtn}
          activeOpacity={0.85}
          onPress={() => setIsAddModalOpen(true)}
        >
          <PackagePlus size={18} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.addBtnText}>Add Product</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <SearchIcon size={18} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items by name or SKU..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
          <FilterIcon size={18} color="#181C1F" />
        </TouchableOpacity>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.categoriesRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChipsScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={keyExtractor}
        renderItem={renderProductItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>🔍</Text>
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptySub}>
              Try adjusting your search query or category filters.
            </Text>
          </View>
        }
      />

      {/* Add Product Modal */}
      <Modal visible={isAddModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Product</Text>
              <TouchableOpacity
                onPress={() => setIsAddModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Product Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Amul Salted Butter 100g"
                placeholderTextColor="#8E8E93"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.categoryPickerRow}>
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.catPickerChip,
                      newCategory === c && styles.catPickerChipActive,
                    ]}
                    onPress={() => setNewCategory(c)}
                  >
                    <Text
                      style={[
                        styles.catPickerText,
                        newCategory === c && styles.catPickerTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>MRP Price (₹) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 55"
                    keyboardType="numeric"
                    placeholderTextColor="#8E8E93"
                    value={newPrice}
                    onChangeText={setNewPrice}
                  />
                </View>
                <View style={{ width: 14 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>Offer Price (₹)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 50 (Optional)"
                    keyboardType="numeric"
                    placeholderTextColor="#8E8E93"
                    value={newDiscountPrice}
                    onChangeText={setNewDiscountPrice}
                  />
                </View>
              </View>

              <Text style={styles.formLabel}>Opening Stock Quantity *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. 25"
                keyboardType="numeric"
                placeholderTextColor="#8E8E93"
                value={newStock}
                onChangeText={setNewStock}
              />

              <TouchableOpacity
                style={styles.saveProductBtn}
                activeOpacity={0.85}
                onPress={handleAddProduct}
              >
                <Text style={styles.saveBtnText}>Save & Publish Item</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerSubtitle: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#707070',
    marginTop: 2,
  },
  addProductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5790',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
  },
  addBtnText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
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
  categoriesRow: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
    paddingBottom: 10,
  },
  categoryChipsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F6F8',
  },
  categoryChipSelected: {
    backgroundColor: '#FFF0F5',
    borderWidth: 1,
    borderColor: '#FFD6E5',
  },
  categoryChipText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 12.5,
    color: '#707070',
  },
  categoryChipTextSelected: {
    color: '#FF5790',
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  productTopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  productImageBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F7F8FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productDetails: {
    flex: 1,
  },
  titleSwitchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
  },
  productTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 14,
    color: '#181C1F',
    flex: 1,
  },
  productSkuCategory: {
    fontFamily: fonts.nunito.regular,
    fontSize: 11.5,
    color: '#707070',
    marginTop: 3,
  },
  priceStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  productPrice: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    color: '#181C1F',
  },
  originalPrice: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  stockPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockPillIn: {
    backgroundColor: '#E8FBF0',
  },
  stockTextIn: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#17BE5A',
  },
  stockPillLow: {
    backgroundColor: '#FFF8E1',
  },
  stockTextLow: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#FF8F00',
  },
  stockPillOut: {
    backgroundColor: '#FEECEF',
  },
  stockTextOut: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11,
    color: '#FF3B30',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 16,
    color: '#181C1F',
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: fonts.nunito.regular,
    fontSize: 12.5,
    color: '#707070',
    textAlign: 'center',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontFamily: fonts.raleway.bold,
    fontSize: 18,
    color: '#181C1F',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#707070',
  },
  formLabel: {
    fontFamily: fonts.nunito.bold,
    fontSize: 12.5,
    color: '#181C1F',
    marginBottom: 6,
    marginTop: 10,
  },
  formInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1.2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontFamily: fonts.nunito.regular,
    fontSize: 13.5,
    color: '#181C1F',
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  catPickerChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#F5F6F8',
  },
  catPickerChipActive: {
    backgroundColor: '#FFF0F5',
    borderWidth: 1,
    borderColor: '#FFD6E5',
  },
  catPickerText: {
    fontFamily: fonts.nunito.bold,
    fontSize: 11.5,
    color: '#707070',
  },
  catPickerTextActive: {
    color: '#FF5790',
  },
  formRow: {
    flexDirection: 'row',
  },
  saveProductBtn: {
    backgroundColor: '#FF5790',
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  saveBtnText: {
    fontFamily: fonts.raleway.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
});

export default VendorProductsScreen;
