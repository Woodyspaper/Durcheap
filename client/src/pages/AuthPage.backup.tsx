import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Layout } from '@/components/Layout';
import { Eye, EyeOff, ShoppingBag, Users, TrendingUp, Shield, Search } from 'lucide-react';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'buyer' | 'seller';
  referralCode?: string;
}

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form states
  const [loginData, setLoginData] = useState<LoginData>({ email: '', password: '' });
  const [registerData, setRegisterData] = useState<RegisterData>({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
    role: 'buyer',
    referralCode: ''
  });
  
  // Referral code states
  const [referralType, setReferralType] = useState<'none' | 'user' | 'code'>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [showManualCode, setShowManualCode] = useState(false);
  
  // Query for searching users by name for referral
  const { data: searchResults = [] } = useQuery<Array<{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    uniqueReferralCode: string;
  }>>({
    queryKey: ['/api/users/search', searchQuery],
    enabled: searchQuery.length >= 2 && referralType === 'user',
    retry: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Check if user is already authenticated
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Redirect if already logged in
  if (user) {
    setLocation('/');
    return null;
  }

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest('POST', '/api/auth/login', credentials);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }
      return await res.json();
    },
    onSuccess: (userData) => {
      toast({
        title: "Welcome back!",
        description: `Successfully signed in as ${userData.email}`,
      });
      queryClient.setQueryData(['/api/auth/user'], userData);
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest('POST', '/api/auth/register', userData);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Registration failed');
      }
      return await res.json();
    },
    onSuccess: (userData) => {
      toast({
        title: "Account Created!",
        description: `Welcome to Durcheap, ${userData.firstName}!`,
      });
      queryClient.setQueryData(['/api/auth/user'], userData);
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerData.email || !registerData.password || !registerData.username || 
        !registerData.firstName || !registerData.lastName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    if (registerData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    // Handle referral code validation
    let finalReferralCode = '';
    if (referralType === 'code' && registerData.referralCode) {
      finalReferralCode = registerData.referralCode.toUpperCase();
    } else if (referralType === 'user' && registerData.referralCode) {
      finalReferralCode = registerData.referralCode;
    }
    
    registerMutation.mutate({
      ...registerData,
      referralCode: finalReferralCode || undefined
    });
  };
  
  const handleReferralSelection = (value: string) => {
    if (value === 'none') {
      setReferralType('none');
      setRegisterData(prev => ({ ...prev, referralCode: '' }));
    } else if (value === 'other') {
      setReferralType('code');
      setShowManualCode(true);
    } else if (value === 'search') {
      setReferralType('user');
      setShowManualCode(false);
    } else {
      // User selected from search results
      setRegisterData(prev => ({ ...prev, referralCode: value }));
      setReferralType('user');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
              
              {/* Left side - Hero/Benefits */}
              <div className="space-y-6 lg:space-y-8 hidden lg:block">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    Welcome to Durcheap
                  </h1>
                  <p className="text-lg lg:text-xl text-gray-600 mb-6 lg:mb-8">
                    The marketplace that connects buyers and sellers worldwide. 
                    Discover millions of products or start selling today.
                  </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Shop Millions of Products</h3>
                      <p className="text-gray-600 text-sm">From electronics to fashion, find everything you need</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Trusted Sellers</h3>
                      <p className="text-gray-600 text-sm">Verified merchants with quality guarantees</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Start Selling</h3>
                      <p className="text-gray-600 text-sm">Launch your business with powerful seller tools</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Secure & Safe</h3>
                      <p className="text-gray-600 text-sm">Protected transactions and buyer guarantees</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Auth Forms */}
              <div className="max-w-md mx-auto w-full">
                {/* Mobile-only header */}
                <div className="lg:hidden text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Durcheap</h1>
                  <p className="text-gray-600">Sign in to your account or create a new one</p>
                </div>
                
                <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl lg:text-2xl">Get Started</CardTitle>
                    <CardDescription className="hidden lg:block">
                      Sign in to your account or create a new one
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Replit OAuth Sign In Button */}
                    <div className="mb-6">
                      <Button 
                        onClick={() => window.location.href = "/api/auth/replit"}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                        size="lg"
                      >
                        Sign in with Replit
                      </Button>
                      
                      <div className="relative mt-6">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
                        </div>
                      </div>
                    </div>
                        <TabsTrigger value="login" className="text-sm lg:text-base">Sign In</TabsTrigger>
                        <TabsTrigger value="register" className="text-sm lg:text-base">Sign Up</TabsTrigger>
                      </TabsList>
                      
                      {/* Login Form */}
                      <TabsContent value="login" className="space-y-4">
                        <form onSubmit={handleLogin} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="login-email">Email</Label>
                            <Input
                              id="login-email"
                              type="email"
                              placeholder="Enter your email"
                              value={loginData.email}
                              onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="login-password">Password</Label>
                            <div className="relative">
                              <Input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={loginData.password}
                                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? "Signing In..." : "Sign In"}
                          </Button>
                        </form>
                      </TabsContent>
                      
                      {/* Register Form */}
                      <TabsContent value="register" className="space-y-4">
                        <form onSubmit={handleRegister} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="register-firstName">First Name</Label>
                              <Input
                                id="register-firstName"
                                type="text"
                                placeholder="First name"
                                value={registerData.firstName}
                                onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="register-lastName">Last Name</Label>
                              <Input
                                id="register-lastName"
                                type="text"
                                placeholder="Last name"
                                value={registerData.lastName}
                                onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="register-username">Username</Label>
                            <Input
                              id="register-username"
                              type="text"
                              placeholder="Choose a username"
                              value={registerData.username}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="register-email">Email</Label>
                            <Input
                              id="register-email"
                              type="email"
                              placeholder="Enter your email"
                              value={registerData.email}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="register-password">Password</Label>
                            <div className="relative">
                              <Input
                                id="register-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password (min 6 characters)"
                                value={registerData.password}
                                onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                                required
                                minLength={6}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="register-role">Account Type</Label>
                            <select
                              id="register-role"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={registerData.role}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, role: e.target.value as 'buyer' | 'seller' }))}
                            >
                              <option value="buyer">Buyer - Shop products</option>
                              <option value="seller">Seller - Sell products</option>
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="referral-selection">Who referred you? (Required)</Label>
                            <Select onValueChange={handleReferralSelection} required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select how you heard about us" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No one referred me</SelectItem>
                                <SelectItem value="search">Search for a user who referred me</SelectItem>
                                <SelectItem value="other">I have a referral code</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {referralType === 'user' && (
                            <div className="space-y-2">
                              <Label htmlFor="user-search">Search for the user who referred you</Label>
                              <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  id="user-search"
                                  type="text"
                                  placeholder="Type name or username..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  className="pl-10"
                                />
                              </div>
                              {searchResults.length > 0 && (
                                <div className="border rounded-md bg-white max-h-40 overflow-y-auto">
                                  {searchResults.map((user) => (
                                    <div 
                                      key={user.id}
                                      className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                      onClick={() => {
                                        setRegisterData(prev => ({ ...prev, referralCode: user.uniqueReferralCode }));
                                        setSearchQuery(`${user.firstName} ${user.lastName} (@${user.username})`);
                                      }}
                                    >
                                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                                      <div className="text-sm text-gray-500">@{user.username}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {referralType === 'code' && (
                            <div className="space-y-2">
                              <Label htmlFor="referral-code">Enter Referral Code</Label>
                              <Input
                                id="referral-code"
                                type="text"
                                placeholder="Enter the referral code"
                                value={registerData.referralCode}
                                onChange={(e) => setRegisterData(prev => ({ ...prev, referralCode: e.target.value.toUpperCase() }))}
                                className="uppercase"
                              />
                            </div>
                          )}
                          
                          <Button 
                            type="submit" 
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                          </Button>
                        </form>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}