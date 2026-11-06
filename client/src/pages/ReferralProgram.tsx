import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { 
  Gift, 
  Users, 
  DollarSign, 
  Star, 
  Share2, 
  TrendingUp, 
  Award, 
  CheckCircle,
  Copy,
  Mail,
  MessageSquare,
  Facebook,
  Twitter,
  QrCode,
  Download,
  Camera
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

export default function ReferralProgram() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Create signup link with referral code pre-filled - use current domain
  const currentDomain = window.location.origin;
  console.log('Debug - Current domain:', currentDomain);
  console.log('Debug - Window location:', window.location);
  
  const referralLink = user ? `${currentDomain}?ref=${user.uniqueReferralCode}` : currentDomain;
  const signupLink = user ? `${currentDomain}/auth?ref=${user.uniqueReferralCode}` : `${currentDomain}/auth`;
  
  console.log('Debug - Signup link:', signupLink);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const generateQRCode = async () => {
    try {
      // Force refresh the current domain to avoid caching issues
      const freshDomain = window.location.origin;
      const freshSignupLink = user ? `${freshDomain}/auth?ref=${user.uniqueReferralCode}` : `${freshDomain}/auth`;
      
      console.log('Debug - Fresh domain for QR:', freshDomain);
      console.log('Debug - Fresh signup link for QR:', freshSignupLink);
      
      const dataUrl = await QRCode.toDataURL(freshSignupLink, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `referral-qr-${user?.uniqueReferralCode || 'code'}.png`;
    link.href = qrCodeDataUrl;
    link.click();
    
    toast({
      title: "Downloaded!",
      description: "QR code image saved to your device",
    });
  };

  useEffect(() => {
    if (user) {
      generateQRCode();
    }
  }, [user]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="h-12 w-12 text-purple-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Referral Program
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Earn 1% commission on every purchase made by your referrals. Share Durcheap with friends, 
            family, and followers, and get rewarded for growing our community!
          </p>
          
          {user ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-4xl mx-auto">
              <Tabs defaultValue="link" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="link" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Referral Link
                  </TabsTrigger>
                  <TabsTrigger value="qr" className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    QR Code
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="link" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Your Referral Link</h3>
                      <p className="text-sm text-gray-600 mb-2">Share this link for general referrals</p>
                      <div className="flex items-center gap-2 bg-white rounded-lg p-3 border">
                        <input 
                          type="text" 
                          value={referralLink} 
                          readOnly 
                          className="flex-1 text-sm text-gray-700 bg-transparent border-none outline-none"
                        />
                        <Button size="sm" onClick={() => copyToClipboard(referralLink, "Referral link")} className="bg-green-600 hover:bg-green-700">
                          <Copy className="h-4 w-4" />
                          Copy
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Direct Signup Link</h3>
                      <p className="text-sm text-gray-600 mb-2">Takes users directly to signup with your referral code pre-filled</p>
                      <div className="flex items-center gap-2 bg-white rounded-lg p-3 border">
                        <input 
                          type="text" 
                          value={signupLink} 
                          readOnly 
                          className="flex-1 text-sm text-gray-700 bg-transparent border-none outline-none"
                        />
                        <Button size="sm" onClick={() => copyToClipboard(signupLink, "Signup link")} className="bg-blue-600 hover:bg-blue-700">
                          <Copy className="h-4 w-4" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="qr" className="mt-4">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold text-green-800">QR Code for Easy Sharing</h3>
                    <p className="text-sm text-gray-600">
                      Scan this QR code to go directly to signup with your referral code pre-filled
                    </p>
                    
                    {qrCodeDataUrl ? (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                          <img 
                            src={qrCodeDataUrl} 
                            alt="Referral QR Code" 
                            className="w-64 h-64"
                          />
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-blue-800 font-medium">QR Code URL:</p>
                          <p className="text-xs text-blue-600 break-all">{user ? `${window.location.origin}/auth?ref=${user.uniqueReferralCode}` : `${window.location.origin}/auth`}</p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={downloadQRCode} 
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download QR Code
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              const currentUrl = user ? `${window.location.origin}/auth?ref=${user.uniqueReferralCode}` : `${window.location.origin}/auth`;
                              copyToClipboard(currentUrl, "QR code link");
                            }}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </Button>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
                          <div className="flex items-start gap-2">
                            <Camera className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                              <p className="font-medium mb-1">How to use:</p>
                              <ul className="space-y-1 text-xs">
                                <li>• Save or screenshot this QR code</li>
                                <li>• Share it on social media, print it, or send it directly</li>
                                <li>• Anyone who scans it will go to signup with your referral code</li>
                                <li>• You'll earn 1% on all their future purchases</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Generating QR code...</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Link href="/auth">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 px-8 py-3">
                Join Now to Get Your Referral Link
              </Button>
            </Link>
          )}
        </div>

        {/* How It Works */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">1. Share Your Link</h3>
                <p className="text-gray-600">
                  Share your unique referral link with friends, family, or on social media
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">2. Friends Join & Shop</h3>
                <p className="text-gray-600">
                  When someone uses your link to sign up and make a purchase
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">3. You Earn 1%</h3>
                <p className="text-gray-600">
                  Receive 1% commission on every purchase they make, forever
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">1% Commission</h3>
              <p className="text-sm text-gray-600">Earn on every purchase</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Lifetime Earnings</h3>
              <p className="text-sm text-gray-600">Earn from all future purchases</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Unlimited Referrals</h3>
              <p className="text-sm text-gray-600">No limit on referrals</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Award className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Instant Payouts</h3>
              <p className="text-sm text-gray-600">Monthly automatic payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Sharing Tools */}
        {user && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Share Your Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  SMS
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Stories */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Success Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">$2,847</div>
                <div className="text-sm text-gray-600 mb-2">Sarah M. - Monthly Earnings</div>
                <div className="text-xs text-gray-500">"I shared with my social media followers and now earn consistently every month!"</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">156</div>
                <div className="text-sm text-gray-600 mb-2">Mike R. - Active Referrals</div>
                <div className="text-xs text-gray-500">"Started with family, now my entire network shops on Durcheap!"</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">$15K+</div>
                <div className="text-sm text-gray-600 mb-2">Jessica L. - Total Earned</div>
                <div className="text-xs text-gray-500">"Best passive income I've ever had. Highly recommend!"</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms & FAQ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Program Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <strong>1% Commission:</strong> Earn 1% on all purchases made by your referrals
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <strong>Lifetime Earnings:</strong> Continue earning from repeat purchases
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <strong>Monthly Payouts:</strong> Automatic payments on the 1st of each month
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <strong>Minimum Payout:</strong> $25 minimum for monthly payments
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-1">When do I get paid?</h4>
                <p className="text-sm text-gray-600">Commissions are paid monthly on the 1st, with a minimum of $25.</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Is there a limit to referrals?</h4>
                <p className="text-sm text-gray-600">No, you can refer unlimited people and earn from all of them.</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">How do I track my earnings?</h4>
                <p className="text-sm text-gray-600">View your referral dashboard in your account settings.</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">Can I refer myself?</h4>
                <p className="text-sm text-gray-600">No, self-referrals are not allowed and will not earn commission.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        {!user && (
          <div className="text-center mt-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="mb-6">Join thousands of members already earning through our referral program</p>
            <Link href="/auth">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-8">
                Create Your Account
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}