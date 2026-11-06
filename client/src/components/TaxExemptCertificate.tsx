import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Upload, CheckCircle, XCircle, Clock, Plus } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

interface TaxExemptCertificate {
  id: string;
  certificateType: string;
  exemptionNumber: string;
  businessName: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZipCode: string;
  exemptStates: string[];
  certificateFilePath?: string;
  expirationDate?: string;
  isActive: boolean;
  verificationStatus: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

const CERTIFICATE_TYPES = [
  { value: "resale", label: "Resale Certificate" },
  { value: "non_profit", label: "Non-Profit Organization" },
  { value: "government", label: "Government Entity" },
  { value: "manufacturing", label: "Manufacturing Exemption" },
  { value: "agriculture", label: "Agricultural Exemption" },
];

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

export function TaxExemptCertificate() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    certificateType: "",
    exemptionNumber: "",
    businessName: "",
    businessAddress: "",
    businessCity: "",
    businessState: "",
    businessZipCode: "",
    exemptStates: [] as string[],
    expirationDate: "",
  });

  // Fetch existing certificates
  const { data: certificates = [], isLoading } = useQuery<TaxExemptCertificate[]>({
    queryKey: [`/api/tax/exempt-certificates/${user?.id}`],
    enabled: !!user?.id,
  });

  // Upload certificate mutation
  const uploadCertificate = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`/api/tax/exempt-certificates/${user?.id}`, {
        method: "POST",
        body: data,
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Certificate Uploaded",
        description: "Your tax exempt certificate has been uploaded and is being reviewed.",
      });
      setShowAddDialog(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: [`/api/tax/exempt-certificates/${user?.id}`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => window.location.href = "/auth", 500);
        return;
      }
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload certificate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      certificateType: "",
      exemptionNumber: "",
      businessName: "",
      businessAddress: "",
      businessCity: "",
      businessState: "",
      businessZipCode: "",
      exemptStates: [],
      expirationDate: "",
    });
    setSelectedFile(null);
  };

  const handleSubmit = () => {
    if (!formData.certificateType || !formData.exemptionNumber || !formData.businessName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const data = new FormData();
    data.append("certificateType", formData.certificateType);
    data.append("exemptionNumber", formData.exemptionNumber);
    data.append("businessName", formData.businessName);
    data.append("businessAddress", formData.businessAddress);
    data.append("businessCity", formData.businessCity);
    data.append("businessState", formData.businessState);
    data.append("businessZipCode", formData.businessZipCode);
    data.append("exemptStates", JSON.stringify(formData.exemptStates));
    if (formData.expirationDate) {
      data.append("expirationDate", formData.expirationDate);
    }
    if (selectedFile) {
      data.append("certificate", selectedFile);
    }

    uploadCertificate.mutate(data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-amazon-orange" />
              Tax Exempt Certificates
            </CardTitle>
            <CardDescription>
              Upload tax exempt certificates to qualify for tax-free purchases in eligible states
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-amazon-orange hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Tax Exempt Certificate</DialogTitle>
                <DialogDescription>
                  Upload your tax exempt certificate to qualify for tax-free purchases
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="certificateType">Certificate Type *</Label>
                    <Select
                      value={formData.certificateType}
                      onValueChange={(value) => setFormData({ ...formData, certificateType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select certificate type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CERTIFICATE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="exemptionNumber">Tax Exempt Number *</Label>
                    <Input
                      id="exemptionNumber"
                      value={formData.exemptionNumber}
                      onChange={(e) => setFormData({ ...formData, exemptionNumber: e.target.value })}
                      placeholder="Enter your tax exempt number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Enter your business name"
                  />
                </div>

                <div>
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Textarea
                    id="businessAddress"
                    value={formData.businessAddress}
                    onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                    placeholder="Enter your business address"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="businessCity">City</Label>
                    <Input
                      id="businessCity"
                      value={formData.businessCity}
                      onChange={(e) => setFormData({ ...formData, businessCity: e.target.value })}
                      placeholder="City"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="businessState">State</Label>
                    <Select
                      value={formData.businessState}
                      onValueChange={(value) => setFormData({ ...formData, businessState: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="businessZipCode">ZIP Code</Label>
                    <Input
                      id="businessZipCode"
                      value={formData.businessZipCode}
                      onChange={(e) => setFormData({ ...formData, businessZipCode: e.target.value })}
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="expirationDate">Expiration Date (Optional)</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="certificate">Upload Certificate Document</Label>
                  <Input
                    id="certificate"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Accepted formats: PDF, JPG, PNG (max 10MB)
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={uploadCertificate.isPending}
                  className="bg-amazon-orange hover:bg-orange-600"
                >
                  {uploadCertificate.isPending ? "Uploading..." : "Upload Certificate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Tax Exempt Certificates</h3>
            <p className="text-gray-500 mb-4">
              Upload your tax exempt certificate to qualify for tax-free purchases
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(cert.verificationStatus)}
                      <h4 className="font-semibold">
                        {CERTIFICATE_TYPES.find(t => t.value === cert.certificateType)?.label}
                      </h4>
                      <Badge className={getStatusColor(cert.verificationStatus)}>
                        {cert.verificationStatus.charAt(0).toUpperCase() + cert.verificationStatus.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Exemption Number:</span> {cert.exemptionNumber}
                      </div>
                      <div>
                        <span className="font-medium">Business:</span> {cert.businessName}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {cert.businessCity}, {cert.businessState}
                      </div>
                      <div>
                        <span className="font-medium">Uploaded:</span> {new Date(cert.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {cert.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <span className="font-medium">Rejection Reason:</span> {cert.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}