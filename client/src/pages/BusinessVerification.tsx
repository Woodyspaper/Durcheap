import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Upload, 
  FileText, 
  Building, 
  Award,
  AlertCircle,
  Eye,
  Download,
  RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface BusinessVerification {
  id: string;
  businessName: string;
  businessType: string;
  taxId: string;
  businessAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  website?: string;
  description: string;
  documentsUploaded: string[];
  status: "pending" | "approved" | "rejected" | "under_review";
  submittedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  verificationLevel: "basic" | "standard" | "premium";
  badgeUrl?: string;
}

interface VerificationDocument {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
}

export default function BusinessVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    taxId: "",
    businessAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phoneNumber: "",
    website: "",
    description: "",
    verificationLevel: "standard"
  });

  const { data: verification, isLoading } = useQuery({
    queryKey: ["/api/business-verification"],
    enabled: !!user,
  });

  const { data: documents } = useQuery({
    queryKey: ["/api/business-verification/documents"],
    enabled: !!user,
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/business-verification/upload", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-verification"] });
      toast({
        title: "Documents Uploaded",
        description: "Your verification documents have been uploaded successfully.",
      });
      setSelectedFiles([]);
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/business-verification/submit", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-verification"] });
      toast({
        title: "Application Submitted",
        description: "Your business verification application has been submitted for review.",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a supported file type. Please upload PDF, JPG, or PNG files.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} is too large. Please upload files smaller than 10MB.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select documents to upload.",
        variant: "destructive",
      });
      return;
    }

    const uploadData = new FormData();
    selectedFiles.forEach(file => {
      uploadData.append("documents", file);
    });

    uploadMutation.mutate(uploadData);
  };

  const handleSubmit = async () => {
    if (!formData.businessName || !formData.businessType || !formData.taxId) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required business information.",
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate(formData);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Business Verification</h1>
            <p className="text-gray-600">Please log in to access business verification.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const verificationData = verification as BusinessVerification;
  const documentData = documents as VerificationDocument[];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "under_review":
        return <Eye className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              Business Verification
            </h1>
            <p className="text-gray-600 mt-2">Verify your business to build trust and unlock premium features</p>
          </div>
          
          {verificationData && (
            <div className="flex items-center gap-3">
              {getStatusIcon(verificationData.status)}
              <Badge className={getStatusColor(verificationData.status)}>
                {verificationData.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          )}
        </div>

        {verificationData?.status === "approved" && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Business Verified!</h3>
                  <p className="text-green-700">
                    Your business has been successfully verified. You now have access to premium seller features and display a verified badge.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="application">Application</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {verificationData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Business Name</span>
                      <span className="font-medium">{verificationData.businessName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Business Type</span>
                      <span className="font-medium">{verificationData.businessType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Verification Level</span>
                      <Badge variant="outline">{verificationData.verificationLevel}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Submitted</span>
                      <span className="font-medium">
                        {new Date(verificationData.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {verificationData.reviewedAt && (
                      <div className="flex items-center justify-between">
                        <span>Reviewed</span>
                        <span className="font-medium">
                          {new Date(verificationData.reviewedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {verificationData.reviewerNotes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Review Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{verificationData.reviewerNotes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Get Started with Business Verification</CardTitle>
                  <CardDescription>
                    Verify your business to build customer trust and unlock premium seller features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Submit Application</h3>
                      <p className="text-sm text-gray-600">Provide business information and upload required documents</p>
                    </div>
                    <div className="text-center">
                      <div className="p-3 bg-yellow-100 rounded-full w-fit mx-auto mb-3">
                        <Eye className="h-6 w-6 text-yellow-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Review Process</h3>
                      <p className="text-sm text-gray-600">Our team reviews your application within 2-3 business days</p>
                    </div>
                    <div className="text-center">
                      <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                        <Award className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Get Verified</h3>
                      <p className="text-sm text-gray-600">Receive your verification badge and unlock premium features</p>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => {
                    const element = document.querySelector('[value="application"]') as HTMLElement;
                    element?.click();
                  }}>
                    Start Application
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="application" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Provide accurate business information for verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="Enter your business name"
                      disabled={verificationData?.status === "approved"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Select 
                      value={formData.businessType} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}
                      disabled={verificationData?.status === "approved"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select business type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="llc">LLC</SelectItem>
                        <SelectItem value="corporation">Corporation</SelectItem>
                        <SelectItem value="non_profit">Non-Profit</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taxId">Tax ID / EIN *</Label>
                    <Input
                      id="taxId"
                      value={formData.taxId}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                      placeholder="XX-XXXXXXX"
                      disabled={verificationData?.status === "approved"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Business Phone</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="(555) 123-4567"
                      disabled={verificationData?.status === "approved"}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Input
                    id="businessAddress"
                    value={formData.businessAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessAddress: e.target.value }))}
                    placeholder="Street address"
                    disabled={verificationData?.status === "approved"}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City"
                      disabled={verificationData?.status === "approved"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="State"
                      disabled={verificationData?.status === "approved"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                      placeholder="12345"
                      disabled={verificationData?.status === "approved"}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select 
                      value={formData.country} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                      disabled={verificationData?.status === "approved"}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Business Website (Optional)</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourbusiness.com"
                    disabled={verificationData?.status === "approved"}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your business and what you sell"
                    rows={3}
                    disabled={verificationData?.status === "approved"}
                  />
                </div>

                <div>
                  <Label htmlFor="verificationLevel">Verification Level</Label>
                  <Select 
                    value={formData.verificationLevel} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, verificationLevel: value }))}
                    disabled={verificationData?.status === "approved"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic ($24) - Business name and tax ID verification</SelectItem>
                      <SelectItem value="standard">Standard ($49) - Full business verification with documents</SelectItem>
                      <SelectItem value="premium">Premium ($99) - Enhanced verification with background check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!verificationData && (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={submitMutation.isPending}
                    className="w-full"
                  >
                    {submitMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Required Documents</CardTitle>
                <CardDescription>
                  Upload the following documents to complete your verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Business License</h3>
                    <p className="text-sm text-gray-600 mb-3">Official business license or registration certificate</p>
                    <Badge variant="outline">Required</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Tax Document</h3>
                    <p className="text-sm text-gray-600 mb-3">EIN letter or tax registration document</p>
                    <Badge variant="outline">Required</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Bank Statement</h3>
                    <p className="text-sm text-gray-600 mb-3">Recent business bank statement (last 3 months)</p>
                    <Badge variant="secondary">Optional</Badge>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Articles of Incorporation</h3>
                    <p className="text-sm text-gray-600 mb-3">For corporations and LLCs</p>
                    <Badge variant="secondary">If Applicable</Badge>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Upload Documents</h3>
                    <p className="text-gray-600 mb-4">Drag and drop files here, or click to select</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      Select Files
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: PDF, JPG, PNG (max 10MB each)
                    </p>
                  </div>
                </div>

                {selectedFiles.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Selected Files</h4>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={handleUpload} 
                      disabled={uploadMutation.isPending}
                      className="w-full mt-4"
                    >
                      {uploadMutation.isPending ? "Uploading..." : "Upload Documents"}
                    </Button>
                  </div>
                )}

                {documentData && documentData.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Uploaded Documents</h4>
                    <div className="space-y-2">
                      {documentData.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <span className="text-sm font-medium">{doc.fileName}</span>
                              <p className="text-xs text-gray-500">
                                Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(doc.status)}>
                              {doc.status}
                            </Badge>
                            {getStatusIcon(doc.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Trust & Credibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Verified business badge on all listings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Higher search ranking priority</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Increased customer confidence</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Premium Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Priority customer support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Advanced seller analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Bulk product management tools</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Business Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Access to B2B marketplace features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Wholesale pricing opportunities</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Corporate buyer network access</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Verification Levels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Basic</span>
                      <Badge variant="outline">$24</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Standard</span>
                      <Badge variant="secondary">$49</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Premium</span>
                      <Badge>$99</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}