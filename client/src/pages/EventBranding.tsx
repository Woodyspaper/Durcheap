import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Palette, 
  Upload, 
  Eye, 
  Save, 
  Crown, 
  Image as ImageIcon,
  Type,
  Layout as LayoutIcon,
  Sparkles
} from "lucide-react";

interface BrandingTheme {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  preview: string;
}

interface CustomBranding {
  logoUrl?: string;
  companyName: string;
  tagline?: string;
  customCss?: string;
  socialLinks: {
    website?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  theme: BrandingTheme;
}

export default function EventBranding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("themes");
  const [selectedTheme, setSelectedTheme] = useState<BrandingTheme | null>(null);
  const [customBranding, setCustomBranding] = useState<CustomBranding>({
    companyName: "",
    socialLinks: {},
    theme: {} as BrandingTheme
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has Enterprise subscription
  const hasEnterpriseAccess = user?.subscription?.plan === 'enterprise';

  const brandingThemes: BrandingTheme[] = [
    {
      id: "corporate_blue",
      name: "Corporate Blue",
      description: "Professional blue theme perfect for business events",
      primaryColor: "#1e40af",
      secondaryColor: "#3b82f6",
      backgroundColor: "#f8fafc",
      textColor: "#1e293b",
      accentColor: "#0ea5e9",
      preview: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)"
    },
    {
      id: "elegant_purple",
      name: "Elegant Purple",
      description: "Sophisticated purple theme for premium events",
      primaryColor: "#7c3aed",
      secondaryColor: "#a855f7",
      backgroundColor: "#faf5ff",
      textColor: "#374151",
      accentColor: "#c084fc",
      preview: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
    },
    {
      id: "vibrant_orange",
      name: "Vibrant Orange",
      description: "Energetic orange theme for creative and social events",
      primaryColor: "#ea580c",
      secondaryColor: "#f97316",
      backgroundColor: "#fffbeb",
      textColor: "#1f2937",
      accentColor: "#fb923c",
      preview: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)"
    },
    {
      id: "nature_green",
      name: "Nature Green",
      description: "Fresh green theme for outdoor and eco-friendly events",
      primaryColor: "#059669",
      secondaryColor: "#10b981",
      backgroundColor: "#f0fdf4",
      textColor: "#111827",
      accentColor: "#34d399",
      preview: "linear-gradient(135deg, #059669 0%, #10b981 100%)"
    },
    {
      id: "luxury_gold",
      name: "Luxury Gold",
      description: "Premium gold theme for high-end and exclusive events",
      primaryColor: "#d97706",
      secondaryColor: "#f59e0b",
      backgroundColor: "#fffbeb",
      textColor: "#1f2937",
      accentColor: "#fbbf24",
      preview: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)"
    },
    {
      id: "modern_teal",
      name: "Modern Teal",
      description: "Contemporary teal theme for tech and innovation events",
      primaryColor: "#0d9488",
      secondaryColor: "#14b8a6",
      backgroundColor: "#f0fdfa",
      textColor: "#1f2937",
      accentColor: "#5eead4",
      preview: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)"
    }
  ];

  useEffect(() => {
    if (hasEnterpriseAccess) {
      loadCustomBranding();
    }
  }, [hasEnterpriseAccess]);

  const loadCustomBranding = async () => {
    try {
      const response = await apiRequest("GET", "/api/user/branding");
      if (response.ok) {
        const branding = await response.json();
        setCustomBranding(branding);
        setSelectedTheme(branding.theme || brandingThemes[0]);
      }
    } catch (error) {
      // User might not have branding set up yet
      setSelectedTheme(brandingThemes[0]);
    }
  };

  const handleThemeSelect = (theme: BrandingTheme) => {
    setSelectedTheme(theme);
    setCustomBranding(prev => ({ ...prev, theme }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Logo must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('logo', file);

    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/upload/logo", formData);
      if (response.ok) {
        const { url } = await response.json();
        setCustomBranding(prev => ({ ...prev, logoUrl: url }));
        toast({
          title: "Logo uploaded",
          description: "Your logo has been uploaded successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload logo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBranding = async () => {
    if (!hasEnterpriseAccess) {
      toast({
        title: "Enterprise Required",
        description: "Custom event branding is only available for Enterprise subscribers",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/user/branding", customBranding);
      if (response.ok) {
        toast({
          title: "Branding Saved",
          description: "Your custom event branding has been saved successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save branding settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasEnterpriseAccess) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <Crown className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-4">Custom Event Branding & Themes</h1>
              <p className="text-xl text-gray-600 mb-8">
                Create branded event experiences that reflect your company's identity
              </p>
            </div>

            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
              <CardContent className="p-8">
                <Crown className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">Enterprise Feature</h3>
                <p className="text-gray-600 mb-6">
                  Custom event branding & themes is exclusively available for Enterprise subscribers. 
                  Upgrade to access professional branding tools, custom themes, logo integration, and more.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="text-left">
                    <h4 className="font-semibold mb-2">✓ Custom Color Themes</h4>
                    <p className="text-sm text-gray-600">6 professional themes plus custom colors</p>
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold mb-2">✓ Logo Integration</h4>
                    <p className="text-sm text-gray-600">Upload and integrate your company logo</p>
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold mb-2">✓ Custom CSS</h4>
                    <p className="text-sm text-gray-600">Advanced styling with custom CSS</p>
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold mb-2">✓ Social Integration</h4>
                    <p className="text-sm text-gray-600">Link your social media accounts</p>
                  </div>
                </div>
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                  Upgrade to Enterprise
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Palette className="h-8 w-8 text-orange-500" />
            <div>
              <h1 className="text-4xl font-bold">Custom Event Branding & Themes</h1>
              <p className="text-gray-600">Customize the look and feel of your event pages</p>
            </div>
            <Badge className="bg-orange-100 text-orange-800 ml-auto">
              <Crown className="h-4 w-4 mr-1" />
              Enterprise
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="themes" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Themes
              </TabsTrigger>
              <TabsTrigger value="branding" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Branding
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Advanced
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="themes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Choose Your Theme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {brandingThemes.map((theme) => (
                      <Card 
                        key={theme.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedTheme?.id === theme.id ? 'ring-2 ring-orange-500' : ''
                        }`}
                        onClick={() => handleThemeSelect(theme)}
                      >
                        <CardContent className="p-4">
                          <div 
                            className="h-20 rounded-lg mb-3"
                            style={{ background: theme.preview }}
                          />
                          <h3 className="font-semibold">{theme.name}</h3>
                          <p className="text-sm text-gray-600">{theme.description}</p>
                          <div className="flex gap-2 mt-3">
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: theme.primaryColor }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: theme.secondaryColor }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: theme.accentColor }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Logo & Company Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="logo-upload">Company Logo</Label>
                      <div className="mt-2">
                        {customBranding.logoUrl ? (
                          <div className="relative">
                            <img 
                              src={customBranding.logoUrl} 
                              alt="Company Logo" 
                              className="h-20 w-auto mb-2"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCustomBranding(prev => ({ ...prev, logoUrl: undefined }))}
                            >
                              Remove Logo
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <input
                              id="logo-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                            <Button
                              variant="outline"
                              onClick={() => document.getElementById('logo-upload')?.click()}
                              disabled={isLoading}
                            >
                              {isLoading ? "Uploading..." : "Upload Logo"}
                            </Button>
                            <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        value={customBranding.companyName}
                        onChange={(e) => setCustomBranding(prev => ({ 
                          ...prev, 
                          companyName: e.target.value 
                        }))}
                        placeholder="Your Company Name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tagline">Tagline (Optional)</Label>
                      <Input
                        id="tagline"
                        value={customBranding.tagline || ''}
                        onChange={(e) => setCustomBranding(prev => ({ 
                          ...prev, 
                          tagline: e.target.value 
                        }))}
                        placeholder="Your company tagline"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Social Media Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={customBranding.socialLinks.website || ''}
                        onChange={(e) => setCustomBranding(prev => ({ 
                          ...prev, 
                          socialLinks: { ...prev.socialLinks, website: e.target.value }
                        }))}
                        placeholder="https://yourcompany.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={customBranding.socialLinks.facebook || ''}
                        onChange={(e) => setCustomBranding(prev => ({ 
                          ...prev, 
                          socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                        }))}
                        placeholder="https://facebook.com/yourcompany"
                      />
                    </div>

                    <div>
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={customBranding.socialLinks.twitter || ''}
                        onChange={(e) => setCustomBranding(prev => ({ 
                          ...prev, 
                          socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                        }))}
                        placeholder="https://twitter.com/yourcompany"
                      />
                    </div>

                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={customBranding.socialLinks.linkedin || ''}
                        onChange={(e) => setCustomBranding(prev => ({ 
                          ...prev, 
                          socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                        }))}
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    Custom CSS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="custom-css">Custom CSS (Advanced Users)</Label>
                    <Textarea
                      id="custom-css"
                      value={customBranding.customCss || ''}
                      onChange={(e) => setCustomBranding(prev => ({ 
                        ...prev, 
                        customCss: e.target.value 
                      }))}
                      placeholder={`/* Custom CSS for your events */
.event-header {
  font-family: 'Your Custom Font';
}

.event-button {
  border-radius: 8px;
  transition: all 0.3s ease;
}`}
                      rows={10}
                      className="font-mono text-sm"
                    />
                    <p className="text-sm text-gray-500">
                      Add custom CSS to further customize your event pages. Use with caution.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Event Page Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <div 
                      className="p-6"
                      style={{ 
                        background: selectedTheme?.backgroundColor,
                        color: selectedTheme?.textColor
                      }}
                    >
                      <div className="flex items-center gap-4 mb-6">
                        {customBranding.logoUrl && (
                          <img 
                            src={customBranding.logoUrl} 
                            alt="Logo" 
                            className="h-12 w-auto"
                          />
                        )}
                        <div>
                          <h2 className="text-2xl font-bold">
                            {customBranding.companyName || "Your Company"}
                          </h2>
                          {customBranding.tagline && (
                            <p className="text-sm opacity-80">{customBranding.tagline}</p>
                          )}
                        </div>
                      </div>

                      <div 
                        className="p-6 rounded-lg mb-6"
                        style={{ 
                          background: selectedTheme?.preview,
                          color: 'white'
                        }}
                      >
                        <h1 className="text-3xl font-bold mb-2">Sample Event Title</h1>
                        <p className="mb-4">This is how your event will look with your custom branding applied.</p>
                        <Button 
                          style={{ 
                            backgroundColor: selectedTheme?.accentColor,
                            color: selectedTheme?.textColor 
                          }}
                        >
                          Register Now
                        </Button>
                      </div>

                      <div className="flex gap-4">
                        {Object.entries(customBranding.socialLinks).map(([platform, url]) => 
                          url && (
                            <Button key={platform} variant="outline" size="sm">
                              {platform.charAt(0).toUpperCase() + platform.slice(1)}
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-8">
            <Button variant="outline" onClick={loadCustomBranding}>
              Reset Changes
            </Button>
            <Button 
              onClick={handleSaveBranding}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Branding"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}