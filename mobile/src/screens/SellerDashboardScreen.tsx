import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../../App';

type SellerDashboardNavigationProp = StackNavigationProp<RootStackParamList>;

const SellerDashboardScreen = () => {
  const navigation = useNavigation<SellerDashboardNavigationProp>();
  const { user, isAuthenticated } = useAuth();

  const { data: products, isLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: () => apiRequest('/api/seller/products'),
    enabled: isAuthenticated && user?.role === 'seller',
  });

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed-outline" size={64} color="#ccc" />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>Please sign in to access seller tools</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (user?.role !== 'seller' && user?.role !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Ionicons name="storefront-outline" size={64} color="#ccc" />
          <Text style={styles.accessDeniedTitle}>Become a Seller</Text>
          <Text style={styles.accessDeniedText}>
            Contact support to upgrade your account to a seller account
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back, {user?.firstName || 'Seller'}!</Text>
          <Text style={styles.subtitle}>Manage your products and sales</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="bag-outline" size={24} color="#FF9900" />
            <Text style={styles.statNumber}>{products?.length || 0}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-up-outline" size={24} color="#007600" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={24} color="#B12704" />
            <Text style={styles.statNumber}>$0</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('ProductForm', {})}
          >
            <Ionicons name="add-circle-outline" size={24} color="#FF9900" />
            <Text style={styles.actionButtonText}>Add New Product</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="list-outline" size={24} color="#666" />
            <Text style={styles.actionButtonText}>Manage Products</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="receipt-outline" size={24} color="#666" />
            <Text style={styles.actionButtonText}>View Orders</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="analytics-outline" size={24} color="#666" />
            <Text style={styles.actionButtonText}>Sales Analytics</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Recent Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Products</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FF9900" />
            </View>
          ) : products?.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bag-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No products yet</Text>
              <Text style={styles.emptyStateText}>Start by adding your first product</Text>
              <TouchableOpacity 
                style={styles.addProductButton}
                onPress={() => navigation.navigate('ProductForm', {})}
              >
                <Text style={styles.addProductButtonText}>Add Product</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.productsList}>
              {products?.slice(0, 3).map((product: any) => (
                <View key={product.id} style={styles.productItem}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>${product.price}</Text>
                  <Text style={styles.productStock}>
                    {product.stock || 0} in stock
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Getting Started Guide */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Getting Started</Text>
          
          <View style={styles.guideStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Add your first product</Text>
              <Text style={styles.stepDescription}>
                Create detailed product listings with high-quality images
              </Text>
            </View>
          </View>

          <View style={styles.guideStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Set up shipping</Text>
              <Text style={styles.stepDescription}>
                Configure shipping options and fulfillment preferences
              </Text>
            </View>
          </View>

          <View style={styles.guideStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Start selling</Text>
              <Text style={styles.stepDescription}>
                Monitor orders and grow your business
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#232F3E',
    padding: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#232F3E',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#232F3E',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#232F3E',
    marginLeft: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyState: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  addProductButton: {
    backgroundColor: '#FF9900',
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  addProductButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  productsList: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 8,
  },
  productItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#232F3E',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B12704',
    marginBottom: 2,
  },
  productStock: {
    fontSize: 14,
    color: '#666',
  },
  guideStep: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF9900',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#232F3E',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default SellerDashboardScreen;