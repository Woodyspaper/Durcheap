import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, RefreshCw, AlertTriangle } from "lucide-react";

interface TwoFactorPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
  title?: string;
  description?: string;
  action?: string;
}

export function TwoFactorPrompt({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title = "Two-Factor Authentication Required",
  description = "Enter your verification code to continue",
  action = "Access Balance"
}: TwoFactorPromptProps) {
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState<number | undefined>(undefined);

  // Create 2FA session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/2fa/create-session", { method: 'totp' });
    },
    onSuccess: (data) => {
      setSessionToken(data.sessionToken);
    },
    onError: (error) => {
      toast({
        title: "Session Error",
        description: "Failed to create verification session. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Verify 2FA token
  const verifyMutation = useMutation({
    mutationFn: async ({ sessionToken, token }: { sessionToken: string; token: string }) => {
      return await apiRequest("POST", "/api/auth/2fa/verify", { sessionToken, token });
    },
    onSuccess: (data) => {
      if (data.verified) {
        onSuccess(data.token);
        handleClose();
        toast({
          title: "Verification Successful",
          description: "Two-factor authentication verified successfully.",
        });
      }
    },
    onError: (error: any) => {
      const errorData = error.message.includes('remainingAttempts') ? JSON.parse(error.message.split(': ')[1]) : {};
      setRemainingAttempts(errorData.remainingAttempts);
      
      toast({
        title: "Verification Failed",
        description: errorData.message || "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setVerificationCode("");
    setSessionToken("");
    setRemainingAttempts(undefined);
    onClose();
  };

  const handleVerify = () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter your verification code.",
        variant: "destructive",
      });
      return;
    }

    if (!sessionToken) {
      createSessionMutation.mutate();
      return;
    }

    verifyMutation.mutate({ sessionToken, token: verificationCode });
  };

  // Auto-create session when dialog opens
  React.useEffect(() => {
    if (isOpen && !sessionToken && !createSessionMutation.isPending) {
      createSessionMutation.mutate();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {remainingAttempts !== undefined && remainingAttempts <= 2 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {remainingAttempts === 0 
                  ? "Maximum attempts exceeded. Please try again later."
                  : `${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
                }
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="verification-code">
              Verification Code from Authenticator App
            </Label>
            <Input
              id="verification-code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="text-center text-lg tracking-wider"
              disabled={createSessionMutation.isPending || verifyMutation.isPending || remainingAttempts === 0}
            />
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              disabled={createSessionMutation.isPending || verifyMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleVerify}
              disabled={
                createSessionMutation.isPending || 
                verifyMutation.isPending || 
                verificationCode.length !== 6 ||
                remainingAttempts === 0
              }
              className="flex-1"
            >
              {(createSessionMutation.isPending || verifyMutation.isPending) && (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              )}
              {createSessionMutation.isPending ? "Setting up..." : action}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Lost your device?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-sm"
                onClick={() => {
                  // Could implement backup code entry here
                  toast({
                    title: "Backup Codes",
                    description: "Use one of your backup codes in place of the verification code.",
                  });
                }}
              >
                Use backup code
              </Button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}