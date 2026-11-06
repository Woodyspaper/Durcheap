import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Clock, FileText, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ContractorAgreement {
  id: string;
  fullName: string;
  businessName?: string;
  taxId: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  email: string;
  agreementSigned: boolean;
  signedAt?: string;
  status: string;
  rejectionReason?: string;
}

interface TaxForm {
  id: string;
  formType: string;
  taxYear: number;
  formData: string;
  status: string;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
  "Wisconsin", "Wyoming"
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
    case 'rejected':
      return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    default:
      return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
  }
};

export default function TaxComplianceForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    taxId: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phoneNumber: "",
    email: "",
  });

  const [w9Data, setW9Data] = useState({
    taxYear: new Date().getFullYear(),
    businessClassification: "individual",
    exemptPayeeCode: "",
    exemptFromFatca: false,
    // W-9 Form Fields
    name: "",
    businessName: "",
    federalTaxClassification: "individual",
    otherClassification: "",
    taxId: "",
    exemptions: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    accountNumbers: "",
    requestersName: "Durcheap LLC",
    requestersAddress: "Business Address, City, State ZIP",
  });

  // Fetch existing contractor agreement
  const { data: agreement, isLoading: agreementLoading } = useQuery<ContractorAgreement>({
    queryKey: ["/api/user/contractor-agreement"],
  });

  // Fetch tax forms
  const { data: taxForms, isLoading: formsLoading } = useQuery<TaxForm[]>({
    queryKey: ["/api/user/tax-forms"],
  });

  // Create contractor agreement mutation
  const createAgreementMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/user/contractor-agreement", data);
    },
    onSuccess: () => {
      toast({
        title: "Agreement Submitted",
        description: "Your Independent Contractor Agreement has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/contractor-agreement"] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit agreement",
        variant: "destructive",
      });
    },
  });

  // Create tax form mutation
  const createTaxFormMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/user/tax-forms", data);
    },
    onSuccess: () => {
      toast({
        title: "Tax Form Submitted",
        description: "Your tax form has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/tax-forms"] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit tax form",
        variant: "destructive",
      });
    },
  });

  // Populate form with existing data
  useEffect(() => {
    if (agreement) {
      setFormData({
        fullName: agreement.fullName || "",
        businessName: agreement.businessName || "",
        taxId: agreement.taxId || "",
        addressLine1: agreement.addressLine1 || "",
        addressLine2: agreement.addressLine2 || "",
        city: agreement.city || "",
        state: agreement.state || "",
        zipCode: agreement.zipCode || "",
        country: agreement.country || "United States",
        phoneNumber: agreement.phoneNumber || "",
        email: agreement.email || "",
      });
    }
  }, [agreement]);

  const handleSubmitAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.taxId || !formData.addressLine1 || 
        !formData.city || !formData.state || !formData.zipCode || 
        !formData.phoneNumber || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createAgreementMutation.mutate(formData);
  };

  const handleSubmitW9 = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreement || agreement.status !== 'approved') {
      toast({
        title: "Agreement Required",
        description: "You must have an approved Independent Contractor Agreement before submitting tax forms.",
        variant: "destructive",
      });
      return;
    }

    const formDataJson = JSON.stringify({
      ...w9Data,
      personalInfo: formData,
      submissionDate: new Date().toISOString(),
    });

    createTaxFormMutation.mutate({
      formType: "W9",
      taxYear: w9Data.taxYear,
      formData: formDataJson,
    });
  };

  if (agreementLoading || formsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Tax Compliance Requirements
          </CardTitle>
          <CardDescription>
            To participate in the referral program and receive commission payments, you must complete 
            an Independent Contractor Agreement and submit required tax forms. This ensures compliance 
            with IRS regulations for independent contractor relationships.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="agreement" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="agreement" className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            Contractor Agreement
          </TabsTrigger>
          <TabsTrigger value="forms" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Tax Forms
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agreement">
          <Card>
            <CardHeader>
              <CardTitle>Independent Contractor Agreement</CardTitle>
              <CardDescription>
                {agreement ? (
                  <div className="flex items-center justify-between">
                    <span>Agreement Status:</span>
                    {getStatusBadge(agreement.status)}
                  </div>
                ) : (
                  "Complete this agreement to establish your independent contractor relationship with Durcheap."
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agreement && agreement.status === 'rejected' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">Agreement Rejected</p>
                  <p className="text-red-700 text-sm mt-1">{agreement.rejectionReason}</p>
                </div>
              )}

              <form onSubmit={handleSubmitAgreement} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Legal Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter your full legal name"
                      required
                      disabled={agreement?.status === 'approved'}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="businessName">Business Name (if applicable)</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="DBA or business name"
                      disabled={agreement?.status === 'approved'}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="taxId">Tax ID (SSN or EIN) *</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="XXX-XX-XXXX or XX-XXXXXXX"
                    required
                    disabled={agreement?.status === 'approved'}
                  />
                </div>

                <div>
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    placeholder="Street address"
                    required
                    disabled={agreement?.status === 'approved'}
                  />
                </div>

                <div>
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                    placeholder="Apartment, suite, etc."
                    disabled={agreement?.status === 'approved'}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City"
                      required
                      disabled={agreement?.status === 'approved'}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Select 
                      value={formData.state} 
                      onValueChange={(value) => setFormData({ ...formData, state: value })}
                      disabled={agreement?.status === 'approved'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      placeholder="12345"
                      required
                      disabled={agreement?.status === 'approved'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="(555) 123-4567"
                      required
                      disabled={agreement?.status === 'approved'}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@example.com"
                      required
                      disabled={agreement?.status === 'approved'}
                    />
                  </div>
                </div>

                {agreement?.status !== 'approved' && (
                  <Button 
                    type="submit" 
                    disabled={createAgreementMutation.isPending}
                    className="w-full"
                  >
                    {createAgreementMutation.isPending ? "Submitting..." : "Submit Agreement"}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms">
          <Card>
            <CardHeader>
              <CardTitle>Tax Forms</CardTitle>
              <CardDescription>
                Submit required tax forms for commission payments. Form W-9 is required for all US contractors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!agreement || agreement.status !== 'approved' ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Complete and get approval for your Independent Contractor Agreement first.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Existing Forms */}
                  {taxForms && taxForms.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Submitted Forms</h4>
                      <div className="space-y-3">
                        {taxForms.map((form: TaxForm) => (
                          <div key={form.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{form.formType} - Tax Year {form.taxYear}</p>
                              <p className="text-sm text-gray-600">
                                Submitted: {form.submittedAt ? new Date(form.submittedAt).toLocaleDateString() : 'N/A'}
                              </p>
                              {form.rejectionReason && (
                                <p className="text-sm text-red-600 mt-1">{form.rejectionReason}</p>
                              )}
                            </div>
                            {getStatusBadge(form.status)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* W-9 Form */}
                  <div>
                    <h4 className="font-medium mb-3">Form W-9 - Request for Taxpayer Identification Number</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-blue-800 text-sm">
                        Complete this electronic W-9 form. All information will be used to generate your official W-9 document for tax reporting purposes.
                      </p>
                    </div>
                    
                    <form onSubmit={handleSubmitW9} className="space-y-6">
                      <div>
                        <Label htmlFor="taxYear">Tax Year</Label>
                        <Select 
                          value={w9Data.taxYear.toString()} 
                          onValueChange={(value) => setW9Data({ ...w9Data, taxYear: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Part I: Taxpayer Identification Number */}
                      <div className="border rounded-lg p-4">
                        <h5 className="font-medium mb-4 text-gray-900">Part I: Taxpayer Identification Number (TIN)</h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="w9Name">Name (as shown on income tax return) *</Label>
                            <Input
                              id="w9Name"
                              value={w9Data.name}
                              onChange={(e) => setW9Data({ ...w9Data, name: e.target.value })}
                              placeholder="Enter name exactly as shown on tax return"
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="w9BusinessName">Business name/disregarded entity name (if different)</Label>
                            <Input
                              id="w9BusinessName"
                              value={w9Data.businessName}
                              onChange={(e) => setW9Data({ ...w9Data, businessName: e.target.value })}
                              placeholder="Business or DBA name (if applicable)"
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <Label htmlFor="federalTaxClassification">Federal Tax Classification *</Label>
                          <Select 
                            value={w9Data.federalTaxClassification} 
                            onValueChange={(value) => setW9Data({ ...w9Data, federalTaxClassification: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="individual">Individual/sole proprietor or single-member LLC</SelectItem>
                              <SelectItem value="c-corp">C Corporation</SelectItem>
                              <SelectItem value="s-corp">S Corporation</SelectItem>
                              <SelectItem value="partnership">Partnership</SelectItem>
                              <SelectItem value="trust">Trust/estate</SelectItem>
                              <SelectItem value="llc">Limited liability company (LLC)</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {w9Data.federalTaxClassification === "other" && (
                          <div className="mt-4">
                            <Label htmlFor="otherClassification">Specify Other Classification *</Label>
                            <Input
                              id="otherClassification"
                              value={w9Data.otherClassification}
                              onChange={(e) => setW9Data({ ...w9Data, otherClassification: e.target.value })}
                              placeholder="Describe other tax classification"
                              required
                            />
                          </div>
                        )}

                        <div className="mt-4">
                          <Label htmlFor="taxId">Taxpayer Identification Number (SSN or EIN) *</Label>
                          <Input
                            id="taxId"
                            value={w9Data.taxId}
                            onChange={(e) => setW9Data({ ...w9Data, taxId: e.target.value })}
                            placeholder="XXX-XX-XXXX or XX-XXXXXXX"
                            required
                          />
                          <p className="text-sm text-gray-600 mt-1">
                            Enter your Social Security Number (SSN) or Employer Identification Number (EIN)
                          </p>
                        </div>

                        <div className="mt-4">
                          <Label htmlFor="exemptions">Exemptions (codes apply only to certain entities)</Label>
                          <Input
                            id="exemptions"
                            value={w9Data.exemptions}
                            onChange={(e) => setW9Data({ ...w9Data, exemptions: e.target.value })}
                            placeholder="Enter exemption codes if applicable"
                          />
                          <p className="text-sm text-gray-600 mt-1">
                            Leave blank unless you are exempt from backup withholding
                          </p>
                        </div>
                      </div>

                      {/* Part II: Address */}
                      <div className="border rounded-lg p-4">
                        <h5 className="font-medium mb-4 text-gray-900">Part II: Address</h5>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="w9Address">Address (number, street, and apt. or suite no.) *</Label>
                            <Input
                              id="w9Address"
                              value={w9Data.address}
                              onChange={(e) => setW9Data({ ...w9Data, address: e.target.value })}
                              placeholder="Street address"
                              required
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="w9City">City *</Label>
                              <Input
                                id="w9City"
                                value={w9Data.city}
                                onChange={(e) => setW9Data({ ...w9Data, city: e.target.value })}
                                placeholder="City"
                                required
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="w9State">State *</Label>
                              <Select 
                                value={w9Data.state} 
                                onValueChange={(value) => setW9Data({ ...w9Data, state: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                                <SelectContent>
                                  {US_STATES.map((state) => (
                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="w9ZipCode">ZIP Code *</Label>
                              <Input
                                id="w9ZipCode"
                                value={w9Data.zipCode}
                                onChange={(e) => setW9Data({ ...w9Data, zipCode: e.target.value })}
                                placeholder="12345"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Part III: Certification */}
                      <div className="border rounded-lg p-4">
                        <h5 className="font-medium mb-4 text-gray-900">Part III: Certification</h5>
                        
                        <div className="bg-gray-50 p-4 rounded text-sm text-gray-700 mb-4">
                          <p className="font-medium mb-2">Under penalties of perjury, I certify that:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>The number shown on this form is my correct taxpayer identification number (or I am waiting for a number to be issued to me); and</li>
                            <li>I am not subject to backup withholding because: (a) I am exempt from backup withholding, or (b) I have not been notified by the Internal Revenue Service (IRS) that I am subject to backup withholding as a result of a failure to report all interest or dividends, or (c) the IRS has notified me that I am no longer subject to backup withholding; and</li>
                            <li>I am a U.S. citizen or other U.S. person (defined below); and</li>
                            <li>The FATCA code(s) entered on this form (if any) indicating that I am exempt from FATCA reporting is correct.</li>
                          </ul>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="accountNumbers">List account number(s) here (optional)</Label>
                            <Input
                              id="accountNumbers"
                              value={w9Data.accountNumbers}
                              onChange={(e) => setW9Data({ ...w9Data, accountNumbers: e.target.value })}
                              placeholder="Account numbers if requested by payer"
                            />
                          </div>

                          <div className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id="fatcaExempt"
                              checked={w9Data.exemptFromFatca}
                              onChange={(e) => setW9Data({ ...w9Data, exemptFromFatca: e.target.checked })}
                              className="rounded"
                            />
                            <Label htmlFor="fatcaExempt" className="text-sm">
                              I am exempt from FATCA reporting
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm font-medium mb-2">Important Notice:</p>
                        <p className="text-yellow-700 text-sm">
                          By submitting this form, you certify under penalties of perjury that the information provided is true, correct, and complete. 
                          This information will be used for tax reporting purposes as required by the IRS.
                        </p>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={createTaxFormMutation.isPending || !w9Data.name || !w9Data.taxId || !w9Data.address || !w9Data.city || !w9Data.state || !w9Data.zipCode}
                        className="w-full"
                      >
                        {createTaxFormMutation.isPending ? "Submitting W-9..." : "Submit W-9 Form"}
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}