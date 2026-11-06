import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Smartphone, Mail, Key, Download, RefreshCw, AlertTriangle, CheckCircle, QrCode, Copy, Eye, EyeOff } from "lucide-react";

interface TwoFactorStatus {
  enabled: boolean;
  preferredMethod: string;
  backupEmail?: string;
  phone?: string;
  lastUsed?: string;
  hasBackupCodes: boolean;
}

interface TwoFactorSetup {
  qrCodeUrl: string;
  manualEntryKey: string;
  backupCodes: string[];
}

export default function TwoFactorAuth() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [showManualKey, setShowManualKey] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);

  // Fetch 2FA status
  const { data: twoFactorStatus, isLoading: statusLoading, refetch: refetchStatus } = useQuery<TwoFactorStatus>({
    queryKey: ['/api/auth/2fa/status'],
    enabled: isAuthenticated,
  });

  // Setup 2FA mutation
  const setupMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/2fa/setup");
    },
    onSuccess: (data) => {
      setSetupData(data);
      toast({
        title: "2FA Setup Started",
        description: "Scan the QR code or enter the manual key in your authenticator app.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 500);
        return;
      }
      toast({
        title: "Setup Failed",
        description: "Failed to setup two-factor authentication. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Verify and enable 2FA mutation
  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      return await apiRequest("POST", "/api/auth/2fa/verify-setup", { token });
    },
    onSuccess: () => {
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been successfully enabled for your account.",
      });
      setSetupData(null);
      setVerificationCode("");
      refetchStatus();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Disable 2FA mutation
  const disableMutation = useMutation({
    mutationFn: async (confirmationToken: string) => {
      return await apiRequest("POST", "/api/auth/2fa/disable", { confirmationToken });
    },
    onSuccess: () => {
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled for your account.",
      });
      setDisableCode("");
      refetchStatus();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "Disable Failed",
        description: "Invalid confirmation code. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Regenerate backup codes mutation
  const regenerateCodesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/2fa/backup-codes/regenerate");
    },
    onSuccess: (data) => {
      setNewBackupCodes(data.backupCodes);
      toast({
        title: "Backup Codes Regenerated",
        description: "New backup codes have been generated. Save them in a secure location.",
      });
      refetchStatus();
    },
    onError: (error) => {
      toast({
        title: "Regeneration Failed",
        description: "Failed to regenerate backup codes. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSetup = () => {
    setupMutation.mutate();
  };

  const handleVerify = () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter the verification code from your authenticator app.",
        variant: "destructive",
      });
      return;
    }
    verifyMutation.mutate(verificationCode);
  };

  const handleDisable = () => {
    if (!disableCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter a verification code to confirm disabling 2FA.",
        variant: "destructive",
      });
      return;
    }
    disableMutation.mutate(disableCode);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard successfully.",
    });
  };

  const downloadBackupCodes = (codes: string[]) => {
    const content = `Durcheap 2FA Backup Codes\n\nGenerated: ${new Date().toLocaleDateString()}\n\n${codes.join('\n')}\n\nKeep these codes safe and secure!\nEach code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `durcheap-2fa-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  if (authLoading || statusLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h1>
          <p className="text-gray-600">
            Add an extra layer of security to your account with two-factor authentication.
          </p>
        </div>

        {/* Current Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {twoFactorStatus?.enabled ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication Enabled</p>
                      <p className="text-sm text-gray-600">
                        Your account is protected with 2FA
                        {twoFactorStatus.lastUsed && (
                          <span> • Last used: {new Date(twoFactorStatus.lastUsed).toLocaleDateString()}</span>
                        )}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication Disabled</p>
                      <p className="text-sm text-gray-600">
                        Your account is not protected with 2FA
                      </p>
                    </div>
                  </>
                )}
              </div>
              <Badge variant={twoFactorStatus?.enabled ? "default" : "secondary"}>
                {twoFactorStatus?.enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Account Balance Protection Notice */}
        <Alert className="mb-8">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Two-factor authentication is required to access your account balance and financial information.
            Enable 2FA to view your earnings, transactions, and manage payouts securely.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup & Management</TabsTrigger>
            <TabsTrigger value="methods">Authentication Methods</TabsTrigger>
            <TabsTrigger value="backup">Backup & Recovery</TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            {!twoFactorStatus?.enabled ? (
              <Card>
                <CardHeader>
                  <CardTitle>Enable Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Set up 2FA using an authenticator app like Google Authenticator, Authy, or 1Password.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!setupData ? (
                    <Button 
                      onClick={handleSetup} 
                      disabled={setupMutation.isPending}
                      className="w-full"
                    >
                      {setupMutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                      Start 2FA Setup
                    </Button>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-lg font-medium mb-4">Step 1: Scan QR Code</h3>
                        <div className="flex justify-center mb-4">
                          <img 
                            src={setupData.qrCodeUrl} 
                            alt="2FA QR Code" 
                            className="border-2 border-gray-200 rounded-lg"
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowManualKey(!showManualKey)}
                          >
                            {showManualKey ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                            {showManualKey ? "Hide" : "Show"} Manual Entry Key
                          </Button>
                        </div>
                        {showManualKey && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <Label className="text-sm font-medium">Manual Entry Key:</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="flex-1 text-sm bg-white px-3 py-2 rounded border font-mono">
                                {setupData.manualEntryKey}
                              </code>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(setupData.manualEntryKey)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-medium mb-4">Step 2: Enter Verification Code</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="verification-code">6-digit code from your authenticator app</Label>
                            <Input
                              id="verification-code"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="000000"
                              maxLength={6}
                              className="text-center text-lg tracking-wider"
                            />
                          </div>
                          <Button 
                            onClick={handleVerify}
                            disabled={verifyMutation.isPending || verificationCode.length !== 6}
                            className="w-full"
                          >
                            {verifyMutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                            Verify and Enable 2FA
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Step 3: Save Backup Codes</h3>
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
                          </AlertDescription>
                        </Alert>
                        <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg">
                          {setupData.backupCodes.map((code, index) => (
                            <code key={index} className="text-sm font-mono bg-white px-2 py-1 rounded">
                              {code}
                            </code>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => downloadBackupCodes(setupData.backupCodes)}
                          className="w-full"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Backup Codes
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Disable Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    This will remove 2FA protection from your account and require authentication codes for balance access.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Warning:</strong> Disabling 2FA will make your account less secure. You'll still need 2FA to access balance information.
                    </AlertDescription>
                  </Alert>
                  <div>
                    <Label htmlFor="disable-code">Enter verification code to confirm</Label>
                    <Input
                      id="disable-code"
                      value={disableCode}
                      onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="text-center text-lg tracking-wider"
                    />
                  </div>
                  <Button 
                    onClick={handleDisable}
                    disabled={disableMutation.isPending || disableCode.length !== 6}
                    variant="destructive"
                    className="w-full"
                  >
                    {disableMutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                    Disable Two-Factor Authentication
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Methods Tab */}
          <TabsContent value="methods" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Authenticator App (TOTP)
                  </CardTitle>
                  <CardDescription>
                    Use apps like Google Authenticator, Authy, or 1Password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant={twoFactorStatus?.enabled ? "default" : "secondary"}>
                        {twoFactorStatus?.enabled ? "Active" : "Not Set Up"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Most secure method. Works offline and generates time-based codes.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Verification
                  </CardTitle>
                  <CardDescription>
                    Send verification codes to your email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant="secondary">Coming Soon</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Receive codes via email as a backup method.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    SMS Text Message
                  </CardTitle>
                  <CardDescription>
                    Send verification codes to your phone
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant="secondary">Coming Soon</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Receive codes via SMS as a backup method.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Backup Codes
                  </CardTitle>
                  <CardDescription>
                    One-time use emergency codes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant={twoFactorStatus?.hasBackupCodes ? "default" : "secondary"}>
                        {twoFactorStatus?.hasBackupCodes ? "Available" : "Not Generated"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Use when you don't have access to your primary 2FA method.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Backup Tab */}
          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup & Recovery Codes</CardTitle>
                <CardDescription>
                  Generate and manage backup codes for emergency access to your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {twoFactorStatus?.enabled && (
                  <>
                    <Alert>
                      <Key className="h-4 w-4" />
                      <AlertDescription>
                        Backup codes are single-use codes that allow you to access your account if you lose your authenticator device.
                        Store them securely and regenerate them if compromised.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex gap-4">
                      <Button
                        onClick={() => regenerateCodesMutation.mutate()}
                        disabled={regenerateCodesMutation.isPending}
                        variant="outline"
                      >
                        {regenerateCodesMutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                        Generate New Backup Codes
                      </Button>
                    </div>

                    {newBackupCodes.length > 0 && (
                      <div className="space-y-4">
                        <Alert>
                          <Download className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Save these codes immediately!</strong> They replace your previous backup codes and each can only be used once.
                          </AlertDescription>
                        </Alert>
                        <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded-lg">
                          {newBackupCodes.map((code, index) => (
                            <code key={index} className="text-sm font-mono bg-white px-2 py-1 rounded">
                              {code}
                            </code>
                          ))}
                        </div>
                        <Button
                          onClick={() => downloadBackupCodes(newBackupCodes)}
                          className="w-full"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download New Backup Codes
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {!twoFactorStatus?.enabled && (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No 2FA Enabled</h3>
                    <p className="text-gray-600 mb-4">
                      Enable two-factor authentication first to generate backup codes.
                    </p>
                    <Button variant="outline" onClick={() => document.querySelector('[value="setup"]')?.click()}>
                      Go to Setup
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}