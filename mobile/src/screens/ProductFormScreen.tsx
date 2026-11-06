import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../../App';

type ProductFormRouteProp = RouteProp<RootStackParamList, 'ProductForm'>;

const ProductFormScreen = () => {
  const route = useRoute<ProductFormRouteProp>();
  const navigation = useNavigation();
  const { productId } = route.params;
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    inventory: '',
    sku: '',
    brand: '',
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiRequest('/api/categories'),
  });

  // Fetch existing product if editing
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => apiRequest(`/api/products/${productId}`),
    enabled: !!productId,
    onSuccess: (data) => {
      if (data) {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          price: data.price?.toString() || '',
          categoryId: data.categoryId || '',
          imageUrl: data.images?.[0] || '',
          inventory: data.stock?.toString() || '',
          sku: data.sku || '',
          brand: data.brand || '',
        });
      }
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = productId ? `/api/products/${productId}` : '/api/products';
      const method = productId ? 'PATCH' : 'POST';
      
      return apiRequest(endpoint, {
        method,
        body: JSON.stringify({
          ...data,
          price: parseFloat(data.price),
          inventory: parseInt(data.inventory) || 0,
        }),
      });
    },
    onSuccess: () => {
      Alert.alert(
        'Success',
        productId ? 'Product updated successfully!' : 'Product created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              queryClient.invalidateQueries({ queryKey: ['seller-products'] });
              navigation.goBack();
            },
          },
        ]
      );
    },
    onError: (error: any) => {
      Alert.alert('Error', 'Failed to save product. Please try again.');
    },
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.description || !formData.price || !formData.categoryId) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    createProductMutation.mutate(formData);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>Please sign in to manage products</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (productLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9900" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          <Text style={styles.title}>
            {productId ? 'Edit Product' : 'Add New Product'}
          </Text>

          {/* Product Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Enter product name"
            />
          </View>

          {/* Description */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => updateField('description', value)}
              placeholder="Describe your product..."
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Price */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Price ($) *</Text>
            <TextInput
              style={styles.input}
              value={formData.price}
              onChangeText={(value) => updateField('price', value)}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>

          {/* Category */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerText}>
                {categories?.find((c: any) => c.id === formData.categoryId)?.name || 'Select category'}
              </Text>
            </View>
          </View>

          {/* Image URL */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Image URL</Text>
            <TextInput
              style={styles.input}
              value={formData.imageUrl}
              onChangeText={(value) => updateField('imageUrl', value)}
              placeholder="https://example.com/image.jpg"
              keyboardType="url"
            />
          </View>

          {/* Inventory */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Inventory Count</Text>
            <TextInput
              style={styles.input}
              value={formData.inventory}
              onChangeText={(value) => updateField('inventory', value)}
              placeholder="0"
              keyboardType="number-pad"
            />
          </View>

          {/* SKU */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>SKU</Text>
            <TextInput
              style={styles.input}
              value={formData.sku}
              onChangeText={(value) => updateField('sku', value)}
              placeholder="Enter SKU"
            />
          </View>

          {/* Brand */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Brand</Text>
            <TextInput
              style={styles.input}
              value={formData.brand}
              onChangeText={(value) => updateField('brand', value)}
              placeholder="Enter brand name"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, createProductMutation.isPending && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={createProductMutation.isPending}
          >
            {createProductMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {productId ? 'Update Product' : 'Create Product'}
              </Text>
            )}
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#232F3E',
    marginBottom: 24,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#232F3E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#FF9900',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default ProductFormScreen;