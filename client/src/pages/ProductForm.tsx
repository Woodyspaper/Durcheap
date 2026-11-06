import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Crown, Package } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Papa from 'papaparse';
import { Link } from 'wouter';
import { Layout } from '@/components/Layout';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  categoryId: string;
  inventory: number;
  imageUrl: string;
  images: string[];
  videoUrl: string;
  brand: string;
  condition: string;
  conditionDescription: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  isLocal: boolean;
  specifications: Record<string, any>;
  isSubscription: boolean;
  subscriptionFrequency: string;
  trialPeriodDays: number;
}

interface ImportedProduct extends ProductFormData {
  rowIndex: number;
  isValid: boolean;
  errors: string[];
}

// Add interfaces for query responses
interface ListingLimits {
  plan: string;
  currentListings: number;
  maxListings: number;
  canAddMore: boolean;
  remainingListings: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  categoryId: string;
  stock: number;
  images: string[];
  videoUrl?: string;
  brand?: string;
  condition: string;
  conditionDescription?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  isLocal: boolean;
  specifications: Record<string, any>;
  isSubscription: boolean;
  subscriptionFrequency?: string;
  trialPeriodDays?: number;
}

interface ProductFormProps {
  productId?: string;
  mode?: 'edit' | 'create';
}

export default function ProductForm({ productId, mode = 'create' }: ProductFormProps = {}) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get auth loading state from useAuth hook
  const { isLoading: isAuthLoading } = useAuth();
  
  // Subscription plan features with proper loading guard
  // Don't determine plan until user is fully loaded to prevent flicker
  const isUserLoaded = !isAuthLoading && user !== null;
  const userPlan = isUserLoaded ? user.subscriptionPlan || 'basic' : null;
  const isBasicPlan = userPlan === 'basic';
  const isProPlan = userPlan === 'pro';
  const isEnterprisePlan = userPlan === 'enterprise';
  const isPremiumPlan = isProPlan || isEnterprisePlan;
  
  // Show loading state while auth is loading
  const isLoadingUserPlan = isAuthLoading || userPlan === null;
  
  // Helper function to strip disallowed fields based on subscription plan
  const stripDisallowedFields = (data: ProductFormData): ProductFormData => {
    // Don't filter if user plan is not loaded yet
    if (!isUserLoaded) {
      return data;
    }
    
    const filteredData = { ...data };
    
    if (isBasicPlan) {
      // Remove premium features for basic users
      if (filteredData.originalPrice && filteredData.originalPrice > 0) {
        filteredData.originalPrice = 0; // Reset to 0 instead of keeping premium value
      }
      if (filteredData.videoUrl) {
        filteredData.videoUrl = ''; // Clear video URL
      }
      if (filteredData.images && filteredData.images.length > 1) {
        filteredData.images = filteredData.images.slice(0, 1); // Keep only first image
      }
      if (filteredData.specifications && Object.keys(filteredData.specifications).length > 0) {
        filteredData.specifications = {}; // Clear specifications
      }
      if (filteredData.isSubscription) {
        filteredData.isSubscription = false;
        filteredData.subscriptionFrequency = 'monthly';
        filteredData.trialPeriodDays = 0;
      }
    } else if (isProPlan) {
      // Remove enterprise-only features for pro users
      if (filteredData.isSubscription) {
        filteredData.isSubscription = false;
        filteredData.subscriptionFrequency = 'monthly';
        filteredData.trialPeriodDays = 0;
      }
    }
    
    return filteredData;
  };

  // Determine if we're in edit mode
  const isEditMode = mode === 'edit' && !!productId;

  // Fetch existing product data if editing
  const { data: existingProduct, isLoading: productLoading } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    enabled: isEditMode,
  });

  // Fetch listing limits
  const { data: listingLimits, isLoading: limitsLoading } = useQuery<ListingLimits>({
    queryKey: ['/api/seller/listing-limits'],
    enabled: !!user,
  });

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    inventory: 0,
    imageUrl: '',
    images: ['', '', '', '', ''],
    originalPrice: 0,
    specifications: {},
    isSubscription: false,
    subscriptionFrequency: 'monthly',
    trialPeriodDays: 0,
    videoUrl: '',
    brand: '',
    condition: 'new',
    conditionDescription: '',
    country: '',
    state: '',
    city: '',
    zipCode: '',
    isLocal: false,
  });

  const [importedProducts, setImportedProducts] = useState<ImportedProduct[]>([]);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<boolean[]>([false, false, false, false, false]);
  const [showFileUpload, setShowFileUpload] = useState(true);

  // Populate form data when editing
  useEffect(() => {
    if (isEditMode && existingProduct) {
      setFormData({
        name: existingProduct.name || '',
        description: existingProduct.description || '',
        price: parseFloat(existingProduct.price) || 0,
        originalPrice: parseFloat(existingProduct.originalPrice || '0') || 0,
        categoryId: existingProduct.categoryId || '',
        inventory: existingProduct.stock || 0,
        imageUrl: existingProduct.images?.[0] || '',
        images: [...(existingProduct.images || []), '', '', '', ''].slice(0, 5),
        videoUrl: existingProduct.videoUrl || '',
        brand: existingProduct.brand || '',
        condition: existingProduct.condition || 'new',
        conditionDescription: existingProduct.conditionDescription || '',
        country: existingProduct.country || '',
        state: existingProduct.state || '',
        city: existingProduct.city || '',
        zipCode: existingProduct.zipCode || '',
        isLocal: existingProduct.isLocal || false,
        specifications: existingProduct.specifications || {},
        isSubscription: existingProduct.isSubscription || false,
        subscriptionFrequency: existingProduct.subscriptionFrequency || 'monthly',
        trialPeriodDays: existingProduct.trialPeriodDays || 0,
      });
    }
  }, [isEditMode, existingProduct]);

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Strip disallowed fields based on subscription plan
      const filteredData = stripDisallowedFields(data);
      
      // Process form data to match backend expectations
      const processedData = {
        ...filteredData,
        price: filteredData.price.toString(), // Convert number to string for decimal field
        originalPrice: filteredData.originalPrice ? filteredData.originalPrice.toString() : undefined,
        stock: filteredData.inventory,
        images: filteredData.images.filter(url => url.trim() !== ''),
      };
      return await apiRequest('POST', '/api/products', processedData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seller/listing-limits'] });
      setLocation('/manage-products');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Strip disallowed fields based on subscription plan
      const filteredData = stripDisallowedFields(data);
      
      // Process form data to match backend expectations
      const processedData = {
        ...filteredData,
        price: filteredData.price.toString(), // Convert number to string for decimal field
        originalPrice: filteredData.originalPrice ? filteredData.originalPrice.toString() : undefined,
        stock: filteredData.inventory,
        images: filteredData.images.filter(url => url.trim() !== ''),
      };
      return await apiRequest('PATCH', `/api/products/${productId!}`, processedData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seller/products'] });
      setLocation('/manage-products');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (products: ProductFormData[]) => {
      // Process products for backend compatibility with subscription plan filtering
      const processedProducts = products.map(product => {
        const filteredProduct = stripDisallowedFields(product);
        return {
          ...filteredProduct,
          price: filteredProduct.price.toString(), // Convert number to string for decimal field
          originalPrice: filteredProduct.originalPrice ? filteredProduct.originalPrice.toString() : undefined,
          stock: filteredProduct.inventory,
          images: filteredProduct.images.filter(url => url.trim() !== ''),
        };
      });
      const response = await apiRequest('POST', '/api/products/bulk', { products: processedProducts });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `${data.created || 0} products imported successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seller/listing-limits'] });
      setImportedProducts([]);
      setShowImportPreview(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to import products",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      toast({
        title: "Access Denied",
        description: "You must be a seller to create products",
        variant: "destructive",
      });
      return;
    }
    
    if (isEditMode) {
      updateProductMutation.mutate(formData);
    } else {
      createProductMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => {
      // Special handling for primary image URL to keep it in sync with images array
      if (field === 'imageUrl') {
        const newImages = [...prev.images];
        newImages[0] = value;
        return { ...prev, [field]: value, images: newImages };
      }
      return { ...prev, [field]: value };
    });
  };

  const validateProduct = (product: any, rowIndex: number): ImportedProduct => {
    const errors: string[] = [];
    
    if (!product.name || product.name.trim() === '') {
      errors.push('Product name is required');
    }
    
    if (!product.price || isNaN(parseFloat(product.price)) || parseFloat(product.price) <= 0) {
      errors.push('Valid price is required');
    }
    
    if (!product.categoryId || product.categoryId.trim() === '') {
      errors.push('Category is required');
    }
    
    if (!product.inventory || isNaN(parseInt(product.inventory)) || parseInt(product.inventory) < 0) {
      errors.push('Valid inventory count is required');
    }

    const validConditions = ['new', 'used', 'refurbished'];
    if (product.condition && !validConditions.includes(product.condition.toLowerCase())) {
      errors.push('Condition must be: new, used, or refurbished');
    }

    // Parse multiple image URLs from CSV columns
    const images = [
      product.imageUrl1 || '',
      product.imageUrl2 || '',
      product.imageUrl3 || '',
      product.imageUrl4 || '',
      product.imageUrl5 || ''
    ].filter(url => url.trim() !== '');

    return {
      rowIndex,
      name: product.name || '',
      description: product.description || '',
      price: parseFloat(product.price) || 0,
      originalPrice: parseFloat(product.originalPrice) || 0,
      categoryId: product.categoryId || '',
      inventory: parseInt(product.inventory) || 0,
      imageUrl: product.imageUrl1 || '',
      images: images,
      videoUrl: product.videoUrl || '',
      brand: product.brand || '',
      condition: product.condition || 'new',
      conditionDescription: product.conditionDescription || '',
      country: product.country || '',
      state: product.state || '',
      city: product.city || '',
      zipCode: product.zipCode || '',
      isLocal: product.isLocal === 'true' || product.isLocal === true,
      specifications: product.specifications ? JSON.parse(product.specifications) : {},
      isSubscription: product.isSubscription === 'true' || product.isSubscription === true || false,
      subscriptionFrequency: product.subscriptionFrequency || 'monthly',
      trialPeriodDays: parseInt(product.trialPeriodDays) || 0,
      isValid: errors.length === 0,
      errors,
    };
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingImport(true);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const validatedProducts = results.data.map((product: any, index: number) => 
          validateProduct(product, index + 1)
        );
        
        setImportedProducts(validatedProducts);
        setShowImportPreview(true);
        setIsProcessingImport(false);
        
        const validCount = validatedProducts.filter(p => p.isValid).length;
        const totalCount = validatedProducts.length;
        
        toast({
          title: "Import Preview Ready",
          description: `${validCount} of ${totalCount} products are valid and ready to import`,
        });
      },
      error: (error) => {
        setIsProcessingImport(false);
        toast({
          title: "Import Error",
          description: `Failed to parse CSV: ${error.message}`,
          variant: "destructive",
        });
      }
    });
  };

  const handleBulkImport = () => {
    const validProducts = importedProducts
      .filter(p => p.isValid)
      .map(({ rowIndex, isValid, errors, ...product }) => product);
    
    if (validProducts.length === 0) {
      toast({
        title: "No Valid Products",
        description: "Please fix validation errors before importing",
        variant: "destructive",
      });
      return;
    }

    bulkCreateMutation.mutate(validProducts);
  };

  // Image upload function
  const uploadImage = async (file: File, index: number) => {
    try {
      setUploadingImages(prev => {
        const newUploading = [...prev];
        newUploading[index] = true;
        return newUploading;
      });

      const fileFormData = new FormData();
      fileFormData.append('image', file);

      const response = await apiRequest('POST', '/api/products/upload-image', fileFormData);
      const data = await response.json();

      if (data.imageUrl) {
        if (index === 0) {
          // Primary image
          handleInputChange('imageUrl', data.imageUrl);
        } else {
          // Additional images
          const newImages = [...formData.images];
          newImages[index] = data.imageUrl;
          handleInputChange('images', newImages);
        }

        toast({
          title: "Success",
          description: "Image uploaded successfully!",
        });
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(prev => {
        const newUploading = [...prev];
        newUploading[index] = false;
        return newUploading;
      });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a JPG, PNG, WebP, or GIF image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image must be less than 5MB in size.",
          variant: "destructive",
        });
        return;
      }

      await uploadImage(file, index);
    }
  };

  const downloadTemplate = () => {
    // Download the pre-created CSV file instead of generating it
    const link = document.createElement('a');
    link.href = '/sample-inventory-template.csv';
    link.download = 'product-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportProducts = async () => {
    try {
      const response = await apiRequest('GET', '/api/products/export');
      const data = await response.json();
      const csv = Papa.unparse(data.products || []);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Complete",
        description: "Products exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export products",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
          <CardDescription>
            Add individual products or import multiple products from a spreadsheet
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Listing Limits Alert */}
          {listingLimits && listingLimits.plan && (
            <Alert className={`mb-6 ${
              listingLimits.plan === 'basic' ? 'bg-gray-100 text-gray-800 border-gray-300' :
              listingLimits.plan === 'pro' ? 'bg-blue-100 text-blue-800 border-blue-300' :
              'bg-orange-100 text-orange-800 border-orange-300'
            }`}>
              <div className="flex items-center gap-3">
                {listingLimits.plan === 'enterprise' ? <Crown className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold capitalize">{listingLimits.plan} Plan Listings</h4>
                      <p className="text-sm">
                        {listingLimits.maxListings === -1 
                          ? `${listingLimits.currentListings} active listings (unlimited)`
                          : `${listingLimits.currentListings} of ${listingLimits.maxListings} listings used`
                        }
                      </p>
                    </div>
                    {listingLimits.canAddMore === false && (
                      <div className="text-right">
                        <Badge variant="destructive" className="mb-2">Limit Reached</Badge>
                        <div className="text-sm">
                          <Link href="/subscription">
                            <Button size="sm" variant="outline">
                              Upgrade Plan
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                    {listingLimits.canAddMore === true && listingLimits.remainingListings !== -1 && (
                      <div className="text-right">
                        <Badge variant="secondary">{listingLimits.remainingListings} remaining</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {listingLimits.canAddMore === false && (
                <AlertDescription className="mt-2">
                  You've reached your listing limit. Please upgrade your plan or deactivate some existing products to add new ones.
                </AlertDescription>
              )}
            </Alert>
          )}
          
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="single">Single Product</TabsTrigger>
              <TabsTrigger value="import">Import Products</TabsTrigger>
              <TabsTrigger value="export">Export Products</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="Enter brand name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your product..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Pro Feature: Sale Pricing */}
              {isPremiumPlan ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="originalPrice">Original Price ($)</Label>
                    <Badge variant="secondary" className="text-xs">Pro</Badge>
                  </div>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                  {formData.originalPrice > formData.price && formData.originalPrice > 0 && (
                    <p className="text-xs text-green-600">
                      Save {Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}%!
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-gray-400">Sale Pricing</Label>
                    <Badge variant="outline" className="text-xs">Pro Only</Badge>
                  </div>
                  <div className="relative">
                    <Input 
                      disabled 
                      placeholder="Upgrade to Pro" 
                      className="bg-gray-50 text-gray-400"
                    />
                    <Button 
                      type="button" 
                      size="sm" 
                      className="absolute right-1 top-1 h-8 px-2 text-xs"
                      onClick={() => setLocation('/subscription')}
                    >
                      Upgrade
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="inventory">Inventory *</Label>
                <Input
                  id="inventory"
                  type="number"
                  min="0"
                  value={formData.inventory}
                  onChange={(e) => handleInputChange('inventory', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="refurbished">Refurbished</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.condition !== 'new' && (
              <div className="space-y-2">
                <Label htmlFor="conditionDescription">Condition Details</Label>
                <Textarea
                  id="conditionDescription"
                  value={formData.conditionDescription}
                  onChange={(e) => handleInputChange('conditionDescription', e.target.value)}
                  placeholder="Describe the condition of the item (wear, damage, age, etc.)"
                  rows={3}
                />
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product Media</h3>
              
              {/* Toggle between file upload and URL input */}
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant={showFileUpload ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFileUpload(true)}
                  data-testid="button-file-upload-mode"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  File Upload
                </Button>
                <Button
                  type="button"
                  variant={!showFileUpload ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFileUpload(false)}
                  data-testid="button-url-input-mode"
                >
                  URL Input
                </Button>
              </div>

              {/* Primary Image */}
              <div className="space-y-2">
                <Label htmlFor="primaryImage">Primary Image *</Label>
                {showFileUpload ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={(e) => handleFileChange(e, 0)}
                        disabled={uploadingImages[0]}
                        data-testid="input-primary-image-file"
                      />
                      {uploadingImages[0] && (
                        <div className="flex items-center gap-1 text-sm text-blue-600">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                          Uploading...
                        </div>
                      )}
                    </div>
                    {formData.imageUrl && (
                      <div className="text-sm text-green-600">
                        ✓ Image uploaded successfully
                      </div>
                    )}
                  </div>
                ) : (
                  <Input
                    id="primaryImageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                    data-testid="input-primary-image-url"
                  />
                )}
              </div>

              {/* Additional Images */}
              <div className="space-y-3">
                <Label>Additional Images (up to 4 more)</Label>
                {formData.images.slice(1).map((image, index) => (
                  <div key={index} className="space-y-2">
                    {showFileUpload ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                            onChange={(e) => handleFileChange(e, index + 1)}
                            disabled={uploadingImages[index + 1]}
                            data-testid={`input-additional-image-file-${index + 1}`}
                          />
                          {uploadingImages[index + 1] && (
                            <div className="flex items-center gap-1 text-sm text-blue-600">
                              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                              Uploading...
                            </div>
                          )}
                        </div>
                        {image && (
                          <div className="text-sm text-green-600">
                            ✓ Image uploaded successfully
                          </div>
                        )}
                      </div>
                    ) : (
                      <Input
                        placeholder={`Image ${index + 2} URL`}
                        value={image}
                        onChange={(e) => {
                          const newImages = [...formData.images];
                          newImages[index + 1] = e.target.value;
                          handleInputChange('images', newImages);
                        }}
                        data-testid={`input-additional-image-url-${index + 1}`}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Product Video/Stream URL</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                  placeholder="https://example.com/video.mp4"
                />
                <p className="text-sm text-gray-600">
                  Add a video demonstration, unboxing, or streaming content for your product
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Shop Local Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="United States"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="New York"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="New York"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="10001"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isLocal"
                  checked={formData.isLocal}
                  onChange={(e) => handleInputChange('isLocal', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isLocal">
                  Mark as local product (available for Shop Local feature)
                </Label>
              </div>
            </div>

            {/* Media Section */}
            <div className="space-y-4">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  Product Media
                  {isPremiumPlan && <Badge className="bg-blue-500">Pro Features</Badge>}
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Primary Product Image *</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Pro Feature: Multiple Images */}
                  {isPremiumPlan ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label>Additional Images (up to 4 more)</Label>
                        <Badge variant="secondary" className="text-xs">Pro</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {formData.images.slice(0, 4).map((image, index) => (
                          <Input
                            key={index}
                            value={image}
                            onChange={(e) => {
                              const newImages = [...formData.images];
                              newImages[index] = e.target.value;
                              handleInputChange('images', newImages);
                            }}
                            placeholder={`Image ${index + 2} URL`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <div className="text-center">
                        <Badge variant="outline" className="mb-2">Pro Feature</Badge>
                        <p className="text-sm text-gray-600 mb-3">
                          Add up to 5 product images with Pro plan
                        </p>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline"
                          onClick={() => setLocation('/subscription')}
                        >
                          Upgrade to Pro
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Pro Feature: Video */}
                  {isPremiumPlan ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="videoUrl">Product Video URL</Label>
                        <Badge variant="secondary" className="text-xs">Pro</Badge>
                      </div>
                      <Input
                        id="videoUrl"
                        value={formData.videoUrl}
                        onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                        placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <div className="text-center">
                        <Badge variant="outline" className="mb-2">Pro Feature</Badge>
                        <p className="text-sm text-gray-600 mb-3">
                          Add product demo videos with Pro plan
                        </p>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline"
                          onClick={() => setLocation('/subscription')}
                        >
                          Upgrade to Pro
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enterprise Feature: Custom Specifications */}
            {isEnterprisePlan ? (
              <div className="space-y-4">
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold">Custom Specifications</h3>
                    <Badge className="bg-orange-500">Enterprise</Badge>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg space-y-3">
                    <p className="text-sm text-orange-800">
                      Add custom product specifications for technical details, features, and attributes.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Specification name (e.g., 'Screen Size')"
                        onChange={(e) => {
                          // This would handle dynamic spec key input
                        }}
                      />
                      <Input
                        placeholder="Value (e.g., '15.6 inches')"
                        onChange={(e) => {
                          // This would handle dynamic spec value input
                        }}
                      />
                    </div>
                    <Button type="button" size="sm" variant="outline">
                      Add Specification
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-orange-50 rounded-lg border border-dashed border-orange-300">
                <div className="text-center">
                  <Badge variant="outline" className="mb-3 border-orange-500 text-orange-700">Enterprise Feature</Badge>
                  <h4 className="font-semibold text-orange-900 mb-2">Custom Product Specifications</h4>
                  <p className="text-sm text-orange-700 mb-4">
                    Add unlimited custom specifications like dimensions, technical specs, materials, and more with Enterprise plan.
                  </p>
                  <Button 
                    type="button" 
                    size="sm" 
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() => setLocation('/subscription')}
                  >
                    Upgrade to Enterprise
                  </Button>
                </div>
              </div>
            )}

            {/* Enterprise Feature: Subscription Products */}
            {isEnterprisePlan ? (
              <div className="space-y-4">
                <div className="border-t pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold">Subscription Product Settings</h3>
                    <Badge className="bg-orange-500">Enterprise</Badge>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isSubscription"
                        checked={formData.isSubscription}
                        onChange={(e) => handleInputChange('isSubscription', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="isSubscription">This is a subscription product</Label>
                    </div>
                    
                    {formData.isSubscription && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label>Billing Frequency</Label>
                          <Select 
                            value={formData.subscriptionFrequency} 
                            onValueChange={(value) => handleInputChange('subscriptionFrequency', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Free Trial Days</Label>
                          <Input
                            type="number"
                            min="0"
                            max="365"
                            value={formData.trialPeriodDays}
                            onChange={(e) => handleInputChange('trialPeriodDays', parseInt(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-orange-50 rounded-lg border border-dashed border-orange-300">
                <div className="text-center">
                  <Badge variant="outline" className="mb-3 border-orange-500 text-orange-700">Enterprise Feature</Badge>
                  <h4 className="font-semibold text-orange-900 mb-2">Subscription Products</h4>
                  <p className="text-sm text-orange-700 mb-4">
                    Create recurring subscription products with flexible billing cycles and free trials with Enterprise plan.
                  </p>
                  <Button 
                    type="button" 
                    size="sm" 
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() => setLocation('/subscription')}
                  >
                    Upgrade to Enterprise
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold">Shop Local Settings</h3>
                
                <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isLocal"
                  checked={formData.isLocal}
                  onChange={(e) => handleInputChange('isLocal', e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isLocal">List as Shop Local item</Label>
              </div>

              {formData.isLocal && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="Enter state or province"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip/Postal Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="Enter zip code"
                    />
                  </div>
                </div>
              )}
            </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                className="flex-1 bg-amazon-orange hover:bg-orange-600 text-amazon-dark"
                disabled={createProductMutation.isPending || limitsLoading || (listingLimits?.canAddMore === false) || isLoadingUserPlan || !formData.name.trim() || !formData.price || !formData.imageUrl.trim()}
                data-testid="button-submit"
              >
                {createProductMutation.isPending ? 'Creating...' :
                 limitsLoading || isLoadingUserPlan ? 'Loading...' :
                 listingLimits?.canAddMore === false ? 'Upgrade Plan to Add More' : 
                 isEditMode ? 'Update Product' : 'Create Product'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setLocation('/seller-dashboard')}
              >
                Cancel
              </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="import" className="space-y-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Import Products from CSV</h3>
                  <p className="text-gray-600 mb-4">
                    Upload a CSV file to import multiple products at once. 
                    <br />Download our sample template with 10 example products to see the correct format.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded mb-4 text-left">
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                      <strong>Template includes:</strong> Required fields (name, price, category, inventory), 
                      up to 5 image URLs, video URL, location data, and condition information.
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Categories: electronics, fashion, home_garden, sports_outdoors, books, pro_tools, contractor_services
                    </p>
                  </div>
                  <div className="space-x-4">
                    <Button onClick={downloadTemplate} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Sample Template
                    </Button>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessingImport || limitsLoading || (listingLimits?.canAddMore === false) || isLoadingUserPlan}
                      data-testid="button-upload-csv"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isProcessingImport ? 'Processing...' :
                       limitsLoading || isLoadingUserPlan ? 'Loading...' :
                       listingLimits?.canAddMore === false ? 'Upgrade Plan to Import' :
                       'Upload CSV'}
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </div>

                {showImportPreview && importedProducts.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Import Preview</h3>
                      <div className="space-x-2">
                        <Badge variant="secondary">
                          {importedProducts.filter(p => p.isValid).length} Valid
                        </Badge>
                        <Badge variant="destructive">
                          {importedProducts.filter(p => !p.isValid).length} Invalid
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Row</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Inventory</TableHead>
                            <TableHead>Errors</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importedProducts.slice(0, 10).map((product, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {product.isValid ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                              </TableCell>
                              <TableCell>{product.rowIndex}</TableCell>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell>${product.price}</TableCell>
                              <TableCell>{product.categoryId}</TableCell>
                              <TableCell>{product.inventory}</TableCell>
                              <TableCell>
                                {product.errors.length > 0 && (
                                  <div className="space-y-1">
                                    {product.errors.map((error, idx) => (
                                      <Badge key={idx} variant="destructive" className="text-xs">
                                        {error}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {importedProducts.length > 10 && (
                      <p className="text-sm text-gray-600 text-center">
                        Showing first 10 of {importedProducts.length} products
                      </p>
                    )}

                    <div className="flex justify-end space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowImportPreview(false);
                          setImportedProducts([]);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleBulkImport}
                        disabled={bulkCreateMutation.isPending || importedProducts.filter(p => p.isValid).length === 0 || limitsLoading || (listingLimits?.canAddMore === false) || isLoadingUserPlan}
                        className="bg-amazon-orange hover:bg-orange-600 text-amazon-dark"
                        data-testid="button-bulk-import"
                      >
                        {bulkCreateMutation.isPending ? 'Importing...' :
                         limitsLoading || isLoadingUserPlan ? 'Loading...' :
                         listingLimits?.canAddMore === false ? 'Upgrade Plan to Import' :
                         `Import ${importedProducts.filter(p => p.isValid).length} Products`}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-6">
              <div className="text-center space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <Download className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Export Your Products</h3>
                  <p className="text-gray-600 mb-4">
                    Download all your products as a CSV file. This can be used for backup, 
                    <br />editing in spreadsheet applications, or importing to other systems.
                  </p>
                  <Button
                    onClick={exportProducts}
                    className="bg-amazon-orange hover:bg-orange-600 text-amazon-dark"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export All Products
                  </Button>
                </div>
                
                <div className="text-left space-y-2">
                  <h4 className="font-semibold">Export includes:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Product names and descriptions</li>
                    <li>• Pricing and inventory information</li>
                    <li>• Category and brand details</li>
                    <li>• Location and condition data</li>
                    <li>• All custom fields and metadata</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
}